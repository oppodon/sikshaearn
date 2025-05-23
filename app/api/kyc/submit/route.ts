import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import KYC from "@/models/KYC"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const data = await req.json()

    // Validate required fields
    const requiredFields = [
      "fullName",
      "dateOfBirth",
      "address",
      "idType",
      "idNumber",
      "idFrontImage",
      "idBackImage",
      "selfieWithId",
      "phoneNumber",
    ]

    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ message: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Check if KYC already exists for this user
    let kyc = await KYC.findOne({ user: session.user.id })

    if (kyc) {
      // Update existing KYC
      kyc.fullName = data.fullName
      kyc.dateOfBirth = new Date(data.dateOfBirth)
      kyc.address = data.address
      kyc.idType = data.idType
      kyc.idNumber = data.idNumber
      kyc.idFrontImage = data.idFrontImage
      kyc.idBackImage = data.idBackImage
      kyc.selfieWithId = data.selfieWithId
      kyc.phoneNumber = data.phoneNumber
      kyc.status = "pending"
      kyc.message = null
      kyc.reviewedBy = null
      kyc.reviewedAt = null

      await kyc.save()
    } else {
      // Create new KYC
      kyc = await KYC.create({
        user: session.user.id,
        fullName: data.fullName,
        dateOfBirth: new Date(data.dateOfBirth),
        address: data.address,
        idType: data.idType,
        idNumber: data.idNumber,
        idFrontImage: data.idFrontImage,
        idBackImage: data.idBackImage,
        selfieWithId: data.selfieWithId,
        phoneNumber: data.phoneNumber,
        status: "pending",
      })
    }

    return NextResponse.json({
      message: "KYC verification submitted successfully",
      status: "pending",
    })
  } catch (error) {
    console.error("Error submitting KYC:", error)
    return NextResponse.json({ message: "Failed to submit KYC verification", error: error.message }, { status: 500 })
  }
}
