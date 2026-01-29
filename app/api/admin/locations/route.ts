import { NextRequest, NextResponse } from "next/server";
import Location from "@/config/utils/admin/location/locationSchema";
import connectDB from "@/config/models/connectDB";

// GET - Fetch all locations
export async function GET() {
  try {
    await connectDB();
    const locations = await Location.find({}).sort({ order: 1, name: 1 });
    
    return NextResponse.json({
      success: true,
      data: locations,
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}

// POST - Create new location
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    const newLocation = new Location(body);
    const savedLocation = await newLocation.save();

    return NextResponse.json({
      success: true,
      data: savedLocation,
      message: "Location created successfully",
    });
  } catch (error) {
    console.error("Error creating location:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create location" },
      { status: 500 }
    );
  }
}

// PUT - Update location
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json(
        { success: false, error: "Location ID is required" },
        { status: 400 }
      );
    }

    const updatedLocation = await Location.findByIdAndUpdate(
      _id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedLocation) {
      return NextResponse.json(
        { success: false, error: "Location not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedLocation,
      message: "Location updated successfully",
    });
  } catch (error) {
    console.error("Error updating location:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update location" },
      { status: 500 }
    );
  }
}

// DELETE - Delete location
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('id');

    if (!locationId) {
      return NextResponse.json(
        { success: false, error: "Location ID is required" },
        { status: 400 }
      );
    }

    const deletedLocation = await Location.findByIdAndDelete(locationId);

    if (!deletedLocation) {
      return NextResponse.json(
        { success: false, error: "Location not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Location deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting location:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete location" },
      { status: 500 }
    );
  }
}