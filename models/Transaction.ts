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
    },
    package: {
      type: Schema.Types.ObjectId,
      ref: "Package",
      required: true,
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
    },
    affiliateId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
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

// Create indexes using schema.index() only (removed index: true from field definitions)
TransactionSchema.index({ user: 1, createdAt: -1 })
TransactionSchema.index({ status: 1, createdAt: -1 })
TransactionSchema.index({ affiliateId: 1, status: 1 })
TransactionSchema.index({ package: 1 })
TransactionSchema.index({ user: 1 })
TransactionSchema.index({ affiliateId: 1 })
TransactionSchema.index({ tier2AffiliateId: 1 })

const Transaction = mongoose.models.Transaction || mongoose.model<TransactionDocument>("Transaction", TransactionSchema)

export default Transaction
