import connectDB from "../config/models/connectDB"
import Admin from "../config/utils/admin/login/loginSchema"

async function seedInitialAdmin() {
  try {
    console.log("Connecting to database...")
    await connectDB()

    console.log("Creating initial admin user...")
    const admin = await Admin.createInitialAdmin()

    console.log("Admin seeding completed successfully!")
    console.log("Admin Details:")
    console.log(`- Name: ${admin.fullName}`)
    console.log(`- Email: ${admin.email}`)
    console.log(`- Role: ${admin.role}`)
    console.log(`- Created: ${admin.createdAt}`)

    process.exit(0)
  } catch (error) {
    console.error("Error seeding admin:", error)
    process.exit(1)
  }
}

// Run the seeding function
seedInitialAdmin()
