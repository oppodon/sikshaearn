import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import KYC from "@/models/KYC"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Get user's KYC submission
    const kyc = await KYC.findOne({ userId: session.user.id }).lean()

    return NextResponse.json({ kyc })
  } catch (error) {
    console.error("Error in KYC API:", error)
    return NextResponse.json({ error: "An error occurred while fetching KYC status" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Check if user already has a KYC submission
    const existingKYC = await KYC.findOne({ userId: session.user.id })

    if (existingKYC && existingKYC.status !== "rejected") {
      return NextResponse.json({ error: "You already have a KYC submission in progress" }, { status: 400 })
    }

    // Parse form data
    const formData = await req.formData()

    const documentType = formData.get("documentType") as string
    const documentNumber = formData.get("documentNumber") as string
    const fullName = formData.get("fullName") as string
    const dateOfBirth = formData.get("dateOfBirth") as string
    const address = formData.get("address") as string
    const phoneNumber = formData.get("phoneNumber") as string
    const gender = formData.get("gender") as string
    const documentImage = formData.get("documentImage") as File
    const selfieImage = formData.get("selfieImage") as File | null

    // Validate required fields
    if (!documentType || !documentNumber || !fullName || !documentImage) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Upload document image to Cloudinary
    const documentUploadResult = await uploadToCloudinary(
      await documentImage.arrayBuffer(),
      `kyc/${session.user.id}/document`,
      documentImage.type,
    )

    // Upload selfie image to Cloudinary if provided
    let selfieUploadResult = null
    if (selfieImage) {
      selfieUploadResult = await uploadToCloudinary(
        await selfieImage.arrayBuffer(),
        `kyc/${session.user.id}/selfie`,
        selfieImage.type,
      )
    }

    // Create or update KYC submission
    const kycData = {
      userId: session.user.id,
      documentType,
      documentNumber,
      fullName,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      address,
      phoneNumber,
      gender,
      documentImage: documentUploadResult.secure_url,
      documentImageId: documentUploadResult.public_id,
      status: "pending",
      submittedAt: new Date(),
    }

    if (selfieUploadResult) {
      kycData.selfieImage = selfieUploadResult.secure_url
      kycData.selfieImageId = selfieUploadResult.public_id
    }

    if (existingKYC) {
      // Update existing KYC submission
      await KYC.findByIdAndUpdate(existingKYC._id, kycData)
    } else {
      // Create new KYC submission
      await KYC.create(kycData)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in KYC submission:", error)
    return NextResponse.json({ error: "An error occurred while submitting KYC information" }, { status: 500 })
  }
}
