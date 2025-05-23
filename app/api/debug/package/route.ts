import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Enrollment from "@/models/Enrollment"
import Package from "@/models/Package"
import Course from "@/models/Course"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Step 1: Find all enrollments for the user
    const enrollments = await Enrollment.find({
      user: session.user.id,
      isActive: true,
    }).lean()

    console.log("Found enrollments:", enrollments.length)

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({ error: "No enrollments found" })
    }

    // Step 2: Get all package IDs from enrollments
    const packageIds = enrollments.map((enrollment) => enrollment.package)
    console.log("Package IDs:", packageIds)

    // Step 3: Find all packages WITHOUT populating courses first
    const packages = await Package.find({
      _id: { $in: packageIds },
    }).lean()

    console.log("Found packages:", packages.length)

    // Debug package details
    const packageDetails = packages.map((pkg) => ({
      _id: pkg._id,
      title: pkg.title,
      name: pkg.name,
      slug: pkg.slug,
      coursesCount: pkg.courses?.length || 0,
      coursesIds: pkg.courses,
    }))

    // Step 4: Find all courses that belong to these packages
    const allCourseIds = []
    packages.forEach((pkg) => {
      if (pkg.courses && pkg.courses.length > 0) {
        allCourseIds.push(...pkg.courses)
      }
    })

    console.log("Course IDs from packages:", allCourseIds)

    // Step 5: Find all courses by IDs
    const courses = await Course.find({
      _id: { $in: allCourseIds },
    }).lean()

    console.log("Found courses:", courses.length)

    // Step 6: Check if all courses exist
    const courseDetails = courses.map((course) => ({
      _id: course._id,
      title: course.title,
      slug: course.slug,
      lessonsCount: course.videoLessons?.length || 0,
    }))

    return NextResponse.json({
      enrollments: enrollments.length,
      packages: packageDetails,
      courses: courseDetails,
      allCourseIds: allCourseIds,
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({ error: "Debug failed", details: error.message }, { status: 500 })
  }
}
