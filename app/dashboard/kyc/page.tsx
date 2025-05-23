"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Upload, Camera, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function KYCPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selfieInputRef = useRef<HTMLInputElement>(null)

  const [activeTab, setActiveTab] = useState<string>("submit")
  const [documentType, setDocumentType] = useState<string>("")
  const [documentNumber, setDocumentNumber] = useState<string>("")
  const [fullName, setFullName] = useState<string>("")
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>()
  const [address, setAddress] = useState<string>("")
  const [phoneNumber, setPhoneNumber] = useState<string>("")
  const [gender, setGender] = useState<string>("")
  const [documentImage, setDocumentImage] = useState<File | null>(null)
  const [documentPreview, setDocumentPreview] = useState<string>("")
  const [selfieImage, setSelfieImage] = useState<File | null>(null)
  const [selfiePreview, setSelfiePreview] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [kycStatus, setKycStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated") {
      fetchKYCStatus()
    }
  }, [status, router])

  const fetchKYCStatus = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/kyc")
      const data = await response.json()

      if (response.ok) {
        setKycStatus(data.kyc || null)

        // If KYC exists, switch to status tab
        if (data.kyc) {
          setActiveTab("status")
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch KYC status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching KYC status:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setDocumentImage(file)
      setDocumentPreview(URL.createObjectURL(file))
    }
  }

  const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelfieImage(file)
      setSelfiePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!documentType || !documentNumber || !fullName || !documentImage) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and upload your document",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Create FormData for file upload
      const formData = new FormData()
      formData.append("documentType", documentType)
      formData.append("documentNumber", documentNumber)
      formData.append("fullName", fullName)

      if (dateOfBirth) {
        formData.append("dateOfBirth", dateOfBirth.toISOString())
      }

      if (address) {
        formData.append("address", address)
      }

      if (phoneNumber) {
        formData.append("phoneNumber", phoneNumber)
      }

      if (gender) {
        formData.append("gender", gender)
      }

      formData.append("documentImage", documentImage)

      if (selfieImage) {
        formData.append("selfieImage", selfieImage)
      }

      const response = await fetch("/api/kyc", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Your KYC information has been submitted successfully",
          variant: "default",
        })

        // Reset form
        setDocumentType("")
        setDocumentNumber("")
        setFullName("")
        setDateOfBirth(undefined)
        setAddress("")
        setPhoneNumber("")
        setGender("")
        setDocumentImage(null)
        setDocumentPreview("")
        setSelfieImage(null)
        setSelfiePreview("")

        // Fetch updated KYC status
        fetchKYCStatus()

        // Switch to status tab
        setActiveTab("status")
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to submit KYC information",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting KYC:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "border-amber-200 bg-amber-50 text-amber-700"
      case "approved":
        return "border-green-200 bg-green-50 text-green-700"
      case "rejected":
        return "border-red-200 bg-red-50 text-red-700"
      default:
        return "border-gray-200 bg-gray-50 text-gray-700"
    }
  }

  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case "national_id":
        return "National ID Card"
      case "citizenship":
        return "Citizenship"
      case "license":
        return "Driver's License"
      default:
        return type
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-6 space-y-6">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">KYC Verification</h1>
        <p className="text-muted-foreground">Complete your identity verification to unlock all platform features</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="submit">Submit KYC</TabsTrigger>
          <TabsTrigger value="status">Verification Status</TabsTrigger>
        </TabsList>

        <TabsContent value="submit" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Identity Verification</CardTitle>
              <CardDescription>
                Please provide your identity document details and upload a clear photo of your document
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="documentType">
                        Document Type <span className="text-red-500">*</span>
                      </Label>
                      <Select value={documentType} onValueChange={setDocumentType} required>
                        <SelectTrigger id="documentType">
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="national_id">National ID Card</SelectItem>
                          <SelectItem value="citizenship">Citizenship</SelectItem>
                          <SelectItem value="license">Driver's License</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="documentNumber">
                        Document Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="documentNumber"
                        placeholder="Enter document number"
                        value={documentNumber}
                        onChange={(e) => setDocumentNumber(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fullName">
                        Full Name (as on document) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="fullName"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dateOfBirth && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateOfBirth ? format(dateOfBirth, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={dateOfBirth}
                            onSelect={setDateOfBirth}
                            initialFocus
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        placeholder="Enter your address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          placeholder="Enter phone number"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={gender} onValueChange={setGender}>
                          <SelectTrigger id="gender">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>
                        Document Image <span className="text-red-500">*</span>
                      </Label>
                      <div
                        className={cn(
                          "border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors",
                          documentPreview ? "h-64" : "h-40",
                        )}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handleDocumentChange}
                        />

                        {documentPreview ? (
                          <div className="relative w-full h-full">
                            <img
                              src={documentPreview || "/placeholder.svg"}
                              alt="Document Preview"
                              className="w-full h-full object-contain"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation()
                                setDocumentImage(null)
                                setDocumentPreview("")
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground text-center">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">PNG, JPG or JPEG (max 5MB)</p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Selfie with Document (Optional)</Label>
                      <div
                        className={cn(
                          "border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors",
                          selfiePreview ? "h-64" : "h-40",
                        )}
                        onClick={() => selfieInputRef.current?.click()}
                      >
                        <input
                          type="file"
                          ref={selfieInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handleSelfieChange}
                        />

                        {selfiePreview ? (
                          <div className="relative w-full h-full">
                            <img
                              src={selfiePreview || "/placeholder.svg"}
                              alt="Selfie Preview"
                              className="w-full h-full object-contain"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelfieImage(null)
                                setSelfiePreview("")
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Camera className="h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground text-center">
                              Upload a selfie holding your document
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              This helps verify you're the document owner
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700">
                  <p className="font-medium mb-1">Important Information:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Make sure your document is valid and not expired</li>
                    <li>All information must match your document exactly</li>
                    <li>The document image must be clear and all text readable</li>
                    <li>Verification typically takes 1-2 business days</li>
                  </ul>
                </div>

                <CardFooter className="px-0 pt-4">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Verification"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
              <CardDescription>Track the status of your identity verification submission</CardDescription>
            </CardHeader>
            <CardContent>
              {kycStatus ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">KYC Status</h3>
                    <Badge variant="outline" className={getStatusBadgeClass(kycStatus.status)}>
                      {kycStatus.status.charAt(0).toUpperCase() + kycStatus.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Document Information</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Document Type:</span>
                            <span className="text-sm">{getDocumentTypeName(kycStatus.documentType)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Document Number:</span>
                            <span className="text-sm">{kycStatus.documentNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Full Name:</span>
                            <span className="text-sm">{kycStatus.fullName}</span>
                          </div>
                          {kycStatus.dateOfBirth && (
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Date of Birth:</span>
                              <span className="text-sm">{new Date(kycStatus.dateOfBirth).toLocaleDateString()}</span>
                            </div>
                          )}
                          {kycStatus.address && (
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Address:</span>
                              <span className="text-sm">{kycStatus.address}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Submitted On:</span>
                            <span className="text-sm">{new Date(kycStatus.submittedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {kycStatus.status === "pending" && (
                        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-sm text-amber-700">
                          <div className="flex items-start">
                            <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                            <div>
                              <p className="font-medium">Verification in Progress</p>
                              <p className="mt-1">
                                Your documents are being reviewed. This process typically takes 1-2 business days.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {kycStatus.status === "approved" && (
                        <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-sm text-green-700">
                          <div className="flex items-start">
                            <CheckCircle className="h-5 w-5 mr-2 mt-0.5" />
                            <div>
                              <p className="font-medium">Verification Approved</p>
                              <p className="mt-1">
                                Your identity has been verified successfully. You now have full access to all platform
                                features.
                              </p>
                              {kycStatus.verifiedAt && (
                                <p className="mt-1">
                                  Approved on: {new Date(kycStatus.verifiedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {kycStatus.status === "rejected" && (
                        <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-sm text-red-700">
                          <div className="flex items-start">
                            <X className="h-5 w-5 mr-2 mt-0.5" />
                            <div>
                              <p className="font-medium">Verification Rejected</p>
                              {kycStatus.rejectionReason && <p className="mt-1">Reason: {kycStatus.rejectionReason}</p>}
                              <p className="mt-1">
                                Please submit a new verification with the correct information and clear documents.
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => setActiveTab("submit")}
                              >
                                Submit New Verification
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Uploaded Documents</h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Document Image:</p>
                          <div className="border rounded-md overflow-hidden">
                            <img
                              src={kycStatus.documentImage || "/placeholder.svg"}
                              alt="Document"
                              className="w-full h-auto object-contain"
                            />
                          </div>
                        </div>

                        {kycStatus.selfieImage && (
                          <div>
                            <p className="text-sm font-medium mb-2">Selfie with Document:</p>
                            <div className="border rounded-md overflow-hidden">
                              <img
                                src={kycStatus.selfieImage || "/placeholder.svg"}
                                alt="Selfie with Document"
                                className="w-full h-auto object-contain"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="bg-muted rounded-full p-3 mb-4">
                    <AlertCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Verification Submitted</h3>
                  <p className="text-muted-foreground max-w-md mb-6">
                    You haven't submitted your identity verification documents yet. Complete the verification process to
                    unlock all platform features.
                  </p>
                  <Button onClick={() => setActiveTab("submit")}>Submit Verification</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
