"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, Mail, MapPin, Phone, Shield, User, Plus } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { AssignPackageDialog } from "@/components/assign-package-dialog"

interface Props {
  params: { id: string }
}

const UserProfilePage = ({ params }: Props) => {
  const [user, setUser] = useState<any>(null)
  const [userPackages, setUserPackages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)

  useEffect(() => {
    fetchUserData()
  }, [params.id])

  const fetchUserData = async () => {
    setLoading(true)
    try {
      // Fetch user details
      const userResponse = await fetch(`/api/admin/users/${params.id}`)
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUser(userData)
      }

      // Fetch user packages
      const packagesResponse = await fetch(`/api/admin/users/${params.id}/packages`)
      if (packagesResponse.ok) {
        const packagesData = await packagesResponse.json()
        setUserPackages(packagesData.packages || [])
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      toast.error("Failed to fetch user data")
    } finally {
      setLoading(false)
    }
  }

  const handleBanUser = async (action: "ban" | "unban") => {
    try {
      const response = await fetch(`/api/admin/users/${params.id}/ban`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        toast.success(`User ${action === "ban" ? "banned" : "unbanned"} successfully`)
        fetchUserData() // Refresh data
      } else {
        const error = await response.json()
        toast.error(error.message || `Failed to ${action} user`)
      }
    } catch (error) {
      console.error(`Error ${action}ning user:`, error)
      toast.error(`Failed to ${action} user`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading user profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold">User not found</h2>
          <p className="text-muted-foreground">The requested user could not be found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">User Profile</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* User Information Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>View and manage user details</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar || "/placeholder.svg?height=96&width=96"} alt="User" />
              <AvatarFallback>{user.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <h2 className="mt-4 text-xl font-semibold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-2 flex gap-2">
              <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">
                {user.role}
              </Badge>
              <Badge
                variant="outline"
                className={
                  user.status === "banned"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-green-200 bg-green-50 text-green-700"
                }
              >
                {user.status || "Active"}
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
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>{user.role}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{user.status || "Active"}</span>
              </div>
              {user.referralCode && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Referral Code:</span>
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{user.referralCode}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-6 md:col-span-5">
          <Tabs defaultValue="packages">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="packages">Packages</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            {/* Packages Tab */}
            <TabsContent value="packages" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">User Packages</h3>
                <Button onClick={() => setAssignDialogOpen(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Assign Package
                </Button>
              </div>

              {userPackages.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground">No packages assigned to this user</p>
                    <Button onClick={() => setAssignDialogOpen(true)} className="mt-4" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Assign First Package
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {userPackages.map((pkg) => (
                    <Card key={pkg._id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{pkg.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {pkg.assignedBy ? "Assigned by Admin" : "Purchased"} on{" "}
                              {new Date(pkg.purchaseDate || pkg.assignedDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm font-medium">₹{pkg.price}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={pkg.assignedBy ? "secondary" : "default"}>
                              {pkg.assignedBy ? "Admin Assigned" : "Purchased"}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">{pkg.courses?.length || 0} courses</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Enrolled Courses</CardTitle>
                  <CardDescription>Courses the user has access to</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Course enrollment details will be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>All transactions and payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Payment history will be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Activity</CardTitle>
                  <CardDescription>Recent user actions and login history</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Activity logs will be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>Manage user account settings and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline">Reset Password</Button>
                <Button variant="outline">Send Verification Email</Button>
                <Button variant="outline">Edit Profile</Button>
                <Button variant="outline">Login as User</Button>
                {user.status === "banned" ? (
                  <Button
                    variant="outline"
                    className="text-green-600 hover:text-green-700"
                    onClick={() => handleBanUser("unban")}
                  >
                    Unban Account
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="text-amber-600 hover:text-amber-700"
                    onClick={() => handleBanUser("ban")}
                  >
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

      {/* Assign Package Dialog */}
      <AssignPackageDialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen} userId={params.id} />
    </div>
  )
}

export default UserProfilePage
