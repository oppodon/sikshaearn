"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2, Sparkles, ArrowLeft } from "lucide-react"
import Image from "next/image"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
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

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      })

      if (result?.error) {
        setError(result.error)
        return
      }

      router.push(callbackUrl)
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col lg:flex-row overflow-x-hidden">
      {/* Left Side - Image (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-purple-600/90 z-10"></div>
        <Image
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=1200&fit=crop"
          alt="Students learning"
          fill
          className="object-cover"
          priority
        />
        <div className="relative z-20 flex flex-col justify-center items-center text-white p-6 sm:p-8 md:p-12 h-full">
          <div className="max-w-md text-center">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 md:mb-8 mx-auto">
              <Sparkles className="h-6 w-6 md:h-8 md:w-8" />
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">Welcome Back!</h1>
            <p className="text-base md:text-lg lg:text-xl opacity-90 mb-6 md:mb-8">
              Continue your learning journey and unlock new opportunities
            </p>
            <div className="flex items-center justify-center space-x-4 md:space-x-8 text-xs md:text-sm">
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold">50K+</div>
                <div className="opacity-80">Active Learners</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold">200+</div>
                <div className="opacity-80">Expert Courses</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold">95%</div>
                <div className="opacity-80">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Banner (visible only on small screens) */}
      <div className="lg:hidden relative h-[180px] sm:h-[220px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90 z-10"></div>
        <Image
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=300&fit=crop"
          alt="Students learning"
          fill
          className="object-cover"
          priority
        />
        <div className="relative z-20 h-full flex flex-col justify-center items-center text-white p-4 sm:p-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3 sm:mb-4">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">Welcome Back!</h1>
          <p className="text-sm sm:text-base opacity-90 mt-1 sm:mt-2 text-center">Continue your learning journey</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="text-center space-y-3 sm:space-y-4">
            <Link
              href="/"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4 sm:mb-6 md:mb-8 text-sm sm:text-base"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Back to Home
            </Link>

            <div className="flex items-center justify-center space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SikshaEarn
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Sign in to your account</h2>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Welcome back! Please enter your details</p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800 text-sm sm:text-base">{error}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100 p-5 sm:p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium text-sm sm:text-base">Email address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your email"
                          type="email"
                          autoComplete="email"
                          disabled={isLoading}
                          className="h-10 sm:h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-gray-700 font-medium text-sm sm:text-base">Password</FormLabel>
                        <Link
                          href="/forgot-password"
                          className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
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
                            className="h-10 sm:h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 pr-10 sm:pr-12 text-sm sm:text-base"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-10 sm:h-12 px-2 sm:px-3 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                          >
                            {showPassword ? (
                              <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                            ) : (
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-10 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg sm:rounded-xl transition-all duration-200 text-sm sm:text-base"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </Form>

            <p className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-600">
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
