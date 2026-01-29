import { NextRequest, NextResponse } from "next/server";
import SEO from "@/config/utils/admin/seo/seoSchema";
import connectDB from "@/config/models/connectDB";

// GET - Fetch all SEO data
export async function GET() {
  try {
    await connectDB();
    
    // Check if SEO data exists, if not create default data (only once)
    let seoData = await SEO.find({}).sort({ lastUpdated: -1 });
    
    if (seoData.length === 0) {
      // Create default SEO data if none exists - using upsert to prevent duplicates
      const defaultSEOData = [
        {
          id: "home",
          pageName: "Home Page",
          title: "mnt Tours & Travels - Best Taxi Services in Tamil Nadu",
          description: "Book reliable taxi services, tour packages, and travel solutions across Tamil Nadu. One-way trips, round trips, airport taxi, and tour packages available 24/7.",
          keywords: "taxi service tamil nadu, tour packages, airport taxi, mnt tours, chennai taxi, bangalore taxi, travel services, one way trip, round trip",
          lastUpdated: new Date(),
          isActive: true,
        },
        {
          id: "about",
          pageName: "About Us",
          title: "About mnt Tours & Travels - Your Trusted Travel Partner",
          description: "Learn about mnt Tours & Travels, your trusted travel partner in Tamil Nadu. We provide reliable taxi services, tour packages, and travel solutions since 2020.",
          keywords: "about mnt tours, travel company tamil nadu, trusted taxi service, travel partner, company history, reliable transport",
          lastUpdated: new Date(),
          isActive: true,
        },
        {
          id: "tariff",
          pageName: "Tariff Page",
          title: "Taxi Tariff & Pricing - mnt Tours & Travels",
          description: "Check our competitive taxi tariff and pricing for one-way trips, round trips, airport taxi, and hourly packages. Transparent pricing with no hidden charges.",
          keywords: "taxi tariff, taxi pricing, one way taxi rates, round trip rates, airport taxi charges, hourly package rates, transparent pricing",
          lastUpdated: new Date(),
          isActive: true,
        },
        {
          id: "packages",
          pageName: "Packages Page",
          title: "Tour Packages Tamil Nadu - Ooty, Kodaikanal, Chennai Tours",
          description: "Explore our exciting tour packages for Ooty, Kodaikanal, Chennai, and other Tamil Nadu destinations. Complete packages with accommodation and sightseeing.",
          keywords: "tour packages tamil nadu, ooty tour package, kodaikanal tour, chennai tour, hill station packages, south india tours, travel packages",
          lastUpdated: new Date(),
          isActive: true,
        },
        {
          id: "contact",
          pageName: "Contact Us",
          title: "Contact mnt Tours & Travels - Book Your Taxi Now",
          description: "Contact mnt Tours & Travels for taxi booking, tour packages, and travel inquiries. Available 24/7 for all your travel needs across Tamil Nadu.",
          keywords: "contact mnt tours, taxi booking, travel inquiry, phone number, whatsapp booking, 24/7 service, customer support",
          lastUpdated: new Date(),
          isActive: true,
        },
      ];

      // Use bulkWrite with upsert to prevent duplicates
      const bulkOps = defaultSEOData.map(item => ({
        updateOne: {
          filter: { id: item.id },
          update: { $setOnInsert: item },
          upsert: true
        }
      }));

      await SEO.bulkWrite(bulkOps);
      seoData = await SEO.find({}).sort({ lastUpdated: -1 });
      console.log("✅ SEO data initialized with default values");
    }
    
    return NextResponse.json({
      success: true,
      data: seoData,
    });
  } catch (error) {
    console.error("Error fetching SEO data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch SEO data" },
      { status: 500 }
    );
  }
}

// PUT - Update SEO data
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, title, description, keywords } = body;

    if (!id || !title || !description) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updatedSEO = await SEO.findOneAndUpdate(
      { id },
      {
        title,
        description,
        keywords: keywords || "",
        lastUpdated: new Date(),
      },
      { new: true }
    );

    if (!updatedSEO) {
      return NextResponse.json(
        { success: false, error: "SEO page not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedSEO,
      message: "SEO data updated successfully",
    });
  } catch (error) {
    console.error("Error updating SEO data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update SEO data" },
      { status: 500 }
    );
  }
}