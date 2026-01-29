import { NextRequest, NextResponse } from "next/server";
import Lead from "@/config/utils/admin/lead/leadSchema";
import connectDB from "@/config/models/connectDB";

// GET - Fetch all leads
export async function GET() {
  try {
    await connectDB();
    const leads = await Lead.find({}).sort({ submittedAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: leads,
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

// POST - Create new lead
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    const newLead = new Lead(body);
    const savedLead = await newLead.save();

    return NextResponse.json({
      success: true,
      data: savedLead,
      message: "Lead created successfully",
    });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create lead" },
      { status: 500 }
    );
  }
}

// PUT - Update lead
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json(
        { success: false, error: "Lead ID is required" },
        { status: 400 }
      );
    }

    // Get the current lead to check status change
    const currentLead = await Lead.findById(_id);
    if (!currentLead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    // Generate review link if status is changing to completed
    if (updateData.status === "completed" && currentLead.status !== "completed") {
      // Generate a unique review token
      const reviewToken = `review_${_id}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      const reviewLink = `${process.env.APP_URL || 'http://localhost:3000'}/review?token=${reviewToken}`;
      
      console.log('Generating review link:', { reviewToken, reviewLink });
      
      updateData.reviewToken = reviewToken;
      updateData.reviewLink = reviewLink;
    }

    const updatedLead = await Lead.findByIdAndUpdate(
      _id,
      { ...updateData, lastUpdated: new Date() },
      { new: true }
    );

    let responseMessage = "Lead updated successfully";
    
    // If review link was generated, include it in the response
    if (updateData.reviewLink) {
      responseMessage += ". Review link generated - you can share this with the customer via WhatsApp.";
    }

    return NextResponse.json({
      success: true,
      data: updatedLead,
      message: responseMessage,
      reviewLink: updateData.reviewLink || null,
    });
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update lead" },
      { status: 500 }
    );
  }
}

// DELETE - Delete lead
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('id');

    if (!leadId) {
      return NextResponse.json(
        { success: false, error: "Lead ID is required" },
        { status: 400 }
      );
    }

    const deletedLead = await Lead.findByIdAndDelete(leadId);

    if (!deletedLead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete lead" },
      { status: 500 }
    );
  }
}