import mongoose from "mongoose"

export interface IKYC extends mongoose.Document {
  userId: mongoose.Types.ObjectId
  documentType: "national_id" | "citizenship" | "license"
  documentNumber: string
  fullName: string
  dateOfBirth?: Date
  address?: string
  phoneNumber?: string
  gender?: string
  documentImage: string
  documentImageId?: string
  selfieImage?: string
  selfieImageId?: string
  status: "pending" | "approved" | "rejected"
  rejectionReason?: string
  submittedAt: Date
  verifiedAt?: Date
  verifiedBy?: mongoose.Types.ObjectId
}

const KYCSchema = new mongoose.Schema<IKYC>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    documentType: {
      type: String,
      enum: ["national_id", "citizenship", "license"],
      required: [true, "Document type is required"],
    },
    documentNumber: {
      type: String,
      required: [true, "Document number is required"],
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    address: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    documentImage: {
      type: String,
      required: [true, "Document image is required"],
    },
    documentImageId: {
      type: String,
    },
    selfieImage: {
      type: String,
    },
    selfieImageId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    verifiedAt: {
      type: Date,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
)

// Create a unique compound index on userId and documentType
// This ensures a user can only have one KYC submission per document type
KYCSchema.index({ userId: 1, documentType: 1 }, { unique: true })

const KYC = mongoose.models.KYC || mongoose.model<IKYC>("KYC", KYCSchema)

export default KYC
