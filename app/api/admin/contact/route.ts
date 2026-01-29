import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/models/connectDB";
import Contact from "@/config/utils/admin/contact/ContactSchema";

// GET - Fetch contact information
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get the contact information (there should only be one record)
    let contactInfo = await Contact.findOne();

    // If no contact info exists, create default data
    if (!contactInfo) {
      const defaultContactInfo = {
        primaryPhone: "9003782966",
        secondaryPhone: "9443935045",
        whatsappNumber: "9150639506",
        email: "info@mnttours.com",
        address: "1/92, Near By Sai Baba Temple, Mellur Main Road, Uthangudi",
        city: "Madurai",
        state: "Tamil Nadu",
        pincode: "625107",
        country: "India",
        businessHours: "24/7 Available",
        bookingHours: "24/7 Online Booking Available",
        servicesOffered: "One-way trips, Round trips, Airport Taxi, Day rentals, Hourly packages, Local pickup/drop, Tour packages",
        coverageAreas: "Chennai, Bangalore, Madurai, Coimbatore, Ooty, Kodaikanal, Pondicherry, Trichy, Salem, Tirunelveli",
        facebook: "",
        twitter: "",
        linkedin: "",
        instagram: "",
        youtube: "",
        whatsapp: "",
        telegram: "",
        github: "",
        behance: "",
        dribbble: "",
        mapEmbedCode: "",
        latitude: "",
        longitude: "",
        pageTitle: "Plan Your Perfect Journey",
        pageDescription: "Ready to explore beautiful destinations? Contact our travel experts today and let us plan your perfect journey with comfort and safety.",
        officeTitle: "Visit Our Office",
        officeDescription: "Conveniently located, our office is your gateway to exploring wonderful destinations",
      };

      contactInfo = new Contact(defaultContactInfo);
      await contactInfo.save();
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

// POST - Create or update contact information
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate required fields
    const requiredFields = ['primaryPhone', 'whatsappNumber', 'email', 'address', 'city', 'state', 'pincode', 'country', 'pageTitle', 'pageDescription', 'officeTitle', 'officeDescription'];
    for (const field of requiredFields) {
      if (!body[field] || body[field].trim() === '') {
        return NextResponse.json(
          {
            success: false,
            message: `${field} is required and cannot be empty`,
          },
          { status: 400 }
        );
      }
    }

    // Check if contact info already exists
    let contactInfo = await Contact.findOne();

    if (contactInfo) {
      // Update existing contact info
      Object.assign(contactInfo, body);
      await contactInfo.save();
    } else {
      // Create new contact info
      contactInfo = new Contact(body);
      await contactInfo.save();
    }

    return NextResponse.json({
      success: true,
      data: contactInfo,
      message: "Contact information saved successfully",
    });
  } catch (error: unknown) {
    console.error("Error saving contact information:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save contact information",
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT - Update contact information
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate required fields
    const requiredFields = ['primaryPhone', 'whatsappNumber', 'email', 'address', 'city', 'state', 'pincode', 'country', 'pageTitle', 'pageDescription', 'officeTitle', 'officeDescription'];
    for (const field of requiredFields) {
      if (!body[field] || body[field].trim() === '') {
        return NextResponse.json(
          {
            success: false,
            message: `${field} is required and cannot be empty`,
          },
          { status: 400 }
        );
      }
    }

    // Find and update the contact info (there should only be one record)
    const contactInfo = await Contact.findOneAndUpdate(
      {},
      body,
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      data: contactInfo,
      message: "Contact information updated successfully",
    });
  } catch (error: unknown) {
    console.error("Error updating contact information:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update contact information",
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}