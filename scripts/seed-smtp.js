import dotenv from 'dotenv'
import connectDB from '../config/models/connectDB.js'
import EmailSMTP from '../config/utils/admin/smtp/emailSMTPSchema.js'

// Load environment variables
dotenv.config()

async function seedSMTP() {
  try {
    console.log('🔄 Connecting to database...')
    await connectDB()

    // Check if SMTP settings already exist
    const existingSMTP = await EmailSMTP.findOne({ id: 'default' })

    if (existingSMTP) {
      console.log('✅ SMTP settings already exist')
      console.log('Current settings:')
      console.log(`- Host: ${existingSMTP.smtpHost}`)
      console.log(`- Port: ${existingSMTP.smtpPort}`)
      console.log(`- User: ${existingSMTP.smtpUser}`)
      console.log(`- From Email: ${existingSMTP.fromEmail}`)
      console.log(`- From Name: ${existingSMTP.fromName}`)
      return
    }

    // Create SMTP settings from environment variables
    const smtpData = {
      id: 'default',
      smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
      smtpPort: process.env.SMTP_PORT || '587',
      smtpUser: process.env.SMTP_USER || '',
      smtpPassword: process.env.SMTP_PASS || '',
      fromEmail: process.env.SMTP_FROM_EMAIL || '',
      fromName: 'mnt Tours & Travels',
      isActive: true,
      testStatus: 'never',
      lastUpdated: new Date()
    }

    // Validate required fields
    if (!smtpData.smtpUser || !smtpData.smtpPassword || !smtpData.fromEmail) {
      console.log('⚠️  Warning: Missing SMTP environment variables')
      console.log('Please set SMTP_USER, SMTP_PASS, and SMTP_FROM_EMAIL in your .env file')
    }

    const smtp = await EmailSMTP.create(smtpData)

    console.log('✅ SMTP settings seeded successfully!')
    console.log('Settings created:')
    console.log(`- Host: ${smtp.smtpHost}`)
    console.log(`- Port: ${smtp.smtpPort}`)
    console.log(`- User: ${smtp.smtpUser}`)
    console.log(`- From Email: ${smtp.fromEmail}`)
    console.log(`- From Name: ${smtp.fromName}`)

  } catch (error) {
    console.error('❌ Error seeding SMTP settings:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

seedSMTP()