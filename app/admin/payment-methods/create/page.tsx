"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { ArrowLeft, Upload, X, QrCode } from "lucide-react"
import Link from "next/link"

export default function CreatePaymentMethodPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [name, setName] = useState("")
  const [instructions, setInstructions] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null)
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

    if (!name || !instructions || !qrCodeFile) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields and upload a QR code.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Upload QR code to Cloudinary
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

      // Create payment method
      const response = await fetch("/api/payment-methods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          qrCodeUrl: uploadResult.secure_url,
          instructions,
          isActive,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create payment method")
      }

      toast({
        title: "Success",
        description: "Payment method created successfully.",
      })

      router.push("/admin/payment-methods")
    } catch (error: any) {
      console.error("Error creating payment method:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create payment method. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/payment-methods">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Add Payment Method</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Method Details</CardTitle>
                <CardDescription>Add a new payment method for your customers to use during checkout.</CardDescription>
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
                <CardDescription>Upload a QR code image for this payment method.</CardDescription>
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
                ) : (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md p-6 flex flex-col items-center justify-center mb-4 aspect-square">
                    <QrCode className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                      Upload a QR code image for customers to scan
                    </p>
                    <Label
                      htmlFor="qrCode"
                      className="cursor-pointer inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Select QR Code
                    </Label>
                    <Input
                      id="qrCode"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleQrCodeChange}
                      required
                    />
                  </div>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Upload a clear, high-quality QR code image. Supported formats: JPG, PNG, GIF.
                </p>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting || isUploading || !qrCodeFile}>
                  {isSubmitting || isUploading
                    ? isUploading
                      ? "Uploading QR Code..."
                      : "Creating Payment Method..."
                    : "Create Payment Method"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
