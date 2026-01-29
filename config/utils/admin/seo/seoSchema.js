import mongoose from "mongoose";

const seoSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
      index: { unique: true }
    },
    pageName: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    keywords: {
      type: String,
      trim: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for better performance
seoSchema.index({ isActive: 1 });

const SEO = mongoose.models.SEO || mongoose.model("SEO", seoSchema);

// Remove auto-seeding from schema - data initialization will be handled by the API route only

export default SEO;
