import { NextResponse } from "next/server";
import Location from "@/config/utils/admin/location/locationSchema";
import connectDB from "@/config/models/connectDB";

// GET - Fetch active locations for frontend
export async function GET() {
  try {
    await connectDB();
    const locations = await Location.find({ isActive: true }).sort({ order: 1, name: 1 });
    
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