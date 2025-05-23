import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import mongoose from "mongoose"

// Get PaymentMethod model
let PaymentMethod: mongoose.Model<any>
try {
  PaymentMethod = mongoose.model("PaymentMethod")
} catch {
  // Model will be defined in the main route file
  const PaymentMethodSchema = new mongoose.Schema({}, { timestamps: true })
  PaymentMethod = mongoose.model("PaymentMethod", PaymentMethodSchema)
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()

    const paymentMethod = await PaymentMethod.findById(params.id).lean()

    if (!paymentMethod) {
      return NextResponse.json({ success: false, error: "Payment method not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, paymentMethod }, { status: 200 })
  } catch (error) {
    console.error("Error fetching payment method:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch payment method" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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

    const paymentMethod = await PaymentMethod.findByIdAndUpdate(
      params.id,
      {
        name: data.name,
        qrCodeUrl: data.qrCodeUrl,
        instructions: data.instructions,
        isActive: data.isActive !== false,
      },
      { new: true },
    ).lean()

    if (!paymentMethod) {
      return NextResponse.json({ success: false, error: "Payment method not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, paymentMethod }, { status: 200 })
  } catch (error) {
    console.error("Error updating payment method:", error)
    return NextResponse.json({ success: false, error: "Failed to update payment method" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const paymentMethod = await PaymentMethod.findByIdAndDelete(params.id).lean()

    if (!paymentMethod) {
      return NextResponse.json({ success: false, error: "Payment method not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error deleting payment method:", error)
    return NextResponse.json({ success: false, error: "Failed to delete payment method" }, { status: 500 })
  }
}
