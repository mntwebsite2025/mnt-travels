import mongoose from "mongoose";

const themeSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
      default: "default",
      index: { unique: true }
    },
    siteName: {
      type: String,
      required: true,
      trim: true,
      default: "mnt Tours & Travels"
    },
    logo: {
      type: String,
      trim: true,
      default: null
    },
    favicon: {
      type: String,
      trim: true,
      default: null
    },
    primaryColor: {
      type: String,
      required: true,
      trim: true,
      match: /^#[0-9A-F]{6}$/i,
      default: "#F59E0B" // Gold color for travel theme
    },
    secondaryColor: {
      type: String,
      required: true,
      trim: true,
      match: /^#[0-9A-F]{6}$/i,
      default: "#1F2937" // Dark navy/black color for travel theme
    },
    gradientDirection: {
      type: String,
      enum: ["135deg", "90deg", "45deg", "180deg"],
      default: "135deg"
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
  }
);

// Create index for better performance
themeSchema.index({ isActive: 1 });

const Theme = mongoose.models.Theme || mongoose.model("Theme", themeSchema);

// Default theme data for mnt Tours & Travels
const defaultThemeData = {
  id: "default",
  siteName: "mnt Tours & Travels",
  logo: "/mnt-tours-logo.png",
  favicon: null,
  primaryColor: "#F59E0B", // Gold color for travel theme
  secondaryColor: "#1F2937", // Dark navy/black color for travel theme
  gradientDirection: "135deg",
  isActive: true,
  lastUpdated: new Date()
};

// Auto-seed function
const autoSeedTheme = async () => {
  try {
    const count = await Theme.countDocuments();
    if (count === 0) {
      await Theme.create(defaultThemeData);
      console.log("✅ Theme database auto-seeded with default data");
    }
  } catch (error) {
    console.error("❌ Error auto-seeding theme data:", error);
  }
};

// Auto-seed when model is first loaded
if (mongoose.connection.readyState === 1) {
  autoSeedTheme();
} else {
  mongoose.connection.once("open", autoSeedTheme);
}

export default Theme;