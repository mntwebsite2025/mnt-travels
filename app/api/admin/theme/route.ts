import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/models/connectDB";
import Theme from "@/config/utils/admin/theme/themeSchema";
import { uploadToCloudinary, deleteFromCloudinary } from "@/config/utils/cloudinary";

// GET - Fetch theme settings 
export async function GET() {
  try {
    await connectDB();

    // The auto-seeding will happen automatically when the schema is loaded
    const theme = await Theme.findOne({ isActive: true }).lean();

    if (!theme) {
      return NextResponse.json(
        {
          success: false,
          message: "No active theme found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: theme,
        message: "Theme settings fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching theme settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch theme settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper function to delete old file from Cloudinary
async function deleteOldFile(cloudinaryUrl: string | null): Promise<void> {
  if (!cloudinaryUrl) return;
  
  try {
    // Extract public_id from Cloudinary URL
    const urlParts = cloudinaryUrl.split('/');
    const publicId = `theme/${urlParts[urlParts.length - 1].split('.')[0]}`;
    
    await deleteFromCloudinary(publicId);
    console.log(`✅ Deleted file from Cloudinary: ${publicId}`);
  } catch (error) {
    console.error(`❌ Error deleting file from Cloudinary:`, error);
    // Don't throw error - file deletion failure shouldn't stop the update
  }
}

// Helper function to upload base64 image to Cloudinary
async function uploadBase64Image(base64Data: string, type: 'logo' | 'favicon'): Promise<string> {
  try {
    // Extract base64 data
    const base64Image = base64Data.split(';base64,').pop();
    if (!base64Image) {
      throw new Error('Invalid base64 data');
    }

    const imageBuffer = Buffer.from(base64Image, 'base64');
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(imageBuffer, 'theme');
    
    return result.secure_url;
  } catch (error) {
    console.error(`Error uploading ${type} to Cloudinary:`, error);
    throw new Error(`Failed to upload ${type} file`);
  }
}

// PUT - Update theme settings
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { 
      siteName, 
      logo, 
      favicon, 
      primaryColor, 
      secondaryColor, 
      gradientDirection 
    } = body;

    // Validate hex color format
    const hexColorRegex = /^#[0-9A-F]{6}$/i;
    if (primaryColor && !hexColorRegex.test(primaryColor)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid primary color format. Use hex format like #2563eb",
        },
        { status: 400 }
      );
    }

    if (secondaryColor && !hexColorRegex.test(secondaryColor)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid secondary color format. Use hex format like #9333ea",
        },
        { status: 400 }
      );
    }

    // Get current theme data to access old file paths
    const currentTheme = await Theme.findOne({ id: "default" });

    let logoPath = logo;
    let faviconPath = favicon;

    // Handle logo upload if it's base64 data
    if (logo && logo.startsWith('data:image/')) {
      // Delete old logo from Cloudinary if it exists
      if (currentTheme?.logo) {
        await deleteOldFile(currentTheme.logo);
      }
      logoPath = await uploadBase64Image(logo, 'logo');
    }

    // Handle favicon upload if it's base64 data
    if (favicon && favicon.startsWith('data:image/')) {
      // Delete old favicon from Cloudinary if it exists
      if (currentTheme?.favicon) {
        await deleteOldFile(currentTheme.favicon);
      }
      faviconPath = await uploadBase64Image(favicon, 'favicon');
    }

    // Find and update the theme settings
    const updatedTheme = await Theme.findOneAndUpdate(
      { id: "default" },
      {
        ...(siteName && { siteName }),
        ...(logoPath !== undefined && { logo: logoPath }),
        ...(faviconPath !== undefined && { favicon: faviconPath }),
        ...(primaryColor && { primaryColor }),
        ...(secondaryColor && { secondaryColor }),
        ...(gradientDirection && { gradientDirection }),
        lastUpdated: new Date(),
      },
      { new: true, runValidators: true, upsert: true }
    );

    return NextResponse.json(
      {
        success: true,
        data: updatedTheme,
        message: "Theme settings updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating theme settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update theme settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST - Reset theme to default
export async function POST() {
  try {
    await connectDB();

    // Get current theme data to clean up old files
    const currentTheme = await Theme.findOne({ id: "default" });

    // Delete old logo and favicon from Cloudinary if they exist
    if (currentTheme?.logo) {
      await deleteOldFile(currentTheme.logo);
    }
    if (currentTheme?.favicon) {
      await deleteOldFile(currentTheme.favicon);
    }

    const defaultTheme = {
      id: "default",
      siteName: "mnt Tours & Travels",
      logo: "/mnt-tours-logo.png",
      favicon: null,
      primaryColor: "#F59E0B", // Gold color for travel theme
      secondaryColor: "#1F2937", // Dark navy/black color for travel theme
      gradientDirection: "135deg",
      isActive: true,
      lastUpdated: new Date()
    };

    const resetTheme = await Theme.findOneAndUpdate(
      { id: "default" },
      defaultTheme,
      { new: true, runValidators: true, upsert: true }
    );

    return NextResponse.json(
      {
        success: true,
        data: resetTheme,
        message: "Theme settings reset to default successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error resetting theme settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to reset theme settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}