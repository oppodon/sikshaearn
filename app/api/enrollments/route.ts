import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Enrollment from "@/models/Enrollment"
import Transaction from "@/models/Transaction"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const { transactionId } = await req.json()

    if (!transactionId) {
      return NextResponse.json({ success: false, error: "Transaction ID is required" }, { status: 400 })
    }

    // Get transaction details
    const transaction = await Transaction.findById(transactionId).populate("package").lean()

    if (!transaction) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 })
    }

    // Verify transaction belongs to user (unless admin)
    if (transaction.user.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Check if transaction is approved
    if (transaction.status !== "approved") {
      return NextResponse.json({ success: false, error: "Transaction must be approved first" }, { status: 400 })
    }

    // Check if enrollment already exists
    const existingEnrollment = await Enrollment.findOne({
      user: transaction.user,
      package: transaction.package._id,
      transaction: transactionId,
    })

    if (existingEnrollment) {
      return NextResponse.json({ success: false, error: "Enrollment already exists" }, { status: 400 })
    }

    // Calculate end date based on package duration
    let endDate = null
    if (transaction.package.duration && transaction.package.duration > 0) {
      endDate = new Date()
      endDate.setDate(endDate.getDate() + transaction.package.duration)
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      user: transaction.user,
      package: transaction.package._id,
      transaction: transactionId,
      startDate: new Date(),
      endDate,
      isActive: true,
      completedCourses: [],
      completedLessons: [],
      progress: 0,
      lastAccessed: new Date(),
    })

    return NextResponse.json({ success: true, enrollment }, { status: 201 })
  } catch (error) {
    console.error("Error creating enrollment:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create enrollment. Please try again." },
      { status: 500 },
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId") || session.user.id

    // Only allow users to see their own enrollments unless they're admin
    if (userId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const enrollments = await Enrollment.find({ user: userId, isActive: true })
      .populate({
        path: "package",
        populate: {
          path: "courses",
          model: "Course",
        },
      })
      .populate("transaction", "status amount createdAt")
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ success: true, enrollments }, { status: 200 })
  } catch (error) {
    console.error("Error fetching enrollments:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch enrollments. Please try again." },
      { status: 500 },
    )
  }
}
