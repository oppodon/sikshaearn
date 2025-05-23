import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    await connectToDatabase()

    // Import models directly to ensure they're registered
    require("@/models/Package")
    require("@/models/Course")
    require("@/models/Enrollment")
    require("@/models/Transaction")

    // Get transactions
    const transactions = await mongoose
      .model("Transaction")
      .find({
        user: userId,
      })
      .lean()

    // Get enrollments
    const enrollments = await mongoose
      .model("Enrollment")
      .find({
        user: userId,
      })
      .lean()

    // Get packages from transactions
    const packageIds = transactions.filter((t) => t.package).map((t) => t.package)

    const packages = await mongoose
      .model("Package")
      .find({
        _id: { $in: packageIds },
      })
      .lean()

    // Count courses in packages
    let coursesCount = 0
    for (const pkg of packages) {
      if (pkg.courses && Array.isArray(pkg.courses)) {
        coursesCount += pkg.courses.length
      }
    }

    return NextResponse.json({
      userId,
      transactions,
      enrollments,
      packages,
      coursesCount,
    })
  } catch (error) {
    console.error("Error in debug enrollments API:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch debug info",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
