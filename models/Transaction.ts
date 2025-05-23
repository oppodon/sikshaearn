import mongoose, { Schema, type Document } from "mongoose"

export interface ITransaction extends Document {
  user: mongoose.Types.ObjectId
  package: mongoose.Types.ObjectId
  amount: number
  paymentMethod: "bank_transfer" | "esewa" | "khalti"
  paymentProof?: string
  status: "pending" | "approved" | "rejected"
  affiliateId?: mongoose.Types.ObjectId
  affiliateCommission?: number
  tier2AffiliateId?: mongoose.Types.ObjectId
  tier2Commission?: number
  approvedAt?: Date
  approvedBy?: mongoose.Types.ObjectId
  rejectedAt?: Date
  rejectedBy?: mongoose.Types.ObjectId
  rejectionReason?: string
  createdAt: Date
  updatedAt: Date
}

const TransactionSchema = new Schema(
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
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount must be positive"],
    },
    paymentMethod: {
      type: String,
      enum: ["bank_transfer", "esewa", "khalti"],
      required: [true, "Payment method is required"],
    },
    paymentProof: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    affiliateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    affiliateCommission: {
      type: Number,
      default: 0,
    },
    tier2AffiliateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    tier2Commission: {
      type: Number,
      default: 0,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

const Transaction = mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema)

export default Transaction
