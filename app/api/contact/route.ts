import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/models/connectDB";
import Contact from "@/config/utils/admin/contact/ContactSchema";

// GET - Fetch public contact information
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get the contact information (there should only be one record)
    const contactInfo = await Contact.findOne().lean();
    
    if (!contactInfo) {
      return NextResponse.json({
        success: false,
        message: "Contact information not found",
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: contactInfo,
      message: "Contact information fetched successfully",
    });
  } catch (error: unknown) {
    console.error("Error fetching contact information:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch contact information",
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}