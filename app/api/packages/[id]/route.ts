import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Package from "@/models/Package"
import Course from "@/models/Course" // Import Course model
import { isValidObjectId } from "mongoose"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    const { id } = params

    // Initialize Course model to ensure it's registered
    await Course.findOne().limit(1)

    // Check if id is a valid ObjectId or slug
    const query = isValidObjectId(id) ? { _id: id } : { slug: id }

    // Find package by ID or slug
    const packageData = await Package.findOne(query)
      .populate({
        path: "courses",
        select: "title slug description thumbnail instructor duration lessons rating reviewCount",
      })
      .lean()

    if (!packageData) {
      return NextResponse.json({ success: false, error: "Package not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, package: packageData }, { status: 200 })
  } catch (error: any) {
    console.error("Error fetching package:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch package" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    const { id } = params
    const data = await request.json()

    // Check if id is a valid ObjectId or slug
    const query = isValidObjectId(id) ? { _id: id } : { slug: id }

    // Find and update package
    const updatedPackage = await Package.findOneAndUpdate(query, data, { new: true })
      .populate({
        path: "courses",
        select: "title slug description thumbnail instructor duration lessons rating reviewCount",
      })
      .lean()

    if (!updatedPackage) {
      return NextResponse.json({ success: false, error: "Package not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, package: updatedPackage }, { status: 200 })
  } catch (error: any) {
    console.error("Error updating package:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to update package" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    const { id } = params

    // Check if id is a valid ObjectId or slug
    const query = isValidObjectId(id) ? { _id: id } : { slug: id }

    // Find and delete package
    const deletedPackage = await Package.findOneAndDelete(query).lean()

    if (!deletedPackage) {
      return NextResponse.json({ success: false, error: "Package not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Package deleted successfully" }, { status: 200 })
  } catch (error: any) {
    console.error("Error deleting package:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to delete package" }, { status: 500 })
  }
}
