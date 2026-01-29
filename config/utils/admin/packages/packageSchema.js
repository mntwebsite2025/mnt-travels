import mongoose from "mongoose";

const itineraryDaySchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });

const packageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    destination: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    shortDescription: {
      type: String,
      required: false, // changed to optional
      trim: true
    },
    fullDescription: {
      type: String,
      required: false // changed to optional
    },
    duration: {
      type: String,
      required: false, // changed to optional
      trim: true
    },
    price: {
      type: String,
      required: false, // changed to optional
      trim: true
    },
    inclusions: [{
      type: String,
      trim: true
    }],
    exclusions: [{
      type: String,
      trim: true
    }],
    highlights: [{
      type: String,
      trim: true
    }],
    image: {
      type: String,
      required: true, // main image is required
      trim: true
    },
    gallery: [{
      type: String,
      trim: true
    }],
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
      index: true
    },
    featured: {
      type: Boolean,
      default: false,
      index: true
    },
    seoTitle: {
      type: String,
      required: false,
      trim: true,
      maxlength: 200,
    },
    seoDescription: {
      type: String,
      required: false,
      trim: true,
      maxlength: 300,
    },
    seoKeywords: {
      type: String,
      required: false,
      trim: true,
    },
    itinerary: [itineraryDaySchema],

    views: {
      type: Number,
      default: 0
    },
    bookings: {
      type: Number,
      default: 0
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
packageSchema.index({ status: 1, featured: -1, createdAt: -1 });
packageSchema.index({ destination: 1, status: 1 });
packageSchema.index({ title: "text", destination: "text", shortDescription: "text" });

// Virtual for URL slug
packageSchema.virtual("urlSlug").get(function () {
  return this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
});

// Pre-save middleware to limit featured packages
packageSchema.pre("save", async function (next) {
  if (this.featured && this.isModified("featured")) {
    const featuredCount = await this.constructor.countDocuments({ 
      featured: true, 
      _id: { $ne: this._id },
      isDeleted: false 
    });
    
    if (featuredCount >= 3) {
      const error = new Error("Maximum 3 packages can be featured at a time");
      error.name = "ValidationError";
      return next(error);
    }
  }
  next();
});

// Static method to get featured packages
packageSchema.statics.getFeatured = function() {
  return this.find({ 
    featured: true, 
    status: "active", 
    isDeleted: false 
  }).limit(3).sort({ createdAt: -1 });
};

// Static method to get active packages with pagination
packageSchema.statics.getActive = function(page = 1, limit = 6, destination = null) {
  const query = { status: "active", isDeleted: false };
  if (destination) {
    query.destination = new RegExp(destination, 'i');
  }
  
  const skip = (page - 1) * limit;
  
  return {
    packages: this.find(query)
      .sort({ featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    total: this.countDocuments(query)
  };
};

// Instance method to increment views
packageSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Instance method to increment bookings
packageSchema.methods.incrementBookings = function() {
  this.bookings += 1;
  return this.save();
};

const Package = mongoose.models.Package || mongoose.model("Package", packageSchema);

export default Package;