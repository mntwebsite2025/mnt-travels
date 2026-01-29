import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/models/connectDB";
import Lead from "@/config/utils/admin/lead/leadSchema";
import Testimonial from "@/config/utils/admin/testimonial/testimonialSchema";

// GET - Fetch lead details for review form
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Review token is required",
        },
        { status: 400 }
      );
    }

    // Find lead by review token
    const lead = await Lead.findOne({ reviewToken: token });

    if (!lead) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired review link",
        },
        { status: 404 }
      );
    }

    // Return lead details for review form
    return NextResponse.json({
      success: true,
      data: {
        leadId: lead._id,
        customerName: lead.fullName,
        serviceType: lead.serviceType,
        travelDate: lead.travelDate,
        pickupLocation: lead.pickupLocation,
        dropLocation: lead.dropLocation,
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching review details:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch review details",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST - Submit review
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { token, rating, content, location } = body;

    if (!token || !rating || !content) {
      return NextResponse.json(
        {
          success: false,
          message: "Token, rating, and content are required",
        },
        { status: 400 }
      );
    }

    // Find lead by review token
    const lead = await Lead.findOne({ reviewToken: token });

    if (!lead) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired review link",
        },
        { status: 404 }
      );
    }

    // Validate rating
    const ratingNum = parseInt(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        {
          success: false,
          message: "Rating must be between 1 and 5",
        },
        { status: 400 }
      );
    }

    // Create testimonial
    const testimonialData = {
      name: lead.fullName,
      location: location || lead.pickupLocation,
      content: content.trim(),
      rating: ratingNum,
      servicesType: lead.serviceType,
      status: "draft", // Admin will review and publish
    };

    const newTestimonial = new Testimonial(testimonialData);
    await newTestimonial.save();

    // Clear the review token so it can't be used again
    lead.reviewToken = "";
    await lead.save();

    return NextResponse.json({
      success: true,
      message: "Thank you for your review! It will be published after admin approval.",
    });
  } catch (error: unknown) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit review",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}