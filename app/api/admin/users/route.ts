import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { hash } from "bcryptjs"
import crypto from "crypto"
import { sendEmail } from "@/lib/mail"

// GET /api/admin/users - Get all users with filtering
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status") || ""
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || ""

    const skip = (page - 1) * limit

    // Build query
    const query: any = {}

    if (status) {
      query.status = status
    }

    if (role) {
      query.role = role
    }

    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }]
    }

    // Execute query
    const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()

    const total = await User.countDocuments(query)

    return NextResponse.json({ users, total, page, limit })
  } catch (error: any) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

// POST /api/admin/users - Create a new user
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const body = await req.json()
    const { name, email, password, role } = body

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 400 })
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create new user
    const hashedPassword = await hash(password, 10)
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      status: "pending",
      verificationToken,
      verificationTokenExpiry,
    })

    // Send verification email
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`

    await sendEmail({
      to: email,
      subject: "Verify your email address",
      text: `Please verify your email address by clicking on the following link: ${verificationUrl}`,
      html: `
        <div>
          <h1>Welcome to Sikshya Earn!</h1>
          <p>Please verify your email address by clicking on the button below:</p>
          <a href="${verificationUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
          <p>If the button doesn't work, you can also click on this link: <a href="${verificationUrl}">${verificationUrl}</a></p>
          <p>This link will expire in 24 hours.</p>
        </div>
      `,
    })

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status,
          createdAt: newUser.createdAt,
        },
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Error creating user:", error)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
