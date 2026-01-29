import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/models/connectDB";
import Tariff from "@/config/utils/admin/tariff/tariffSchema";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured");
    const vehicleType = searchParams.get("vehicleType");
    const limit = parseInt(searchParams.get("limit") || "0");

    // Build query for active tariffs only
    let query: any = { 
      status: "active", 
      isDeleted: false 
    };

    // Filter by featured if requested
    if (featured === "true") {
      query.featured = true;
    }

    // Filter by vehicle type if provided
    if (vehicleType && vehicleType !== "all") {
      query.vehicleType = new RegExp(vehicleType, 'i');
    }

    // Get tariffs with sorting (featured first, then newest)
    let tariffsQuery = Tariff.find(query)
      .sort({ featured: -1, createdAt: -1 })
      .select('-isDeleted -__v'); // Exclude internal fields

    // Apply limit if specified
    if (limit > 0) {
      tariffsQuery = tariffsQuery.limit(limit);
    }

    const tariffs = await tariffsQuery.exec();

    // Transform data for frontend compatibility
    const transformedTariffs = tariffs.map(tariff => ({
      id: tariff._id.toString(),
      vehicleType: tariff.vehicleType,
      vehicleName: tariff.vehicleName,
      description: tariff.description,
      oneWayRate: tariff.oneWayRate,
      roundTripRate: tariff.roundTripRate,
      driverAllowance: tariff.driverAllowance,
      minimumKmOneWay: tariff.minimumKmOneWay,
      minimumKmRoundTrip: tariff.minimumKmRoundTrip,
      image: tariff.image,
      featured: tariff.featured,
      additionalCharges: tariff.additionalCharges,
      slug: tariff.vehicleName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      seoTitle: tariff.seoTitle,
      seoDescription: tariff.seoDescription,
      seoKeywords: tariff.seoKeywords
    }));

    return NextResponse.json({
      success: true,
      data: transformedTariffs,
      total: transformedTariffs.length
    });

  } catch (error) {
    console.error("Error fetching tariffs:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch tariffs" },
      { status: 500 }
    );
  }
}