import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Package from "@/models/Package"
import Course from "@/models/Course" // Import Course model

export async function GET(request: Request) {
  try {
    await connectToDatabase()

    // Initialize Course model to ensure it's registered
    await Course.findOne().limit(1)

    // Get all packages and populate courses
    const packages = await Package.find({})
      .populate({
        path: "courses",
        select: "title slug thumbnail instructor",
      })
      .sort({ price: 1 })
      .lean()

    return NextResponse.json({ packages })
  } catch (error: any) {
    console.error("Error fetching packages:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch packages" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase()
    const data = await request.json()

    // Validate required fields
    if (!data.title) {
      return NextResponse.json({ error: "Package title is required" }, { status: 400 })
    }

    if (!data.description) {
      return NextResponse.json({ error: "Package description is required" }, { status: 400 })
    }

    if (data.price === undefined || data.price === null) {
      return NextResponse.json({ error: "Package price is required" }, { status: 400 })
    }

    // Create slug from title
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Create new package
    const newPackage = new Package({
      ...data,
      slug,
      courses: data.courses || [], // Ensure courses is an array
    })

    await newPackage.save()

    // If courses are specified, update the courses to include this package
    if (data.courses && data.courses.length > 0) {
      await Course.updateMany({ _id: { $in: data.courses } }, { $addToSet: { packages: newPackage._id } })
    }

    return NextResponse.json({ package: newPackage }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating package:", error)
    return NextResponse.json({ error: error.message || "Failed to create package" }, { status: 500 })
  }
}
