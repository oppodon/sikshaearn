import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Enrollment from "@/models/Enrollment"
import Package from "@/models/Package"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    console.log("Fetching enrollments for user:", session.user.id)

    // 1. Get user's enrollments
    const enrollments = await Enrollment.find({
      user: session.user.id,
      isActive: true,
    }).lean()

    console.log("Found enrollments:", enrollments.length)

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({ courses: [] })
    }

    // 2. Get package IDs from enrollments
    const packageIds = enrollments.map((enrollment) => enrollment.package)
    console.log("Package IDs:", packageIds)

    // 3. Get packages and populate their courses
    const packages = await Package.find({
      _id: { $in: packageIds },
    })
      .populate("courses") // This will populate the courses array with full course data
      .lean()

    console.log("Found packages:", packages.length)

    // 4. Extract all courses from all packages
    const allCourses = []

    for (const pkg of packages) {
      console.log(`Package "${pkg.title}" has ${pkg.courses?.length || 0} courses`)

      if (pkg.courses && pkg.courses.length > 0) {
        // Find the enrollment for this package
        const enrollment = enrollments.find((e) => e.package.toString() === pkg._id.toString())

        for (const course of pkg.courses) {
          // Calculate progress for this course
          const totalLessons = course.videoLessons?.length || 0
          const completedLessons =
            enrollment?.completedLessons?.filter((lessonId) =>
              course.videoLessons?.some((lesson) => lesson._id.toString() === lessonId.toString()),
            ) || []

          const progress = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0

          allCourses.push({
            ...course,
            enrollmentId: enrollment._id,
            packageName: pkg.title,
            packageId: pkg._id,
            enrolledAt: enrollment.startDate,
            progress: progress,
            lastAccessed: enrollment.lastAccessed,
            completedLessons: completedLessons,
            isCompleted: enrollment.completedCourses?.includes(course._id) || false,
            status: "active",
          })
        }
      }
    }

    console.log("Total courses found:", allCourses.length)

    return NextResponse.json({
      success: true,
      courses: allCourses,
    })
  } catch (error) {
    console.error("Error fetching enrolled courses:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch enrolled courses",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
