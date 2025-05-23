import mongoose, { Schema, type Document } from "mongoose"

export interface IEnrollment extends Document {
  user: mongoose.Types.ObjectId
  package: mongoose.Types.ObjectId
  transaction: mongoose.Types.ObjectId
  startDate: Date
  endDate: Date | null // null for lifetime access
  isActive: boolean
  completedCourses: mongoose.Types.ObjectId[]
  completedLessons: mongoose.Types.ObjectId[]
  currentLesson?: mongoose.Types.ObjectId
  notes?: Record<string, string> // Map lesson IDs to notes
  progress: number
  lastAccessed: Date
  createdAt: Date
  updatedAt: Date
}

const EnrollmentSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: [true, "Package is required"],
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: [true, "Transaction is required"],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null, // Will be calculated based on package duration
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    completedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    currentLesson: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    notes: {
      type: Map,
      of: String,
      default: {},
    },
    progress: {
      type: Number,
      default: 0,
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

const Enrollment = mongoose.models.Enrollment || mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema)

export default Enrollment
