import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Package from "@/models/Package"
import Course from "@/models/Course"
import mongoose from "mongoose"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    const { packageId, courseIds } = await request.json()

    if (!packageId || !courseIds || !Array.isArray(courseIds)) {
      return NextResponse.json(
        { success: false, error: "Package ID and course IDs array are required" },
        { status: 400 },
      )
    }

    // Start a session for transaction
    const dbSession = await mongoose.startSession()
    dbSession.startTransaction()

    try {
      // Update package with new courses
      const updatedPackage = await Package.findByIdAndUpdate(
        packageId,
        { $set: { courses: courseIds } },
        { new: true, session: dbSession },
      )

      if (!updatedPackage) {
        throw new Error("Package not found")
      }

      // Remove this package from all courses
      await Course.updateMany({ packages: packageId }, { $pull: { packages: packageId } }, { session: dbSession })

      // Add this package to selected courses
      await Course.updateMany(
        { _id: { $in: courseIds } },
        { $addToSet: { packages: packageId } },
        { session: dbSession },
      )

      // Commit the transaction
      await dbSession.commitTransaction()
      dbSession.endSession()

      return NextResponse.json({
        success: true,
        message: "Courses assigned successfully",
        package: updatedPackage,
      })
    } catch (error) {
      // Abort transaction on error
      await dbSession.abortTransaction()
      dbSession.endSession()
      throw error
    }
  } catch (error: any) {
    console.error("Error assigning courses to package:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to assign courses" }, { status: 500 })
  }
}
