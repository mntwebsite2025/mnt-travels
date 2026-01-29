import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    // Contact Information
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: false,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      default: "",
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },

    // Travel Service Information
    serviceType: {
      type: String,
      required: true,
      trim: true,
    },
    travelDate: {
      type: String,
      required: true,
    },
    travelTime: {
      type: String,
      trim: true,
      default: "",
    },
    returnDate: {
      type: String,
      trim: true,
      default: "",
    },
    pickupLocation: {
      type: String,
      required: true,
      trim: true,
    },
    dropLocation: {
      type: String,
      trim: true,
      default: "",
    },
    passengers: {
      type: Number,
      default: 1,
      min: 1,
      max: 20,
    },

    // Customer Message
    message: {
      type: String,
      required: true,
      trim: true,
    },

    // Lead Management
    status: {
      type: String,
      enum: ["new", "contacted", "confirmed", "completed", "cancelled"],
      default: "new",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    // Lead Source Tracking
    source: {
      type: String,
      enum: ["website", "whatsapp", "phone", "referral"],
      default: "website",
    },

    // Additional Fields
    estimatedCost: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    reviewLink: {
      type: String,
      trim: true,
      default: "",
    },
    reviewToken: {
      type: String,
      trim: true,
      default: "",
    },

    // Timestamps
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance
leadSchema.index({ email: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ priority: 1 });
leadSchema.index({ source: 1 });
leadSchema.index({ serviceType: 1 });
leadSchema.index({ submittedAt: -1 });

// Update lastUpdated on save
leadSchema.pre("save", function (next) {
  this.lastUpdated = new Date();
  next();
});

const Lead = mongoose.models.Lead || mongoose.model("Lead", leadSchema);

export default Lead;
