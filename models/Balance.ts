import mongoose from "mongoose"

export interface IBalance extends mongoose.Document {
  user: mongoose.Types.ObjectId
  available: number
  pending: number
  processing: number
  withdrawn: number
  lastSyncedAt: Date
  createdAt: Date
  updatedAt: Date
}

const BalanceSchema = new mongoose.Schema<IBalance>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    available: {
      type: Number,
      default: 0,
      min: 0,
    },
    pending: {
      type: Number,
      default: 0,
      min: 0,
    },
    processing: {
      type: Number,
      default: 0,
      min: 0,
    },
    withdrawn: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

// Create a unique compound index on user
BalanceSchema.index({ user: 1 }, { unique: true })

// Prevent mongoose from creating a new model if it already exists
const Balance = mongoose.models.Balance || mongoose.model<IBalance>("Balance", BalanceSchema)

export default Balance
