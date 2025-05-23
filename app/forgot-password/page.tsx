"use client"

import { useState } from "react"
import Link from "next/link"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft, CheckCircle, Sparkles } from "lucide-react"

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to process request")
      }

      setSuccess(true)
    } catch (error: any) {
      setError(error.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 overflow-x-hidden">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <div className="flex flex-col items-center space-y-3 sm:space-y-4 text-center">
          <Link href="/" className="flex items-center gap-2 mb-2 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center">
              <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="flex items-center">
              <span className="text-lg sm:text-2xl font-bold font-montserrat tracking-tight text-gray-900">
                Siksha<span className="text-primary font-extrabold">Earn</span>
              </span>
            </div>
          </Link>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Reset your password</h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-500 max-w-sm">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800 text-xs sm:text-sm">{error}</AlertDescription>
          </Alert>
        )}

        <div className="rounded-lg sm:rounded-xl border bg-white p-4 sm:p-6 md:p-8 shadow-md sm:shadow-lg">
          {success ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-6 sm:py-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <div className="space-y-2 text-center">
                <h2 className="text-lg sm:text-xl font-semibold text-green-600">Check Your Email</h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  If an account exists with the email you provided, we've sent instructions to reset your password.
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">The link will expire in 1 hour.</p>
              </div>
              <Button asChild className="mt-4 w-full sm:w-auto">
                <Link href="/login">Back to Sign In</Link>
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium text-sm sm:text-base">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="your.email@example.com"
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

                <Button
                  type="submit"
                  className="w-full h-10 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg sm:rounded-xl transition-all duration-200 text-sm sm:text-base"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      Sending reset link...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>

                <div className="text-center">
                  <Button
                    variant="link"
                    asChild
                    className="mt-2 h-auto p-0 text-xs sm:text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Link href="/login" className="flex items-center justify-center">
                      <ArrowLeft className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                      Back to sign in
                    </Link>
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>

        {/* Additional help text */}
        <div className="text-center text-xs sm:text-sm text-gray-500">
          <p>
            Need help?{" "}
            <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}