import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ensureModelsRegistered, Transaction, Package, Enrollment } from "@/lib/models"
import { BalanceService } from "@/lib/balance-service"

export async function POST(req: NextRequest) {
  try {
    console.log("=== 🚀 STARTING TRANSACTION APPROVAL ===")

    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { transactionId } = await req.json()
    if (!transactionId) {
      return NextResponse.json({ success: false, error: "Transaction ID is required" }, { status: 400 })
    }

    await connectToDatabase()
    ensureModelsRegistered()

    // Get transaction with populated data
    const transaction = await Transaction.findById(transactionId)
      .populate("user", "name email referralCode referredBy")
      .populate("package", "title price courses")

    if (!transaction) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 })
    }

    console.log("📋 Transaction details:", {
      id: transaction._id,
      status: transaction.status,
      user: transaction.user?.email,
      package: transaction.package?.title,
      amount: transaction.amount,
      affiliateId: transaction.affiliateId,
      affiliateCommission: transaction.affiliateCommission,
      tier2AffiliateId: transaction.tier2AffiliateId,
      tier2Commission: transaction.tier2Commission,
    })

    if (transaction.status === "completed") {
      return NextResponse.json({ success: false, error: "Transaction already approved" }, { status: 400 })
    }

    // Step 1: Update transaction status
    transaction.status = "completed"
    transaction.completedAt = new Date()
    await transaction.save()
    console.log("✅ Transaction status updated to completed")

    // Step 2: Create enrollment
    const packageData = await Package.findById(transaction.package._id).populate("courses")
    if (packageData && packageData.courses) {
      const existingEnrollment = await Enrollment.findOne({
        user: transaction.user._id,
        package: packageData._id,
      })

      if (!existingEnrollment) {
        const courseIds = packageData.courses.map((course: any) => course._id)

        await Enrollment.create({
          user: transaction.user._id,
          package: packageData._id,
          transaction: transaction._id,
          courses: courseIds,
          startDate: new Date(),
          isActive: true,
          completedCourses: [],
          completedLessons: [],
          progress: 0,
          lastAccessed: new Date(),
        })

        console.log("✅ Enrollment created for", courseIds.length, "courses")
      }
    }

    // Step 3: Process commissions
    const commissionResults = []

    // Tier 1 commission (Direct referrer)
    if (transaction.affiliateId && transaction.affiliateCommission > 0) {
      console.log(
        `💰 Processing Tier 1 commission: ₹${transaction.affiliateCommission} for user ${transaction.affiliateId}`,
      )

      try {
        const tier1Result = await BalanceService.addCommission({
          userId: transaction.affiliateId,
          amount: transaction.affiliateCommission,
          tier: 1,
          transactionId: transaction._id,
          packageId: transaction.package._id,
          packageTitle: transaction.package.title,
          customerName: transaction.user.name,
          customerEmail: transaction.user.email,
          commissionRate: 65,
        })

        commissionResults.push({
          tier: 1,
          userId: transaction.affiliateId,
          amount: transaction.affiliateCommission,
          success: true,
        })

        console.log("✅ Tier 1 commission added successfully")
      } catch (error) {
        console.error("❌ Tier 1 commission error:", error)
        commissionResults.push({
          tier: 1,
          userId: transaction.affiliateId,
          amount: transaction.affiliateCommission,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    // Tier 2 commission (Second-level referrer)
    if (transaction.tier2AffiliateId && transaction.tier2Commission > 0) {
      console.log(
        `💰 Processing Tier 2 commission: ₹${transaction.tier2Commission} for user ${transaction.tier2AffiliateId}`,
      )

      try {
        const tier2Result = await BalanceService.addCommission({
          userId: transaction.tier2AffiliateId,
          amount: transaction.tier2Commission,
          tier: 2,
          transactionId: transaction._id,
          packageId: transaction.package._id,
          packageTitle: transaction.package.title,
          customerName: transaction.user.name,
          customerEmail: transaction.user.email,
          commissionRate: 5,
        })

        commissionResults.push({
          tier: 2,
          userId: transaction.tier2AffiliateId,
          amount: transaction.tier2Commission,
          success: true,
        })

        console.log("✅ Tier 2 commission added successfully")
      } catch (error) {
        console.error("❌ Tier 2 commission error:", error)
        commissionResults.push({
          tier: 2,
          userId: transaction.tier2AffiliateId,
          amount: transaction.tier2Commission,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    console.log("=== ✅ TRANSACTION APPROVAL COMPLETED ===")
    console.log("📊 Commission Results:", commissionResults)

    return NextResponse.json({
      success: true,
      message: "Transaction approved successfully",
      transactionId: transaction._id,
      commissionResults,
    })
  } catch (error) {
    console.error("❌ Error in transaction approval:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to approve transaction",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
