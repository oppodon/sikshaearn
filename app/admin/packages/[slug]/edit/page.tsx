"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Plus, Trash } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface PackageData {
  _id: string
  name: string
  slug: string
  description: string
  price: number
  accessDuration: number
  supportLevel: string
  maxCourses: number
  workshopCount: number
  hasMentoring: boolean
  mentoringType: string
  hasJobPlacement: boolean
  hasCertificate: boolean
  isPopular: boolean
  features: string[]
  title: string
  longDescription: string
  originalPrice: number
  thumbnail: string
  courseCount: number
  studentCount: number
  benefits: string[]
  courses: string[]
}

export default function EditPackagePage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [features, setFeatures] = useState<string[]>([""])
  const [benefits, setBenefits] = useState<string[]>([""])
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [packageId, setPackageId] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    longDescription: "",
    price: "",
    originalPrice: "",
    accessDuration: "3",
    supportLevel: "basic",
    maxCourses: "5",
    workshopCount: "0",
    hasMentoring: false,
    mentoringType: "",
    hasJobPlacement: false,
    hasCertificate: true,
    isPopular: false,
    thumbnail: "",
    courseCount: "0",
    studentCount: "0",
  })

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/packages/${params.slug}`)

        if (!response.ok) {
          throw new Error("Failed to fetch package")
        }

        const data = await response.json()
        const packageData: PackageData = data.package

        if (!packageData) {
          throw new Error("Package not found")
        }

        setPackageId(packageData._id)

        setFormData({
          title: packageData.title || "",
          description: packageData.description || "",
          longDescription: packageData.longDescription || "",
          price: packageData.price?.toString() || "0",
          originalPrice: packageData.originalPrice?.toString() || "0",
          accessDuration: packageData.accessDuration?.toString() || "3",
          supportLevel: packageData.supportLevel || "basic",
          maxCourses: packageData.maxCourses?.toString() || "5",
          workshopCount: packageData.workshopCount?.toString() || "0",
          hasMentoring: packageData.hasMentoring || false,
          mentoringType: packageData.mentoringType || "",
          hasJobPlacement: packageData.hasJobPlacement || false,
          hasCertificate: packageData.hasCertificate || true,
          isPopular: packageData.isPopular || false,
          thumbnail: packageData.thumbnail || "/placeholder.svg?height=200&width=300",
          courseCount: packageData.courseCount?.toString() || "0",
          studentCount: packageData.studentCount?.toString() || "0",
        })

        setFeatures(packageData.features?.length ? packageData.features : [""])
        setBenefits(packageData.benefits?.length ? packageData.benefits : [""])
      } catch (error) {
        console.error("Error fetching package:", error)
        toast({
          title: "Error",
          description: "Failed to load package data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPackage()
  }, [params.slug, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features]
    newFeatures[index] = value
    setFeatures(newFeatures)
  }

  const addFeature = () => {
    setFeatures([...features, ""])
  }

  const removeFeature = (index: number) => {
    const newFeatures = features.filter((_, i) => i !== index)
    setFeatures(newFeatures.length ? newFeatures : [""])
  }

  const handleBenefitChange = (index: number, value: string) => {
    const newBenefits = [...benefits]
    newBenefits[index] = value
    setBenefits(newBenefits)
  }

  const addBenefit = () => {
    setBenefits([...benefits, ""])
  }

  const removeBenefit = (index: number) => {
    const newBenefits = benefits.filter((_, i) => i !== index)
    setBenefits(newBenefits.length ? newBenefits : [""])
  }

  const handleDeletePackage = async () => {
    try {
      setIsSubmitting(true)

      const response = await fetch(`/api/packages/${params.slug}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete package")
      }

      toast({
        title: "Success",
        description: "Package deleted successfully",
      })

      router.push("/admin/packages")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setShowDeleteAlert(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)

      // Filter out empty features and benefits
      const filteredFeatures = features.filter((f) => f.trim() !== "")
      const filteredBenefits = benefits.filter((b) => b.trim() !== "")

      const packageData = {
        ...formData,
        price: Number.parseFloat(formData.price),
        originalPrice: Number.parseFloat(formData.originalPrice),
        accessDuration: Number.parseInt(formData.accessDuration),
        maxCourses: Number.parseInt(formData.maxCourses),
        workshopCount: Number.parseInt(formData.workshopCount),
        courseCount: Number.parseInt(formData.courseCount),
        studentCount: Number.parseInt(formData.studentCount),
        features: filteredFeatures,
        benefits: filteredBenefits,
      }

      const response = await fetch(`/api/packages/${params.slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(packageData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update package")
      }

      toast({
        title: "Success",
        description: "Package updated successfully",
      })

      router.push("/admin/packages")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Edit Package</h1>
        </div>
        <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete Package</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the package and may affect users who have
                purchased it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeletePackage} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Package Information</CardTitle>
              <CardDescription>Basic information about the package</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Package Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Silver Package"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayTitle">Display Title (Optional)</Label>
                <Input
                  id="displayTitle"
                  name="displayTitle"
                  value={formData.displayTitle || ""}
                  onChange={handleChange}
                  placeholder="e.g. Silver Package - Best Value"
                />
                <p className="text-xs text-muted-foreground">
                  If provided, this will be displayed instead of the package title
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Briefly describe what this package offers"
                  rows={2}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longDescription">Detailed Description</Label>
                <Textarea
                  id="longDescription"
                  name="longDescription"
                  value={formData.longDescription}
                  onChange={handleChange}
                  placeholder="Provide a comprehensive description of the package"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="e.g. 999"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Original Price (₹)</Label>
                  <Input
                    id="originalPrice"
                    name="originalPrice"
                    type="number"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    placeholder="e.g. 1499"
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-muted-foreground">For showing discounted price</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isPopular"
                  checked={formData.isPopular}
                  onCheckedChange={(checked) => handleSwitchChange("isPopular", checked)}
                />
                <Label htmlFor="isPopular">Mark as Popular</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Package Features</CardTitle>
              <CardDescription>Define what's included in this package</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accessDuration">Access Duration</Label>
                <Select
                  value={formData.accessDuration}
                  onValueChange={(value) => handleSelectChange("accessDuration", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Month</SelectItem>
                    <SelectItem value="3">3 Months</SelectItem>
                    <SelectItem value="6">6 Months</SelectItem>
                    <SelectItem value="12">12 Months</SelectItem>
                    <SelectItem value="0">Lifetime</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportLevel">Support Level</Label>
                <Select
                  value={formData.supportLevel}
                  onValueChange={(value) => handleSelectChange("supportLevel", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select support level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic Support</SelectItem>
                    <SelectItem value="priority">Priority Support</SelectItem>
                    <SelectItem value="24/7">24/7 Support</SelectItem>
                    <SelectItem value="vip">VIP Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxCourses">Number of Courses</Label>
                <Select value={formData.maxCourses} onValueChange={(value) => handleSelectChange("maxCourses", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select number of courses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Core Courses</SelectItem>
                    <SelectItem value="10">10 Courses</SelectItem>
                    <SelectItem value="15">15 Courses</SelectItem>
                    <SelectItem value="20">20 Courses</SelectItem>
                    <SelectItem value="0">All Courses</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workshopCount">Workshops</Label>
                <Select
                  value={formData.workshopCount}
                  onValueChange={(value) => handleSelectChange("workshopCount", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select number of workshops" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No Workshops</SelectItem>
                    <SelectItem value="1">1 Live Workshop</SelectItem>
                    <SelectItem value="3">3 Live Workshops</SelectItem>
                    <SelectItem value="-1">Unlimited Workshops</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="hasMentoring"
                  checked={formData.hasMentoring}
                  onCheckedChange={(checked) => handleSwitchChange("hasMentoring", checked)}
                />
                <Label htmlFor="hasMentoring">Include Mentoring</Label>
              </div>

              {formData.hasMentoring && (
                <div className="space-y-2">
                  <Label htmlFor="mentoringType">Mentoring Type</Label>
                  <Select
                    value={formData.mentoringType}
                    onValueChange={(value) => handleSelectChange("mentoringType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mentoring type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-on-1">1-on-1 Mentoring</SelectItem>
                      <SelectItem value="weekly">Weekly Mentoring</SelectItem>
                      <SelectItem value="monthly">Monthly Mentoring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="hasJobPlacement"
                  checked={formData.hasJobPlacement}
                  onCheckedChange={(checked) => handleSwitchChange("hasJobPlacement", checked)}
                />
                <Label htmlFor="hasJobPlacement">Job Placement Assistance</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="hasCertificate"
                  checked={formData.hasCertificate}
                  onCheckedChange={(checked) => handleSwitchChange("hasCertificate", checked)}
                />
                <Label htmlFor="hasCertificate">Certificate of Completion</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features List</CardTitle>
              <CardDescription>Add bullet points that will be displayed on the package page</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      placeholder="e.g. Access to premium content"
                    />
                    <Button type="button" variant="outline" size="icon" onClick={() => removeFeature(index)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addFeature} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Feature
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Benefits</CardTitle>
              <CardDescription>Add key benefits of this package</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={benefit}
                      onChange={(e) => handleBenefitChange(index, e.target.value)}
                      placeholder="e.g. Boost your career prospects"
                    />
                    <Button type="button" variant="outline" size="icon" onClick={() => removeBenefit(index)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addBenefit} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Benefit
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Package Media</CardTitle>
              <CardDescription>Upload package thumbnail</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Package Thumbnail</Label>
                <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                  <div className="mb-4 w-full max-w-xs aspect-video relative bg-muted rounded-md overflow-hidden">
                    <img
                      src={formData.thumbnail || "/placeholder.svg?height=200&width=300"}
                      alt="Package thumbnail"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium mb-1">Drag and drop or click to upload</p>
                    <p className="text-xs text-muted-foreground mb-4">Recommended size: 1280x720px (16:9 ratio)</p>
                    <Button type="button" variant="outline" size="sm">
                      Choose File
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Package"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
