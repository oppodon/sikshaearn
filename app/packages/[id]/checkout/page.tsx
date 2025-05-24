"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Info,
  Users,
  CreditCard,
  FileText,
  Upload,
  Clock,
  Shield,
  ArrowRight,
  Gift,
  Check,
  X,
} from "lucide-react"

interface Package {
  _id: string
  title: string
  description: string
  price: number
  thumbnail: string
  courses: any[]
}

interface PaymentMethod {
  _id: string
  name: string
  qrCodeUrl: string
  instructions: string
}

interface ReferralData {
  isValid: boolean
  referrer?: {
    id: string
    name: string
    email: string
  }
}

type CheckoutStep = "review" | "payment" | "confirmation"

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const { toast } = useToast()

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("review")
  const [isLoading, setIsLoading] = useState(true)
  const [packageData, setPackageData] = useState<Package | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [transactionId, setTransactionId] = useState<string | null>(null)

  // Referral system states
  const [referralCode, setReferralCode] = useState("")
  const [referralData, setReferralData] = useState<ReferralData | null>(null)
  const [isValidatingReferral, setIsValidatingReferral] = useState(false)
  const [appliedReferral, setAppliedReferral] = useState<string | null>(null)

  const steps = [
    { id: "review", title: "Review Order", icon: FileText },
    { id: "payment", title: "Payment Method", icon: CreditCard },
    { id: "confirmation", title: "Confirmation", icon: CheckCircle },
  ]

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep)

  useEffect(() => {
    // Check for referral code in URL
    const refCode = searchParams.get("ref")
    if (refCode) {
      setReferralCode(refCode)
      validateReferralCode(refCode)
    }
  }, [searchParams])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/packages/${params.id}/checkout`)}`)
      return
    }

    const fetchData = async () => {
      try {
        setIsLoading(true)

        const packageResponse = await fetch(`/api/packages/${params.id}`)
        if (!packageResponse.ok) {
          throw new Error("Failed to fetch package data")
        }
        const packageResult = await packageResponse.json()

        const paymentResponse = await fetch("/api/payment-methods")
        if (!paymentResponse.ok) {
          throw new Error("Failed to fetch payment methods")
        }
        const paymentResult = await paymentResponse.json()

        setPackageData(packageResult.package)
        setPaymentMethods(paymentResult.paymentMethods)

        if (paymentResult.paymentMethods.length > 0) {
          setSelectedPaymentMethod(paymentResult.paymentMethods[0]._id)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load checkout data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchData()
    }
  }, [params.id, router, status, toast])

  const validateReferralCode = async (code: string) => {
    if (!code.trim()) {
      setReferralData(null)
      return
    }

    try {
      setIsValidatingReferral(true)
      const response = await fetch(`/api/referral/validate?code=${encodeURIComponent(code)}`)
      const data = await response.json()

      if (response.ok && data.success) {
        setReferralData({
          isValid: true,
          referrer: data.referrer,
        })
        setAppliedReferral(code)
        toast({
          title: "Referral Code Applied!",
          description: `You're being referred by ${data.referrer.name}`,
        })
      } else {
        setReferralData({ isValid: false })
        setAppliedReferral(null)
      }
    } catch (error) {
      console.error("Error validating referral:", error)
      setReferralData({ isValid: false })
      setAppliedReferral(null)
    } finally {
      setIsValidatingReferral(false)
    }
  }

  const handleReferralCodeChange = (value: string) => {
    setReferralCode(value)
    if (value.length >= 3) {
      validateReferralCode(value)
    } else {
      setReferralData(null)
      setAppliedReferral(null)
    }
  }

  const handleCreateOrder = async () => {
    if (!packageData || !selectedPaymentMethod) {
      toast({
        title: "Missing Information",
        description: "Please ensure all required information is provided.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const formData = new FormData()
      formData.append("packageId", packageData._id)
      formData.append("amount", packageData.price.toString())
      formData.append("paymentMethodId", selectedPaymentMethod)

      // Add referral code if applied
      if (appliedReferral) {
        formData.append("referralCode", appliedReferral)
      }

      const response = await fetch("/api/transactions", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create transaction")
      }

      setTransactionId(data.transaction._id)
      setCurrentStep("confirmation")

      toast({
        title: "Order Created Successfully!",
        description: "Please complete your payment using the instructions below.",
      })
    } catch (error: any) {
      console.error("Error creating transaction:", error)
      toast({
        title: "Order Creation Failed",
        description: error.message || "Failed to create order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedMethod = paymentMethods.find((method) => method._id === selectedPaymentMethod)

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container max-w-6xl mx-auto py-8 px-4">
          <div className="flex items-center gap-2 mb-8">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!packageData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container max-w-4xl mx-auto py-12 px-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load package data. Please try again or{" "}
              <Link href="/packages" className="underline">
                browse other packages
              </Link>
              .
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" asChild className="rounded-full">
            <Link href={`/packages/${params.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Checkout</h1>
            <p className="text-gray-600 dark:text-gray-300">Complete your purchase securely</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              const isActive = index <= currentStepIndex
              const isCurrent = index === currentStepIndex

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                        isActive
                          ? "bg-gray-900 border-gray-900 text-white dark:bg-white dark:border-white dark:text-gray-900"
                          : "bg-white border-gray-300 text-gray-400 dark:bg-gray-800 dark:border-gray-600"
                      }`}
                    >
                      <StepIcon className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <p
                        className={`text-sm font-medium ${isCurrent ? "text-gray-900 dark:text-white" : "text-gray-500"}`}
                      >
                        {step.title}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-4 ${index < currentStepIndex ? "bg-gray-900 dark:bg-white" : "bg-gray-300 dark:bg-gray-600"}`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === "review" && (
              <div className="space-y-6">
                {/* Package Details */}
                <Card className="shadow-sm border border-gray-200 dark:border-gray-700">
                  <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <FileText className="h-5 w-5" />
                      Package Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <Image
                          src={packageData.thumbnail || "/placeholder.svg?height=128&width=192"}
                          alt={packageData.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                          {packageData.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">{packageData.description}</p>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {packageData.courses?.length || 0} Courses
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            Lifetime Access
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Referral Code */}
                <Card className="shadow-sm border border-gray-200 dark:border-gray-700">
                  <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <Gift className="h-5 w-5" />
                      Referral Code (Optional)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="referralCode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Enter referral code to support your referrer
                        </Label>
                        <div className="mt-1 relative">
                          <Input
                            id="referralCode"
                            type="text"
                            value={referralCode}
                            onChange={(e) => handleReferralCodeChange(e.target.value)}
                            placeholder="Enter referral code"
                            className="pr-10"
                            disabled={isValidatingReferral}
                          />
                          {isValidatingReferral && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                            </div>
                          )}
                          {referralData?.isValid && (
                            <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
                          )}
                          {referralData?.isValid === false && (
                            <X className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-600" />
                          )}
                        </div>
                      </div>

                      {referralData?.isValid && referralData.referrer && (
                        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-800 dark:text-green-200">
                            Valid referral code! You're being referred by <strong>{referralData.referrer.name}</strong>
                          </AlertDescription>
                        </Alert>
                      )}

                      {referralData?.isValid === false && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>Invalid referral code. Please check and try again.</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={() => setCurrentStep("payment")}
                  className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                >
                  Continue to Payment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {currentStep === "payment" && (
              <Card className="shadow-sm border border-gray-200 dark:border-gray-700">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {paymentMethods.length > 0 ? (
                    <div className="space-y-4">
                      {paymentMethods.map((method) => (
                        <div
                          key={method._id}
                          className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all hover:shadow-sm ${
                            selectedPaymentMethod === method._id
                              ? "border-gray-900 bg-gray-50 dark:border-white dark:bg-gray-800"
                              : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                          }`}
                          onClick={() => setSelectedPaymentMethod(method._id)}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                selectedPaymentMethod === method._id
                                  ? "border-gray-900 dark:border-white"
                                  : "border-gray-400"
                              }`}
                            >
                              {selectedPaymentMethod === method._id && (
                                <div className="w-2.5 h-2.5 rounded-full bg-gray-900 dark:bg-white" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                              <span className="font-medium text-gray-900 dark:text-white">{method.name}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No payment methods available.</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t border-gray-200 dark:border-gray-700 p-6 flex gap-3">
                  <Button variant="outline" onClick={() => setCurrentStep("review")} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={handleCreateOrder}
                    disabled={isSubmitting || !selectedPaymentMethod}
                    className="flex-1 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                  >
                    {isSubmitting ? "Creating Order..." : "Create Order"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {currentStep === "confirmation" && selectedMethod && (
              <Card className="shadow-sm border border-gray-200 dark:border-gray-700">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <CheckCircle className="h-5 w-5" />
                    Payment Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      Order created successfully! Complete the payment to access your courses.
                    </AlertDescription>
                  </Alert>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                      Pay via {selectedMethod.name}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                      <div className="order-2 md:order-1">
                        <div className="prose dark:prose-invert max-w-none">
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{selectedMethod.instructions}</p>
                        </div>

                        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                          <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Next Steps:</h4>
                          <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                            <li>1. Complete the payment using the QR code</li>
                            <li>2. Upload payment proof on the next page</li>
                            <li>3. Wait for verification (usually within 24 hours)</li>
                            <li>4. Access your courses once approved</li>
                          </ol>
                        </div>
                      </div>

                      <div className="order-1 md:order-2 flex justify-center">
                        <div className="relative w-48 h-48 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                          <Image
                            src={selectedMethod.qrCodeUrl || "/placeholder.svg"}
                            alt={`${selectedMethod.name} QR Code`}
                            fill
                            className="object-contain p-2"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      After payment, upload proof to complete your purchase. Courses will be available after
                      verification.
                    </AlertDescription>
                  </Alert>
                </CardContent>
                <CardFooter className="border-t border-gray-200 dark:border-gray-700 p-6">
                  <Button
                    asChild
                    className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                  >
                    <Link href={`/payment/confirmation/${transactionId}`}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Payment Proof
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card className="sticky top-8 shadow-sm border border-gray-200 dark:border-gray-700">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="text-gray-900 dark:text-white">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Package Price:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">₹{packageData.price.toFixed(2)}</span>
                  </div>
                  {appliedReferral && (
                    <div className="flex justify-between text-green-600">
                      <span>Referral Applied:</span>
                      <span className="font-medium">{appliedReferral}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900 dark:text-white">Total:</span>
                    <span className="text-gray-900 dark:text-white">₹{packageData.price.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <div className="w-full space-y-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">Secure Checkout</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    By completing this purchase, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
