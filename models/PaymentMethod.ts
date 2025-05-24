import mongoose, { Schema, type Document } from "mongoose"

export interface PaymentMethodDocument extends Document {
  name: string
  qrCodeUrl: string
  instructions: string
  order: number
  isActive: boolean
  createdBy: mongoose.Types.ObjectId
  updatedBy?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const PaymentMethodSchema = new Schema<PaymentMethodDocument>(
  {
    name: {
      type: String,
      required: [true, "Payment method name is required"],
      trim: true,
    },
    qrCodeUrl: {
      type: String,
      required: [true, "QR code URL is required"],
    },
    instructions: {
      type: String,
      default: "Scan the QR code to make payment",
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",

    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
)

// Create or use existing model
const PaymentMethod =
  mongoose.models.PaymentMethod || mongoose.model<PaymentMethodDocument>("PaymentMethod", PaymentMethodSchema)

export default PaymentMethod
