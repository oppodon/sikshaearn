import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Course from "@/models/Course"
import Enrollment from "@/models/Enrollment"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ hasAccess: false, message: "Not authenticated" }, { status: 401 })
    }

    await connectToDatabase()

    // Find the course by slug
    const course = await Course.findOne({ slug: params.slug }).select("_id").lean()

    if (!course) {
      return NextResponse.json({ hasAccess: false, message: "Course not found" }, { status: 404 })
    }

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      user: session.user.id,
      course: course._id,
    }).lean()

    if (!enrollment) {
      return NextResponse.json({
        hasAccess: false,
        message: "You are not enrolled in this course",
      })
    }

    // Update last accessed time
    await Enrollment.findByIdAndUpdate(enrollment._id, {
      lastAccessed: new Date(),
    })

    return NextResponse.json({
      hasAccess: true,
      enrollment: {
        progress: enrollment.progress,
        completedLessons: enrollment.completedLessons,
        currentLesson: enrollment.currentLesson,
        lastAccessed: enrollment.lastAccessed,
      },
    })
  } catch (error) {
    console.error("Error checking course access:", error)
    return NextResponse.json({ hasAccess: false, message: "Failed to check course access" }, { status: 500 })
  }
}
