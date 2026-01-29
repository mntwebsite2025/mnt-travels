import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: [100, "Location cannot exceed 100 characters"],
    },
    avatar: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      required: [true, "Testimonial content is required"],
      trim: true,
      minlength: [1, "Content must be at least 1 characters"],
      maxlength: [1000, "Content cannot exceed 1000 characters"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
      default: 5,
    },
    servicesType: {
      type: String,
      required: [true, "Services type is required"],
      trim: true,
      maxlength: [100, "Services type cannot exceed 100 characters"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "published",
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
testimonialSchema.index({ status: 1, createdAt: -1 });
testimonialSchema.index({ rating: -1 });
testimonialSchema.index({ servicesType: 1 });

const Testimonial = mongoose.models.Testimonial || mongoose.model("Testimonial", testimonialSchema);

export default Testimonial;
