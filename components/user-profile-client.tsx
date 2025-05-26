"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Mail, MapPin, Phone, Shield, User, Package, CreditCard, Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { AssignPackageDialog } from "./assign-package-dialog"
import { UserPackages } from "./user-packages"

interface UserData {
  _id: string
  name: string
  email: string
  phone?: string
  location?: string
  role: string
  status: string
  image?: string
  createdAt: string
  lastLogin?: string
  referralCode?: string
  provider?: string
}

interface UserProfileClientProps {
  userId: string
}

export function UserProfileClient({ userId }: UserProfileClientProps) {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [assignPackageOpen, setAssignPackageOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchUser()
  }, [userId])

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        toast.error("Failed to fetch user data")
      }
    } catch (error) {
      console.error("Error fetching user:", error)
      toast.error("Failed to fetch user data")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (action: "ban" | "unban" | "activate") => {
    setActionLoading(action)
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        toast.success(`User ${action}ned successfully`)
        fetchUser() // Refresh user data
      } else {
        const error = await response.json()
        toast.error(error.message || `Failed to ${action} user`)
      }
    } catch (error) {
      console.error(`Error ${action}ning user:`, error)
      toast.error(`Failed to ${action} user`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRoleChange = async (newRole: string) => {
    setActionLoading("role")
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        toast.success("User role updated successfully")
        fetchUser() // Refresh user data
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to update user role")
      }
    } catch (error) {
      console.error("Error updating user role:", error)
      toast.error("Failed to update user role")
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading user data...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">User not found</p>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "banned":
        return "bg-red-100 text-red-800 border-red-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "user":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>View and manage user details</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.image || "/placeholder.svg?height=96&width=96"} alt="User" />
              <AvatarFallback>{user.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <h2 className="mt-4 text-xl font-semibold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-2 flex gap-2">
              <Badge variant="outline" className={getRoleColor(user.role)}>
                {user.role}
              </Badge>
              <Badge variant="outline" className={getStatusColor(user.status)}>
                {user.status}
              </Badge>
            </div>
            <div className="mt-6 w-full space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{user.phone}</span>
                </div>
              )}
              {user.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{user.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              {user.lastLogin && (
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span>Last login {new Date(user.lastLogin).toLocaleDateString()}</span>
                </div>
              )}
              {user.referralCode && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Referral: {user.referralCode}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 md:col-span-5">
          <Tabs defaultValue="packages" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="packages">Packages</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="packages" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>User Packages</CardTitle>
                    <CardDescription>Packages assigned or purchased by this user</CardDescription>
                  </div>
                  <Button onClick={() => setAssignPackageOpen(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Assign Package
                  </Button>
                </CardHeader>
                <CardContent>
                  <UserPackages userId={userId} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="courses" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Enrolled Courses</CardTitle>
                  <CardDescription>Courses the user is currently enrolled in</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-8">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Course enrollment data will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>All payments made by this user</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-8">
                    <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Payment history will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Activity</CardTitle>
                  <CardDescription>Recent user activity and login history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-8">
                    <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Activity logs will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>Manage user account settings and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleRoleChange(user.role === "admin" ? "user" : "admin")}
                  disabled={actionLoading === "role"}
                >
                  {actionLoading === "role" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                </Button>
                <Button variant="outline">Edit Profile</Button>
                <Button variant="outline">Reset Password</Button>
                <Button variant="outline">Send Email</Button>
                {user.status === "banned" ? (
                  <Button
                    variant="outline"
                    className="text-green-600 hover:text-green-700"
                    onClick={() => handleStatusChange("unban")}
                    disabled={actionLoading === "unban"}
                  >
                    {actionLoading === "unban" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Unban Account
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleStatusChange("ban")}
                    disabled={actionLoading === "ban"}
                  >
                    {actionLoading === "ban" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Ban Account
                  </Button>
                )}
                <Button variant="outline" className="text-red-600 hover:text-red-700">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AssignPackageDialog open={assignPackageOpen} onOpenChange={setAssignPackageOpen} userId={userId} />
    </>
  )
}
