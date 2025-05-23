import mongoose, { Schema, type Document } from "mongoose"

export interface IBalance extends Document {
  user: mongoose.Types.ObjectId
  totalEarnings: number
  availableBalance: number
  pendingBalance: number
  withdrawnBalance: number
  processingBalance: number
  lastUpdated: Date
  createdAt: Date
  updatedAt: Date
}

const BalanceSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      unique: true,
    },
    totalEarnings: {
      type: Number,
      default: 0,
      min: [0, "Total earnings cannot be negative"],
    },
    availableBalance: {
      type: Number,
      default: 0,
      min: [0, "Available balance cannot be negative"],
    },
    pendingBalance: {
      type: Number,
      default: 0,
      min: [0, "Pending balance cannot be negative"],
    },
    withdrawnBalance: {
      type: Number,
      default: 0,
      min: [0, "Withdrawn balance cannot be negative"],
    },
    processingBalance: {
      type: Number,
      default: 0,
      min: [0, "Processing balance cannot be negative"],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

const Balance = mongoose.models.Balance || mongoose.model<IBalance>("Balance", BalanceSchema)

export default Balance
