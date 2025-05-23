import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Package from "@/models/Package"
import Course from "@/models/Course"

export async function GET(request: Request) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const level = searchParams.get("level") || ""
    const featured = searchParams.get("featured") === "true"
    const popular = searchParams.get("popular") === "true"

    // Build filter object
    const filter: any = { isActive: true }

    if (search) {
      filter.$text = { $search: search }
    }

    if (category) {
      filter.category = category
    }

    if (level) {
      filter.level = level
    }

    if (featured) {
      filter.isFeatured = true
    }

    if (popular) {
      filter.isPopular = true
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit

    // Get packages with pagination
    const packages = await Package.find(filter)
      .populate({
        path: "courses",
        select: "title slug thumbnail instructor duration level",
      })
      .sort({ isFeatured: -1, isPopular: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Get total count for pagination
    const total = await Package.countDocuments(filter)

    return NextResponse.json({
      packages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Error fetching packages:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch packages" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase()
    const data = await request.json()

    console.log("Received package data:", data)

    // Detailed validation
    const errors = []

    if (!data.title || data.title.trim() === "") {
      errors.push("Package title is required")
    }

    if (!data.description || data.description.trim() === "") {
      errors.push("Package description is required")
    }

    if (data.price === undefined || data.price === null || isNaN(Number(data.price))) {
      errors.push("Package price is required and must be a valid number")
    }

    if (Number(data.price) < 0) {
      errors.push("Package price must be positive")
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
      console.error("Validation errors:", errors)
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 })
    }

    // Create slug from title if not provided
    const slug =
      data.slug ||
      data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

    // Check if slug already exists
    const existingPackage = await Package.findOne({ slug })
    if (existingPackage) {
      return NextResponse.json({ error: "A package with this title already exists" }, { status: 400 })
    }

    // Prepare package data with defaults
    const packageData = {
      title: data.title.trim(),
      description: data.description.trim(),
      longDescription: data.longDescription?.trim() || "",
      price: Number(data.price),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
      duration: data.duration || "lifetime",
      level: data.level || "Beginner",
      thumbnail: data.thumbnail || "/placeholder.svg?height=300&width=400",
      courses: data.courses || [],
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      isPopular: Boolean(data.isPopular),
      isFeatured: Boolean(data.isFeatured),
      features: Array.isArray(data.features) ? data.features.filter((f) => f.trim()) : [],
      benefits: Array.isArray(data.benefits) ? data.benefits.filter((b) => b.trim()) : [],
      accessDuration: data.accessDuration ? Number(data.accessDuration) : null,
      supportLevel: data.supportLevel || "basic",
      maxCourses: data.maxCourses ? Number(data.maxCourses) : 0,
      workshopCount: data.workshopCount ? Number(data.workshopCount) : 0,
      hasMentoring: Boolean(data.hasMentoring),
      mentoringType: data.mentoringType || "",
      hasJobPlacement: Boolean(data.hasJobPlacement),
      hasCertificate: data.hasCertificate !== undefined ? Boolean(data.hasCertificate) : true,
      category: data.category?.trim() || "general",
      tags: Array.isArray(data.tags) ? data.tags.filter((t) => t.trim()).map((t) => t.toLowerCase()) : [],
      slug,
    }

    console.log("Creating package with data:", packageData)

    // Create new package
    const newPackage = new Package(packageData)
    await newPackage.save()

    console.log("Package created successfully:", newPackage._id)

    // If courses are specified, update the courses to include this package
    if (packageData.courses && packageData.courses.length > 0) {
      try {
        await Course.updateMany({ _id: { $in: packageData.courses } }, { $addToSet: { packages: newPackage._id } })
        console.log("Updated courses with package reference")
      } catch (courseError) {
        console.error("Error updating courses:", courseError)
        // Don't fail the package creation if course update fails
      }
    }

    // Populate courses before returning
    const populatedPackage = await Package.findById(newPackage._id)
      .populate({
        path: "courses",
        select: "title slug thumbnail instructor",
      })
      .lean()

    return NextResponse.json({ package: populatedPackage }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating package:", error)

    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ error: "Validation failed", details: validationErrors }, { status: 400 })
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json({ error: "A package with this title already exists" }, { status: 400 })
    }

    return NextResponse.json(
      {
        error: error.message || "Failed to create package",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
