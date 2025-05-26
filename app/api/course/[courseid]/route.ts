import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Course from "@/models/Course"
import Enrollment from "@/models/Enrollment"
import Transaction from "@/models/Transaction"
import mongoose from "mongoose"

export async function GET(request: NextRequest, { params }: { params: { courseid: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    // Await params in Next.js 15
    const { courseid } = await params

    // Find course by ID
    const course = await Course.findById(courseid).lean()

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Check if user has access to this course
    const userId = session.user.id

    // Find enrollment for this course
    let enrollment = await Enrollment.findOne({
      user: userId,
      courseId: courseid,
      isActive: true,
    }).lean()

    // If no direct enrollment, check if user has access through a package
    if (!enrollment) {
      // Find all enrollments for packages that contain this course
      const packageEnrollments = await Enrollment.find({
        user: userId,
        isActive: true,
      })
        .populate({
          path: "package",
          select: "courses",
          match: { courses: { $in: [new mongoose.Types.ObjectId(courseid)] } },
        })
        .lean()

      // Filter out enrollments where package is null (meaning the package doesn't contain this course)
      const validPackageEnrollments = packageEnrollments.filter((e) => e.package)

      if (validPackageEnrollments.length === 0) {
        // Check if user has approved transactions for packages containing this course
        const approvedTransactions = await Transaction.find({
          user: userId,
          status: "approved",
        })
          .populate({
            path: "package",
            select: "courses",
            match: { courses: { $in: [new mongoose.Types.ObjectId(courseid)] } },
          })
          .lean()

        // Filter out transactions where package is null
        const validTransactions = approvedTransactions.filter((t) => t.package)

        if (validTransactions.length === 0) {
          return NextResponse.json({ error: "You don't have access to this course" }, { status: 403 })
        }

        // User has approved transactions but no enrollment - create one
        const transaction = validTransactions[0]
        enrollment = await Enrollment.create({
          user: userId,
          package: transaction.package._id,
          transaction: transaction._id,
          startDate: new Date(),
          isActive: true,
        })
      } else {
        enrollment = validPackageEnrollments[0]
      }
    }

    // All lessons are now accessible - no locking logic
    const lessonsWithAccessStatus =
      course.videoLessons?.map((lesson) => ({
        ...lesson,
        isLocked: false, // All lessons are unlocked
      })) || []

    // Return course with all lessons accessible
    return NextResponse.json({
      course: {
        ...course,
        videoLessons: lessonsWithAccessStatus,
      },
      enrollment,
    })
  } catch (error: any) {
    console.error("Error fetching course:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch course" }, { status: 500 })
  }
}
