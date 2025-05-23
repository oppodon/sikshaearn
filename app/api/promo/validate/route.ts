import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import PromoCode from "@/models/PromoCode"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get("code")
    const packageSlug = url.searchParams.get("package")

    if (!code) {
      return NextResponse.json({ success: false, message: "Promo code is required" }, { status: 400 })
    }

    await dbConnect()

    // Find the promo code
    const promoCode = await PromoCode.findOne({
      code: code.toUpperCase(),
      isActive: true,
      expiryDate: { $gt: new Date() },
    })

    if (!promoCode) {
      return NextResponse.json({ success: false, message: "Invalid or expired promo code" }, { status: 404 })
    }

    // Check if the promo code is applicable to this package
    if (promoCode.applicablePackages && promoCode.applicablePackages.length > 0) {
      if (!packageSlug || !promoCode.applicablePackages.includes(packageSlug)) {
        return NextResponse.json(
          { success: false, message: "Promo code not applicable to this package" },
          { status: 400 },
        )
      }
    }

    // Return success with discount information
    return NextResponse.json({
      success: true,
      message: "Valid promo code",
      discount: promoCode.discountPercentage,
      code: promoCode.code,
    })
  } catch (error) {
    console.error("Error validating promo code:", error)
    return NextResponse.json({ success: false, message: "Failed to validate promo code" }, { status: 500 })
  }
}
