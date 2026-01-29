import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/models/connectDB";
import Package from "@/config/utils/admin/packages/packageSchema";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured");
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "0");

    // Build query for active packages only
    let query: any = { 
      status: "active", 
      isDeleted: false 
    };

    // Filter by featured if requested
    if (featured === "true") {
      query.featured = true;
    }

    // Filter by category if provided
    if (category && category !== "all") {
      query.category = category;
    }

    // Get packages with sorting (featured first, then newest)
    let packagesQuery = Package.find(query)
      .sort({ featured: -1, createdAt: -1 })
      .select('-isDeleted -__v'); // Exclude internal fields

    // Apply limit if specified
    if (limit > 0) {
      packagesQuery = packagesQuery.limit(limit);
    }

    const packages = await packagesQuery.exec();

    // Transform data for frontend compatibility
    const transformedPackages = packages.map(pkg => ({
      id: pkg._id.toString(),
      title: pkg.title,
      description: pkg.shortDescription,
      image: pkg.image,
      duration: pkg.duration,
      price: pkg.price,
      featured: pkg.featured,
      highlights: pkg.highlights,
      inclusions: pkg.inclusions,
      category: pkg.destination, // Using destination as category for now
      fullDescription: pkg.fullDescription,
      exclusions: pkg.exclusions,
      gallery: pkg.gallery,
      itinerary: pkg.itinerary,
      slug: pkg.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      seoTitle: pkg.seoTitle,
      seoDescription: pkg.seoDescription,
      seoKeywords: pkg.seoKeywords
    }));

    return NextResponse.json({
      success: true,
      data: transformedPackages,
      total: transformedPackages.length
    });

  } catch (error) {
    console.error("Error fetching packages:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch packages" },
      { status: 500 }
    );
  }
}