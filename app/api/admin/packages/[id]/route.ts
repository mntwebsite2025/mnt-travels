import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/models/connectDB";
import Package from "@/config/utils/admin/packages/packageSchema";
import { uploadToCloudinary } from "@/config/utils/cloudinary";
import jwt from "jsonwebtoken";

interface DecodedToken {
  adminId: string;
  email: string;
  role: string;
}

// GET - Fetch single package
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to fix NextJS 15 issue
    const { id } = await params;
    
    await connectDB();

    const package_ = await Package.findOne({ 
      _id: id, 
      isDeleted: false 
    }).lean();

    if (!package_) {
      return NextResponse.json(
        { success: false, message: "Package not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: package_,
      message: "Package fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching package:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch package",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT - Update package
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to fix NextJS 15 issue
    const { id } = await params;

    // Verify admin authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;

    await connectDB();

    // Find existing package
    const existingPackage = await Package.findOne({ 
      _id: id, 
      isDeleted: false 
    });

    if (!existingPackage) {
      return NextResponse.json(
        { success: false, message: "Package not found" },
        { status: 404 }
      );
    }

    const contentType = request.headers.get("content-type");
    let body: any;
    let mainImageFile: File | null = null;
    let galleryImageFiles: File[] = [];

    // Handle multipart form data (with files)
    if (contentType?.includes("multipart/form-data")) {
      const formData = await request.formData();
      
      // Extract text fields
      body = {
        title: formData.get("title") as string,
        destination: formData.get("destination") as string,
        shortDescription: formData.get("shortDescription") as string,
        fullDescription: formData.get("fullDescription") as string,
        duration: formData.get("duration") as string,
        price: formData.get("price") as string,
        featured: formData.get("featured") === "true",
        status: formData.get("status") as string,
        image: formData.get("existingImage") as string || existingPackage.image,
        gallery: [],
        inclusions: JSON.parse(formData.get("inclusions") as string || "[]"),
        exclusions: JSON.parse(formData.get("exclusions") as string || "[]"),
        highlights: JSON.parse(formData.get("highlights") as string || "[]"),
        itinerary: JSON.parse(formData.get("itinerary") as string || "[]"),
      };

      // Extract existing gallery URLs
      const existingGallery: string[] = [];
      for (const [key, value] of formData.entries()) {
        if (key.startsWith('existingGallery[') && value) {
          existingGallery.push(value as string);
        }
      }
      body.gallery = existingGallery;

      // Extract file uploads
      mainImageFile = formData.get("mainImage") as File;
      
      const galleryFiles = formData.getAll("galleryImages") as File[];
      galleryImageFiles = galleryFiles.filter(file => file && file.size > 0);
      
    } else {
      // Handle JSON data (no files)
      body = await request.json();
    }
    
    // Check if maximum featured packages limit reached (3 featured packages max)
    if (body.featured && !existingPackage.featured) {
      const { id } = await params;
      const existingFeaturedCount = await Package.countDocuments({ 
        featured: true, 
        isDeleted: false,
        _id: { $ne: id }
      });
      if (existingFeaturedCount >= 3) {
        return NextResponse.json(
          {
            success: false,
            message: "Maximum limit of 3 featured packages reached. Please unfeature an existing package to feature this one.",
          },
          { status: 400 }
        );
      }
    }
    
    // Validate required fields
    const requiredFields = ['title', 'destination'];
    for (const field of requiredFields) {
      if (!body[field] || body[field].toString().trim() === '') {
        return NextResponse.json(
          {
            success: false,
            message: `${field} is required and cannot be empty`,
          },
          { status: 400 }
        );
      }
    }

    if (!body.image && !mainImageFile) {
      return NextResponse.json(
        {
          success: false,
          message: "Package image is required",
        },
        { status: 400 }
      );
    }
    
    // Generate slug from title
    const slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    let finalImageUrl = body.image;
    let finalGalleryUrls = [...body.gallery];

    // Upload main image to Cloudinary if new file provided
    if (mainImageFile) {
      try {
        const bytes = await mainImageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const folderPath = `packages/${slug}/main`;
        const result = await uploadToCloudinary(buffer, folderPath);
        finalImageUrl = result.secure_url;
      } catch (uploadError) {
        console.error("Main image upload failed:", uploadError);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to upload main image",
          },
          { status: 500 }
        );
      }
    }

    // Upload gallery images to Cloudinary if new files provided
    if (galleryImageFiles.length > 0) {
      try {
        const uploadPromises = galleryImageFiles.map(async (file) => {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const folderPath = `packages/${slug}/gallery`;
          const result = await uploadToCloudinary(buffer, folderPath);
          return result.secure_url;
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        finalGalleryUrls = [...finalGalleryUrls, ...uploadedUrls];
      } catch (uploadError) {
        console.error("Gallery images upload failed:", uploadError);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to upload gallery images",
          },
          { status: 500 }
        );
      }
    }
    
    // Update package
    const updatedPackage = await Package.findByIdAndUpdate(
      id,
      {
        ...body,
        slug,
        image: finalImageUrl,
        gallery: finalGalleryUrls,
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedPackage,
      message: "Package updated successfully"
    });

  } catch (error: any) {
    console.error("Error updating package:", error);
    
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update package",
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete package (hard delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to fix NextJS 15 issue
    const { id } = await params;

    // Verify admin authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;

    await connectDB();

    // Find and hard delete package
    const package_ = await Package.findByIdAndDelete(id);

    if (!package_) {
      return NextResponse.json(
        { success: false, message: "Package not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Package deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting package:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete package",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}