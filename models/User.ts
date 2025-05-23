import mongoose from "mongoose"
import bcrypt from "bcryptjs"

export interface IUser extends mongoose.Document {
  name: string
  email: string
  password?: string
  image?: string
  username?: string
  bio?: string
  country?: string
  city?: string
  phone?: string
  emailVerified?: Date
  verificationToken?: string
  verificationTokenExpiry?: Date
  resetPasswordToken?: string
  resetPasswordTokenExpiry?: Date
  role: "user" | "instructor" | "admin"
  status: "active" | "banned" | "pending"
  referralCode?: string
  referredBy?: mongoose.Types.ObjectId
  referredUsers?: mongoose.Types.ObjectId[]
  referralClicks?: number
  referralEarnings?: number
  tier2Earnings?: number
  provider?: string
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        // Only require password if provider is not set (i.e., local auth)
        return !this.provider
      },
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    provider: {
      type: String,
      enum: ["google", "facebook", null],
      default: null,
    },
    image: {
      type: String,
    },
    username: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      lowercase: true,
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot be more than 500 characters"],
    },
    country: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    emailVerified: {
      type: Date,
    },
    verificationToken: String,
    verificationTokenExpiry: Date,
    resetPasswordToken: String,
    resetPasswordTokenExpiry: Date,
    role: {
      type: String,
      enum: ["user", "instructor", "admin"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "banned", "pending"],
      default: "active", // Set default to active for OAuth users
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    referredUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    referralClicks: {
      type: Number,
      default: 0,
    },
    referralEarnings: {
      type: Number,
      default: 0,
    },
    tier2Earnings: {
      type: Number,
      default: 0,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

// Hash password before saving
UserSchema.pre("save", async function (next) {
  // Only hash the password if it's modified and exists
  if (!this.isModified("password") || !this.password) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false
  return bcrypt.compare(candidatePassword, this.password)
}

// Prevent mongoose from creating a new model if it already exists
const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default User
