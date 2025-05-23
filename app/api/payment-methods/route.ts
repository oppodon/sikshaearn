import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import mongoose from "mongoose"

// Define PaymentMethod schema if it doesn't exist yet
let PaymentMethod: mongoose.Model<any>
try {
  PaymentMethod = mongoose.model("PaymentMethod")
} catch {
  const PaymentMethodSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: [true, "Name is required"],
      },
      qrCodeUrl: {
        type: String,
        required: [true, "QR code URL is required"],
      },
      instructions: {
        type: String,
        required: [true, "Instructions are required"],
      },
      isActive: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,
    },
  )

  PaymentMethod = mongoose.model("PaymentMethod", PaymentMethodSchema)
}

export async function GET() {
  try {
    await connectToDatabase()

    // Get active payment methods
    const paymentMethods = await PaymentMethod.find({ isActive: true }).sort({ name: 1 }).lean()

    return NextResponse.json({ success: true, paymentMethods }, { status: 200 })
  } catch (error) {
    console.error("Error fetching payment methods:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch payment methods" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const data = await req.json()

    if (!data.name || !data.qrCodeUrl || !data.instructions) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const paymentMethod = await PaymentMethod.create({
      name: data.name,
      qrCodeUrl: data.qrCodeUrl,
      instructions: data.instructions,
      isActive: data.isActive !== false,
    })

    return NextResponse.json({ success: true, paymentMethod }, { status: 201 })
  } catch (error) {
    console.error("Error creating payment method:", error)
    return NextResponse.json({ success: false, error: "Failed to create payment method" }, { status: 500 })
  }
}
