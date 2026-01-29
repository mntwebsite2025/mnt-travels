import mongoose from "mongoose";

const tariffSchema = new mongoose.Schema(
  {
    vehicleType: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    vehicleName: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: false,
      trim: true,
      default: ""
    },
    oneWayRate: {
      type: String,
      required: false,
      trim: true,
      default: ""
    },
    roundTripRate: {
      type: String,
      required: false,
      trim: true,
      default: ""
    },
    driverAllowance: {
      type: String,
      required: false,
      trim: true,
      default: ""
    },
    minimumKmOneWay: {
      type: String,
      required: false,
      trim: true,
      default: ""
    },
    minimumKmRoundTrip: {
      type: String,
      required: false,
      trim: true,
      default: ""
    },
    image: {
      type: String,
      required: true,
      trim: true
    },
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
    additionalCharges: [{
      type: String,
      trim: true
    }],
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
tariffSchema.index({ status: 1, featured: -1, createdAt: -1 });
tariffSchema.index({ vehicleType: 1, status: 1 });
tariffSchema.index({ vehicleName: "text", vehicleType: "text", description: "text" });

// Virtual for URL slug
tariffSchema.virtual("urlSlug").get(function () {
  return this.vehicleName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
});

// Pre-save middleware to limit featured tariffs
tariffSchema.pre("save", async function (next) {
  if (this.featured && this.isModified("featured")) {
    const featuredCount = await this.constructor.countDocuments({ 
      featured: true, 
      _id: { $ne: this._id },
      isDeleted: false 
    });
    
    if (featuredCount >= 3) {
      const error = new Error("Maximum 3 tariff services can be featured at a time");
      error.name = "ValidationError";
      return next(error);
    }
  }
  next();
});

// Static method to get featured tariffs
tariffSchema.statics.getFeatured = function() {
  return this.find({ 
    featured: true, 
    status: "active", 
    isDeleted: false 
  }).limit(3).sort({ createdAt: -1 });
};

// Static method to get active tariffs with pagination
tariffSchema.statics.getActive = function(page = 1, limit = 6, vehicleType = null) {
  const query = { status: "active", isDeleted: false };
  if (vehicleType) {
    query.vehicleType = new RegExp(vehicleType, 'i');
  }
  
  const skip = (page - 1) * limit;
  
  return {
    tariffs: this.find(query)
      .sort({ featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    total: this.countDocuments(query)
  };
};

// Instance method to increment views
tariffSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Instance method to increment bookings
tariffSchema.methods.incrementBookings = function() {
  this.bookings += 1;
  return this.save();
};

const Tariff = mongoose.models.Tariff || mongoose.model("Tariff", tariffSchema);

export default Tariff;