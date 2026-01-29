import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const adminSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      default: "Admin",
      enum: ["Admin", "Super Admin"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// Virtual for full name
adminSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`
})

// Pre-save middleware to hash password
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare password
adminSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    throw error
  }
}

// Method to check if account is locked
adminSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now())
}

// Method to increment login attempts
adminSchema.methods.incLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    })
  }

  const updates = { $inc: { loginAttempts: 1 } }

  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 } // 2 hours
  }

  return this.updateOne(updates)
}

// Method to reset login attempts
adminSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
  })
}

// Static method to find by credentials
adminSchema.statics.findByCredentials = async function (email, password) {
  const admin = await this.findOne({ email, isActive: true })

  if (!admin) {
    throw new Error("Invalid login credentials")
  }

  if (admin.isLocked()) {
    throw new Error("Account is temporarily locked due to too many failed login attempts")
  }

  const isMatch = await admin.comparePassword(password)

  if (!isMatch) {
    await admin.incLoginAttempts()
    throw new Error("Invalid login credentials")
  }

  // Reset login attempts on successful login
  if (admin.loginAttempts > 0) {
    await admin.resetLoginAttempts()
  }

  // Update last login
  admin.lastLogin = new Date()
  await admin.save()

  return admin
}

// Static method to create initial admin
adminSchema.statics.createInitialAdmin = async function () {
  try {
    const existingAdmin = await this.findOne({ email: "mnt0450@gmail.com" })

    if (!existingAdmin) {
      const initialAdmin = new this({
        firstName: "mnt",
        lastName: "Tours and Travels",
        email: "mnt0450@gmail.com",
        password: "mnt@2025",
        phone: "+91 90037 82966",
        location: "2/18, Uthangudi, Tamil Nadu 625107, India",
        role: "Super Admin",
        emailVerified: true,
        isActive: true,
      })

      await initialAdmin.save()
      console.log("Initial admin created successfully for mnt Tours & Travels")
      return initialAdmin
    } else {
      console.log("Initial admin already exists")
      return existingAdmin
    }
  } catch (error) {
    console.error("Error creating initial admin:", error)
    throw error
  }
}

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema)

export default Admin
