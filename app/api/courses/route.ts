import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Course from "@/models/Course"
import Package from "@/models/Package"
import Enrollment from "@/models/Enrollment"
import mongoose from "mongoose"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const session = await getServerSession(authOptions)

    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const status = searchParams.get("status")
    const level = searchParams.get("level")
    const packageId = searchParams.get("packageId")

    const skip = (page - 1) * limit

    // Build query based on user role
    const query: any = {}

    // For non-admin users, only show published courses
    if (!session?.user || session.user.role !== "admin") {
      query.status = "published"
    }

    // For admin users, filter by status if provided
    if (session?.user?.role === "admin" && status && status !== "all") {
      query.status = status
    }

    if (category) {
      query.categories = category
    }

    if (level) {
      query.level = level
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { instructor: { $regex: search, $options: "i" } },
      ]
    }

    if (packageId) {
      query.packages = packageId
    }

    const totalCourses = await Course.countDocuments(query)
    const courses = await Course.find(query)
      .populate({
        path: "packages",
        select: "title slug price",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // For admin users, add enrollment count for each course
    if (session?.user?.role === "admin") {
      const coursesWithEnrollments = await Promise.all(
        courses.map(async (course) => {
          const enrollmentCount = await Enrollment.countDocuments({
            courseId: course._id,
            status: "active",
          })
          return {
            ...course,
            enrollmentCount,
          }
        }),
      )

      return NextResponse.json({
        courses: coursesWithEnrollments,
        pagination: {
          total: totalCourses,
          page,
          limit,
          pages: Math.ceil(totalCourses / limit),
        },
      })
    }

    return NextResponse.json({
      courses,
      pagination: {
        total: totalCourses,
        page,
        limit,
        pages: Math.ceil(totalCourses / limit),
      },
    })
  } catch (error: any) {
    console.error("Error fetching courses:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch courses" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    const data = await request.json()
    console.log("Creating course with data:", data)

    // Validate required fields
    if (!data.title) {
      return NextResponse.json({ error: "Course title is required" }, { status: 400 })
    }

    if (!data.description) {
      return NextResponse.json({ error: "Course description is required" }, { status: 400 })
    }

    // Create slug from title
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Check if slug already exists
    const existingCourse = await Course.findOne({ slug })
    if (existingCourse) {
      return NextResponse.json({ error: "A course with this title already exists" }, { status: 400 })
    }

    // Process instructor data
    let instructorData = data.instructor
    if (typeof instructorData === "object" && !instructorData.name) {
      // If instructor is an object but name is empty, use a default string
      instructorData = "Instructor"
    }

    // Process video lessons
    const videoLessons = data.videoLessons || []
    videoLessons.forEach((lesson: any) => {
      // Ensure videoUrl is a string
      if (!lesson.videoUrl) {
        lesson.videoUrl = ""
      }
    })

    // Start a session for transaction
    const dbSession = await mongoose.startSession()
    dbSession.startTransaction()

    try {
      // Create new course
      const newCourse = new Course({
        title: data.title,
        slug,
        description: data.description,
        instructor: instructorData,
        thumbnail: data.thumbnail || "/placeholder.svg?height=200&width=300",
        videoLessons: videoLessons,
        status: data.status || "draft",
        packages: data.packages || [],
        price: data.price || 0, // Default price to 0 if not provided
        createdBy: session.user.id,
      })

      await newCourse.save({ session: dbSession })

      // If packages are specified, update the packages to include this course
      if (data.packages && data.packages.length > 0) {
        await Package.updateMany(
          { _id: { $in: data.packages } },
          { $addToSet: { courses: newCourse._id } },
          { session: dbSession },
        )
      }

      // Commit the transaction
      await dbSession.commitTransaction()
      dbSession.endSession()

      return NextResponse.json({ course: newCourse }, { status: 201 })
    } catch (error) {
      // Abort transaction on error
      await dbSession.abortTransaction()
      dbSession.endSession()
      throw error
    }
  } catch (error: any) {
    console.error("Error creating course:", error)
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 })
  }
}
