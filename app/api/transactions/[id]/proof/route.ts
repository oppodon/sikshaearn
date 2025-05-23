import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Transaction from "@/models/Transaction"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { isValidObjectId } from "mongoose"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    const { id } = params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: "Invalid transaction ID" }, { status: 400 })
    }

    // Find transaction
    const transaction = await Transaction.findById(id)

    if (!transaction) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 })
    }

    // Verify that the transaction belongs to the user
    if (transaction.user.toString() !== session.user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const paymentProofFile = formData.get("paymentProof") as File

    if (!paymentProofFile || paymentProofFile.size === 0) {
      return NextResponse.json({ success: false, error: "Payment proof is required" }, { status: 400 })
    }

    // Upload payment proof to Cloudinary
    const paymentProofResult = await uploadToCloudinary(
      await paymentProofFile.arrayBuffer(),
      `payments/${session.user.id}/${Date.now()}`,
      paymentProofFile.type,
    )

    if (!paymentProofResult || !paymentProofResult.secure_url) {
      return NextResponse.json({ success: false, error: "Failed to upload payment proof" }, { status: 500 })
    }

    // Update transaction with payment proof
    transaction.paymentProof = paymentProofResult.secure_url
    transaction.status = "pending_verification"
    await transaction.save()

    return NextResponse.json(
      {
        success: true,
        message: "Payment proof uploaded successfully",
        paymentProofUrl: paymentProofResult.secure_url,
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Error uploading payment proof:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload payment proof" },
      { status: 500 },
    )
  }
}
