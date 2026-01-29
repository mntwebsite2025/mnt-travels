import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/config/models/connectDB"
import Lead from "@/config/utils/admin/lead/leadSchema"

// GET - Get a single lead by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const { id } = await params
    const lead = await Lead.findById(id)

    if (!lead) {
      return NextResponse.json(
        {
          success: false,
          message: "Lead not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: lead,
    })
  } catch (error) {
    console.error("Error fetching lead:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch lead",
      },
      { status: 500 },
    )
  }
}

// PUT - Update a single lead by ID
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const { id } = await params
    const body = await request.json()

    // Remove _id from update data if present
    const { _id, id: bodyId, ...updateData } = body

    // Update the lead
    const updatedLead = await Lead.findByIdAndUpdate(
      id,
      { ...updateData, lastUpdated: new Date() },
      { new: true, runValidators: true },
    )

    if (!updatedLead) {
      return NextResponse.json(
        {
          success: false,
          message: "Lead not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Lead updated successfully",
      data: updatedLead,
    })
  } catch (error) {
    console.error("Error updating lead:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update lead",
      },
      { status: 500 },
    )
  }
}

// DELETE - Delete a single lead by ID
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const { id } = await params
    const deletedLead = await Lead.findByIdAndDelete(id)

    if (!deletedLead) {
      return NextResponse.json(
        {
          success: false,
          message: "Lead not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Lead deleted successfully",
      data: deletedLead,
    })
  } catch (error) {
    console.error("Error deleting lead:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete lead",
      },
      { status: 500 },
    )
  }
}
