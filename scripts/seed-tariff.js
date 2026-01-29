const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

// Import the schema
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
      required: true,
      trim: true
    },
    oneWayRate: {
      type: String,
      required: true,
      trim: true
    },
    roundTripRate: {
      type: String,
      required: true,
      trim: true
    },
    driverAllowance: {
      type: String,
      required: true,
      trim: true
    },
    minimumKmOneWay: {
      type: String,
      required: true,
      trim: true
    },
    minimumKmRoundTrip: {
      type: String,
      required: true,
      trim: true
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

const Tariff = mongoose.models.Tariff || mongoose.model("Tariff", tariffSchema);

const sampleTariffs = [
  {
    vehicleType: "Sedan",
    vehicleName: "Sedan (Dzire/Etios)",
    description: "Comfortable sedan cars perfect for small families and business trips. Air-conditioned with experienced drivers.",
    oneWayRate: "₹14 per km",
    roundTripRate: "₹13 per km",
    driverAllowance: "₹400",
    minimumKmOneWay: "130 km",
    minimumKmRoundTrip: "250 km",
    image: "/images/vehicles/dzire.jpg",
    status: "active",
    featured: true,
    additionalCharges: ["Toll fees extra", "Inter-State Permit charges extra", "Waiting charges ₹100 per hour"],
    seoTitle: "Sedan Taxi Service - Dzire & Etios | mnt Tours",
    seoDescription: "Book comfortable sedan taxis (Dzire/Etios) for outstation trips. Starting from ₹14 per km one way.",
    seoKeywords: "sedan taxi, dzire taxi, etios taxi, outstation taxi"
  },
  {
    vehicleType: "SUV",
    vehicleName: "SUV (Xylo/Ertiga)",
    description: "Spacious SUVs ideal for group travel and family trips. More luggage space and comfortable seating for 6-7 passengers.",
    oneWayRate: "₹19 per km",
    roundTripRate: "₹17 per km", 
    driverAllowance: "₹500",
    minimumKmOneWay: "130 km",
    minimumKmRoundTrip: "250 km",
    image: "/images/vehicles/ertiga.jpg",
    status: "active",
    featured: true,
    additionalCharges: ["Toll fees extra", "Inter-State Permit charges extra", "Hill station charges ₹300"],
    seoTitle: "SUV Taxi Service - Xylo & Ertiga | mnt Tours",
    seoDescription: "Book spacious SUV taxis (Xylo/Ertiga) for group travel. Starting from ₹19 per km one way.",
    seoKeywords: "suv taxi, ertiga taxi, xylo taxi, group travel"
  },
  {
    vehicleType: "Premium",
    vehicleName: "Assured Innova",
    description: "Premium Toyota Innova for luxury travel experience. Perfect for business trips and special occasions with maximum comfort.",
    oneWayRate: "₹20 per km",
    roundTripRate: "₹18 per km",
    driverAllowance: "₹500",
    minimumKmOneWay: "130 km", 
    minimumKmRoundTrip: "250 km",
    image: "/images/vehicles/innova.jpg",
    status: "active",
    featured: true,
    additionalCharges: ["Toll fees extra", "Inter-State Permit charges extra", "Premium service guarantee"],
    seoTitle: "Premium Innova Taxi Service | mnt Tours",
    seoDescription: "Book premium Toyota Innova for luxury outstation travel. Starting from ₹20 per km one way.",
    seoKeywords: "innova taxi, premium taxi, luxury taxi, toyota innova"
  },
  {
    vehicleType: "Luxury",
    vehicleName: "Luxury Sedan (Camry/Accord)",
    description: "Luxury sedan cars for VIP travel and corporate executives. Premium comfort with professional chauffeur service.",
    oneWayRate: "₹25 per km",
    roundTripRate: "₹23 per km",
    driverAllowance: "₹600",
    minimumKmOneWay: "130 km",
    minimumKmRoundTrip: "250 km",
    image: "/images/vehicles/camry.jpg",
    status: "active",
    featured: false,
    additionalCharges: ["Toll fees extra", "Inter-State Permit charges extra", "VIP service charges", "Airport pickup/drop priority"],
    seoTitle: "Luxury Sedan Taxi Service - Camry & Accord | mnt Tours",
    seoDescription: "Book luxury sedan taxis (Camry/Accord) for VIP travel. Starting from ₹25 per km one way.",
    seoKeywords: "luxury taxi, camry taxi, accord taxi, vip travel, executive taxi"
  },
  {
    vehicleType: "Tempo",
    vehicleName: "Tempo Traveller (12-17 Seater)",
    description: "Spacious tempo travellers perfect for large group travel, family reunions, and corporate outings. Comfortable seating with ample luggage space.",
    oneWayRate: "₹22 per km",
    roundTripRate: "₹20 per km",
    driverAllowance: "₹600",
    minimumKmOneWay: "130 km",
    minimumKmRoundTrip: "250 km",
    image: "/images/vehicles/tempo-traveller.jpg",
    status: "active",
    featured: false,
    additionalCharges: ["Toll fees extra", "Inter-State Permit charges extra", "Driver accommodation for outstation trips", "Group travel discount available"],
    seoTitle: "Tempo Traveller Rental - 12-17 Seater | mnt Tours",
    seoDescription: "Book tempo travellers for large group travel. 12-17 seater vehicles starting from ₹22 per km one way.",
    seoKeywords: "tempo traveller, group travel, 12 seater, 17 seater, large group taxi"
  }
];

async function seedTariffs() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    // Clear existing tariffs
    await Tariff.deleteMany({});
    console.log('Cleared existing tariffs');

    // Insert sample tariffs
    const insertedTariffs = await Tariff.insertMany(sampleTariffs);
    console.log(`Inserted ${insertedTariffs.length} tariff services`);

    console.log('Tariff seeding completed successfully!');
    
    // Log the inserted tariffs
    insertedTariffs.forEach((tariff, index) => {
      console.log(`${index + 1}. ${tariff.vehicleName} - ${tariff.vehicleType} (Featured: ${tariff.featured})`);
    });

  } catch (error) {
    console.error('Error seeding tariffs:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedTariffs();