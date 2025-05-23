"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Info,
  Upload,
  FileText,
  Clock,
  Copy,
  ExternalLink,
  Home,
} from "lucide-react"

interface Transaction {
  _id: string
  package: {
    _id: string
    title: string
    price: number
  }
  amount: number
  paymentMethod: string
  paymentProof: string | null
  status: "pending" | "completed" | "rejected"
  rejectionReason?: string
  createdAt: string
}

export default function PaymentConfirmationPage({ params }: { params: { transactionId: string } }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=/payment/confirmation/${params.transactionId}`)
      return
    }

    const fetchTransaction = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/transactions/${params.transactionId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch transaction data")
        }

        const data = await response.json()
        setTransaction(data.transaction)

        // If payment proof exists, set the preview URL
        if (data.transaction.paymentProof) {
          setPreviewUrl(data.transaction.paymentProof)
        }
      } catch (error) {
        console.error("Error fetching transaction:", error)
        toast({
          title: "Error",
          description: "Failed to load transaction data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchTransaction()
    }
  }, [params.transactionId, router, status, toast])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create a preview URL
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    // Clean up the preview URL when component unmounts
    return () => URL.revokeObjectURL(objectUrl)
  }

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      toast({
        title: "No file selected",
        description: "Please select a payment proof image to upload.",
        variant: "destructive",
      })
      return
    }

    const file = fileInputRef.current.files[0]

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg"]
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG or PNG image.",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(10)

      const formData = new FormData()
      formData.append("paymentProof", file)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      const response = await fetch(`/api/transactions/${params.transactionId}/proof`, {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload payment proof")
      }

      // Update the transaction with the new payment proof
      setTransaction((prev) => {
        if (!prev) return null
        return {
          ...prev,
          paymentProof: data.paymentProofUrl,
        }
      })

      toast({
        title: "Payment proof uploaded!",
        description: "Your payment proof has been submitted for verification.",
      })
    } catch (error: any) {
      console.error("Error uploading payment proof:", error)
      toast({
        title: "Upload Error",
        description: error.message || "Failed to upload payment proof. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "The text has been copied to your clipboard.",
    })
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
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load transaction data. Please try again or{" "}
            <Link href="/dashboard" className="underline">
              return to dashboard
            </Link>
            .
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Payment Confirmation</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              transaction.status === "completed"
                ? "success"
                : transaction.status === "rejected"
                  ? "destructive"
                  : "outline"
            }
            className="px-3 py-1"
          >
            {transaction.status === "completed" ? (
              <CheckCircle className="h-3 w-3 mr-1" />
            ) : transaction.status === "rejected" ? (
              <AlertCircle className="h-3 w-3 mr-1" />
            ) : (
              <Clock className="h-3 w-3 mr-1" />
            )}
            {transaction.status === "completed"
              ? "Payment Verified"
              : transaction.status === "rejected"
                ? "Payment Rejected"
                : "Pending Verification"}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Complete Your Payment</CardTitle>
          <CardDescription>
            Follow the instructions below to complete your payment and access your courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="instructions">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="instructions">
                <FileText className="h-4 w-4 mr-2" />
                Instructions
              </TabsTrigger>
              <TabsTrigger value="upload">
                <Upload className="h-4 w-4 mr-2" />
                Upload Proof
              </TabsTrigger>
              <TabsTrigger value="status">
                <Info className="h-4 w-4 mr-2" />
                Status
              </TabsTrigger>
            </TabsList>

            <TabsContent value="instructions" className="pt-4">
              <div className="space-y-6">
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-2">Transaction Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Transaction ID:</div>
                    <div className="flex items-center">
                      {transaction._id.substring(0, 12)}...
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-1"
                        onClick={() => copyToClipboard(transaction._id)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-muted-foreground">Package:</div>
                    <div>{transaction.package.title}</div>
                    <div className="text-muted-foreground">Amount:</div>
                    <div className="font-medium">₹{transaction.amount.toFixed(2)}</div>
                    <div className="text-muted-foreground">Payment Method:</div>
                    <div className="capitalize">{transaction.paymentMethod.replace("_", " ")}</div>
                    <div className="text-muted-foreground">Date:</div>
                    <div>{new Date(transaction.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Payment Instructions</h3>

                  {transaction.paymentMethod === "bank_transfer" && (
                    <div className="space-y-4">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Bank Transfer Instructions</AlertTitle>
                        <AlertDescription>
                          Please transfer the exact amount to the following bank account:
                        </AlertDescription>
                      </Alert>

                      <div className="rounded-lg border p-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bank Name:</span>
                          <span className="font-medium">Nepal Bank Ltd</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Account Name:</span>
                          <span className="font-medium">Knowledge Hub Nepal</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Account Number:</span>
                          <div className="flex items-center">
                            <span className="font-medium">0123456789012</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 ml-1"
                              onClick={() => copyToClipboard("0123456789012")}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Branch:</span>
                          <span className="font-medium">Kathmandu</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount:</span>
                          <div className="flex items-center">
                            <span className="font-medium">₹{transaction.amount.toFixed(2)}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 ml-1"
                              onClick={() => copyToClipboard(transaction.amount.toString())}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Reference:</span>
                          <div className="flex items-center">
                            <span className="font-medium">KHN-{transaction._id.substring(0, 8)}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 ml-1"
                              onClick={() => copyToClipboard(`KHN-${transaction._id.substring(0, 8)}`)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Steps to complete your payment:</h4>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          <li>Log in to your online banking or visit your bank branch</li>
                          <li>Make a transfer to the account details provided above</li>
                          <li>
                            Use the reference number <strong>KHN-{transaction._id.substring(0, 8)}</strong> in the
                            payment description
                          </li>
                          <li>Take a screenshot or photo of the payment confirmation</li>
                          <li>Upload the payment proof in the "Upload Proof" tab</li>
                        </ol>
                      </div>
                    </div>
                  )}

                  {transaction.paymentMethod === "esewa" && (
                    <div className="space-y-4">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>eSewa Payment Instructions</AlertTitle>
                        <AlertDescription>
                          Please transfer the exact amount to the following eSewa account:
                        </AlertDescription>
                      </Alert>

                      <div className="rounded-lg border p-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">eSewa ID:</span>
                          <div className="flex items-center">
                            <span className="font-medium">9801234567</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 ml-1"
                              onClick={() => copyToClipboard("9801234567")}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Account Name:</span>
                          <span className="font-medium">Knowledge Hub Nepal</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount:</span>
                          <div className="flex items-center">
                            <span className="font-medium">₹{transaction.amount.toFixed(2)}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 ml-1"
                              onClick={() => copyToClipboard(transaction.amount.toString())}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Reference:</span>
                          <div className="flex items-center">
                            <span className="font-medium">KHN-{transaction._id.substring(0, 8)}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 ml-1"
                              onClick={() => copyToClipboard(`KHN-${transaction._id.substring(0, 8)}`)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-center my-4">
                        <Button className="flex items-center" asChild>
                          <a href="https://esewa.com.np" target="_blank" rel="noopener noreferrer">
                            Go to eSewa
                            <ExternalLink className="h-4 w-4 ml-2" />
                          </a>
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Steps to complete your payment:</h4>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          <li>Log in to your eSewa account</li>
                          <li>Select "Transfer to eSewa"</li>
                          <li>Enter the eSewa ID provided above</li>
                          <li>Enter the exact amount: ₹{transaction.amount.toFixed(2)}</li>
                          <li>
                            Add the reference <strong>KHN-{transaction._id.substring(0, 8)}</strong> in the remarks
                          </li>
                          <li>Complete the payment and take a screenshot of the confirmation</li>
                          <li>Upload the payment proof in the "Upload Proof" tab</li>
                        </ol>
                      </div>
                    </div>
                  )}

                  {transaction.paymentMethod === "khalti" && (
                    <div className="space-y-4">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Khalti Payment Instructions</AlertTitle>
                        <AlertDescription>
                          Please transfer the exact amount to the following Khalti account:
                        </AlertDescription>
                      </Alert>

                      <div className="rounded-lg border p-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Khalti ID:</span>
                          <div className="flex items-center">
                            <span className="font-medium">9801234567</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 ml-1"
                              onClick={() => copyToClipboard("9801234567")}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Account Name:</span>
                          <span className="font-medium">Knowledge Hub Nepal</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount:</span>
                          <div className="flex items-center">
                            <span className="font-medium">₹{transaction.amount.toFixed(2)}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 ml-1"
                              onClick={() => copyToClipboard(transaction.amount.toString())}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Reference:</span>
                          <div className="flex items-center">
                            <span className="font-medium">KHN-{transaction._id.substring(0, 8)}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 ml-1"
                              onClick={() => copyToClipboard(`KHN-${transaction._id.substring(0, 8)}`)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-center my-4">
                        <Button className="flex items-center" asChild>
                          <a href="https://khalti.com" target="_blank" rel="noopener noreferrer">
                            Go to Khalti
                            <ExternalLink className="h-4 w-4 ml-2" />
                          </a>
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Steps to complete your payment:</h4>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          <li>Log in to your Khalti account</li>
                          <li>Select "Send Money"</li>
                          <li>Enter the Khalti ID provided above</li>
                          <li>Enter the exact amount: ₹{transaction.amount.toFixed(2)}</li>
                          <li>
                            Add the reference <strong>KHN-{transaction._id.substring(0, 8)}</strong> in the remarks
                          </li>
                          <li>Complete the payment and take a screenshot of the confirmation</li>
                          <li>Upload the payment proof in the "Upload Proof" tab</li>
                        </ol>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="pt-4">
              <div className="space-y-6">
                {transaction.status === "completed" ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Payment Verified</AlertTitle>
                    <AlertDescription>
                      Your payment has been verified. You can now access your courses.
                    </AlertDescription>
                  </Alert>
                ) : transaction.status === "rejected" ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Payment Rejected</AlertTitle>
                    <AlertDescription>
                      {transaction.rejectionReason || "Your payment was rejected. Please upload a new payment proof."}
                    </AlertDescription>
                  </Alert>
                ) : transaction.paymentProof ? (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Payment Proof Submitted</AlertTitle>
                    <AlertDescription>
                      Your payment proof has been submitted and is awaiting verification. This usually takes 24 hours.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Upload Payment Proof</AlertTitle>
                    <AlertDescription>
                      Please upload a screenshot or photo of your payment confirmation to verify your purchase.
                    </AlertDescription>
                  </Alert>
                )}

                {transaction.status !== "completed" && (
                  <div className="space-y-4">
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center ${
                        isUploading ? "bg-muted" : "hover:bg-muted/50"
                      } transition-colors cursor-pointer`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {previewUrl ? (
                        <div className="relative w-full h-64 mx-auto">
                          <Image
                            src={previewUrl || "/placeholder.svg"}
                            alt="Payment proof preview"
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="py-4">
                          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm font-medium mb-1">Click to upload payment proof</p>
                          <p className="text-xs text-muted-foreground">
                            JPG or PNG, max 5MB. Screenshot of your payment confirmation.
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={handleFileChange}
                        disabled={isUploading}
                      />
                    </div>

                    {isUploading && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2" />
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button
                        onClick={handleUpload}
                        disabled={isUploading || !previewUrl || transaction.status === "completed"}
                      >
                        {isUploading ? "Uploading..." : "Submit Payment Proof"}
                      </Button>
                    </div>
                  </div>
                )}

                {transaction.paymentProof && (
                  <div className="space-y-2">
                    <h3 className="font-medium">Current Payment Proof</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="relative w-full h-64">
                        <Image
                          src={transaction.paymentProof || "/placeholder.svg"}
                          alt="Payment proof"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="status" className="pt-4">
              <div className="space-y-6">
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-4">Payment Status</h3>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.status !== "pending" ? "bg-green-100 text-green-600" : "bg-muted text-foreground"
                        }`}
                      >
                        1
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Order Placed</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>

                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.paymentProof ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        2
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Payment Proof Submitted</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.paymentProof
                            ? "Your payment proof has been submitted"
                            : "Waiting for payment proof"}
                        </p>
                      </div>
                      {transaction.paymentProof ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.status === "completed"
                            ? "bg-green-100 text-green-600"
                            : transaction.status === "rejected"
                              ? "bg-red-100 text-red-600"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        3
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Payment Verification</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.status === "completed"
                            ? "Your payment has been verified"
                            : transaction.status === "rejected"
                              ? `Payment rejected: ${transaction.rejectionReason || "Invalid payment proof"}`
                              : "Waiting for admin verification"}
                        </p>
                      </div>
                      {transaction.status === "completed" ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : transaction.status === "rejected" ? (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.status === "completed"
                            ? "bg-green-100 text-green-600"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        4
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Course Access</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.status === "completed"
                            ? "You now have access to your courses"
                            : "Waiting for payment verification"}
                        </p>
                      </div>
                      {transaction.status === "completed" ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>

                {transaction.status === "completed" && (
                  <div className="flex justify-center">
                    <Button asChild>
                      <Link href="/dashboard/my-courses">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Go to My Courses
                      </Link>
                    </Button>
                  </div>
                )}

                {transaction.status === "pending" && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Verification in Progress</AlertTitle>
                    <AlertDescription>
                      Our team is reviewing your payment. This usually takes up to 24 hours. You'll receive an email
                      once your payment is verified.
                    </AlertDescription>
                  </Alert>
                )}

                {transaction.status === "rejected" && (
                  <div className="flex justify-center">
                    <Button
                      onClick={() => {
                        setPreviewUrl(null)
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ""
                        }
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload New Payment Proof
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>
          {transaction.status === "completed" ? (
            <Button asChild>
              <Link href="/dashboard/my-courses">
                <CheckCircle className="h-4 w-4 mr-2" />
                View My Courses
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/dashboard/transactions">
                <FileText className="h-4 w-4 mr-2" />
                View All Transactions
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
