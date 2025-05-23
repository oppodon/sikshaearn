"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn, getSession, useSession } from "next-auth/react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FcGoogle } from "react-icons/fc"
import { Eye, EyeOff, Loader2, Sparkles, ArrowLeft } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Check if user is already logged in
  useEffect(() => {
    console.log("🔍 Login page - Session status:", status, "Session:", session)

    if (status === "authenticated" && session) {
      console.log("✅ User already authenticated, redirecting to:", callbackUrl)
      router.push(callbackUrl)
      router.refresh()
    }
  }, [session, status, router, callbackUrl])

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Don't show login form if already authenticated
  if (status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  const generateToken = async () => {
    try {
      const response = await fetch("/api/auth/token")
      const data = await response.json()

      if (data.success) {
        localStorage.setItem("auth_token", data.token)
        localStorage.setItem("user_data", JSON.stringify(data.user))
        toast.success("Login successful! Token generated.")
        console.log("🔑 Auth Token:", data.token)
        return data.token
      }
    } catch (error) {
      console.error("Token generation failed:", error)
    }
    return null
  }

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("🔐 Attempting credential login for:", data.email)

      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      })

      console.log("🔐 Credential login result:", result)

      if (result?.error) {
        setError(result.error)
        return
      }

      if (result?.ok) {
        // Wait a bit for session to be established
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Check session
        const session = await getSession()
        console.log("📋 Session after credential login:", session)

        if (session) {
          await generateToken()
          router.push(callbackUrl)
          router.refresh()
        } else {
          setError("Session could not be established. Please try again.")
        }
      }
    } catch (error) {
      console.error("❌ Login error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("🔐 Attempting Google login...")

      await signIn("google", {
        callbackUrl: "/dashboard",
      })

      // Note: We don't need to handle the redirect here as NextAuth will handle it
      // The page will be redirected automatically
    } catch (error) {
      console.error("❌ Google sign-in error:", error)
      setError("Google sign-in failed. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-purple-600/90 z-10"></div>
        <Image
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=1200&fit=crop"
          alt="Students learning"
          fill
          className="object-cover"
        />
        <div className="relative z-20 flex flex-col justify-center items-center text-white p-12">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 mx-auto">
              <Sparkles className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold mb-6">Welcome Back!</h1>
            <p className="text-xl opacity-90 mb-8">Continue your learning journey and unlock new opportunities</p>
            <div className="flex items-center justify-center space-x-8 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold">50K+</div>
                <div className="opacity-80">Active Learners</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">200+</div>
                <div className="opacity-80">Expert Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">95%</div>
                <div className="opacity-80">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <Link
              href="/"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>

            <div className="flex items-center justify-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SikshaEarn
              </span>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900">Sign in to your account</h2>
              <p className="text-gray-600 mt-2">Welcome back! Please enter your details</p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Email address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your email"
                          type="email"
                          autoComplete="email"
                          disabled={isLoading}
                          className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                        <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Enter your password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            disabled={isLoading}
                            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 pr-12"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-500" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-500" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-500">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full mt-4 h-12 border-gray-200 hover:bg-gray-50 rounded-xl"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <FcGoogle className="mr-3 h-5 w-5" />
                Continue with Google
              </Button>
            </div>

            <p className="mt-8 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/register" className="font-medium text-blue-600 hover:text-blue-700">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
