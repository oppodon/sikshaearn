import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Transaction from "@/models/Transaction"
import User from "@/models/User"
import Enrollment from "@/models/Enrollment"
import { BalanceService } from "@/lib/balance-service"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const { transactionId } = await req.json()

    if (!transactionId) {
      return NextResponse.json({ message: "Transaction ID is required" }, { status: 400 })
    }

    // Find the transaction
    const transaction = await Transaction.findById(transactionId).populate("package").populate("user")

    if (!transaction) {
      return NextResponse.json({ message: "Transaction not found" }, { status: 404 })
    }

    if (transaction.status === "approved") {
      return NextResponse.json({ message: "Transaction already approved" }, { status: 400 })
    }

    // Update transaction status
    transaction.status = "approved"
    transaction.approvedAt = new Date()
    transaction.approvedBy = session.user.id

    await transaction.save()
    console.log("Transaction approved:", transaction._id)

    // Get the package details
    const packageData = transaction.package
    if (!packageData) {
      return NextResponse.json({ message: "Package not found" }, { status: 404 })
    }

    // Create enrollment
    const existingEnrollment = await Enrollment.findOne({
      user: transaction.user._id,
      package: transaction.package._id,
    })

    if (!existingEnrollment) {
      try {
        // Calculate end date if package has duration
        let endDate = null
        if (packageData.duration && packageData.durationType) {
          endDate = new Date()
          if (packageData.durationType === "days") {
            endDate.setDate(endDate.getDate() + packageData.duration)
          } else if (packageData.durationType === "months") {
            endDate.setMonth(endDate.getMonth() + packageData.duration)
          } else if (packageData.durationType === "years") {
            endDate.setFullYear(endDate.getFullYear() + packageData.duration)
          }
        }

        // Create new enrollment with progress as a number
        const newEnrollment = new Enrollment({
          user: transaction.user._id,
          package: transaction.package._id,
          transaction: transaction._id,
          startDate: new Date(),
          endDate: endDate,
          isActive: true,
          completedCourses: [],
          completedLessons: [],
          progress: 0, // Progress as a number (percentage)
          lastAccessed: new Date(),
        })

        await newEnrollment.save()
        console.log("New enrollment created:", newEnrollment._id)
      } catch (error) {
        console.error("Error creating enrollment:", error)
        throw error
      }
    } else {
      console.log("Enrollment already exists:", existingEnrollment._id)
    }

    // Process affiliate commissions if applicable
    if (transaction.affiliateId) {
      const packageAmount = packageData.price || 0

      try {
        // Calculate direct referral commission (65%)
        const directCommission = Math.round(packageAmount * 0.65)

        // Add commission to affiliate's balance
        await BalanceService.addCommission({
          userId: transaction.affiliateId,
          amount: directCommission,
          tier: 1,
          transactionId: transaction._id,
          packageId: packageData._id,
          packageTitle: packageData.title,
          customerName: transaction.user.name,
          customerEmail: transaction.user.email,
          commissionRate: 65,
        })

        console.log(`Direct commission added: ${directCommission} to user ${transaction.affiliateId}`)

        // Process second-tier commission if applicable (5%)
        const referrer = await User.findById(transaction.affiliateId)
        if (referrer && referrer.referredBy) {
          const secondTierCommission = Math.round(packageAmount * 0.05)

          await BalanceService.addCommission({
            userId: referrer.referredBy,
            amount: secondTierCommission,
            tier: 2,
            transactionId: transaction._id,
            packageId: packageData._id,
            packageTitle: packageData.title,
            customerName: transaction.user.name,
            customerEmail: transaction.user.email,
            commissionRate: 5,
          })

          console.log(`Second-tier commission added: ${secondTierCommission} to user ${referrer.referredBy}`)
        }
      } catch (error) {
        console.error("Error processing commissions:", error)
        // Continue with transaction approval even if commission processing fails
      }
    }

    return NextResponse.json({
      message: "Transaction approved and commissions processed successfully",
      transactionId: transaction._id,
    })
  } catch (error) {
    console.error("Error approving transaction:", error)
    return NextResponse.json({ error: "Failed to approve transaction", details: error.message }, { status: 500 })
  }
}
