import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Course from "@/models/Course"
import Enrollment from "@/models/Enrollment"
import Package from "@/models/Package"

export async function GET(req: NextRequest, { params }: { params: { courseid: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    const { courseid } = params

    // Find course by ID
    const course = await Course.findById(courseid).lean()

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Find packages that contain this course
    const packages = await Package.find({
      courses: { $in: [courseid] },
    })
      .select("_id")
      .lean()

    if (!packages || packages.length === 0) {
      return NextResponse.json({ error: "Course not available in any package" }, { status: 404 })
    }

    const packageIds = packages.map((pkg) => pkg._id)

    // Check if user is enrolled in any package containing this course
    const enrollment = await Enrollment.findOne({
      user: session.user.id,
      package: { $in: packageIds },
      isActive: true,
    }).lean()

    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 })
    }

    // Calculate progress
    const totalLessons = course.videoLessons?.length || 0

    // Filter completed lessons to only include those from this course
    const completedLessons =
      enrollment.completedLessons?.filter((lessonId) =>
        course.videoLessons.some((lesson) => lesson._id.toString() === lessonId.toString()),
      ) || []

    const progress = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0

    // Calculate total duration
    const totalDuration = course.videoLessons?.reduce((sum, lesson) => sum + (lesson.duration || 0), 0) || 0

    // Add locked status to lessons based on completion
    const lessonsWithLockStatus = course.videoLessons.map((lesson, index) => {
      // First lesson is always unlocked
      if (index === 0) {
        return { ...lesson, isLocked: false }
      }

      // Check if previous lesson is completed
      const previousLesson = course.videoLessons[index - 1]
      const isPreviousLessonCompleted = completedLessons.some((id) => id.toString() === previousLesson._id.toString())

      return {
        ...lesson,
        isLocked: !isPreviousLessonCompleted,
      }
    })

    // Update last accessed timestamp
    await Enrollment.findByIdAndUpdate(enrollment._id, {
      lastAccessed: new Date(),
    })

    return NextResponse.json({
      course: {
        id: course._id,
        title: course.title,
        description: course.description,
        instructor: course.instructor,
        thumbnail: course.thumbnail,
        videoLessons: lessonsWithLockStatus,
        totalDuration,
        completedLessons,
        currentLesson: enrollment.currentLesson || course.videoLessons[0]?._id,
        progress,
        enrolledAt: enrollment.createdAt,
        lastAccessed: new Date(),
      },
      notes: enrollment.notes || {},
    })
  } catch (error: any) {
    console.error("Error fetching course:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
