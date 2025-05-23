import mongoose from "mongoose"

export interface IAffiliateEarning extends mongoose.Document {
  user: mongoose.Types.ObjectId
  referredUser: mongoose.Types.ObjectId
  transaction: mongoose.Types.ObjectId
  amount: number
  tier: number
  status: "pending" | "available" | "processing" | "withdrawn" | "cancelled"
  description: string
  createdAt: Date
  updatedAt: Date
}

const AffiliateEarningSchema = new mongoose.Schema<IAffiliateEarning>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    referredUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    tier: {
      type: Number,
      required: true,
      enum: [1, 2], // 1 = direct referral, 2 = second-tier referral
    },
    status: {
      type: String,
      enum: ["pending", "available", "processing", "withdrawn", "cancelled"],
      default: "pending",
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
)

// Create indexes for common queries
AffiliateEarningSchema.index({ user: 1, status: 1 })
AffiliateEarningSchema.index({ transaction: 1 })
AffiliateEarningSchema.index({ createdAt: -1 })

// Prevent mongoose from creating a new model if it already exists
const AffiliateEarning =
  mongoose.models.AffiliateEarning || mongoose.model<IAffiliateEarning>("AffiliateEarning", AffiliateEarningSchema)

export default AffiliateEarning
