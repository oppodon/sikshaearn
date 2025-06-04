import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Package from "@/models/Package"
import Enrollment from "@/models/Enrollment"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, packageId, referralCode } = await req.json()

    if (!userId || !packageId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await dbConnect()

    // Find the user
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Find the package
    const packageData = await Package.findById(packageId)
    if (!packageData) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    // Check if referral code is valid if provided
    let referrer = null
    if (referralCode) {
      referrer = await User.findOne({ referralCode })
      if (!referrer) {
        return NextResponse.json({ error: "Invalid referral code" }, { status: 400 })
      }

      // Update user's referral information
      user.referredBy = referrer._id
      await user.save()

      // Update referrer's referred users list
      await User.findByIdAndUpdate(referrer._id, {
        $addToSet: { referredUsers: user._id },
        $inc: { referralClicks: 1 },
      })
    }

    // Create enrollment for each course in the package
    const enrollments = []
    for (const courseId of packageData.courses) {
      const enrollment = new Enrollment({
        user: userId,
        course: courseId,
        package: packageId,
        status: "active",
        progress: 0,
        completedLessons: [],
      })
      enrollments.push(enrollment)
    }

    if (enrollments.length > 0) {
      await Enrollment.insertMany(enrollments)
    }

    return NextResponse.json({
      message: "Package assigned successfully",
      enrollments: enrollments.length,
      referralApplied: !!referrer,
    })
  } catch (error) {
    console.error("Error assigning package:", error)
    return NextResponse.json({ error: "Failed to assign package" }, { status: 500 })
  }
}
