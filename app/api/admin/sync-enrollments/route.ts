import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is admin
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Import models directly to ensure they're registered
    require("@/models/Package")
    require("@/models/Course")
    require("@/models/Enrollment")
    require("@/models/Transaction")
    require("@/models/User")

    const Transaction = mongoose.model("Transaction")
    const Enrollment = mongoose.model("Enrollment")
    const User = mongoose.model("User")

    // Get all approved transactions that might need enrollments
    const transactions = await Transaction.find({
      status: "approved",
    }).lean()

    console.log(`Found ${transactions.length} approved transactions to process`)

    let created = 0
    let skipped = 0
    let errors = 0
    const errorDetails = []

    // Process each transaction
    for (const transaction of transactions) {
      try {
        // Check if enrollment already exists
        const existingEnrollment = await Enrollment.findOne({
          user: transaction.user,
          package: transaction.package,
          transaction: transaction._id,
        })

        if (existingEnrollment) {
          console.log(`Enrollment already exists for transaction ${transaction._id}`)
          skipped++
          continue
        }

        // Create new enrollment
        const newEnrollment = new Enrollment({
          user: transaction.user,
          package: transaction.package,
          transaction: transaction._id,
          startDate: transaction.approvedAt || transaction.createdAt,
          endDate: null, // Lifetime access
          isActive: true,
          completedCourses: [],
          completedLessons: [],
          progress: 0,
          lastAccessed: new Date(),
        })

        await newEnrollment.save()
        created++
        console.log(`Created enrollment for transaction ${transaction._id}`)
      } catch (err) {
        console.error(`Error processing transaction ${transaction._id}:`, err)
        errors++
        errorDetails.push({
          transactionId: transaction._id,
          error: err.message,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${transactions.length} transactions. Created ${created} enrollments, skipped ${skipped}, errors: ${errors}`,
      created,
      skipped,
      errors,
      errorDetails: errorDetails.length > 0 ? errorDetails : undefined,
    })
  } catch (error) {
    console.error("Error in sync-enrollments API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to sync enrollments",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
