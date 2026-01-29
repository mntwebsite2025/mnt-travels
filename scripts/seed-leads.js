import dotenv from "dotenv"
import connectDB from "../config/models/connectDB.js"
import Lead from "../config/utils/admin/lead/leadSchema.js"

// Load environment variables
dotenv.config()

const sampleLeads = [
  {
    fullName: "Rajesh Kumar",
    email: "rajesh.kumar@email.com",
    phone: "+91 98765 43210",
    serviceType: "Airport Taxi",
    travelDate: "2024-02-15",
    pickupLocation: "Chennai Airport",
    dropLocation: "Anna Nagar, Chennai",
    passengers: 2,
    message: "Need airport pickup for early morning flight at 6 AM. Please confirm availability and driver details.",
    status: "new",
    priority: "high",
    source: "website",
    estimatedCost: "₹800",
    notes: "",
    submittedAt: new Date("2024-01-15T10:30:00Z"),
  },
  {
    fullName: "Priya Sharma",
    email: "priya.sharma@email.com",
    phone: "+91 87654 32109",
    serviceType: "Tour Package - Ooty",
    travelDate: "2024-02-20",
    pickupLocation: "Bangalore",
    dropLocation: "Ooty",
    passengers: 4,
    message: "Family trip to Ooty for 3 days. Need complete package with accommodation suggestions and sightseeing.",
    status: "contacted",
    priority: "medium",
    source: "whatsapp",
    estimatedCost: "₹25,000",
    notes: "Interested in premium package. Follow up scheduled for 16th Jan. Customer prefers hill view accommodation.",
    submittedAt: new Date("2024-01-14T15:45:00Z"),
  },
  {
    fullName: "Arun Vijay",
    email: "arun.vijay@email.com",
    phone: "+91 76543 21098",
    serviceType: "One-way Trip",
    travelDate: "2024-02-18",
    pickupLocation: "Chennai",
    dropLocation: "Bangalore",
    passengers: 1,
    message: "Business trip to Bangalore. Prefer sedan car with professional driver. Need to reach by 2 PM.",
    status: "confirmed",
    priority: "medium",
    source: "phone",
    estimatedCost: "₹4,200",
    notes: "Confirmed booking. Payment pending. Customer prefers Innova or similar vehicle.",
    submittedAt: new Date("2024-01-13T09:20:00Z"),
  },
  {
    fullName: "Meera Nair",
    email: "meera.nair@email.com",
    phone: "+91 65432 10987",
    serviceType: "Day Rental",
    travelDate: "2024-02-16",
    pickupLocation: "Coimbatore",
    dropLocation: "Local sightseeing",
    passengers: 3,
    message: "Need car for full day local sightseeing in Coimbatore. 8 hours package with driver.",
    status: "completed",
    priority: "low",
    source: "referral",
    estimatedCost: "₹2,400",
    notes: "Trip completed successfully. Customer very satisfied with service. Left 5-star review.",
    submittedAt: new Date("2024-01-12T11:00:00Z"),
  },
  {
    fullName: "Suresh Babu",
    email: "suresh.babu@email.com",
    phone: "+91 98765 12345",
    serviceType: "Round Trip",
    travelDate: "2024-02-22",
    pickupLocation: "Madurai",
    dropLocation: "Rameswaram",
    passengers: 6,
    message: "Family pilgrimage trip to Rameswaram. Need spacious vehicle for 6 people with luggage.",
    status: "new",
    priority: "medium",
    source: "website",
    estimatedCost: "₹6,500",
    notes: "",
    submittedAt: new Date("2024-01-16T14:20:00Z"),
  },
  {
    fullName: "Lakshmi Devi",
    email: "lakshmi.devi@email.com",
    phone: "+91 87654 98765",
    serviceType: "Hourly Package",
    travelDate: "2024-02-19",
    pickupLocation: "Trichy",
    dropLocation: "Multiple locations",
    passengers: 2,
    message: "Need car for 4 hours to visit multiple temples in Trichy. Elderly passengers, need comfortable vehicle.",
    status: "contacted",
    priority: "high",
    source: "phone",
    estimatedCost: "₹1,200",
    notes: "Customer called back. Confirmed 4-hour package. Driver should be familiar with temple locations.",
    submittedAt: new Date("2024-01-17T09:15:00Z"),
  },
  {
    fullName: "Karthik Raman",
    email: "karthik.raman@email.com",
    phone: "+91 76543 87654",
    serviceType: "Tour Package - Kodaikanal",
    travelDate: "2024-02-25",
    pickupLocation: "Chennai",
    dropLocation: "Kodaikanal",
    passengers: 2,
    message: "Honeymoon trip to Kodaikanal. Need 2-day package with romantic locations and good accommodation.",
    status: "new",
    priority: "medium",
    source: "whatsapp",
    estimatedCost: "₹15,000",
    notes: "",
    submittedAt: new Date("2024-01-18T16:30:00Z"),
  },
  {
    fullName: "Anitha Krishnan",
    email: "anitha.krishnan@email.com",
    phone: "+91 65432 54321",
    serviceType: "Corporate Travel",
    travelDate: "2024-02-21",
    pickupLocation: "Chennai Airport",
    dropLocation: "IT Park, Chennai",
    passengers: 8,
    message: "Corporate group pickup from airport. Need 2 vehicles for 8 executives with luggage.",
    status: "confirmed",
    priority: "high",
    source: "referral",
    estimatedCost: "₹3,500",
    notes: "Corporate booking confirmed. Payment via company account. Regular customer.",
    submittedAt: new Date("2024-01-19T11:45:00Z"),
  }
];

async function seedLeads() {
  try {
    console.log("Connecting to database...")
    await connectDB()

    // Check if leads already exist
    const existingLeads = await Lead.countDocuments()
    if (existingLeads > 0) {
      console.log(`Database already has ${existingLeads} leads. Skipping seed.`)
      process.exit(0)
    }

    console.log("Seeding sample leads...")
    const createdLeads = await Lead.insertMany(sampleLeads)

    console.log("Lead seeding completed successfully!")
    console.log(`Created ${createdLeads.length} sample leads:`)
    
    createdLeads.forEach((lead, index) => {
      console.log(`${index + 1}. ${lead.fullName} - ${lead.serviceType} (${lead.status})`)
    })

    process.exit(0)
  } catch (error) {
    console.error("Error seeding leads:", error)
    process.exit(1)
  }
}

// Run the seeding function
seedLeads()