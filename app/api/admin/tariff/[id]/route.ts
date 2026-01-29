import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/models/connectDB";
import Tariff from "@/config/utils/admin/tariff/tariffSchema";
import jwt from "jsonwebtoken";
import { uploadToCloudinary, deleteFromCloudinary } from "@/config/utils/cloudinary"; // Add this import

interface DecodedToken {
  adminId: string;
  email: string;
  role: string;
}

// GET - Fetch single tariff service
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const tariff = await Tariff.findOne({ 
      _id: id, 
      isDeleted: false 
    }).select('-isDeleted -__v');

    if (!tariff) {
      return NextResponse.json(
        { success: false, message: "Tariff service not found" },
        { status: 404 }
      );
    }

    // Increment views for public access
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      await tariff.incrementViews();
    }

    return NextResponse.json({
      success: true,
      data: tariff
    });

  } catch (error) {
    console.error("Error fetching tariff:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch tariff service" },
      { status: 500 }
    );
  }
}

// PUT - Update tariff service (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Verify admin authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Authorization header required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    try {
      jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const formData = await request.formData();
    
    // Find existing tariff
    const existingTariff = await Tariff.findOne({ _id: id, isDeleted: false });
    if (!existingTariff) {
      return NextResponse.json(
        { success: false, message: "Tariff service not found" },
        { status: 404 }
      );
    }

    // Extract form fields
    const vehicleType = formData.get("vehicleType") as string;
    const vehicleName = formData.get("vehicleName") as string;
    const description = formData.get("description") as string;
    const oneWayRate = formData.get("oneWayRate") as string;
    const roundTripRate = formData.get("roundTripRate") as string;
    const driverAllowance = formData.get("driverAllowance") as string;
    const minimumKmOneWay = formData.get("minimumKmOneWay") as string;
    const minimumKmRoundTrip = formData.get("minimumKmRoundTrip") as string;
    const status = formData.get("status") as string;
    const featured = formData.get("featured") === "true";
    const seoTitle = formData.get("seoTitle") as string;
    const seoDescription = formData.get("seoDescription") as string;
    const seoKeywords = formData.get("seoKeywords") as string;

    // Parse arrays
    const additionalCharges = JSON.parse(formData.get("additionalCharges") as string || "[]");

    // Handle image upload
    let imagePath = existingTariff.image;
    const imageFile = formData.get("mainImage") as File;
    const existingImage = formData.get("existingImage") as string;

    if (imageFile) {
      try {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const folderPath = `tariff`;
        const result = await uploadToCloudinary(buffer, folderPath);
        imagePath = result.secure_url;
      } catch (uploadError) {
        console.error("Image upload failed:", uploadError);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to upload image",
          },
          { status: 500 }
        );
      }
    } else if (existingImage) {
      imagePath = existingImage;
    }

    // Update tariff
    const updatedTariff = await Tariff.findByIdAndUpdate(
      id,
      {
        vehicleType,
        vehicleName,
        description,
        oneWayRate,
        roundTripRate,
        driverAllowance,
        minimumKmOneWay,
        minimumKmRoundTrip,
        image: imagePath,
        status,
        featured,
        additionalCharges,
        seoTitle,
        seoDescription,
        seoKeywords,
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: "Tariff service updated successfully",
      data: updatedTariff
    });

  } catch (error: any) {
    console.error("Error updating tariff:", error);
    
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to update tariff service" },
      { status: 500 }
    );
  }
}

// DELETE - Delete tariff service (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Verify admin authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Authorization header required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    try {
      jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Find the tariff
    const tariff = await Tariff.findOne({ _id: id, isDeleted: false });
    if (!tariff) {
      return NextResponse.json(
        { success: false, message: "Tariff service not found" },
        { status: 404 }
      );
    }

    // Delete image from Cloudinary if it exists
    if (tariff.image && tariff.image.includes('cloudinary.com')) {
      try {
        // Extract public_id from Cloudinary URL
        const publicId = tariff.image.split('/').slice(-2).join('/').split('.')[0];
        await deleteFromCloudinary(publicId);
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
        // Continue with deletion even if image deletion fails
      }
    }

    // Find and hard delete the tariff
    await Tariff.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Tariff service deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting tariff:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete tariff service" },
      { status: 500 }
    );
  }
}