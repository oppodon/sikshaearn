import mongoose from "mongoose"

export interface IBalanceTransaction extends mongoose.Document {
  user: mongoose.Types.ObjectId
  amount: number
  type: "credit" | "debit" | "sync" | "adjustment"
  description: string
  status: "pending" | "completed" | "failed" | "cancelled"
  reference?: string
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

const BalanceTransactionSchema = new mongoose.Schema<IBalanceTransaction>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit", "sync", "adjustment"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
    },
    reference: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true },
)

// Create indexes for common queries
BalanceTransactionSchema.index({ user: 1, createdAt: -1 })
BalanceTransactionSchema.index({ status: 1 })
BalanceTransactionSchema.index({ type: 1 })

// Prevent mongoose from creating a new model if it already exists
const BalanceTransaction =
  mongoose.models.BalanceTransaction ||
  mongoose.model<IBalanceTransaction>("BalanceTransaction", BalanceTransactionSchema)

export default BalanceTransaction
