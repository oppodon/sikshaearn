import mongoose, { Schema, type Document } from "mongoose"

export interface ICourse extends Document {
  title: string
  slug: string
  description: string
  thumbnail: string
  price: number
  instructor:
    | string
    | {
        name: string
        title: string
        bio: string
        avatar?: string
      }
  duration: string
  level: string
  language: string
  categories: string[]
  tags: string[]
  requirements: string[]
  whatYouWillLearn: string[]
  videoLessons: {
    title: string
    description: string
    videoUrl: string
    duration: string
    isFree: boolean
    resources?: {
      title: string
      url: string
      type: string
    }[]
  }[]
  rating: number
  reviewCount: number
  enrollmentCount: number
  isPublished: boolean
  packages: mongoose.Types.ObjectId[] // Store package references in course
  createdAt: Date
  updatedAt: Date
}

const CourseSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Course slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
    },
    thumbnail: {
      type: String,
      required: [true, "Course thumbnail is required"],
    },
    price: {
      type: Number,
      default: 0, // Make price optional with default 0
    },
    instructor: {
      type: Schema.Types.Mixed, // Allow string or object
      required: [true, "Instructor name is required"],
    },
    duration: {
      type: String,
      default: "0 hours",
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "all-levels"],
      default: "all-levels",
    },
    language: {
      type: String,
      default: "English",
    },
    categories: [
      {
        type: String,
      },
    ],
    tags: [
      {
        type: String,
      },
    ],
    requirements: [
      {
        type: String,
      },
    ],
    whatYouWillLearn: [
      {
        type: String,
      },
    ],
    videoLessons: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          default: "",
        },
        videoUrl: {
          type: String,
          default: "",
        },
        duration: {
          type: String,
          default: "0 min",
        },
        isFree: {
          type: Boolean,
          default: false,
        },
        resources: [
          {
            title: {
              type: String,
              required: true,
            },
            url: {
              type: String,
              required: true,
            },
            type: {
              type: String,
              default: "pdf",
            },
          },
        ],
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    enrollmentCount: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    packages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Package",
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Create slug from title before saving
CourseSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }
  next()
})

const Course = mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema)

export default Course
