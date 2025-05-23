import mongoose, { Schema, type Document } from "mongoose"

export interface IBalanceTransaction extends Document {
  user: mongoose.Types.ObjectId
  type: "credit" | "debit"
  category: "commission" | "withdrawal" | "refund" | "adjustment"
  amount: number
  description: string
  referenceId?: mongoose.Types.ObjectId
  referenceType?: string
  tier?: number
  status: "pending" | "completed" | "failed" | "cancelled"
  balanceBefore: number
  balanceAfter: number
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

const BalanceTransactionSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: [true, "Transaction type is required"],
    },
    category: {
      type: String,
      enum: ["commission", "withdrawal", "refund", "adjustment"],
      required: [true, "Transaction category is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount must be positive"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    referenceType: {
      type: String,
      default: null,
    },
    tier: {
      type: Number,
      enum: [1, 2],
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
    },
    balanceBefore: {
      type: Number,
      required: [true, "Balance before transaction is required"],
    },
    balanceAfter: {
      type: Number,
      required: [true, "Balance after transaction is required"],
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for faster queries
BalanceTransactionSchema.index({ user: 1, createdAt: -1 })
BalanceTransactionSchema.index({ referenceId: 1, referenceType: 1 })
BalanceTransactionSchema.index({ status: 1 })

const BalanceTransaction =
  mongoose.models.BalanceTransaction ||
  mongoose.model<IBalanceTransaction>("BalanceTransaction", BalanceTransactionSchema)

export default BalanceTransaction
