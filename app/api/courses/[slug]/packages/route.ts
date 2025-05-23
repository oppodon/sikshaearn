import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Course from "@/models/Course"
import Package from "@/models/Package"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET all packages for a course
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectToDatabase()

    const { slug } = params
    const course = await Course.findOne({ slug }).populate("packages")

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json({ packages: course.packages })
  } catch (error) {
    console.error("Error fetching packages for course:", error)
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 })
  }
}

// POST add packages to a course
export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const { slug } = params
    const { packageIds } = await req.json()

    if (!packageIds || !Array.isArray(packageIds)) {
      return NextResponse.json({ error: "Package IDs must be provided as an array" }, { status: 400 })
    }

    const course = await Course.findOne({ slug })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Verify all packages exist
    const packages = await Package.find({ _id: { $in: packageIds } })

    if (packages.length !== packageIds.length) {
      return NextResponse.json({ error: "One or more packages not found" }, { status: 404 })
    }

    // Update the course with the package IDs
    course.packages = packageIds
    await course.save()

    return NextResponse.json({ message: "Packages updated successfully", packages: packageIds }, { status: 200 })
  } catch (error) {
    console.error("Error updating packages for course:", error)
    return NextResponse.json({ error: "Failed to update packages" }, { status: 500 })
  }
}
