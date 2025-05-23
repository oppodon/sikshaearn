import mongoose, { Schema, type Document } from "mongoose"

export interface IWithdrawal extends Document {
  user: mongoose.Types.ObjectId
  amount: number
  method: "bank_transfer" | "esewa" | "khalti"
  accountDetails: {
    accountName?: string
    accountNumber?: string
    bankName?: string
    branch?: string
    phoneNumber?: string
  }
  status: "pending" | "processing" | "completed" | "rejected"
  rejectionReason?: string
  processedAt?: Date
  processedBy?: mongoose.Types.ObjectId
  earnings: mongoose.Types.ObjectId[]
  transactionId?: string
  createdAt: Date
  updatedAt: Date
}

const WithdrawalSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [100, "Minimum withdrawal amount is Rs. 100"],
    },
    method: {
      type: String,
      enum: ["bank_transfer", "esewa", "khalti"],
      required: [true, "Payment method is required"],
    },
    accountDetails: {
      accountName: String,
      accountNumber: String,
      bankName: String,
      branch: String,
      phoneNumber: String,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    processedAt: {
      type: Date,
      default: null,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    earnings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AffiliateEarning",
      },
    ],
    transactionId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

const Withdrawal = mongoose.models.Withdrawal || mongoose.model<IWithdrawal>("Withdrawal", WithdrawalSchema)

export default Withdrawal
