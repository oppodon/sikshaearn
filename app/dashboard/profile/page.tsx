"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { User, Camera, Trash2, Save, Shield, Loader2 } from "lucide-react"

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    address: "",
    bio: "",
    username: "",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [userData, setUserData] = useState<any>(null)

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user/profile")
      if (response.ok) {
        const data = await response.json()
        console.log("Fetched user profile:", data)

        setUserData(data)
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          country: data.country || "",
          city: data.city || "",
          address: data.address || "",
          bio: data.bio || "",
          username: data.username || "",
        })
      } else {
        console.error("Failed to fetch user profile")
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchUserData()
    }
  }, [session])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a JPEG, PNG, or WebP image")
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error("Image size must be less than 5MB")
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("avatar", file)

      const response = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload avatar")
      }

      // Fetch updated user data instead of updating session
      await fetchUserData()

      toast.success("Avatar updated successfully!")
    } catch (error: any) {
      console.error("Error uploading avatar:", error)
      toast.error(error.message || "Failed to upload avatar")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveAvatar = async () => {
    setIsUploading(true)

    try {
      const response = await fetch("/api/user/avatar", {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove avatar")
      }

      // Fetch updated user data instead of updating session
      await fetchUserData()

      toast.success("Avatar removed successfully!")
    } catch (error: any) {
      console.error("Error removing avatar:", error)
      toast.error(error.message || "Failed to remove avatar")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log("Submitting profile data:", formData)

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      console.log("Profile update response:", data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile")
      }

      // Update session with new data
      await update({
        ...session,
        user: {
          ...session?.user,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          city: formData.city,
          address: formData.address,
          bio: formData.bio,
          username: formData.username,
        },
      })

      toast.success("Profile updated successfully!")
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast.error(error.message || "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
            <p className="text-gray-600">Please log in to access your profile.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-10" />
        <CardHeader className="relative">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage
                  src={userData?.image || "/placeholder.svg"}
                  alt={userData?.name || "User"}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-2xl font-bold">
                  {getInitials(userData?.name || "User")}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 flex gap-1">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 rounded-full p-0 shadow-lg"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </Button>
                {userData?.image && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8 w-8 rounded-full p-0 shadow-lg"
                    onClick={handleRemoveAvatar}
                    disabled={isUploading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold">{userData?.name || session?.user?.name}</CardTitle>
              <CardDescription className="text-lg">{userData?.email || session?.user?.email}</CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Shield className="h-3 w-3 mr-1" />
                  Active
                </Badge>
                <Badge variant="outline">
                  <User className="h-3 w-3 mr-1" />
                  {(session.user as any).role || "User"}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>Update your personal details and contact information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Enter your country"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Enter your city"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself"
                  rows={3}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter your full address"
                rows={3}
              />
            </div>
            <Separator />
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Debug Session Info */}
      <Card>
        <CardHeader>
          <CardTitle>Session Debug Info</CardTitle>
          <CardDescription>Current session data for debugging</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">{JSON.stringify(session, null, 2)}</pre>
        </CardContent>
      </Card>
    </div>
  )
}
