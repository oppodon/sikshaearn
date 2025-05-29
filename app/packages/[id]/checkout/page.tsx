"use client"

import type React from "react"

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
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Info,
  Users,
  CreditCard,
  Upload,
  Clock,
  Shield,
  ArrowRight,
  Check,
  X,
  User,
  Mail,
  MapPin,
  Eye,
  EyeOff,
  Sparkles,
  Phone,
  Home,
  FileImage,
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

interface UserFormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  country: string
  city: string
  address: string
  agreeToTerms: boolean
}

type CheckoutStep = "personal" | "account" | "address" | "payment" | "confirmation"

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const { toast } = useToast()

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("personal")
  const [isLoading, setIsLoading] = useState(true)
  const [packageData, setPackageData] = useState<Package | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null)
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null)
  const [isUploadingProof, setIsUploadingProof] = useState(false)

  // Form data
  const [userFormData, setUserFormData] = useState<UserFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    country: "",
    city: "",
    address: "",
    agreeToTerms: false,
  })

  // Referral system states
  const [referralCode, setReferralCode] = useState("")
  const [referralData, setReferralData] = useState<ReferralData | null>(null)
  const [isValidatingReferral, setIsValidatingReferral] = useState(false)
  const [appliedReferral, setAppliedReferral] = useState<string | null>(null)

  const steps = [
    { id: "personal", title: "Personal", subtitle: "Basic info", icon: User, color: "bg-blue-500" },
    { id: "account", title: "Account", subtitle: "Login details", icon: Mail, color: "bg-purple-500" },
    { id: "address", title: "Address", subtitle: "Location", icon: MapPin, color: "bg-green-500" },
    { id: "payment", title: "Payment", subtitle: "Method", icon: CreditCard, color: "bg-orange-500" },
    { id: "confirmation", title: "Done", subtitle: "Complete", icon: CheckCircle, color: "bg-emerald-500" },
  ]

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep)

  // Auto-fill user data if logged in
  useEffect(() => {
    if (session?.user) {
      const nameParts = session.user.name?.split(" ") || ["", ""]
      setUserFormData((prev) => ({
        ...prev,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: session.user.email || "",
        phone: session.user.phone || "",
        country: session.user.country || "",
        city: session.user.city || "",
        address: session.user.address || "",
      }))

      // Skip to payment step for logged-in users
      setCurrentStep("payment")
    }
  }, [session])

  useEffect(() => {
    // Check for referral code in URL
    const refCode = searchParams.get("ref")
    if (refCode) {
      setReferralCode(refCode)
      validateReferralCode(refCode)
    }
  }, [searchParams])

  useEffect(() => {
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

    fetchData()
  }, [params.id, toast])

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

  const updateFormData = (field: keyof UserFormData, value: string | boolean) => {
    setUserFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePaymentProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: "File too large",
          description: "Please select a file smaller than 5MB.",
          variant: "destructive",
        })
        return
      }

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        })
        return
      }

      setPaymentProofFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPaymentProofPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateCurrentStep = () => {
    if (session?.user) {
      // For logged-in users, only validate payment step
      if (currentStep === "payment") {
        return selectedPaymentMethod && userFormData.agreeToTerms && paymentProofFile
      }
      return true
    }

    // For guest users, validate all steps
    switch (currentStep) {
      case "personal":
        return userFormData.firstName && userFormData.lastName && userFormData.phone
      case "account":
        return (
          userFormData.email &&
          userFormData.password &&
          userFormData.confirmPassword &&
          userFormData.password === userFormData.confirmPassword &&
          userFormData.password.length >= 8
        )
      case "address":
        return userFormData.country && userFormData.city && userFormData.address
      case "payment":
        return selectedPaymentMethod && userFormData.agreeToTerms && paymentProofFile
      default:
        return true
    }
  }

  const handleNextStep = () => {
    if (!validateCurrentStep()) {
      toast({
        title: "Please fill all required fields",
        description: "Complete the current step before proceeding.",
        variant: "destructive",
      })
      return
    }

    const stepOrder: CheckoutStep[] = session?.user
      ? ["payment", "confirmation"]
      : ["personal", "account", "address", "payment", "confirmation"]

    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1])
    }
  }

  const handlePreviousStep = () => {
    const stepOrder: CheckoutStep[] = session?.user
      ? ["payment", "confirmation"]
      : ["personal", "account", "address", "payment", "confirmation"]

    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1])
    }
  }

  const handleCreateOrder = async () => {
    if (!packageData || !selectedPaymentMethod || !paymentProofFile) {
      toast({
        title: "Missing Information",
        description: "Please ensure all required information is provided including payment proof.",
        variant: "destructive",
      })
      return
    }

    if (!userFormData.agreeToTerms) {
      toast({
        title: "Terms and Conditions",
        description: "Please agree to the terms and conditions to proceed.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // For guest users, register first
      if (!session?.user) {
        console.log("🔄 Registering new user...")
        const registerResponse = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: `${userFormData.firstName} ${userFormData.lastName}`,
            email: userFormData.email,
            password: userFormData.password,
            phone: userFormData.phone,
            country: userFormData.country,
            city: userFormData.city,
            address: userFormData.address,
            referralCode: appliedReferral,
            skipEmailVerification: true,
          }),
        })

        const registerResult = await registerResponse.json()

        if (!registerResponse.ok) {
          throw new Error(registerResult.error || "Failed to create account")
        }
        console.log("✅ User registered successfully")
      }

      // Create transaction with payment proof
      console.log("🔄 Creating transaction...")
      const formData = new FormData()
      formData.append("packageId", packageData._id)
      formData.append("amount", packageData.price.toString())
      formData.append("paymentMethodId", selectedPaymentMethod)
      formData.append("paymentProof", paymentProofFile)

      // Always include email for user lookup (as a fallback)
      if (session?.user) {
        formData.append("userEmail", session.user.email)
        console.log("📧 Using authenticated user email as fallback:", session.user.email)
      } else if (userFormData.email) {
        formData.append("userEmail", userFormData.email)
        console.log("📧 Using form email for user lookup:", userFormData.email)
      }

      if (appliedReferral) {
        formData.append("referralCode", appliedReferral)
      }

      console.log("📤 Sending transaction request...")
      const transactionResponse = await fetch("/api/transactions", {
        method: "POST",
        body: formData,
      })

      console.log("📥 Transaction response status:", transactionResponse.status)
      const transactionData = await transactionResponse.json()
      console.log("📥 Transaction response data:", transactionData)

      if (!transactionResponse.ok) {
        throw new Error(transactionData.error || "Failed to create transaction")
      }

      setTransactionId(transactionData.transaction._id)
      setCurrentStep("confirmation")

      toast({
        title: session?.user ? "Order Placed Successfully!" : "Account Created & Order Placed!",
        description: "Your payment proof has been uploaded. We'll verify it within 24 hours.",
      })
    } catch (error: any) {
      console.error("❌ Error creating order:", error)
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container max-w-7xl mx-auto py-4 px-4 sm:py-8">
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-8 w-8 sm:h-10 sm:w-10" />
            <Skeleton className="h-6 w-48 sm:h-8 sm:w-64" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-64 sm:h-96 w-full" />
            </div>
            <div>
              <Skeleton className="h-48 sm:h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!packageData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container max-w-4xl mx-auto py-8 px-4 sm:py-12">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container max-w-7xl mx-auto py-4 px-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 sm:gap-4 sm:mb-8">
          <Button variant="outline" size="icon" asChild className="rounded-full h-8 w-8 sm:h-10 sm:w-10">
            <Link href={`/packages/${params.id}`}>
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">
              {session?.user ? "Complete Purchase" : "Secure Checkout"}
            </h1>
            <p className="text-sm text-gray-600 sm:text-base">
              {session?.user
                ? `Welcome back, ${session.user.name?.split(" ")[0]}! Complete your purchase below.`
                : "Complete your purchase and create your account"}
            </p>
          </div>
        </div>

        {/* Progress Steps - Only show for guest users */}
        {!session?.user && (
          <div className="mb-6 sm:mb-8">
            {/* Mobile: Horizontal scroll */}
            <div className="block sm:hidden">
              <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                {steps.map((step, index) => {
                  const StepIcon = step.icon
                  const isActive = index <= currentStepIndex
                  const isCurrent = index === currentStepIndex
                  const isCompleted = index < currentStepIndex

                  return (
                    <div key={step.id} className="flex flex-col items-center min-w-[80px]">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all mb-2 ${
                          isCompleted
                            ? "bg-green-500 border-green-500 text-white"
                            : isActive
                              ? `${step.color} border-transparent text-white`
                              : "bg-white border-gray-300 text-gray-400"
                        }`}
                      >
                        {isCompleted ? <Check className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                      </div>
                      <div className="text-center">
                        <p className={`text-xs font-medium ${isCurrent ? "text-gray-900" : "text-gray-500"}`}>
                          {step.title}
                        </p>
                        <p className="text-xs text-gray-400">{step.subtitle}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Desktop: Full width */}
            <div className="hidden sm:flex items-center justify-between">
              {steps.map((step, index) => {
                const StepIcon = step.icon
                const isActive = index <= currentStepIndex
                const isCurrent = index === currentStepIndex
                const isCompleted = index < currentStepIndex

                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                          isCompleted
                            ? "bg-green-500 border-green-500 text-white"
                            : isActive
                              ? `${step.color} border-transparent text-white`
                              : "bg-white border-gray-300 text-gray-400"
                        }`}
                      >
                        {isCompleted ? <Check className="h-6 w-6" /> : <StepIcon className="h-6 w-6" />}
                      </div>
                      <div className="mt-2 text-center">
                        <p className={`text-sm font-medium ${isCurrent ? "text-gray-900" : "text-gray-500"}`}>
                          {step.title}
                        </p>
                        <p className="text-xs text-gray-400">{step.subtitle}</p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-4 mt-6 ${
                          index < currentStepIndex
                            ? "bg-green-500"
                            : index === currentStepIndex
                              ? step.color.replace("bg-", "bg-")
                              : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className={`${steps[currentStepIndex]?.color || "bg-blue-600"} text-white rounded-t-lg`}>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
                  {session?.user ? (
                    "Complete Your Purchase"
                  ) : (
                    <>
                      {currentStep === "personal" && "Personal Information"}
                      {currentStep === "account" && "Account Setup"}
                      {currentStep === "address" && "Address Information"}
                      {currentStep === "payment" && "Payment Method"}
                      {currentStep === "confirmation" && "Order Confirmation"}
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 lg:p-8">
                {/* Show user info for logged-in users */}
                {session?.user && currentStep === "payment" && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Account Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium">Name:</span> {session.user.name}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {session.user.email}
                      </div>
                      {session.user.phone && (
                        <div>
                          <span className="font-medium">Phone:</span> {session.user.phone}
                        </div>
                      )}
                      {session.user.country && (
                        <div>
                          <span className="font-medium">Country:</span> {session.user.country}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Personal Information Step - Only for guest users */}
                {!session?.user && currentStep === "personal" && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="text-center mb-4 sm:mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Let's get to know you!</h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        We'll need some basic information to get started.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700">
                          First Name *
                        </Label>
                        <Input
                          id="firstName"
                          placeholder="Enter your first name"
                          value={userFormData.firstName}
                          onChange={(e) => updateFormData("firstName", e.target.value)}
                          className="mt-1 h-11 sm:h-12"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">
                          Last Name *
                        </Label>
                        <Input
                          id="lastName"
                          placeholder="Enter your last name"
                          value={userFormData.lastName}
                          onChange={(e) => updateFormData("lastName", e.target.value)}
                          className="mt-1 h-11 sm:h-12"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                        Phone Number *
                      </Label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          value={userFormData.phone}
                          onChange={(e) => updateFormData("phone", e.target.value)}
                          className="pl-10 h-11 sm:h-12"
                          required
                        />
                      </div>
                    </div>

                    {/* Referral Code */}
                    <div>
                      <Label htmlFor="referralCode" className="text-sm font-semibold text-gray-700">
                        Referral Code (Optional)
                      </Label>
                      <div className="mt-1 relative">
                        <Input
                          id="referralCode"
                          type="text"
                          value={referralCode}
                          onChange={(e) => handleReferralCodeChange(e.target.value)}
                          placeholder="Enter referral code"
                          className="pr-10 h-11 sm:h-12"
                          disabled={isValidatingReferral}
                        />
                        {isValidatingReferral && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          </div>
                        )}
                        {referralData?.isValid && (
                          <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
                        )}
                        {referralData?.isValid === false && (
                          <X className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-600" />
                        )}
                      </div>

                      {referralData?.isValid && referralData.referrer && (
                        <Alert className="border-green-200 bg-green-50 mt-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-800 text-sm">
                            Valid referral code! You're being referred by <strong>{referralData.referrer.name}</strong>
                          </AlertDescription>
                        </Alert>
                      )}

                      {referralData?.isValid === false && (
                        <Alert variant="destructive" className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            Invalid referral code. Please check and try again.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                )}

                {/* Account Setup Step - Only for guest users */}
                {!session?.user && currentStep === "account" && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="text-center mb-4 sm:mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Your Account</h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        Set up your login credentials to access your courses.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                        Email Address *
                      </Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email address"
                          value={userFormData.email}
                          onChange={(e) => updateFormData("email", e.target.value)}
                          className="pl-10 h-11 sm:h-12"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                        Password *
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          value={userFormData.password}
                          onChange={(e) => updateFormData("password", e.target.value)}
                          className="pr-12 h-11 sm:h-12"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-11 sm:h-12 px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                        Confirm Password *
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={userFormData.confirmPassword}
                          onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                          className="pr-12 h-11 sm:h-12"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-11 sm:h-12 px-3 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {userFormData.password &&
                        userFormData.confirmPassword &&
                        userFormData.password !== userFormData.confirmPassword && (
                          <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                        )}
                    </div>
                  </div>
                )}

                {/* Address Step - Only for guest users */}
                {!session?.user && currentStep === "address" && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="text-center mb-4 sm:mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Where are you located?</h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        Help us serve you better with your location details.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <Label htmlFor="country" className="text-sm font-semibold text-gray-700">
                          Country *
                        </Label>
                        <Select
                          value={userFormData.country}
                          onValueChange={(value) => updateFormData("country", value)}
                        >
                          <SelectTrigger className="mt-1 h-11 sm:h-12">
                            <SelectValue placeholder="Select your country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nepal">Nepal</SelectItem>
                            <SelectItem value="india">India</SelectItem>
                            <SelectItem value="usa">United States</SelectItem>
                            <SelectItem value="uk">United Kingdom</SelectItem>
                            <SelectItem value="canada">Canada</SelectItem>
                            <SelectItem value="australia">Australia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="city" className="text-sm font-semibold text-gray-700">
                          City *
                        </Label>
                        <Input
                          id="city"
                          placeholder="Enter your city"
                          value={userFormData.city}
                          onChange={(e) => updateFormData("city", e.target.value)}
                          className="mt-1 h-11 sm:h-12"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address" className="text-sm font-semibold text-gray-700">
                        Address *
                      </Label>
                      <div className="relative mt-1">
                        <Home className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Textarea
                          id="address"
                          placeholder="Enter your full address"
                          value={userFormData.address}
                          onChange={(e) => updateFormData("address", e.target.value)}
                          className="pl-10 min-h-[80px] sm:min-h-[100px]"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Step */}
                {currentStep === "payment" && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="text-center mb-4 sm:mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Your Payment</h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        Select payment method and upload payment proof to complete your purchase.
                      </p>
                    </div>

                    {/* Payment Method Selection */}
                    {paymentMethods.length > 0 ? (
                      <div className="space-y-3 sm:space-y-4">
                        <h4 className="font-semibold text-gray-900">Choose Payment Method</h4>
                        {paymentMethods.map((method) => (
                          <div
                            key={method._id}
                            className={`relative rounded-xl border-2 p-4 sm:p-6 cursor-pointer transition-all hover:shadow-md ${
                              selectedPaymentMethod === method._id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => setSelectedPaymentMethod(method._id)}
                          >
                            <div className="flex items-center gap-3 sm:gap-4">
                              <div
                                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center ${
                                  selectedPaymentMethod === method._id ? "border-blue-500" : "border-gray-400"
                                }`}
                              >
                                {selectedPaymentMethod === method._id && (
                                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-500" />
                                )}
                              </div>
                              <div className="flex items-center gap-2 sm:gap-3">
                                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                                <span className="font-semibold text-gray-900 text-base sm:text-lg">{method.name}</span>
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

                    {/* Payment Instructions and QR Code */}
                    {selectedMethod && (
                      <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                        <h4 className="text-lg font-semibold mb-4 text-gray-900">Payment Instructions</h4>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mb-6">
                          <div className="order-2 lg:order-1">
                            <div className="prose max-w-none">
                              <p className="text-sm text-gray-600 mb-4">{selectedMethod.instructions}</p>
                            </div>

                            <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                              <h5 className="font-medium mb-2 text-gray-900 text-sm sm:text-base">Payment Amount:</h5>
                              <p className="text-2xl font-bold text-blue-600">₹{packageData.price.toFixed(2)}</p>
                            </div>
                          </div>

                          <div className="order-1 lg:order-2 flex justify-center">
                            <div className="relative w-64 h-64 sm:w-72 sm:h-72 bg-white rounded-lg p-2 shadow-sm border border-gray-200">
                              <Image
                                src={selectedMethod.qrCodeUrl || "/placeholder.svg"}
                                alt={`${selectedMethod.name} QR Code`}
                                fill
                                className="object-contain p-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Payment Proof Upload */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Upload Payment Proof *</h4>

                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePaymentProofChange}
                          className="hidden"
                          id="payment-proof"
                        />
                        <label htmlFor="payment-proof" className="cursor-pointer">
                          {paymentProofPreview ? (
                            <div className="space-y-4">
                              <div className="relative w-32 h-32 mx-auto">
                                <Image
                                  src={paymentProofPreview || "/placeholder.svg"}
                                  alt="Payment proof preview"
                                  fill
                                  className="object-cover rounded-lg"
                                />
                              </div>
                              <p className="text-sm text-gray-600">{paymentProofFile?.name}</p>
                              <Button type="button" variant="outline" size="sm">
                                <Upload className="mr-2 h-4 w-4" />
                                Change Image
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <FileImage className="h-12 w-12 text-gray-400 mx-auto" />
                              <div>
                                <p className="text-lg font-medium text-gray-900">Upload Payment Screenshot</p>
                                <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                              </div>
                              <Button type="button" variant="outline">
                                <Upload className="mr-2 h-4 w-4" />
                                Choose File
                              </Button>
                            </div>
                          )}
                        </label>
                      </div>

                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          Please upload a clear screenshot of your payment confirmation. This helps us verify your
                          payment quickly.
                        </AlertDescription>
                      </Alert>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={userFormData.agreeToTerms}
                        onCheckedChange={(checked) => updateFormData("agreeToTerms", checked as boolean)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor="terms"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I agree to the{" "}
                          <Link href="/terms" className="text-blue-600 hover:underline">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link href="/privacy" className="text-blue-600 hover:underline">
                            Privacy Policy
                          </Link>
                        </Label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Confirmation Step */}
                {currentStep === "confirmation" && (
                  <div className="space-y-4 sm:space-y-6">
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800 text-sm sm:text-base">
                        {session?.user
                          ? "Order placed successfully! Your payment proof has been uploaded."
                          : "Account created and order placed successfully! Your payment proof has been uploaded."}
                      </AlertDescription>
                    </Alert>

                    <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">What's Next?</h3>

                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-blue-600">1</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Payment Verification</h4>
                            <p className="text-sm text-gray-600">Our team will verify your payment within 24 hours.</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-blue-600">2</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Course Access</h4>
                            <p className="text-sm text-gray-600">
                              Once verified, you'll get instant access to all courses in your package.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-blue-600">3</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Start Learning</h4>
                            <p className="text-sm text-gray-600">Begin your learning journey and start earning!</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-sm sm:text-base">
                        You'll receive an email confirmation once your payment is verified. Check your dashboard for
                        course access.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row gap-3">
                {currentStep !== "personal" && currentStep !== "confirmation" && !session?.user && (
                  <Button variant="outline" onClick={handlePreviousStep} className="w-full sm:flex-1 h-11 sm:h-12">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                )}
                {currentStep !== "confirmation" && (
                  <Button
                    onClick={currentStep === "payment" ? handleCreateOrder : handleNextStep}
                    disabled={!validateCurrentStep() || isSubmitting}
                    className="w-full sm:flex-1 h-11 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isSubmitting ? (
                      "Processing..."
                    ) : currentStep === "payment" ? (
                      session?.user ? (
                        "Complete Purchase"
                      ) : (
                        "Create Account & Complete Purchase"
                      )
                    ) : (
                      <>
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
                {currentStep === "confirmation" && (
                  <Button
                    asChild
                    className="w-full h-11 sm:h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card className="sticky top-4 sm:top-8 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="text-lg sm:text-xl">📋 Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                    <Image
                      src={packageData.thumbnail || "/placeholder.svg?height=64&width=64"}
                      alt={packageData.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{packageData.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {packageData.courses?.length || 0} courses included
                    </p>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm sm:text-base">Package Price:</span>
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">
                      ₹{packageData.price.toFixed(2)}
                    </span>
                  </div>
                  {appliedReferral && (
                    <div className="flex justify-between text-green-600">
                      <span className="text-sm sm:text-base">Referral Applied:</span>
                      <span className="font-medium text-sm sm:text-base">{appliedReferral}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-blue-600">₹{packageData.price.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 sm:p-3 rounded-lg">
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium">Secure Checkout</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 sm:p-3 rounded-lg">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium">Lifetime Access</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 sm:p-3 rounded-lg">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium">Expert Support</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
