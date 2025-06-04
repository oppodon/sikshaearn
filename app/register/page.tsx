"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Loader2, Sparkles, ArrowLeft, CheckCircle } from "lucide-react"
import Image from "next/image"

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  })

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to register")
      }

      setSuccess("Registration successful! Redirecting to login...")

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (error: any) {
      console.error("Registration error:", error)
      setError(error.message || "An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const benefits = [
    "Access to 200+ premium courses",
    "Learn from industry experts",
    "Get certified upon completion",
    "Join a community of 50K+ learners",
    "Lifetime access to course materials",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col lg:flex-row overflow-x-hidden">
      {/* Mobile Banner (visible only on small screens) */}
      <div className="lg:hidden relative h-[180px] sm:h-[220px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-blue-600/90 z-10"></div>
        <Image
          src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=300&fit=crop"
          alt="Learning environment"
          fill
          className="object-cover"
          priority
        />
        <div className="relative z-20 h-full flex flex-col justify-center items-center text-white p-4 sm:p-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3 sm:mb-4">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-center">Join SikshaEarn Today</h1>
          <p className="text-sm sm:text-base opacity-90 mt-1 sm:mt-2 text-center">Transform your career with us</p>
        </div>
      </div>

      {/* Left Side - Form */}
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
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Create your account</h2>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Start your learning journey today</p>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800 text-sm sm:text-base">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 text-sm sm:text-base">{success}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100 p-5 sm:p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium text-sm sm:text-base">Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name"
                          autoComplete="name"
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
                      <FormLabel className="text-gray-700 font-medium text-sm sm:text-base">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Create a strong password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
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

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium text-sm sm:text-base">Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Confirm your password"
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            disabled={isLoading}
                            className="h-10 sm:h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 pr-10 sm:pr-12 text-sm sm:text-base"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-10 sm:h-12 px-2 sm:px-3 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isLoading}
                          >
                            {showConfirmPassword ? (
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

                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                          className="mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-xs sm:text-sm text-gray-700">
                          I agree to the{" "}
                          <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                            Privacy Policy
                          </Link>
                        </FormLabel>
                        <FormMessage className="text-xs sm:text-sm" />
                      </div>
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
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </Form>

            <p className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Benefits (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 to-blue-600/90 z-10"></div>
        <Image
          src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=1200&fit=crop"
          alt="Learning environment"
          fill
          className="object-cover"
        />
        <div className="relative z-20 flex flex-col justify-center items-center text-white p-6 sm:p-8 md:p-12 h-full">
          <div className="max-w-md">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 md:mb-8 mx-auto">
              <Sparkles className="h-6 w-6 md:h-8 md:w-8" />
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 text-center">
              Join SikshaEarn Today
            </h1>
            <p className="text-base md:text-lg lg:text-xl opacity-90 mb-6 md:mb-8 text-center">
              Transform your career with our comprehensive learning platform
            </p>

            <div className="space-y-3 md:space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-5 h-5 md:w-6 md:h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-3 w-3 md:h-4 md:w-4" />
                  </div>
                  <span className="text-sm md:text-base opacity-90">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 md:mt-8 p-3 md:p-4 bg-white/10 backdrop-blur-sm rounded-xl">
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold mb-1">Start Free</div>
                <div className="text-xs md:text-sm opacity-80">No credit card required</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
