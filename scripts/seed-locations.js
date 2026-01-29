import mongoose from 'mongoose';

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

// Initial locations data
const initialLocations = [
  { name: "Madurai", isActive: true, order: 1 },
  { name: "Chennai", isActive: true, order: 2 },
  { name: "Mumbai", isActive: true, order: 3 },
  { name: "Delhi", isActive: true, order: 4 },
  { name: "Bangalore", isActive: true, order: 5 },
  { name: "Coimbatore", isActive: true, order: 6 },
  { name: "Trichy", isActive: true, order: 7 },
  { name: "Salem", isActive: true, order: 8 },
  { name: "Erode", isActive: true, order: 9 },
  { name: "Tirunelveli", isActive: true, order: 10 }
];

async function seedLocations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/your-database');
    console.log('Connected to MongoDB');

    // Clear existing locations
    await Location.deleteMany({});
    console.log('Cleared existing locations');

    // Insert initial locations
    const createdLocations = await Location.insertMany(initialLocations);
    console.log(`Created ${createdLocations.length} locations:`);
    
    createdLocations.forEach(location => {
      console.log(`- ${location.name} (Order: ${location.order})`);
    });

    console.log('Location seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding locations:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedLocations();