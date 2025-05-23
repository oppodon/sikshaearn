import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import KYC from "@/models/KYC"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Get KYC submission by ID
    const kyc = await KYC.findById(params.id).populate("userId", "name email image").lean()

    if (!kyc) {
      return NextResponse.json({ error: "KYC submission not found" }, { status: 404 })
    }

    // Check if user is admin or the owner of the KYC submission
    if (session.user.role !== "admin" && kyc.userId._id.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ kyc })
  } catch (error) {
    console.error("Error in KYC API:", error)
    return NextResponse.json({ error: "An error occurred while fetching KYC submission" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is an admin
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Get KYC submission by ID
    const kyc = await KYC.findById(params.id)

    if (!kyc) {
      return NextResponse.json({ error: "KYC submission not found" }, { status: 404 })
    }

    // Parse request body
    const body = await req.json()
    const { status, rejectionReason } = body

    // Validate status
    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // If status is rejected, rejection reason is required
    if (status === "rejected" && !rejectionReason) {
      return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 })
    }

    // Update KYC submission
    const updateData: any = {
      status,
      verifiedAt: new Date(),
      verifiedBy: session.user.id,
    }

    if (status === "rejected") {
      updateData.rejectionReason = rejectionReason
    }

    await KYC.findByIdAndUpdate(params.id, updateData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in KYC API:", error)
    return NextResponse.json({ error: "An error occurred while updating KYC submission" }, { status: 500 })
  }
}
