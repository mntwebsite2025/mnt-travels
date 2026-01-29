import dotenv from 'dotenv'
import connectDB from '../config/models/connectDB.js'
import Package from '../config/utils/admin/packages/packageSchema.js'

// Load environment variables
dotenv.config()

async function seedPackages() {
  try {
    console.log('🔄 Connecting to database...')
    await connectDB()

    // Check if packages already exist
    const existingPackages = await Package.countDocuments({ isDeleted: false })

    if (existingPackages > 0) {
      console.log(`✅ ${existingPackages} packages already exist`)
      return
    }

    // Sample packages data for mnt Tours & Travels
    const samplePackages = [
      {
        title: "Ooty Hill Station Tour",
        destination: "Ooty, Tamil Nadu",
        shortDescription: "Experience the beauty of the Queen of Hill Stations with scenic views, tea gardens, and pleasant weather.",
        fullDescription: "<p>Discover the enchanting hill station of Ooty with our comprehensive tour package. Visit famous attractions like Botanical Gardens, Ooty Lake, and Doddabetta Peak.</p><ul><li>Visit the famous Botanical Gardens</li><li>Enjoy boating at Ooty Lake</li><li>Experience the heritage Toy Train ride</li><li>Explore tea factories and gardens</li></ul>",
        duration: "3 Days 2 Nights",
        price: "₹8,500 per person",
        inclusions: ["Accommodation", "Breakfast", "Transportation", "Sightseeing"],
        exclusions: ["Lunch & Dinner", "Personal Expenses", "Entry Fees"],
        highlights: ["Botanical Gardens", "Ooty Lake", "Toy Train Ride", "Tea Factory Visit"],
        image: "/packages/ooty-main.jpg",
        gallery: ["/packages/gallery/ooty-1.jpg", "/packages/gallery/ooty-2.jpg"],
        status: "active",
        featured: true,
        seoTitle: "Ooty Hill Station Tour Package - 3 Days 2 Nights | Best Tours & Travels",
        seoDescription: "Book your Ooty hill station tour with our premium travel packages. Experience scenic beauty, tea gardens, toy train rides, and comfortable accommodation.",
        seoKeywords: "ooty tour packages, hill station tours, ooty travel, tamil nadu tourism, toy train ooty, tea garden tours, ooty holiday packages",
        itinerary: [
          { 
            day: "1", 
            title: "Arrival & Local Sightseeing", 
            description: "Arrive in Ooty, check-in to hotel, visit Botanical Gardens and Ooty Lake. Evening at leisure." 
          },
          { 
            day: "2", 
            title: "Doddabetta & Tea Gardens", 
            description: "Visit Doddabetta Peak, Tea Factory, and enjoy Toy Train ride. Explore local markets." 
          },
          { 
            day: "3", 
            title: "Departure", 
            description: "Check-out from hotel and departure with sweet memories of the Queen of Hill Stations." 
          }
        ]
      },
      {
        title: "Kodaikanal Package",
        destination: "Kodaikanal, Tamil Nadu",
        shortDescription: "Explore the Princess of Hill Stations with lakes, valleys, and misty mountains.",
        fullDescription: "<p>Experience the serene beauty of Kodaikanal with visits to Kodai Lake, Coaker's Walk, and Bryant Park.</p><ul><li>Scenic boat rides at Kodai Lake</li><li>Walk along the famous Coaker's Walk</li><li>Visit beautiful Bryant Park</li><li>Enjoy the Silver Cascade Falls</li></ul>",
        duration: "2 Days 1 Night",
        price: "₹6,500 per person",
        inclusions: ["Accommodation", "Breakfast", "Transportation"],
        exclusions: ["Meals", "Personal Expenses", "Entry Fees"],
        highlights: ["Kodai Lake", "Coaker's Walk", "Bryant Park", "Silver Cascade Falls"],
        image: "/packages/kodai-main.jpg",
        gallery: [],
        status: "active",
        featured: false,
        seoTitle: "Kodaikanal Tour Package - 2 Days 1 Night | Affordable Hill Station Tours",
        seoDescription: "Explore Kodaikanal's natural beauty with our budget-friendly tour packages. Visit Kodai Lake, Coaker's Walk, Bryant Park and scenic viewpoints.",
        seoKeywords: "kodaikanal tour packages, kodai lake tours, hill station holidays, coakers walk, bryant park, kodaikanal travel, princess of hills",
        itinerary: [
          { 
            day: "1", 
            title: "Arrival & Sightseeing", 
            description: "Arrive in Kodaikanal, check-in, visit Kodai Lake and Coaker's Walk. Evening at leisure." 
          },
          { 
            day: "2", 
            title: "Departure", 
            description: "Visit Bryant Park and Silver Cascade Falls, then departure." 
          }
        ]
      },
      {
        title: "Munnar Tea Gardens Tour",
        destination: "Munnar, Kerala",
        shortDescription: "Discover the lush green tea plantations and scenic beauty of Munnar hill station.",
        fullDescription: "<p>Immerse yourself in the breathtaking beauty of Munnar's tea gardens and wildlife.</p><ul><li>Explore vast tea plantations</li><li>Visit Tea Museum</li><li>Enjoy scenic viewpoints</li><li>Wildlife spotting opportunities</li></ul>",
        duration: "3 Days 2 Nights",
        price: "₹9,500 per person",
        inclusions: ["Accommodation", "All Meals", "Transportation", "Guide"],
        exclusions: ["Personal Expenses", "Optional Activities"],
        highlights: ["Tea Plantations", "Eravikulam National Park", "Mattupetty Dam", "Echo Point"],
        image: "/packages/munnar-main.jpg",
        gallery: [],
        status: "active",
        featured: true,
        seoTitle: "Munnar Tea Gardens Tour - 3 Days 2 Nights | Kerala Hill Station Packages",
        seoDescription: "Discover Munnar's breathtaking tea plantations and wildlife with our comprehensive tour packages. Includes accommodation, meals, and guided sightseeing.",
        seoKeywords: "munnar tour packages, tea plantation tours, kerala hill stations, eravikulam national park, munnar wildlife, mattupetty dam, echo point munnar",
        itinerary: [
          { 
            day: "1", 
            title: "Arrival & Tea Gardens", 
            description: "Arrive in Munnar, check-in, visit tea plantations and Tea Museum." 
          },
          { 
            day: "2", 
            title: "Sightseeing", 
            description: "Visit Eravikulam National Park, Mattupetty Dam, and Echo Point." 
          },
          { 
            day: "3", 
            title: "Departure", 
            description: "Morning at leisure, check-out and departure." 
          }
        ]
      }
    ]

    // Create packages
    const createdPackages = await Package.insertMany(samplePackages)

    console.log('✅ Sample packages seeded successfully!')
    console.log(`Created ${createdPackages.length} packages:`)
    createdPackages.forEach((pkg, index) => {
      console.log(`${index + 1}. ${pkg.title} - ${pkg.destination}`)
    })

  } catch (error) {
    console.error('❌ Error seeding packages:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

seedPackages()