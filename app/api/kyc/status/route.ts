import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import KYC from "@/models/KYC"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Find KYC document for the user
    const kyc = await KYC.findOne({ user: session.user.id })

    if (!kyc) {
      return NextResponse.json({
        status: "not_submitted",
        message: "KYC verification not submitted yet",
      })
    }

    return NextResponse.json({
      status: kyc.status,
      message: kyc.message || getStatusMessage(kyc.status),
      updatedAt: kyc.updatedAt,
    })
  } catch (error) {
    console.error("Error fetching KYC status:", error)
    return NextResponse.json({ message: "Failed to fetch KYC status", error: error.message }, { status: 500 })
  }
}

function getStatusMessage(status: string): string {
  switch (status) {
    case "pending":
      return "Your KYC verification is under review. This usually takes 1-2 business days."
    case "approved":
      return "Your KYC verification has been approved."
    case "rejected":
      return "Your KYC verification was rejected. Please submit again with correct information."
    default:
      return "Unknown status"
  }
}
