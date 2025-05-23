"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Upload, ArrowLeft, Loader2, Info } from "lucide-react"

interface Transaction {
  _id: string
  package: {
    _id: string
    title: string
    slug: string
    price: number
  }
  amount: number
  paymentMethod: string
  paymentProof: string | null
  status: string
  createdAt: string
}

interface PaymentMethod {
  _id: string
  name: string
  qrCodeUrl: string
  instructions: string
}

export default function PaymentConfirmationPage({ params }: { params: { transactionId: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch transaction data
        const transactionResponse = await fetch(`/api/transactions/${params.transactionId}`)
        if (!transactionResponse.ok) {
          throw new Error("Failed to fetch transaction data")
        }
        const transactionData = await transactionResponse.json()

        // Fetch payment method data
        const paymentMethodResponse = await fetch(`/api/payment-methods/${transactionData.transaction.paymentMethodId}`)
        if (paymentMethodResponse.ok) {
          const paymentMethodData = await paymentMethodResponse.json()
          setPaymentMethod(paymentMethodData.paymentMethod)
        }

        setTransaction(transactionData.transaction)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load transaction data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.transactionId, toast])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image less than 5MB",
        variant: "destructive",
      })
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    setPaymentProofFile(file)

    // Create preview URL
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    // Clean up preview URL when component unmounts
    return () => URL.revokeObjectURL(objectUrl)
  }

  const handleUploadProof = async () => {
    if (!paymentProofFile || !transaction) return

    try {
      setIsUploading(true)

      const formData = new FormData()
      formData.append("paymentProof", paymentProofFile)

      const response = await fetch(`/api/transactions/${transaction._id}/proof`, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload payment proof")
      }

      toast({
        title: "Success",
        description: "Payment proof uploaded successfully",
      })

      // Update transaction data
      setTransaction({
        ...transaction,
        paymentProof: data.paymentProofUrl,
        status: "pending_verification",
      })

      // Clear file input
      setPaymentProofFile(null)
    } catch (error: any) {
      console.error("Error uploading payment proof:", error)
      toast({
        title: "Upload Error",
        description: error.message || "Failed to upload payment proof. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-3xl mx-auto py-12 px-4">
        <div className="flex items-center gap-2 mb-8">
          <Button variant="outline" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>

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
    )
  }

  if (!transaction) {
    return (
      <div className="container max-w-3xl mx-auto py-12 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load transaction data. Please try again or{" "}
            <Link href="/dashboard" className="underline">
              go to your dashboard
            </Link>
            .
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl mx-auto py-12 px-4">
      <div className="flex items-center gap-2 mb-8">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Payment Confirmation</h1>
      </div>

      <Card className="border-0 shadow-lg mb-8">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="flex items-center gap-2 mb-2">
            {transaction.status === "completed" ? (
              <Badge className="bg-green-500 border-0">Completed</Badge>
            ) : transaction.status === "pending_verification" ? (
              <Badge className="bg-yellow-500 border-0">Verification Pending</Badge>
            ) : (
              <Badge className="bg-blue-500 border-0">Payment Pending</Badge>
            )}
          </div>
          <CardTitle className="text-2xl">Order Confirmation</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="font-medium">Order Placed</p>
            </div>

            <div className="flex-1 h-0.5 bg-gray-200 relative">
              <div
                className={`absolute top-0 left-0 h-full bg-green-500 transition-all duration-500 ${
                  transaction.paymentProof ? "w-full" : "w-0"
                }`}
              />
            </div>

            <div className="text-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${
                  transaction.paymentProof ? "bg-green-100" : "bg-gray-100"
                }`}
              >
                <Upload className={`h-8 w-8 ${transaction.paymentProof ? "text-green-600" : "text-gray-400"}`} />
              </div>
              <p className={transaction.paymentProof ? "font-medium" : "text-gray-500"}>Proof Uploaded</p>
            </div>

            <div className="flex-1 h-0.5 bg-gray-200 relative">
              <div
                className={`absolute top-0 left-0 h-full bg-green-500 transition-all duration-500 ${
                  transaction.status === "completed" ? "w-full" : "w-0"
                }`}
              />
            </div>

            <div className="text-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${
                  transaction.status === "completed" ? "bg-green-100" : "bg-gray-100"
                }`}
              >
                <CheckCircle
                  className={`h-8 w-8 ${transaction.status === "completed" ? "text-green-600" : "text-gray-400"}`}
                />
              </div>
              <p className={transaction.status === "completed" ? "font-medium" : "text-gray-500"}>Payment Verified</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium text-lg mb-3">Order Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Package:</span>
                <span className="font-medium">{transaction.package.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount:</span>
                <span className="font-medium">₹{transaction.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Method:</span>
                <span className="font-medium">{paymentMethod?.name || transaction.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span className="font-medium">{new Date(transaction.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span
                  className={`font-medium ${
                    transaction.status === "completed"
                      ? "text-green-600"
                      : transaction.status === "pending_verification"
                        ? "text-yellow-600"
                        : "text-blue-600"
                  }`}
                >
                  {transaction.status === "completed"
                    ? "Completed"
                    : transaction.status === "pending_verification"
                      ? "Verification Pending"
                      : "Payment Pending"}
                </span>
              </div>
            </div>
          </div>

          {transaction.status !== "completed" && (
            <>
              <Separator />

              {paymentMethod && (
                <div>
                  <h3 className="font-medium text-lg mb-3">Payment Instructions</h3>
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="relative w-full max-w-[200px] aspect-square">
                      <Image
                        src={paymentMethod.qrCodeUrl || "/placeholder.svg"}
                        alt={`${paymentMethod.name} QR Code`}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="prose dark:prose-invert max-w-none">
                        <p>{paymentMethod.instructions}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {transaction.status !== "completed" && !transaction.paymentProof && (
            <>
              <Separator />

              <div>
                <h3 className="font-medium text-lg mb-3">Upload Payment Proof</h3>
                <div className="border-2 border-dashed rounded-lg p-6">
                  {previewUrl ? (
                    <div className="space-y-4">
                      <div className="relative w-full max-w-md mx-auto aspect-video">
                        <Image
                          src={previewUrl || "/placeholder.svg"}
                          alt="Payment proof preview"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setPaymentProofFile(null)
                            setPreviewUrl(null)
                          }}
                        >
                          Change
                        </Button>
                        <Button
                          onClick={handleUploadProof}
                          disabled={isUploading}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Proof
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-center mb-4">Upload a screenshot of your payment receipt</p>
                      <Button asChild variant="outline">
                        <label className="cursor-pointer">
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                          Select Image
                        </label>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {transaction.paymentProof && (
            <>
              <Separator />

              <div>
                <h3 className="font-medium text-lg mb-3">Payment Proof</h3>
                <div className="relative w-full max-w-md mx-auto aspect-video border rounded-lg overflow-hidden">
                  <Image
                    src={transaction.paymentProof || "/placeholder.svg"}
                    alt="Payment proof"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="bg-gray-50 dark:bg-gray-900 p-6">
          {transaction.status === "completed" ? (
            <Alert className="w-full bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle className="text-green-800 dark:text-green-400">Payment Verified</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-500">
                Your payment has been verified. You can now access your courses.
              </AlertDescription>
            </Alert>
          ) : transaction.status === "pending_verification" ? (
            <Alert className="w-full bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900">
              <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertTitle className="text-yellow-800 dark:text-yellow-400">Verification Pending</AlertTitle>
              <AlertDescription className="text-yellow-700 dark:text-yellow-500">
                Your payment proof has been uploaded and is pending verification. You will be notified once it's
                verified.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="w-full bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-800 dark:text-blue-400">Payment Pending</AlertTitle>
              <AlertDescription className="text-blue-700 dark:text-blue-500">
                Please complete your payment and upload the payment proof to access your courses.
              </AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>

        {transaction.status === "completed" && (
          <Button
            asChild
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Link href="/dashboard/my-courses">Access Your Courses</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
