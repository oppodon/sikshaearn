"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import Image from "next/image"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const email = searchParams.get("email")

  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    }
  }, [token])

  const verifyEmail = async (token: string) => {
    setIsVerifying(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to verify email")
      }

      setIsVerified(true)

      // Redirect to login page after successful verification
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (error: any) {
      setError(error.message || "An unexpected error occurred")
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-10 w-10">
              <Image
                src="/placeholder.svg?height=40&width=40"
                alt="Knowledge Hub Nepal Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold text-blue-600">Knowledge Hub Nepal</span>
          </Link>
          <h1 className="text-2xl font-bold">Email Verification</h1>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          {token ? (
            <>
              {isVerifying && (
                <div className="flex flex-col items-center justify-center space-y-4 py-8">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                  <p className="text-center text-gray-600">Verifying your email address...</p>
                </div>
              )}

              {isVerified && (
                <div className="flex flex-col items-center justify-center space-y-4 py-8">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                  <div className="space-y-2 text-center">
                    <h2 className="text-xl font-semibold text-green-600">Email Verified Successfully!</h2>
                    <p className="text-gray-600">Your email has been verified. You can now sign in to your account.</p>
                  </div>
                  <Button asChild className="mt-4">
                    <Link href="/login">Sign In</Link>
                  </Button>
                </div>
              )}

              {error && (
                <div className="flex flex-col items-center justify-center space-y-4 py-8">
                  <XCircle className="h-12 w-12 text-red-600" />
                  <div className="space-y-2 text-center">
                    <h2 className="text-xl font-semibold text-red-600">Verification Failed</h2>
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    <p className="text-gray-600">The verification link may have expired or is invalid.</p>
                  </div>
                  <Button asChild variant="outline" className="mt-4">
                    <Link href="/login">Back to Sign In</Link>
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <div className="rounded-full bg-blue-50 p-3">
                <Loader2 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="space-y-2 text-center">
                <h2 className="text-xl font-semibold">Check Your Email</h2>
                <p className="text-gray-600">
                  We've sent a verification link to <span className="font-medium">{email || "your email address"}</span>
                  .
                </p>
                <p className="text-sm text-gray-500">
                  Please check your inbox and click the verification link to activate your account. The link will expire
                  in 24 hours.
                </p>
              </div>
              <div className="mt-6 space-y-4">
                <p className="text-center text-sm text-gray-500">
                  Didn't receive the email?{" "}
                  <Button variant="link" className="h-auto p-0 text-blue-600">
                    Resend verification email
                  </Button>
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login">Back to Sign In</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
