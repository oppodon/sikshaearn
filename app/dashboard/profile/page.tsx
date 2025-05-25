"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Check, Mail, Phone, User, Loader2, AlertCircle, Shield, Settings, UserCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UserProfile {
  name: string
  email: string
  image?: string
  username?: string
  bio?: string
  country?: string
  city?: string
  phone?: string
  role: string
  status: string
  createdAt: string
}

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("personal")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    bio: "",
    country: "",
    city: "",
    phone: "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/user/profile")

        if (!response.ok) {
          throw new Error("Failed to fetch profile")
        }

        const data = await response.json()
        setUserProfile(data)
        setFormData({
          name: data.name || "",
          email: data.email || "",
          username: data.username || "",
          bio: data.bio || "",
          country: data.country || "",
          city: data.city || "",
          phone: data.phone || "",
        })
      } catch (err) {
        console.error("Error fetching profile:", err)
        setError("Failed to load profile data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchUserProfile()
    }
  }, [session])

  // Handle input changes for personal info
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle password input changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
    setPasswordError("")
  }

  // Handle profile update
  const handleProfileUpdate = async () => {
    try {
      setIsSaving(true)
      setError("")

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile")
      }

      // Update session with new user data
      await update({
        ...session,
        user: {
          ...session?.user,
          name: formData.name,
          email: formData.email,
          image: userProfile?.image,
        },
      })

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })

      // Refresh the page to show updated data
      router.refresh()
    } catch (err: any) {
      console.error("Error updating profile:", err)
      setError(err.message || "Failed to update profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  // Handle password update
  const handlePasswordUpdate = async () => {
    try {
      // Validate passwords
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError("New passwords do not match")
        return
      }

      if (passwordData.newPassword.length < 8) {
        setPasswordError("Password must be at least 8 characters long")
        return
      }

      setIsSaving(true)
      setPasswordError("")

      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update password")
      }

      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      })

      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (err: any) {
      console.error("Error updating password:", err)
      setPasswordError(err.message || "Failed to update password. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)

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

      // Update local state and session
      setUserProfile((prev) => (prev ? { ...prev, image: data.imageUrl } : null))

      await update({
        ...session,
        user: {
          ...session?.user,
          image: data.imageUrl,
        },
      })

      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully.",
      })

      // Refresh the page to show updated avatar
      router.refresh()
    } catch (err: any) {
      console.error("Error uploading avatar:", err)
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: err.message || "Failed to upload avatar. Please try again.",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!userProfile?.name) return "U"
    return userProfile.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 border-4 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
              <p className="text-lg text-gray-600">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
          </div>
        </div>

        {error && (
          <Alert className="border-red-200 bg-gradient-to-r from-red-50 to-rose-50 shadow-lg">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm shadow-lg p-1 rounded-lg">
            <TabsTrigger
              value="personal"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
            >
              <UserCircle className="h-4 w-4 mr-2" />
              Personal
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
            >
              <Settings className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
            >
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Profile Picture
                </CardTitle>
                <CardDescription className="text-blue-100">
                  This is your public profile picture visible to others
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 shadow-lg ring-4 ring-white">
                      <AvatarImage src={userProfile?.image || ""} alt={userProfile?.name || "User"} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-600 text-white text-lg font-bold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <label htmlFor="avatar-upload">
                      <div className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center cursor-pointer hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg">
                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                      </div>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleAvatarUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </div>

                  <div className="space-y-2 text-center sm:text-left">
                    <h3 className="font-bold text-xl text-gray-900">{userProfile?.name}</h3>
                    <p className="text-sm text-gray-600">
                      Joined {userProfile?.createdAt ? formatDate(userProfile.createdAt) : ""}
                    </p>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <div className="px-3 py-1 rounded-full text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                        {userProfile?.role?.charAt(0).toUpperCase() + userProfile?.role?.slice(1)}
                      </div>
                      <div className="px-3 py-1 rounded-full text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                        {userProfile?.status?.charAt(0).toUpperCase() + userProfile?.status?.slice(1)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription className="text-purple-100">Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700 font-medium">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/80"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-700 font-medium">
                      Username
                    </Label>
                    <div className="relative">
                      <User className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
                      <Input
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/80"
                      />
                    </div>
                    <p className="text-xs text-gray-500">This will be used for your profile URL</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/80"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700 font-medium">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/80"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-gray-700 font-medium">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="Tell us about yourself"
                    className="min-h-[100px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/80"
                    value={formData.bio}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-gray-700 font-medium">
                      Country
                    </Label>
                    <Select value={formData.country} onValueChange={(value) => handleSelectChange("country", value)}>
                      <SelectTrigger
                        id="country"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/80"
                      >
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nepal">Nepal</SelectItem>
                        <SelectItem value="india">India</SelectItem>
                        <SelectItem value="usa">United States</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="australia">Australia</SelectItem>
                        <SelectItem value="canada">Canada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-gray-700 font-medium">
                      City
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/80"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200 rounded-b-lg">
                <Button
                  onClick={handleProfileUpdate}
                  disabled={isSaving}
                  className="ml-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Account Settings
                </CardTitle>
                <CardDescription className="text-purple-100">Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200">
                  <Label htmlFor="account-email" className="text-blue-800 font-medium">
                    Email Address
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <Input id="account-email" value={formData.email} disabled className="bg-white/80" />
                  </div>
                  <p className="text-xs text-blue-700 mt-1">Your email address is used for login and notifications</p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200">
                    <Label htmlFor="language" className="text-green-800 font-medium">
                      Language
                    </Label>
                    <Select defaultValue="en">
                      <SelectTrigger id="language" className="mt-2 bg-white/80">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ne">Nepali</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-amber-100 border border-orange-200">
                    <Label htmlFor="timezone" className="text-orange-800 font-medium">
                      Timezone
                    </Label>
                    <Select defaultValue="asia-kathmandu">
                      <SelectTrigger id="timezone" className="mt-2 bg-white/80">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asia-kathmandu">Asia/Kathmandu (GMT+5:45)</SelectItem>
                        <SelectItem value="asia-kolkata">Asia/Kolkata (GMT+5:30)</SelectItem>
                        <SelectItem value="utc">UTC (GMT+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

       
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription className="text-green-100">
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {passwordError && (
                  <Alert className="border-red-200 bg-gradient-to-r from-red-50 to-rose-50 shadow-lg">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">{passwordError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="current-password" className="text-gray-700 font-medium">
                    Current Password
                  </Label>
                  <Input
                    id="current-password"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500 bg-white/80"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-gray-700 font-medium">
                    New Password
                  </Label>
                  <Input
                    id="new-password"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500 bg-white/80"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-gray-700 font-medium">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500 bg-white/80"
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-gradient-to-r from-gray-50 to-green-50 border-t border-gray-200 rounded-b-lg">
                <Button
                  onClick={handlePasswordUpdate}
                  disabled={isSaving}
                  className="ml-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Update Password
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Two-Factor Authentication
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200">
                  <div>
                    <h4 className="font-medium text-blue-900">Enable Two-Factor Authentication</h4>
                    <p className="text-sm text-blue-700">Protect your account with an additional security layer</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="two-factor" className="sr-only">
                      Two-Factor Authentication
                    </Label>
                    <input
                      type="checkbox"
                      id="two-factor"
                      className="h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                      defaultChecked={false}
                    />
                  </div>
                </div>

                <div className="rounded-lg bg-gradient-to-br from-gray-50 to-slate-100 p-4 border border-gray-200">
                  <p className="text-sm text-gray-700">
                    Two-factor authentication adds an extra layer of security to your account by requiring more than
                    just a password to sign in.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200 rounded-b-lg">
                <Button className="ml-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg transform hover:scale-105 transition-all duration-300">
                  Save Security Settings
                </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Account Activity
                </CardTitle>
                <CardDescription className="text-purple-100">Monitor recent activity on your account</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200">
                      <div>
                        <h4 className="font-medium text-green-900">Login from Kathmandu, Nepal</h4>
                        <p className="text-sm text-green-700">Chrome on Windows</p>
                      </div>
                      <span className="text-sm text-green-600 font-medium">Just now</span>
                    </div>
                  </div>

                  <div className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200">
                      <div>
                        <h4 className="font-medium text-blue-900">Password changed</h4>
                        <p className="text-sm text-blue-700">Security setting updated</p>
                      </div>
                      <span className="text-sm text-blue-600 font-medium">2 days ago</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-br from-orange-50 to-amber-100 border border-orange-200">
                      <div>
                        <h4 className="font-medium text-orange-900">Login from new device</h4>
                        <p className="text-sm text-orange-700">Firefox on Android</p>
                      </div>
                      <span className="text-sm text-orange-600 font-medium">5 days ago</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
