"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Landmark,
  Wallet,
  CheckCircle,
  AlertCircle,
  Info,
  Users,
  Gift,
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

interface ReferrerInfo {
  id: string
  name: string
  email: string
}

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [packageData, setPackageData] = useState<Package | null>(null)
  const [activeStep, setActiveStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer")

  // Promo code states
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [isValidatingPromo, setIsValidatingPromo] = useState(false)
  const [promoError, setPromoError] = useState("")

  // Referral code states
  const [referralCode, setReferralCode] = useState("")
  const [referrerInfo, setReferrerInfo] = useState<ReferrerInfo | null>(null)
  const [isValidatingReferral, setIsValidatingReferral] = useState(false)
  const [referralError, setReferralError] = useState("")
  const [autoDetectedReferral, setAutoDetectedReferral] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Auto-detect referral code from URL
  useEffect(() => {
    const urlReferralCode = searchParams.get("ref")
    if (urlReferralCode && !referralCode) {
      setReferralCode(urlReferralCode)
      setAutoDetectedReferral(true)
      validateReferralCode(urlReferralCode)
    }
  }, [searchParams])

  useEffect(() => {
    if (status === "unauthenticated") {
      const currentUrl = `/packages/${params.id}/checkout`
      const referralParam = searchParams.get("ref") ? `?ref=${searchParams.get("ref")}` : ""
      router.push(`/login?callbackUrl=${encodeURIComponent(currentUrl + referralParam)}`)
      return
    }

    const fetchPackage = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/packages/${params.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch package data")
        }

        const data = await response.json()
        setPackageData(data.package)
      } catch (error) {
        console.error("Error fetching package:", error)
        toast({
          title: "Error",
          description: "Failed to load package data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchPackage()
    }
  }, [params.id, router, status, toast, searchParams])

  const validateReferralCode = async (code?: string) => {
    const codeToValidate = code || referralCode
    if (!codeToValidate.trim()) {
      setReferralError("Please enter a referral code")
      return
    }

    try {
      setIsValidatingReferral(true)
      setReferralError("")

      const response = await fetch(`/api/referral/validate?code=${codeToValidate}`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        setReferralError(data.message || "Invalid referral code")
        setReferrerInfo(null)
        return
      }

      setReferrerInfo(data.referrer)
      if (!code) {
        // Only show toast for manual validation
        toast({
          title: "Referral code applied!",
          description: `You were referred by ${data.referrer.name}`,
        })
      }
    } catch (error) {
      console.error("Error validating referral code:", error)
      setReferralError("Failed to validate referral code. Please try again.")
      setReferrerInfo(null)
    } finally {
      setIsValidatingReferral(false)
    }
  }

  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code")
      return
    }

    try {
      setIsValidatingPromo(true)
      setPromoError("")

      const response = await fetch(`/api/promo/validate?code=${promoCode}&package=${params.id}`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        setPromoError(data.message || "Invalid promo code")
        setDiscount(0)
        return
      }

      setDiscount(data.discount)
      toast({
        title: "Promo code applied!",
        description: `You received a ${data.discount}% discount.`,
      })
    } catch (error) {
      console.error("Error validating promo code:", error)
      setPromoError("Failed to validate promo code. Please try again.")
    } finally {
      setIsValidatingPromo(false)
    }
  }

  const removeReferralCode = () => {
    setReferralCode("")
    setReferrerInfo(null)
    setReferralError("")
    setAutoDetectedReferral(false)
  }

  const handleSubmit = async () => {
    if (!packageData) return

    try {
      setIsSubmitting(true)

      const formData = new FormData()
      formData.append("packageId", packageData._id)
      formData.append("amount", calculateFinalPrice().toString())
      formData.append("paymentMethod", paymentMethod)

      // Add referral information if available
      if (referrerInfo) {
        formData.append("referrerId", referrerInfo.id)
      }

      const response = await fetch("/api/transactions", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create transaction")
      }

      toast({
        title: "Order placed successfully!",
        description: "Please complete your payment to access the courses.",
      })

      // Redirect to payment confirmation page
      router.push(`/payment/confirmation/${data.transaction._id}`)
    } catch (error: any) {
      console.error("Error creating transaction:", error)
      toast({
        title: "Checkout Error",
        description: error.message || "Failed to complete checkout. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateFinalPrice = () => {
    if (!packageData) return 0
    if (discount <= 0) return packageData.price

    const discountAmount = (packageData.price * discount) / 100
    return packageData.price - discountAmount
  }

  const nextStep = () => {
    setActiveStep((prev) => Math.min(prev + 1, 4))
  }

  const prevStep = () => {
    setActiveStep((prev) => Math.max(prev - 1, 1))
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <div className="flex items-center gap-2 mb-8">
          <Button variant="outline" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-full max-w-md" />
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Skeleton className="h-64 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!packageData) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load package data. Please try again or{" "}
            <Link href="/packages" className="underline">
              browse other packages
            </Link>
            .
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="flex items-center gap-2 mb-8">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/packages/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Checkout</h1>
        {autoDetectedReferral && referrerInfo && (
          <Badge variant="secondary" className="ml-auto">
            <Users className="h-3 w-3 mr-1" />
            Referred by {referrerInfo.name}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Purchase</CardTitle>
              <CardDescription>Follow the steps below to complete your purchase</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`flex flex-col items-center ${
                        step < activeStep
                          ? "text-primary"
                          : step === activeStep
                            ? "text-primary font-medium"
                            : "text-muted-foreground"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                          step < activeStep
                            ? "bg-primary text-primary-foreground"
                            : step === activeStep
                              ? "border-2 border-primary"
                              : "border-2 border-muted"
                        }`}
                      >
                        {step < activeStep ? <CheckCircle className="h-4 w-4" /> : step}
                      </div>
                      <span className="text-xs hidden sm:block">
                        {step === 1 ? "Package" : step === 2 ? "Payment" : step === 3 ? "Referral" : "Review"}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="relative mt-1 mb-6">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-muted rounded-full" />
                  <div
                    className="absolute top-0 left-0 h-1 bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${((activeStep - 1) / 3) * 100}%` }}
                  />
                </div>
              </div>

              {activeStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="relative w-24 h-24 rounded-md overflow-hidden border">
                      <Image
                        src={packageData.thumbnail || "/placeholder.svg?height=96&width=96"}
                        alt={packageData.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{packageData.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{packageData.description}</p>
                      <p className="text-lg font-bold">₹{packageData.price.toFixed(2)}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-medium mb-2">Included Courses</h3>
                    <ul className="space-y-2">
                      {packageData.courses && packageData.courses.length > 0 ? (
                        packageData.courses.map((course: any) => (
                          <li key={course._id} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>{course.title}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-muted-foreground">No courses included in this package</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-4">Select Payment Method</h3>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      <div>
                        <RadioGroupItem
                          value="bank_transfer"
                          id="bank_transfer"
                          className="peer sr-only"
                          aria-label="Bank Transfer"
                        />
                        <Label
                          htmlFor="bank_transfer"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <Landmark className="mb-3 h-6 w-6" />
                          <span className="font-medium">Bank Transfer</span>
                        </Label>
                      </div>

                      <div>
                        <RadioGroupItem value="esewa" id="esewa" className="peer sr-only" aria-label="eSewa" />
                        <Label
                          htmlFor="esewa"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <Wallet className="mb-3 h-6 w-6" />
                          <span className="font-medium">eSewa</span>
                        </Label>
                      </div>

                      <div>
                        <RadioGroupItem value="khalti" id="khalti" className="peer sr-only" aria-label="Khalti" />
                        <Label
                          htmlFor="khalti"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <CreditCard className="mb-3 h-6 w-6" />
                          <span className="font-medium">Khalti</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Payment Process</AlertTitle>
                    <AlertDescription>
                      After completing your order, you'll need to make the payment and upload proof of payment. Your
                      courses will be accessible after our team verifies your payment.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {activeStep === 3 && (
                <div className="space-y-6">
                  {/* Referral Code Section */}
                  <div>
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Referral Code
                    </h3>

                    {referrerInfo ? (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-green-800 font-medium">Referred by {referrerInfo.name}</span>
                          </div>
                          {!autoDetectedReferral && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={removeReferralCode}
                              className="text-green-600 hover:text-green-800"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-green-600 mt-1">
                          {autoDetectedReferral ? "Automatically detected from your link" : "Manually applied"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter referral code (optional)"
                            value={referralCode}
                            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                            disabled={isValidatingReferral}
                          />
                          <Button
                            onClick={() => validateReferralCode()}
                            disabled={isValidatingReferral || !referralCode.trim()}
                            variant="outline"
                          >
                            {isValidatingReferral ? "Validating..." : "Apply"}
                          </Button>
                        </div>
                        {referralError && <p className="text-sm text-red-500">{referralError}</p>}
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Promo Code Section */}
                  <div>
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                      <Gift className="h-4 w-4" />
                      Promo Code (Optional)
                    </h3>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        disabled={isValidatingPromo}
                      />
                      <Button
                        onClick={validatePromoCode}
                        disabled={isValidatingPromo || !promoCode.trim()}
                        variant="outline"
                      >
                        {isValidatingPromo ? "Validating..." : "Apply"}
                      </Button>
                    </div>
                    {promoError && <p className="text-sm text-red-500 mt-1">{promoError}</p>}
                    {discount > 0 && (
                      <div className="mt-2 p-2 bg-green-50 text-green-700 rounded-md text-sm flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {discount}% discount applied!
                      </div>
                    )}
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Referral Benefits</AlertTitle>
                    <AlertDescription>
                      When someone purchases using your referral code, you'll earn 65% commission from their purchase.
                      Help others learn and earn rewards!
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {activeStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-4">Order Summary</h3>
                    <div className="rounded-lg border p-4 space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Package:</span>
                        <span className="font-medium">{packageData.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment Method:</span>
                        <span className="font-medium capitalize">{paymentMethod.replace("_", " ")}</span>
                      </div>
                      {referrerInfo && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Referred by:</span>
                          <span className="font-medium">{referrerInfo.name}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Original Price:</span>
                        <span>₹{packageData.price.toFixed(2)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount ({discount}%):</span>
                          <span>-₹{((packageData.price * discount) / 100).toFixed(2)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>₹{calculateFinalPrice().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Next Steps</AlertTitle>
                    <AlertDescription>
                      After placing your order, you'll be directed to a page where you can upload proof of your payment.
                      Your courses will be accessible after our team verifies your payment.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={prevStep} disabled={activeStep === 1}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                {activeStep < 4 ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Processing..." : "Place Order"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {referrerInfo && (
                  <>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-800">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">Referral Applied</span>
                      </div>
                      <p className="text-sm text-blue-600 mt-1">Referred by {referrerInfo.name}</p>
                    </div>
                    <Separator />
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Original Price:</span>
                  <span>₹{packageData.price.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discount}%):</span>
                    <span>-₹{((packageData.price * discount) / 100).toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>₹{calculateFinalPrice().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 text-center">
              <p className="text-xs text-muted-foreground">
                By completing this purchase, you agree to our Terms of Service and Privacy Policy.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
