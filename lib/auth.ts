import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { compare } from "bcryptjs"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
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

        // Check if user is banned
        if (user.status === "banned") {
          throw new Error("Your account has been banned. Please contact support for assistance.")
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
          status: user.status,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await dbConnect()

        if (account?.provider === "google") {
          let existingUser = await User.findOne({ email: user.email })

          if (!existingUser) {
            // Generate unique referral code for new Google users
            const generateReferralCode = () => {
              return Math.random().toString(36).substring(2, 8).toUpperCase()
            }

            let referralCodeGen = generateReferralCode()
            let isUnique = false
            while (!isUnique) {
              const existingUser = await User.findOne({ referralCode: referralCodeGen })
              if (!existingUser) {
                isUnique = true
              } else {
                referralCodeGen = generateReferralCode()
              }
            }

            existingUser = await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              role: "user",
              status: "active",
              provider: "google",
              referralCode: referralCodeGen,
              lastLogin: new Date(),
            })
          } else {
            // Check if Google user is banned
            if (existingUser.status === "banned") {
              return false // This will prevent sign in
            }

            await User.findByIdAndUpdate(existingUser._id, {
              image: user.image,
              lastLogin: new Date(),
              provider: existingUser.provider || "google",
            })
          }

          user.id = existingUser._id.toString()
          user.role = existingUser.role
          user.status = existingUser.status
          user.name = existingUser.name
          user.email = existingUser.email
          user.image = existingUser.image

          return true
        }

        return true
      } catch (error) {
        console.error("Error in signIn callback:", error)
        return false
      }
    },

    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = user.role || "user"
        token.status = user.status || "active"
        token.name = user.name
        token.email = user.email
        token.picture = user.image
      }

      // Handle session update trigger (when user updates profile)
      if (trigger === "update" && session) {
        if (session.image !== undefined) {
          token.picture = session.image
        }
        if (session.name !== undefined) {
          token.name = session.name
        }
        if (session.email !== undefined) {
          token.email = session.email
        }
      }

      // Refresh user data from database if token doesn't have ID
      if (!token.id && token.email) {
        try {
          await dbConnect()
          const dbUser = await User.findOne({ email: token.email }).lean()
          if (dbUser) {
            token.id = dbUser._id.toString()
            token.role = dbUser.role
            token.status = dbUser.status
            token.name = dbUser.name
            token.picture = dbUser.image
          }
        } catch (error) {
          console.error("Error refreshing token:", error)
        }
      }

      // Always refresh user status from database to check for bans
      if (token.id) {
        try {
          await dbConnect()
          const dbUser = await User.findById(token.id).lean()
          if (dbUser) {
            token.name = dbUser.name
            token.picture = dbUser.image
            token.role = dbUser.role
            token.status = dbUser.status
            token.lastRefresh = Date.now()
          }
        } catch (error) {
          console.error("Error refreshing user data:", error)
        }
      }

      return token
    },

    async session({ session, token }) {
      if (token && token.id) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.status = token.status as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.image = token.picture as string
      }

      return session
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }

      if (new URL(url).origin === baseUrl) {
        return url
      }

      return `${baseUrl}/dashboard`
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
}
