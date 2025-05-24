import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { compare } from "bcryptjs"
import jwt from "jsonwebtoken"

// Add this function to handle JWT token signing
export async function signJwtToken(payload: any) {
  try {
    const secret = process.env.NEXTAUTH_SECRET || "fallback-secret-key"
    return jwt.sign(payload, secret, { expiresIn: "7d" })
  } catch (error) {
    console.error("JWT signing error:", error)
    throw new Error("Failed to sign token")
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
    verifyRequest: "/verify-email",
    newUser: "/dashboard",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        await dbConnect()

        const user = await User.findOne({ email: credentials.email }).select("+password")

        if (!user) {
          throw new Error("No user found with this email")
        }

        if (!user.emailVerified) {
          throw new Error("Please verify your email before logging in")
        }

        const isPasswordValid = await compare(credentials.password, user.password || "")

        if (!isPasswordValid) {
          throw new Error("Invalid password")
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await dbConnect()

        if (account?.provider === "google") {
          // Check if user already exists
          let existingUser = await User.findOne({ email: user.email })

          if (!existingUser) {
            // Create new user for Google sign-in
            existingUser = await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              role: "user",
              status: "active",
              emailVerified: new Date(),
              provider: "google",
              lastLogin: new Date(),
            })
            console.log("✅ New Google user created:", existingUser._id)
          } else {
            // Update existing user
            await User.findByIdAndUpdate(existingUser._id, {
              image: user.image,
              emailVerified: existingUser.emailVerified || new Date(),
              lastLogin: new Date(),
              provider: existingUser.provider || "google",
            })
            console.log("✅ Existing user updated:", existingUser._id)
          }

          // Set user data for JWT - CRITICAL for session
          user.id = existingUser._id.toString()
          user.role = existingUser.role
          user.name = existingUser.name
          user.email = existingUser.email

          return true
        }

        return true
      } catch (error) {
        console.error("❌ Error in signIn callback:", error)
        return false
      }
    },

    async jwt({ token, user, account, trigger }) {
      // Initial sign in or when user data is updated
      if (user) {
        console.log("🔑 Setting JWT token for user:", user.email)
        token.id = user.id
        token.role = user.role || "user"
        token.name = user.name
        token.email = user.email
        token.picture = user.image
      }

      // Always ensure we have user data in token
      if (!token.id && token.email) {
        try {
          await dbConnect()
          const dbUser = await User.findOne({ email: token.email }).lean()
          if (dbUser) {
            token.id = dbUser._id.toString()
            token.role = dbUser.role
            token.name = dbUser.name
            console.log("🔄 Refreshed token from database for:", token.email)
          }
        } catch (error) {
          console.error("❌ Error refreshing token:", error)
        }
      }

      return token
    },

    async session({ session, token }) {
      if (token && token.id) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.image = token.picture as string

        console.log("📋 Session established for:", session.user.email, "Role:", session.user.role)
      } else {
        console.log("⚠️ No token ID found in session callback")
      }

      return session
    },

    async redirect({ url, baseUrl }) {
      console.log("🔄 Redirect callback - URL:", url, "BaseURL:", baseUrl)

      // If it's a relative URL, make it absolute
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }

      // If it's the same origin, allow it
      if (new URL(url).origin === baseUrl) {
        return url
      }

      // Default redirect to dashboard
      return `${baseUrl}/dashboard`
    },
  },

  events: {
    async signIn({ user, account, isNewUser }) {
      console.log("🎉 SignIn event triggered:", {
        email: user.email,
        provider: account?.provider,
        isNewUser,
        userId: user.id,
      })
    },
    async session({ session, token }) {
      console.log("📱 Session event:", {
        userId: session.user?.id,
        email: session.user?.email,
        hasToken: !!token,
      })
    },
  },

  debug: true, // Enable debug mode
  secret: process.env.NEXTAUTH_SECRET,
}
