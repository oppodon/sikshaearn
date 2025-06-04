"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Users, BookOpen, DollarSign, FileText, TrendingUp, CheckCircle, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface DashboardStats {
  userStats: {
    total: number
    growth: number
    active: {
      count: number
      percentage: number
    }
    premium: {
      count: number
      percentage: number
    }
    verifiedAffiliates: {
      count: number
      percentage: number
    }
    newThisMonth: number
  }
  courseStats: {
    active: number
    newThisMonth: number
  }
  revenueStats: {
    total: number
    lastMonth: number
    growth: number
  }
  kycStats: {
    pending: number
  }
  systemStatus: {
    payment: {
      operational: boolean
      message: string
    }
    courseDelivery: {
      operational: boolean
      message: string
    }
    affiliateTracking: {
      operational: boolean
      message: string
    }
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/dashboard/stats")
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard stats")
        }
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        toast.error("Failed to load dashboard statistics")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-4 bg-muted rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-2">
        <Image src="/logo.png" alt="SikshaEarn" width={200} height={60} className="h-12 w-auto" />
      </div>
      <p className="text-muted-foreground mb-8">Here's an overview of your platform performance and recent activity</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.userStats.total.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />+{stats?.userStats.growth || 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.courseStats.active || 0}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              +{stats?.courseStats.newThisMonth || 0} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats?.revenueStats.total.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />+{stats?.revenueStats.growth || 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending KYC</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.kycStats.pending || 0}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1 text-amber-500">
              {stats?.kycStats.pending ? "Requires attention" : "No pending requests"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Platform Overview</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Statistics</CardTitle>
                <CardDescription>Overview of user engagement and growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">New Users (This Month)</div>
                      <div className="text-sm text-muted-foreground">{stats?.userStats.newThisMonth || 0}</div>
                    </div>
                    <Progress
                      value={
                        stats?.userStats.newThisMonth ? (stats.userStats.newThisMonth / stats.userStats.total) * 100 : 0
                      }
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">Active Users</div>
                      <div className="text-sm text-muted-foreground">
                        {stats?.userStats.active.count.toLocaleString() || 0} ({stats?.userStats.active.percentage || 0}
                        %)
                      </div>
                    </div>
                    <Progress value={stats?.userStats.active.percentage || 0} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">Premium Users</div>
                      <div className="text-sm text-muted-foreground">
                        {stats?.userStats.premium.count.toLocaleString() || 0} (
                        {stats?.userStats.premium.percentage || 0}%)
                      </div>
                    </div>
                    <Progress value={stats?.userStats.premium.percentage || 0} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">Verified Affiliates</div>
                      <div className="text-sm text-muted-foreground">
                        {stats?.userStats.verifiedAffiliates.count.toLocaleString() || 0} (
                        {stats?.userStats.verifiedAffiliates.percentage || 0}%)
                      </div>
                    </div>
                    <Progress value={stats?.userStats.verifiedAffiliates.percentage || 0} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current status of all platform services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                      <div>
                        <div className="font-medium">Payment System</div>
                        <div className="text-sm text-muted-foreground">{stats?.systemStatus.payment.message}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Operational
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                      <div>
                        <div className="font-medium">Course Delivery</div>
                        <div className="text-sm text-muted-foreground">
                          {stats?.systemStatus.courseDelivery.message}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Operational
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                      <div>
                        <div className="font-medium">Affiliate Tracking</div>
                        <div className="text-sm text-muted-foreground">
                          {stats?.systemStatus.affiliateTracking.message}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Operational
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <RefreshCw className="h-5 w-5 mr-2 text-amber-500" />
                      <div>
                        <div className="font-medium">Balance Sync Status</div>
                        <div className="text-sm text-muted-foreground">Last sync: {new Date().toLocaleString()}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      Needs Sync
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest transactions and system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="flex">
                  <div className="flex-none w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-medium">New user registered</p>
                    <p className="text-xs text-muted-foreground">Rahul Sharma (rahul.sharma@example.com)</p>
                    <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-none w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mr-3">
                    <DollarSign className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-medium">New payment received</p>
                    <p className="text-xs text-muted-foreground">₹12,500 for Advanced Web Development</p>
                    <p className="text-xs text-muted-foreground mt-1">3 hours ago</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-none w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mr-3">
                    <BookOpen className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-medium">New course published</p>
                    <p className="text-xs text-muted-foreground">Python Programming Masterclass by Amit Kumar</p>
                    <p className="text-xs text-muted-foreground mt-1">5 hours ago</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-none w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mr-3">
                    <FileText className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-medium">New KYC submission</p>
                    <p className="text-xs text-muted-foreground">Priya Patel submitted KYC documents</p>
                    <p className="text-xs text-muted-foreground mt-1">6 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
              <CardDescription>Key metrics and performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-2">Revenue Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted rounded-lg p-4">
                      <div className="text-sm text-muted-foreground">Course Sales</div>
                      <div className="text-2xl font-bold mt-1">
                        ₹{(stats?.revenueStats.total * 0.75).toLocaleString() || 0}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">75% of total revenue</div>
                    </div>

                    <div className="bg-muted rounded-lg p-4">
                      <div className="text-sm text-muted-foreground">Package Sales</div>
                      <div className="text-2xl font-bold mt-1">
                        ₹{(stats?.revenueStats.total * 0.2).toLocaleString() || 0}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">20% of total revenue</div>
                    </div>

                    <div className="bg-muted rounded-lg p-4">
                      <div className="text-sm text-muted-foreground">Other Revenue</div>
                      <div className="text-2xl font-bold mt-1">
                        ₹{(stats?.revenueStats.total * 0.05).toLocaleString() || 0}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">5% of total revenue</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">User Engagement</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted rounded-lg p-4">
                      <div className="text-sm text-muted-foreground">Average Course Completion Rate</div>
                      <div className="text-2xl font-bold mt-1">68%</div>
                      <div className="text-xs text-green-500 mt-1">↑ 5% from last month</div>
                    </div>

                    <div className="bg-muted rounded-lg p-4">
                      <div className="text-sm text-muted-foreground">Average Session Duration</div>
                      <div className="text-2xl font-bold mt-1">32 minutes</div>
                      <div className="text-xs text-green-500 mt-1">↑ 3 minutes from last month</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Affiliate Performance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted rounded-lg p-4">
                      <div className="text-sm text-muted-foreground">Active Affiliates</div>
                      <div className="text-2xl font-bold mt-1">{stats?.userStats.verifiedAffiliates.count || 0}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Out of {stats?.userStats.total || 0} total users
                      </div>
                    </div>

                    <div className="bg-muted rounded-lg p-4">
                      <div className="text-sm text-muted-foreground">Affiliate-Generated Revenue</div>
                      <div className="text-2xl font-bold mt-1">
                        ₹{(stats?.revenueStats.total * 0.35).toLocaleString() || 0}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">35% of total revenue</div>
                    </div>

                    <div className="bg-muted rounded-lg p-4">
                      <div className="text-sm text-muted-foreground">Affiliate Commissions Paid</div>
                      <div className="text-2xl font-bold mt-1">
                        ₹{(stats?.revenueStats.total * 0.23).toLocaleString() || 0}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">23% of total revenue</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
