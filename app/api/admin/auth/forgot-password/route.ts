import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "../../../../../config/models/connectDB";
import Admin from "../../../../../config/utils/admin/login/loginSchema";
import EmailSMTP from "../../../../../config/utils/admin/smtp/emailSMTPSchema";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    await connectDB();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        success: false, 
        error: "Please enter a valid email address." 
      }, { status: 400 });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return NextResponse.json({ 
        success: false, 
        error: "The email address you entered is not registered as an admin account." 
      }, { status: 401 });
    }

    // Check if account is active
    if (!admin.isActive) {
      return NextResponse.json({ 
        success: false, 
        error: "Your admin account is currently inactive. Please contact support." 
      }, { status: 403 });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Save reset token to admin
    admin.resetPasswordToken = resetToken;
    admin.resetPasswordExpires = resetTokenExpiry;
    await admin.save();

    // Get SMTP settings
    const smtpSettings = await EmailSMTP.findOne({ id: "default", isActive: true });
    if (!smtpSettings) {
      throw new Error("SMTP settings not configured");
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpSettings.smtpHost,
      port: parseInt(smtpSettings.smtpPort),
      secure: smtpSettings.smtpPort === "465",
      auth: {
        user: smtpSettings.smtpUser,
        pass: smtpSettings.smtpPassword,
      },
    });

    // Reset link (replace with your actual frontend URL)
    const resetLink = `${process.env.APP_URL}/admin/login/reset-password?token=${resetToken}`;

    console.log('Attempting to send email with the following details:');
    console.log('SMTP Settings:', {
      host: smtpSettings.smtpHost,
      port: smtpSettings.smtpPort,
      secure: smtpSettings.smtpPort === "465",
      fromEmail: smtpSettings.fromEmail,
      fromName: smtpSettings.fromName,
      toEmail: email
    });
    console.log('Reset Link:', resetLink);

    try {
      // Send email
      const info = await transporter.sendMail({
        from: smtpSettings.fromEmail,
        to: email,
        subject: "Password Reset Request",
        html: `
          <h1>Password Reset Request</h1>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <p><a href="${resetLink}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
          <p>Or copy and paste this link in your browser:</p>
          <p>${resetLink}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p><small>This is an automated message, please do not reply to this email.</small></p>
        `,
      });
      
      console.log('Email sent successfully:', info.messageId);
    } catch (error: any) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, you will receive password reset instructions.",
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
