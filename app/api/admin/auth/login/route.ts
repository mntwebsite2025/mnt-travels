import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { compare } from "bcryptjs"
import connectDB from "../../../../../config/models/connectDB"
import Admin from "../../../../../config/utils/admin/login/loginSchema"

export async function POST(request : Request) {
  try {
    await connectDB()

    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find admin by email
    let admin = await Admin.findOne({ email })
    
    console.log('Login attempt for email:', email);
    
    if (!admin) {
      console.log('Login attempt failed: Admin not found for email:', email);
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    console.log('Found admin account:', {
      email: admin.email,
      hasPassword: !!admin.password,
      isActive: admin.isActive,
      lastLogin: admin.lastLogin
    });

    // Verify password
    try {
      // Check if the user has a password set
      if (!admin.password) {
        console.log('Account has no password set. Possibly a Google-only account');
        return NextResponse.json({ 
          error: "Please use Google Sign-In or reset your password to set one up",
          code: "NO_PASSWORD_SET"
        }, { status: 401 });
      }

      // Log password info (length only, not the actual password)
      console.log('Attempting password verification:', {
        providedPasswordLength: password.length,
        storedPasswordLength: admin.password?.length
      });

      const isPasswordValid = await compare(password, admin.password);
      
      if (!isPasswordValid) {
        console.log('Login attempt failed: Invalid password for email:', email);
        // Refresh admin data to ensure we have the latest password
        const refreshedAdmin = await Admin.findById(admin._id);
        if (refreshedAdmin && refreshedAdmin.password !== admin.password) {
          console.log('Password in database has changed, retrying verification');
          const retryValid = await compare(password, refreshedAdmin.password);
          if (!retryValid) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
          }
          admin = refreshedAdmin;
        } else {
          return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }
      }
      
      console.log('Password verification successful for:', email);
    } catch (error) {
      console.error('Password comparison error:', error);
      return NextResponse.json({ error: "Error verifying credentials" }, { status: 500 })
    }

    // Check if account is active
    if (!admin.isActive) {
      return NextResponse.json({ error: "Account is inactive" }, { status: 403 })
    }

    // Ensure JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured")
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        adminId: admin._id.toString(),
        email: admin.email,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    )

    // Update last login time
    admin.lastLogin = new Date()
    await admin.save()

    // Prepare admin data (exclude sensitive information)
    const adminData = {
      id: admin._id,
      firstName: admin.firstName, 
      lastName: admin.lastName,
      email: admin.email,
      phone: admin.phone,
      location: admin.location,
      avatar: admin.avatar,
      role: admin.role,
      lastLogin: admin.lastLogin,
      emailVerified: admin.emailVerified,
      isActive: admin.isActive
    }

    return NextResponse.json({
      success: true,
      message: "Login successful",
      token,
      admin: adminData,
    })
  } catch (error: any) {
    console.error("Login error:", error)

    if (error.message === "JWT_SECRET is not configured") {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    if (error.name === "ValidationError") {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 })
    }

    return NextResponse.json({ 
      error: "An error occurred during login. Please try again." 
    }, { status: 500 })
  }
}
