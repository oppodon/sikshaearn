import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Package from "@/models/Package"
import Enrollment from "@/models/Enrollment"
import Transaction from "@/models/Transaction"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const { userId, packageId } = await req.json()

    if (!userId || !packageId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Check if package exists
    const packageData = await Package.findById(packageId).populate("courses")
    if (!packageData) {
      return NextResponse.json({ message: "Package not found" }, { status: 404 })
    }

    // Check if user already has this package
    const existingEnrollment = await Enrollment.findOne({
      user: userId,
      package: packageId,
    })

    if (existingEnrollment) {
      return NextResponse.json({ message: "User already has this package" }, { status: 400 })
    }

    // Create a transaction record for admin assignment
    const transaction = new Transaction({
      user: userId,
      package: packageId,
      amount: packageData.price,
      status: "completed",
      paymentMethodId: "admin_assignment",
      paymentProof: null,
      affiliateId: null,
      affiliateCommission: 0,
      tier2AffiliateId: null,
      tier2Commission: 0,
      completedAt: new Date(),
      rejectionReason: null,
    })
    await transaction.save()

    // Create ONE enrollment for the package (not individual courses)
    // The enrollment contains all courses from the package
    const enrollment = new Enrollment({
      user: userId,
      package: packageId,
      transaction: transaction._id,
      courses: packageData.courses.map((course) => course._id), // All courses from package
      startDate: new Date(),
      endDate: null, // null for lifetime access
      isActive: true,
      completedCourses: [],
      completedLessons: [],
      progress: 0,
      lastAccessed: new Date(),
    })
    await enrollment.save()

    return NextResponse.json({
      message: "Package assigned successfully",
      transaction: transaction._id,
      enrollment: enrollment._id,
      packageTitle: packageData.title,
      coursesCount: packageData.courses.length,
    })
  } catch (error: any) {
    console.error("Error assigning package:", error)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
