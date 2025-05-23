"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2, Plus, Trash, Check, AlertTriangle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CustomImageUpload } from "@/components/custom-image-upload"

export default function CreatePackagePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [features, setFeatures] = useState<string[]>([""])
  const [benefits, setBenefits] = useState<string[]>([""])
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    longDescription: "",
    price: "",
    originalPrice: "",
    thumbnail: "",
    accessDuration: "3",
    supportLevel: "basic",
    maxCourses: "5",
    workshopCount: "0",
    hasMentoring: false,
    mentoringType: "",
    hasJobPlacement: false,
    hasCertificate: true,
    isPopular: false,
    isActive: true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
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

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = "Package name is required"
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required"
    }

    if (!formData.price.trim()) {
      errors.price = "Price is required"
    } else if (isNaN(Number.parseFloat(formData.price)) || Number.parseFloat(formData.price) < 0) {
      errors.price = "Price must be a valid positive number"
    }

    if (
      formData.originalPrice &&
      (isNaN(Number.parseFloat(formData.originalPrice)) || Number.parseFloat(formData.originalPrice) < 0)
    ) {
      errors.originalPrice = "Original price must be a valid positive number"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Filter out empty features and benefits
      const filteredFeatures = features.filter((f) => f.trim() !== "")
      const filteredBenefits = benefits.filter((b) => b.trim() !== "")

      const packageData = {
        name: formData.name,
        description: formData.description,
        longDescription: formData.longDescription,
        price: Number.parseFloat(formData.price),
        originalPrice: formData.originalPrice ? Number.parseFloat(formData.originalPrice) : undefined,
        thumbnail: formData.thumbnail || "/placeholder.svg?height=200&width=300",
        accessDuration: Number.parseInt(formData.accessDuration),
        supportLevel: formData.supportLevel,
        maxCourses: Number.parseInt(formData.maxCourses),
        workshopCount: Number.parseInt(formData.workshopCount),
        hasMentoring: formData.hasMentoring,
        mentoringType: formData.mentoringType,
        hasJobPlacement: formData.hasJobPlacement,
        hasCertificate: formData.hasCertificate,
        isPopular: formData.isPopular,
        isActive: formData.isActive,
        features: filteredFeatures,
        benefits: filteredBenefits,
      }

      const response = await fetch("/api/packages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(packageData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create package")
      }

      toast({
        title: "Success",
        description: "Package created successfully",
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

  return (
    <div className="container max-w-5xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Create Package</h1>
        </div>
      </div>

      {Object.keys(validationErrors).length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please fix the following errors:
            <ul className="mt-2 list-disc pl-5">
              {Object.values(validationErrors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="features">Features & Benefits</TabsTrigger>
            <TabsTrigger value="courses">Courses & Content</TabsTrigger>
            <TabsTrigger value="media">Media & Display</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Package Information</CardTitle>
                <CardDescription>Basic details about your package</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className={validationErrors.name ? "text-destructive" : ""}>
                    Package Name*
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Silver Package"
                    className={validationErrors.name ? "border-destructive" : ""}
                  />
                  {validationErrors.name && <p className="text-sm text-destructive">{validationErrors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className={validationErrors.description ? "text-destructive" : ""}>
                    Short Description*
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Briefly describe what this package offers"
                    rows={2}
                    className={validationErrors.description ? "border-destructive" : ""}
                  />
                  {validationErrors.description && (
                    <p className="text-sm text-destructive">{validationErrors.description}</p>
                  )}
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
                    <Label htmlFor="price" className={validationErrors.price ? "text-destructive" : ""}>
                      Price (₹)*
                    </Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="e.g. 999"
                      min="0"
                      step="0.01"
                      className={validationErrors.price ? "border-destructive" : ""}
                    />
                    {validationErrors.price && <p className="text-sm text-destructive">{validationErrors.price}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="originalPrice" className={validationErrors.originalPrice ? "text-destructive" : ""}>
                      Original Price (₹)
                    </Label>
                    <Input
                      id="originalPrice"
                      name="originalPrice"
                      type="number"
                      value={formData.originalPrice}
                      onChange={handleChange}
                      placeholder="e.g. 1499"
                      min="0"
                      step="0.01"
                      className={validationErrors.originalPrice ? "border-destructive" : ""}
                    />
                    {validationErrors.originalPrice && (
                      <p className="text-sm text-destructive">{validationErrors.originalPrice}</p>
                    )}
                    <p className="text-xs text-muted-foreground">For showing discounted price</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleSwitchChange("isActive", checked)}
                  />
                  <Label htmlFor="isActive">Active Package</Label>
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
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => setActiveTab("features")}>
                  Next: Features & Benefits
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
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
                  <Select
                    value={formData.maxCourses}
                    onValueChange={(value) => handleSelectChange("maxCourses", value)}
                  >
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
                  <div className="space-y-2 pl-6 border-l-2 border-muted">
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
                        <SelectItem value="weekly">Weekly Group Mentoring</SelectItem>
                        <SelectItem value="monthly">Monthly Group Mentoring</SelectItem>
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
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("basic")}>
                  Back
                </Button>
                <Button type="button" onClick={() => setActiveTab("courses")}>
                  Next: Courses & Content
                </Button>
              </CardFooter>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Selection</CardTitle>
                <CardDescription>You'll be able to assign courses after creating the package</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">Courses Assignment</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    After creating this package, you'll be able to assign courses from your course library.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You've selected {formData.maxCourses === "0" ? "unlimited" : formData.maxCourses} courses for this
                    package.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("features")}>
                  Back
                </Button>
                <Button type="button" onClick={() => setActiveTab("media")}>
                  Next: Media & Display
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Package Media</CardTitle>
                <CardDescription>Upload package thumbnail and promotional media</CardDescription>
              </CardHeader>
              <CardContent>
                <CustomImageUpload
                  value={formData.thumbnail}
                  onChange={(url) => setFormData((prev) => ({ ...prev, thumbnail: url }))}
                  folder="packages"
                  label="Package Thumbnail"
                  description="Upload package thumbnail image (recommended: 1280x720px)"
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("courses")}>
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Create Package
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}
