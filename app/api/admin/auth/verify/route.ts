import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import connectDB from "../../../../../config/models/connectDB"
import Admin from "../../../../../config/utils/admin/login/loginSchema"

interface DecodedToken {
  adminId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export async function GET(request : Request) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Check if JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured")
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken

    await connectDB()

    // Find admin
    const admin = await Admin.findById(decoded.adminId).select("-password -resetPasswordToken -resetPasswordExpires")

    if (!admin || !admin.isActive) {
      return NextResponse.json({ error: "Admin not found or inactive" }, { status: 404 })
    }

    // Update lastVerified timestamp
    admin.lastVerified = new Date()
    await admin.save()

    return NextResponse.json({
      success: true,
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        phone: admin.phone,
        location: admin.location,
        avatar: admin.avatar,
        role: admin.role,
        lastLogin: admin.lastLogin,
        lastVerified: admin.lastVerified,
        emailVerified: admin.emailVerified,
        isActive: admin.isActive,
      },
    })
  } catch (error: any) {
    console.error("Token verification error:", error)

    if (error.message === "JWT_SECRET is not configured") {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ 
        error: "Invalid token. Please login again.",
        code: "INVALID_TOKEN"
      }, { status: 401 })
    }

    if (error.name === "TokenExpiredError") {
      return NextResponse.json({ 
        error: "Session expired. Please login again.",
        code: "TOKEN_EXPIRED"
      }, { status: 401 })
    }

    if (error.name === "CastError") {
      return NextResponse.json({ 
        error: "Invalid token format",
        code: "INVALID_TOKEN_FORMAT"
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: "An error occurred while verifying your session",
      code: "INTERNAL_ERROR"
    }, { status: 500 })
  }
}
 