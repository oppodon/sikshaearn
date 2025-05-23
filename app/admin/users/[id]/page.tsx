import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, Mail, MapPin, Phone, Shield, User } from "lucide-react"
import Link from "next/link"

export default function UserProfilePage({ params }: { params: { id: string } }) {
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
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>View and manage user details</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src="/placeholder.svg?height=96&width=96" alt="User" />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>
            <h2 className="mt-4 text-xl font-semibold">Rahul Sharma</h2>
            <p className="text-sm text-muted-foreground">rahul.sharma@example.com</p>
            <div className="mt-2 flex gap-2">
              <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">
                Admin
              </Badge>
              <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                Active
              </Badge>
            </div>
            <div className="mt-6 w-full space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>rahul.sharma@example.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>Kathmandu, Nepal</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined May 15, 2023</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>Admin</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 md:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>View user's recent activity and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="courses">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="courses">Courses</TabsTrigger>
                  <TabsTrigger value="payments">Payments</TabsTrigger>
                  <TabsTrigger value="logins">Login History</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>
                <TabsContent value="courses" className="mt-4 space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Digital Marketing Mastery</h3>
                        <p className="text-sm text-muted-foreground">Enrolled on Jan 20, 2023</p>
                      </div>
                      <Badge>In Progress</Badge>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>65%</span>
                      </div>
                      <div className="mt-1 h-2 w-full rounded-full bg-gray-100">
                        <div className="h-2 rounded-full bg-blue-600" style={{ width: "65%" }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Communication Skills</h3>
                        <p className="text-sm text-muted-foreground">Enrolled on Feb 15, 2023</p>
                      </div>
                      <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                        Completed
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>100%</span>
                      </div>
                      <div className="mt-1 h-2 w-full rounded-full bg-gray-100">
                        <div className="h-2 rounded-full bg-green-600" style={{ width: "100%" }}></div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="payments" className="mt-4">
                  <div className="rounded-lg border">
                    <div className="grid grid-cols-5 border-b p-3 font-medium">
                      <div>Date</div>
                      <div className="col-span-2">Description</div>
                      <div>Method</div>
                      <div className="text-right">Amount</div>
                    </div>
                    <div className="grid grid-cols-5 border-b p-3">
                      <div className="text-sm">Mar 15, 2023</div>
                      <div className="col-span-2 text-sm">Digital Marketing Mastery Course</div>
                      <div className="text-sm">Credit Card</div>
                      <div className="text-right text-sm">₹1,499</div>
                    </div>
                    <div className="grid grid-cols-5 border-b p-3">
                      <div className="text-sm">Feb 10, 2023</div>
                      <div className="col-span-2 text-sm">Communication Skills Course</div>
                      <div className="text-sm">PayPal</div>
                      <div className="text-right text-sm">₹899</div>
                    </div>
                    <div className="grid grid-cols-5 p-3">
                      <div className="text-sm">Jan 05, 2023</div>
                      <div className="col-span-2 text-sm">Premium Membership</div>
                      <div className="text-sm">UPI</div>
                      <div className="text-right text-sm">₹2,999</div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="logins" className="mt-4">
                  <div className="rounded-lg border">
                    <div className="grid grid-cols-4 border-b p-3 font-medium">
                      <div>Date & Time</div>
                      <div>IP Address</div>
                      <div>Device</div>
                      <div>Location</div>
                    </div>
                    <div className="grid grid-cols-4 border-b p-3">
                      <div className="text-sm">May 20, 2023 10:30 AM</div>
                      <div className="text-sm">192.168.1.1</div>
                      <div className="text-sm">Chrome / Windows</div>
                      <div className="text-sm">Kathmandu, Nepal</div>
                    </div>
                    <div className="grid grid-cols-4 border-b p-3">
                      <div className="text-sm">May 18, 2023 3:45 PM</div>
                      <div className="text-sm">192.168.1.1</div>
                      <div className="text-sm">Safari / iOS</div>
                      <div className="text-sm">Kathmandu, Nepal</div>
                    </div>
                    <div className="grid grid-cols-4 p-3">
                      <div className="text-sm">May 15, 2023 9:15 AM</div>
                      <div className="text-sm">192.168.1.1</div>
                      <div className="text-sm">Chrome / Android</div>
                      <div className="text-sm">Pokhara, Nepal</div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="activity" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex gap-4 rounded-lg border p-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm">Completed lesson 5 of Digital Marketing Mastery</p>
                        <p className="text-xs text-muted-foreground">May 20, 2023 11:30 AM</p>
                      </div>
                    </div>
                    <div className="flex gap-4 rounded-lg border p-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm">Submitted assignment for Communication Skills</p>
                        <p className="text-xs text-muted-foreground">May 18, 2023 2:15 PM</p>
                      </div>
                    </div>
                    <div className="flex gap-4 rounded-lg border p-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm">Posted a question in Digital Marketing forum</p>
                        <p className="text-xs text-muted-foreground">May 15, 2023 4:45 PM</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

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
                <Button variant="outline" className="text-amber-600 hover:text-amber-700">
                  Suspend Account
                </Button>
                <Button variant="outline" className="text-red-600 hover:text-red-700">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
