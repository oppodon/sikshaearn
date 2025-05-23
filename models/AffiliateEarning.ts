import mongoose, { Schema, type Document } from "mongoose"

export interface IAffiliateEarning extends Document {
  user: mongoose.Types.ObjectId
  transaction: mongoose.Types.ObjectId
  amount: number
  tier: number // 1 for direct referral, 2 for second-tier
  status: "pending" | "available" | "withdrawn" | "processing"
  withdrawalId?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const AffiliateEarningSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: [true, "Transaction is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount must be positive"],
    },
    tier: {
      type: Number,
      enum: [1, 2],
      default: 1,
    },
    status: {
      type: String,
      enum: ["pending", "available", "withdrawn", "processing"],
      default: "pending",
    },
    withdrawalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Withdrawal",
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

const AffiliateEarning =
  mongoose.models.AffiliateEarning || mongoose.model<IAffiliateEarning>("AffiliateEarning", AffiliateEarningSchema)

export default AffiliateEarning
