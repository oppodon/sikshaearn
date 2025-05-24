import mongoose, { Schema, type Document } from "mongoose"

export interface TransactionDocument extends Document {
  user: mongoose.Types.ObjectId
  package: mongoose.Types.ObjectId
  amount: number
  paymentMethodId: string
  paymentProof: string | null
  status: "pending" | "pending_verification" | "completed" | "rejected"
  affiliateId: mongoose.Types.ObjectId | null
  affiliateCommission: number
  tier2AffiliateId: mongoose.Types.ObjectId | null
  tier2Commission: number
  completedAt: Date | null
  rejectionReason: string | null
  createdAt: Date
  updatedAt: Date
}

const TransactionSchema = new Schema<TransactionDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    package: {
      type: Schema.Types.ObjectId,
      ref: "Package",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethodId: {
      type: String,
      required: true,
    },
    paymentProof: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "pending_verification", "completed", "rejected"],
      default: "pending",
      index: true,
    },
    affiliateId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    affiliateCommission: {
      type: Number,
      default: 0,
      min: 0,
    },
    tier2AffiliateId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    tier2Commission: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for better query performance
TransactionSchema.index({ user: 1, createdAt: -1 })
TransactionSchema.index({ status: 1, createdAt: -1 })
TransactionSchema.index({ affiliateId: 1, status: 1 })

const Transaction = mongoose.models.Transaction || mongoose.model<TransactionDocument>("Transaction", TransactionSchema)

export default Transaction
