"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { ArrowLeft, Upload, X, QrCode, AlertCircle } from "lucide-react"
import Link from "next/link"

interface PaymentMethod {
  _id: string
  name: string
  qrCodeUrl: string
  instructions: string
  isActive: boolean
}

export default function EditPaymentMethodPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [name, setName] = useState("")
  const [instructions, setInstructions] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null)
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPaymentMethod = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/payment-methods/${params.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch payment method")
        }

        const data = await response.json()
        const method = data.paymentMethod

        setName(method.name)
        setInstructions(method.instructions)
        setIsActive(method.isActive)
        setQrCodeUrl(method.qrCodeUrl)
      } catch (error: any) {
        console.error("Error fetching payment method:", error)
        setError(error.message || "Failed to load payment method")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPaymentMethod()
  }, [params.id])

  const handleQrCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.includes("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file for the QR code.",
        variant: "destructive",
      })
      return
    }

    setQrCodeFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setQrCodePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeQrCode = () => {
    setQrCodeFile(null)
    setQrCodePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !instructions) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      let finalQrCodeUrl = qrCodeUrl

      // Upload new QR code if provided
      if (qrCodeFile) {
        setIsUploading(true)
        const uploadResult = await uploadToCloudinary(
          await qrCodeFile.arrayBuffer(),
          `payment-methods/${Date.now()}-${qrCodeFile.name.replace(/\s+/g, "-")}`,
          qrCodeFile.type,
        )
        setIsUploading(false)

        if (!uploadResult || !uploadResult.secure_url) {
          throw new Error("Failed to upload QR code")
        }

        finalQrCodeUrl = uploadResult.secure_url
      }

      // Update payment method
      const response = await fetch(`/api/payment-methods/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          qrCodeUrl: finalQrCodeUrl,
          instructions,
          isActive,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update payment method")
      }

      toast({
        title: "Success",
        description: "Payment method updated successfully.",
      })

      router.push("/admin/payment-methods")
    } catch (error: any) {
      console.error("Error updating payment method:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update payment method. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-10 w-64" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-full max-w-md" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full mb-4" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-10">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/payment-methods">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Payment Method</h1>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <CardTitle className="mb-2">Error Loading Payment Method</CardTitle>
            <CardDescription className="text-center mb-6">{error}</CardDescription>
            <Button asChild>
              <Link href="/admin/payment-methods">Go Back to Payment Methods</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/payment-methods">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Payment Method</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Method Details</CardTitle>
                <CardDescription>Update the payment method details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Bank Transfer, eSewa, Khalti"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Payment Instructions</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Provide clear instructions for customers on how to make the payment..."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={5}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>QR Code</CardTitle>
                <CardDescription>Update the QR code image for this payment method.</CardDescription>
              </CardHeader>
              <CardContent>
                {qrCodePreview ? (
                  <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden mb-4">
                    <Image
                      src={qrCodePreview || "/placeholder.svg"}
                      alt="QR Code Preview"
                      fill
                      className="object-contain p-2"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={removeQrCode}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : qrCodeUrl ? (
                  <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden mb-4">
                    <Image
                      src={qrCodeUrl || "/placeholder.svg"}
                      alt="Current QR Code"
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md p-6 flex flex-col items-center justify-center mb-4 aspect-square">
                    <QrCode className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                      No QR code available. Please upload one.
                    </p>
                    <Label
                      htmlFor="qrCode"
                      className="cursor-pointer inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Select QR Code
                    </Label>
                    <Input id="qrCode" type="file" accept="image/*" className="hidden" onChange={handleQrCodeChange} />
                  </div>
                )}

                {!qrCodePreview && qrCodeUrl && (
                  <div className="mt-4">
                    <Label
                      htmlFor="qrCode"
                      className="cursor-pointer inline-flex items-center px-4 py-2 w-full justify-center bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Change QR Code
                    </Label>
                    <Input id="qrCode" type="file" accept="image/*" className="hidden" onChange={handleQrCodeChange} />
                  </div>
                )}

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                  Upload a clear, high-quality QR code image. Supported formats: JPG, PNG, GIF.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || isUploading || (!qrCodeUrl && !qrCodeFile)}
                >
                  {isSubmitting || isUploading
                    ? isUploading
                      ? "Uploading QR Code..."
                      : "Updating Payment Method..."
                    : "Update Payment Method"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
