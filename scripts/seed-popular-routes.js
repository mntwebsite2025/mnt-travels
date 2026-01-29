import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Location Schema
const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPopularRoute: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Location = mongoose.models.Location || mongoose.model('Location', locationSchema);

const popularRoutes = [
  { name: 'Chennai Drop Taxi', order: 1 },
  { name: 'Madurai Drop Taxi', order: 2 },
  { name: 'Coimbatore Drop Taxi', order: 3 },
  { name: 'Kodaikanal Drop Taxi', order: 4 },
  { name: 'Ooty Drop Taxi', order: 5 },
  { name: 'Bangalore Drop Taxi', order: 6 },
  { name: 'Kerala Drop Taxi', order: 7 },
  { name: 'Salem Drop Taxi', order: 8 },
  { name: 'Trichy Drop Taxi', order: 9 },
  { name: 'Thanjavur Drop Taxi', order: 10 },
  { name: 'Rameswaram Drop Taxi', order: 11 },
  { name: 'Kanyakumari Drop Taxi', order: 12 }
];

async function seedPopularRoutes() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    // Update existing locations or create new ones as popular routes
    for (const route of popularRoutes) {
      await Location.findOneAndUpdate(
        { name: route.name },
        {
          name: route.name,
          isActive: true,
          isPopularRoute: true,
          order: route.order,
          updatedAt: new Date()
        },
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true
        }
      );
      console.log(`✓ Seeded popular route: ${route.name}`);
    }

    console.log('\n🎉 Popular routes seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding popular routes:', error);
    process.exit(1);
  }
}

seedPopularRoutes();