import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/config/models/connectDB"
import Banner from "@/config/utils/admin/banner/bannerSchema"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const pageKey = (searchParams.get("pageKey") || "").toLowerCase().trim()

    if (!pageKey) {
      return NextResponse.json({ success: false, message: "pageKey is required" }, { status: 400 })
    }

    const banner = await Banner.findOne({
      pageKey,
      status: "active",
      isDeleted: false,
    })
      .sort({ updatedAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      data: banner || null,
    })
  } catch (error) {
    console.error("Error fetching public banner:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch banner" }, { status: 500 })
  }
}
