import mongoose, { Schema, type Document } from "mongoose"

export interface IPackage extends Document {
  title: string
  slug: string
  description: string
  longDescription?: string
  thumbnail: string
  price: number
  originalPrice?: number
  duration?: string // e.g., "6 months", "1 year", "lifetime"
  level?: string // e.g., "Beginner", "Intermediate", "Advanced"
  courses: mongoose.Types.ObjectId[]
  isActive: boolean
  isPopular?: boolean
  isFeatured?: boolean
  features: string[]
  benefits?: string[]
  accessDuration?: number // in days, null for lifetime
  supportLevel?: string
  maxCourses?: number
  workshopCount?: number
  hasMentoring?: boolean
  mentoringType?: string
  hasJobPlacement?: boolean
  hasCertificate?: boolean
  category?: string
  tags?: string[]
  enrollmentCount?: number
  rating?: number
  reviewCount?: number
  createdAt: Date
  updatedAt: Date
}

const PackageSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Package title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      required: [true, "Package slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Package description is required"],
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    longDescription: {
      type: String,
      default: "",
      maxlength: [2000, "Long description cannot exceed 2000 characters"],
    },
    thumbnail: {
      type: String,
      default: "/placeholder.svg?height=300&width=400",
    },
    price: {
      type: Number,
      required: [true, "Package price is required"],
      min: [0, "Price must be positive"],
    },
    originalPrice: {
      type: Number,
      default: null,
      min: [0, "Original price must be positive"],
    },
    duration: {
      type: String,
      default: "lifetime",
      enum: ["1 month", "3 months", "6 months", "1 year", "lifetime"],
    },
    level: {
      type: String,
      default: "Beginner",
      enum: ["Beginner", "Intermediate", "Advanced", "All Levels"],
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    benefits: [
      {
        type: String,
        trim: true,
      },
    ],
    accessDuration: {
      type: Number,
      default: null, // null means lifetime access
      min: [1, "Access duration must be at least 1 day"],
    },
    supportLevel: {
      type: String,
      default: "basic",
      enum: ["basic", "standard", "premium"],
    },
    maxCourses: {
      type: Number,
      default: 0, // 0 means unlimited
      min: [0, "Max courses cannot be negative"],
    },
    workshopCount: {
      type: Number,
      default: 0,
      min: [0, "Workshop count cannot be negative"],
    },
    hasMentoring: {
      type: Boolean,
      default: false,
    },
    mentoringType: {
      type: String,
      default: "",
      enum: ["", "group", "individual", "both"],
    },
    hasJobPlacement: {
      type: Boolean,
      default: false,
    },
    hasCertificate: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      default: "general",
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    enrollmentCount: {
      type: Number,
      default: 0,
      min: [0, "Enrollment count cannot be negative"],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot exceed 5"],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, "Review count cannot be negative"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Create slug from title before saving
PackageSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }
  next()
})

// Virtual for discount percentage
PackageSchema.virtual("discountPercentage").get(function () {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100)
  }
  return 0
})

// Virtual for course count
PackageSchema.virtual("courseCount").get(function () {
  return this.courses ? this.courses.length : 0
})

// Index for search
PackageSchema.index({ title: "text", description: "text", tags: "text" })

// Index for filtering
PackageSchema.index({ isActive: 1, isPopular: 1, isFeatured: 1 })
PackageSchema.index({ price: 1 })
PackageSchema.index({ createdAt: -1 })

const Package = mongoose.models.Package || mongoose.model<IPackage>("Package", PackageSchema)

export default Package
