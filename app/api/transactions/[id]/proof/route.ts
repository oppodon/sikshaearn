import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Transaction from "@/models/Transaction"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { uploadImage } from "@/lib/cloudinary"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Find the transaction
    const transaction = await Transaction.findById(params.id)

    if (!transaction) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 })
    }

    // Verify that the transaction belongs to the user
    if (transaction.user.toString() !== session.user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    // Get the payment proof file from the request
    const formData = await req.formData()
    const paymentProofFile = formData.get("paymentProof") as File

    if (!paymentProofFile) {
      return NextResponse.json({ success: false, error: "Payment proof is required" }, { status: 400 })
    }

    // Upload payment proof to Cloudinary
    const paymentProofResult = await uploadImage(paymentProofFile, `payments/${session.user.id}/${Date.now()}`)

    if (!paymentProofResult || !paymentProofResult.url) {
      return NextResponse.json({ success: false, error: "Failed to upload payment proof" }, { status: 500 })
    }

    // Update the transaction with the payment proof
    transaction.paymentProof = paymentProofResult.url
    await transaction.save()

    return NextResponse.json(
      {
        success: true,
        message: "Payment proof uploaded successfully",
        paymentProofUrl: paymentProofResult.url,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error uploading payment proof:", error)
    return NextResponse.json(
      { success: false, error: "Failed to upload payment proof. Please try again." },
      { status: 500 },
    )
  }
}
