"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, AlertCircle, Info, Users } from "lucide-react"

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

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [packageData, setPackageData] = useState<Package | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/packages/${params.id}/checkout`)}`)
      return
    }

    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch package data
        const packageResponse = await fetch(`/api/packages/${params.id}`)
        if (!packageResponse.ok) {
          throw new Error("Failed to fetch package data")
        }
        const packageResult = await packageResponse.json()

        // Fetch payment methods
        const paymentResponse = await fetch("/api/payment-methods")
        if (!paymentResponse.ok) {
          throw new Error("Failed to fetch payment methods")
        }
        const paymentResult = await paymentResponse.json()

        setPackageData(packageResult.package)
        setPaymentMethods(paymentResult.paymentMethods)

        // Select first payment method by default if available
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

  const handleSubmit = async () => {
    if (!packageData || !selectedPaymentMethod) return

    try {
      setIsSubmitting(true)

      const formData = new FormData()
      formData.append("packageId", packageData._id)
      formData.append("amount", packageData.price.toString())
      formData.append("paymentMethodId", selectedPaymentMethod)

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

  const selectedMethod = paymentMethods.find((method) => method._id === selectedPaymentMethod)

  return (
    <div className="container max-w-5xl mx-auto py-12 px-4">
      <div className="flex items-center gap-2 mb-8">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/packages/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Package Summary */}
          <Card className="overflow-hidden border-0 shadow-md">
            <div className="flex flex-col sm:flex-row">
              <div className="relative w-full sm:w-1/3 aspect-video sm:aspect-square">
                <Image
                  src={packageData.thumbnail || "/placeholder.svg?height=200&width=200"}
                  alt={packageData.title}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-6 sm:w-2/3">
                <h2 className="text-xl font-semibold mb-2">{packageData.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{packageData.description}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {packageData.courses?.length || 0} Courses
                  </Badge>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Payment Methods */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Select Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {paymentMethods.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method._id}
                      className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                        selectedPaymentMethod === method._id
                          ? "border-purple-600 bg-purple-50 dark:bg-purple-950/20"
                          : "border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700"
                      }`}
                      onClick={() => setSelectedPaymentMethod(method._id)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedPaymentMethod === method._id ? "border-purple-600" : "border-gray-400"
                          }`}
                        >
                          {selectedPaymentMethod === method._id && (
                            <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                          )}
                        </div>
                        <span className="font-medium">{method.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No payment methods available.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Instructions */}
          {selectedMethod && (
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Payment Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="relative w-full max-w-[200px] aspect-square">
                    <Image
                      src={selectedMethod.qrCodeUrl || "/placeholder.svg"}
                      alt={`${selectedMethod.name} QR Code`}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium mb-2">How to pay:</h3>
                    <div className="prose dark:prose-invert max-w-none">
                      <p>{selectedMethod.instructions}</p>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    After placing your order, you'll be directed to a page where you can upload proof of your payment.
                    Your courses will be accessible after our team verifies your payment.
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !selectedPaymentMethod}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isSubmitting ? "Processing..." : "Place Order"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>

        <div>
          <Card className="sticky top-8 border-0 shadow-md">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Package Price:</span>
                  <span>₹{packageData.price.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>₹{packageData.price.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="w-full p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Secure Checkout</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                By completing this purchase, you agree to our Terms of Service and Privacy Policy.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
