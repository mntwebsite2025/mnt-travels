import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/models/connectDB";
import Lead from "@/config/utils/admin/lead/leadSchema";
import EmailSMTP from "@/config/utils/admin/smtp/emailSMTPSchema";
import { createSMTPTransporter } from "@/config/models/connectSMTP";

// POST - Create new lead from any form (quotation, contact, lead)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
 
    const body = await request.json();
    const {
      fullName,
      email,
      phone = "",
      company = "",
      service,
      message,
      projectDescription = "",
      additionalRequirements = "",
      formSource = "contact", // Default to contact if not specified
    } = body;

    // Validation
    if (!fullName || !email || !service || !message) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields: fullName, email, service, and message are required",
        },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email format",
        },
        { status: 400 }
      );
    }

    // Create lead with default status "new" and priority "high"
    const leadData = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      company: company.trim(),
      service: service.trim(),
      message: message.trim(),
      projectDescription: projectDescription.trim(),
      additionalRequirements: additionalRequirements.trim(),
      status: "new",
      priority: "high",
      formSource: formSource,
      submittedAt: new Date(),
      lastUpdated: new Date(),
    };

    // Save lead to database
    const newLead = new Lead(leadData);
    const savedLead = await newLead.save();

    // Send email notification to admin
    try {
      await sendAdminNotification(savedLead);
    } catch (emailError) {
      console.error("Email notification failed:", emailError);
      // Don't fail the API call if email fails, just log it
    }

    return NextResponse.json({
      success: true,
      message: "Lead submitted successfully",
      data: {
        id: savedLead._id,
        formSource: savedLead.formSource,
        status: savedLead.status,
        priority: savedLead.priority,
        submittedAt: savedLead.submittedAt,
      },
    });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error. Please try again later.",
      },
      { status: 500 }
    );
  }
}

// GET - Retrieve all leads (for admin panel)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const formSource = searchParams.get("formSource");
    const all = searchParams.get("all") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = all ? 0 : parseInt(searchParams.get("limit") || "10");

    // Build filter query
    const filter: any = {};
    if (status && status !== "all") filter.status = status;
    if (priority && priority !== "all") filter.priority = priority;
    if (formSource && formSource !== "all") filter.formSource = formSource;

    // Get total count for pagination
    const total = await Lead.countDocuments(filter);

    // Get leads with or without pagination based on 'all' parameter
    let query = Lead.find(filter).sort({ submittedAt: -1 });

    if (!all) {
      query = query.skip((page - 1) * limit).limit(limit);
    }

    const leads = await query.lean();

    return NextResponse.json({
      success: true,
      data: leads,
      pagination: all
        ? null
        : {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch leads",
      },
      { status: 500 }
    );
  }
}

// PUT - Update a lead
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Lead ID is required",
        },
        { status: 400 }
      );
    }

    // Update the lead
    const updatedLead = await Lead.findByIdAndUpdate(
      _id,
      { ...updateData, lastUpdated: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedLead) {
      return NextResponse.json(
        {
          success: false,
          message: "Lead not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Lead updated successfully",
      data: updatedLead,
    });
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update lead",
      },
      { status: 500 }
    );
  }
}

// Function to send admin notification email
async function sendAdminNotification(lead: any) {
  try {
    // Get SMTP configuration
    const smtpConfig = await EmailSMTP.findOne({
      id: "default",
      isActive: true,
    });

    if (!smtpConfig) {
      throw new Error("SMTP configuration not found or inactive");
    }

    // Create transporter
    const transporter = createSMTPTransporter(smtpConfig);

    // Determine form type for email subject and content
    const formTypeMap = {
      quotation: "Quotation Request",
      contact: "Contact Form",
      lead: "Lead Form",
      brochure: "Brochure Request", // Changed from "broucher"
    };

    const formType =
      formTypeMap[lead.formSource as keyof typeof formTypeMap] ||
      "Form Submission";

    // Email content
    const emailSubject = `New ${formType} Submission - ${lead.fullName}`;

    const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; background-color: #f8fafc;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">New ${formType} Received</h1>
          <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">Filigree Solutions Admin Panel</p>
        </div>
        
        <div style="padding: 30px; background-color: white; margin: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="border-left: 4px solid #667eea; padding-left: 20px; margin-bottom: 30px;">
            <h2 style="color: #2d3748; margin: 0 0 10px 0;">Lead Information</h2>
            <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px;">
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="background-color: #3182ce; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${lead.status.toUpperCase()}</span></p>
              <p style="margin: 5px 0;"><strong>Priority:</strong> <span style="background-color: #e53e3e; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${lead.priority.toUpperCase()}</span></p>
              <p style="margin: 5px 0;"><strong>Form Source:</strong> <span style="background-color: #38a169; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${lead.formSource.toUpperCase()}</span></p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
            <div>
              <h3 style="color: #2d3748; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Contact Details</h3>
              <p style="margin: 10px 0;"><strong>Name:</strong> ${
                lead.fullName
              }</p>
              <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${
                lead.email
              }" style="color: #3182ce;">${lead.email}</a></p>
              ${
                lead.phone
                  ? `<p style="margin: 10px 0;"><strong>Phone:</strong> <a href="tel:${lead.phone}" style="color: #3182ce;">${lead.phone}</a></p>`
                  : ""
              }
              ${
                lead.company
                  ? `<p style="margin: 10px 0;"><strong>Company:</strong> ${lead.company}</p>`
                  : ""
              }
            </div>
            
            <div>
              <h3 style="color: #2d3748; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Service Details</h3>
              <p style="margin: 10px 0;"><strong>Service:</strong> ${
                lead.service
              }</p>
              <p style="margin: 10px 0;"><strong>Submitted:</strong> ${new Date(
                lead.submittedAt
              ).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
            </div>
          </div>

          <div style="margin-bottom: 30px;">
            <h3 style="color: #2d3748; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Message</h3>
            <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #4299e1;">
              <p style="margin: 0; line-height: 1.6; color: #2d3748;">${
                lead.message
              }</p>
            </div>
          </div>

          ${
            lead.projectDescription
              ? `
          <div style="margin-bottom: 30px;">
            <h3 style="color: #2d3748; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Project Description</h3>
            <div style="background-color: #f0fff4; padding: 20px; border-radius: 8px; border-left: 4px solid #48bb78;">
              <p style="margin: 0; line-height: 1.6; color: #2d3748;">${lead.projectDescription}</p>
            </div>
          </div>
          `
              : ""
          }

          ${
            lead.additionalRequirements
              ? `
          <div style="margin-bottom: 30px;">
            <h3 style="color: #2d3748; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Additional Requirements</h3>
            <div style="background-color: #fffaf0; padding: 20px; border-radius: 8px; border-left: 4px solid #ed8936;">
              <p style="margin: 0; line-height: 1.6; color: #2d3748;">${lead.additionalRequirements}</p>
            </div>
          </div>
          `
              : ""
          }

          <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 2px solid #e2e8f0;">
            <p style="color: #718096; margin: 0; font-size: 14px;">
              This email was automatically generated from the Filigree Solutions website.<br>
              Lead ID: #${lead._id}<br>
              Received at: ${new Date().toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
              })}
            </p>
          </div>
        </div>
      </div>
    `;

    // Send email - Use environment variable for admin email or fallback to fromEmail
    const adminEmail = process.env.SMTP_FROM_EMAIL || smtpConfig.fromEmail;

    const mailOptions = {
      from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`,
      to: adminEmail, // Send to admin email
      subject: emailSubject,
      html: emailHTML,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Admin notification email sent:", result.messageId);

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error) {
    console.error("Failed to send admin notification:", error);
    throw error;
  }
}
