import mongoose, { Schema, type Document } from "mongoose"

export interface IPromoCode extends Document {
  code: string
  discountPercentage: number
  isActive: boolean
  createdAt: Date
  expiryDate: Date
  applicablePackages?: string[]
  usageLimit?: number
  usageCount?: number
}

const PromoCodeSchema = new Schema(
  {
    code: {
      type: String,
      required: [true, "Promo code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountPercentage: {
      type: Number,
      required: [true, "Discount percentage is required"],
      min: 0,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    applicablePackages: {
      type: [String],
      default: [],
    },
    usageLimit: {
      type: Number,
      default: null,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

export default mongoose.models.PromoCode || mongoose.model<IPromoCode>("PromoCode", PromoCodeSchema)
