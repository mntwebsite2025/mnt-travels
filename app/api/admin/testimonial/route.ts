import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/models/connectDB";
import Testimonial from "@/config/utils/admin/testimonial/testimonialSchema";
import { uploadToCloudinary } from "@/config/utils/cloudinary";

// GET - Fetch all testimonials
export async function GET(request: NextRequest) {
  try { 
    await connectDB(); 

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const rating = searchParams.get("rating");
    const servicesType = searchParams.get("servicesType");

    // Build query
    const query: any = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (rating) {
      query.rating = parseInt(rating);
    }

    if (servicesType && servicesType !== "all") {
      query.servicesType = servicesType;
    }

    // Fetch all testimonials
    const testimonials = await Testimonial.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: testimonials,
      message: "Testimonials fetched successfully",
    });
  } catch (error: unknown) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch testimonials",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST - Create new testimonial
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const contentType = request.headers.get("content-type");
    let body: any;
    let avatarPath = "";

    // Handle multipart form data (with file upload)
    if (contentType?.includes("multipart/form-data")) {
      const formData = await request.formData();

      // Extract form fields
      body = {
        name: formData.get("name") as string,
        location: formData.get("location") as string,
        content: formData.get("content") as string,
        rating: formData.get("rating") as string,
        servicesType: formData.get("servicesType") as string,
        date: formData.get("date") as string,
        status: formData.get("status") as string,
      };

      // Handle file upload
      const file = formData.get("avatar") as File;
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const result = await uploadToCloudinary(buffer, 'testimonials');
        avatarPath = result.secure_url;
      }
    } else {
      // Handle JSON data
      body = await request.json();
      avatarPath = body.avatar || "";
    }

    // Validate required fields
    const requiredFields = [
      "name",
      "location",
      "content",
      "rating",
      "servicesType",
    ];
    for (const field of requiredFields) {
      if (
        !body[field] ||
        (typeof body[field] === "string" && body[field].trim() === "")
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `${field} is required and cannot be empty`,
          },
          { status: 400 }
        );
      }
    }

    // Validate rating range
    const rating = parseInt(body.rating);
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          success: false,
          message: "Rating must be between 1 and 5",
        },
        { status: 400 }
      );
    }

    // Create testimonial data
    const testimonialData = {
      name: body.name.trim(),
      location: body.location.trim(),
      avatar: avatarPath,
      content: body.content.trim(),
      rating: rating,
      servicesType: body.servicesType.trim(),
      date: body.date ? new Date(body.date) : new Date(),
      status: body.status || "published",
    };

    const newTestimonial = new Testimonial(testimonialData);
    const savedTestimonial = await newTestimonial.save();

    return NextResponse.json({
      success: true,
      data: savedTestimonial,
      message: "Testimonial created successfully",
    });
  } catch (error: unknown) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create testimonial",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT - Update testimonial
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const contentType = request.headers.get("content-type");
    let body: any;
    let avatarPath = "";

    // Handle multipart form data (with file upload)
    if (contentType?.includes("multipart/form-data")) {
      const formData = await request.formData();

      // Extract form fields
      body = {
        id: formData.get("id") as string,
        name: formData.get("name") as string,
        location: formData.get("location") as string,
        content: formData.get("content") as string,
        rating: formData.get("rating") as string,
        servicesType: formData.get("servicesType") as string,
        date: formData.get("date") as string,
        status: formData.get("status") as string,
      };

      // Handle file upload
      const file = formData.get("avatar") as File;
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const result = await uploadToCloudinary(buffer, 'testimonials');
        avatarPath = result.secure_url;
      }
    } else {
      // Handle JSON data
      body = await request.json();
      avatarPath = body.avatar || "";
    }

    if (!body.id) {
      return NextResponse.json(
        { success: false, message: "Testimonial ID is required" },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields = ["name", "location", "content", "rating", "servicesType"];
    for (const field of requiredFields) {
      if (!body[field] || (typeof body[field] === "string" && body[field].trim() === "")) {
        return NextResponse.json(
          { success: false, message: `${field} is required and cannot be empty` },
          { status: 400 }
        );
      }
    }

    // Validate rating range
    const rating = parseInt(body.rating);
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Update testimonial data
    const updateData: any = {
      name: body.name.trim(),
      location: body.location.trim(),
      content: body.content.trim(),
      rating: rating,
      servicesType: body.servicesType.trim(),
      date: body.date ? new Date(body.date) : new Date(),
      status: body.status || "published",
    };

    if (avatarPath) {
      updateData.avatar = avatarPath;
    }

    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      body.id,
      updateData,
      { new: true }
    );

    if (!updatedTestimonial) {
      return NextResponse.json(
        { success: false, message: "Testimonial not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedTestimonial,
      message: "Testimonial updated successfully",
    });
  } catch (error: unknown) {
    console.error("Error updating testimonial:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update testimonial",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete testimonial
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Testimonial ID is required" },
        { status: 400 }
      );
    }

    const deletedTestimonial = await Testimonial.findByIdAndDelete(id);

    if (!deletedTestimonial) {
      return NextResponse.json(
        { success: false, message: "Testimonial not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Testimonial deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Error deleting testimonial:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete testimonial",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
