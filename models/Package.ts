import mongoose, { Schema, type Document } from "mongoose"

export interface IPackage extends Document {
  title: string
  slug: string
  description: string
  longDescription?: string
  thumbnail: string
  price: number
  originalPrice?: number
  duration?: number // in days, null for lifetime
  courses: mongoose.Types.ObjectId[] // Store course references in package
  isActive: boolean
  isPopular?: boolean
  features: string[]
  benefits?: string[]
  accessDuration?: number
  supportLevel?: string
  maxCourses?: number
  workshopCount?: number
  hasMentoring?: boolean
  mentoringType?: string
  hasJobPlacement?: boolean
  hasCertificate?: boolean
  createdAt: Date
  updatedAt: Date
}

const PackageSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Package title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Package slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Package description is required"],
    },
    longDescription: {
      type: String,
      default: "",
    },
    thumbnail: {
      type: String,
      required: [true, "Package thumbnail is required"],
    },
    price: {
      type: Number,
      required: [true, "Package price is required"],
      min: [0, "Price must be positive"],
    },
    originalPrice: {
      type: Number,
      default: null,
    },
    duration: {
      type: Number,
      default: null, // null means lifetime access
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    features: [
      {
        type: String,
      },
    ],
    benefits: [
      {
        type: String,
      },
    ],
    accessDuration: {
      type: Number,
      default: null,
    },
    supportLevel: {
      type: String,
      default: "basic",
    },
    maxCourses: {
      type: Number,
      default: 0,
    },
    workshopCount: {
      type: Number,
      default: 0,
    },
    hasMentoring: {
      type: Boolean,
      default: false,
    },
    mentoringType: {
      type: String,
      default: "",
    },
    hasJobPlacement: {
      type: Boolean,
      default: false,
    },
    hasCertificate: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Create slug from title before saving
PackageSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }
  next()
})

const Package = mongoose.models.Package || mongoose.model<IPackage>("Package", PackageSchema)

export default Package
