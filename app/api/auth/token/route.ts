import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Generate a custom JWT token
    const token = jwt.sign(
      {
        userId: session.user.id,
        email: session.user.email,
        role: session.user.role,
        name: session.user.name,
      },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "30d" },
    )

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        image: session.user.image,
      },
    })
  } catch (error) {
    console.error("Token generation error:", error)
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 })
  }
}
