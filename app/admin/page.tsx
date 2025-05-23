import type React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  BookOpen,
  DollarSign,
  FileText,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity,
  Calendar,
  BarChart3,
} from "lucide-react"

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, Admin</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's an overview of your platform performance and recent activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value="2,845"
          change="+12%"
          changeType="increase"
          icon={<Users className="h-5 w-5" />}
          description="from last month"
        />
        <StatsCard
          title="Active Courses"
          value="48"
          change="+5"
          changeType="increase"
          icon={<BookOpen className="h-5 w-5" />}
          description="new this month"
        />
        <StatsCard
          title="Total Revenue"
          value="₹1,245,890"
          change="+18%"
          changeType="increase"
          icon={<DollarSign className="h-5 w-5" />}
          description="from last month"
        />
        <StatsCard
          title="Pending KYC"
          value="8"
          change="Requires attention"
          changeType="warning"
          icon={<FileText className="h-5 w-5" />}
          description=""
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="overview">Platform Overview</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* User Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Statistics</CardTitle>
                <CardDescription>Overview of user engagement and growth</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <StatItem label="New Users (This Month)" value="245" percentage={45} color="blue" />
                <StatItem label="Active Users" value="1,876 (65.9%)" percentage={66} color="green" />
                <StatItem label="Premium Users" value="986 (34.7%)" percentage={35} color="purple" />
                <StatItem label="Verified Affiliates" value="128 (4.5%)" percentage={5} color="orange" />
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admin/users">View Detailed User Report</Link>
                </Button>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Status</CardTitle>
                <CardDescription>Current status of all platform services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <StatusItem
                  title="Payment System"
                  description="All payment gateways operational"
                  status="Operational"
                  statusType="success"
                />
                <StatusItem
                  title="Course Delivery"
                  description="Video streaming and content delivery"
                  status="Operational"
                  statusType="success"
                />
                <StatusItem
                  title="Affiliate Tracking"
                  description="Minor delays in tracking"
                  status="Degraded"
                  statusType="warning"
                />
                <StatusItem
                  title="User Authentication"
                  description="Login and registration systems"
                  status="Operational"
                  statusType="success"
                />
                <Button variant="outline" className="w-full">
                  View System Status
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title="Enrollments"
              value="128"
              trend="+12.5%"
              trendUp={true}
              description="New enrollments this week"
            />
            <MetricCard
              title="Revenue"
              value="₹245,890"
              trend="+8.2%"
              trendUp={true}
              description="Revenue this month"
            />
            <MetricCard
              title="Active Sessions"
              value="1,245"
              trend="+24.3%"
              trendUp={true}
              description="Current active users"
            />
          </div>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
              <CardDescription>Scheduled events and important deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <EventItem
                  title="New Course Launch"
                  description="Advanced Python Programming"
                  date="May 28, 2025"
                  type="launch"
                />
                <EventItem
                  title="Affiliate Payout"
                  description="Monthly affiliate commission payout"
                  date="May 31, 2025"
                  type="payment"
                />
                <EventItem
                  title="System Maintenance"
                  description="Scheduled downtime for system updates"
                  date="June 2, 2025"
                  type="maintenance"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Latest actions and events across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <ActivityItem
                  title="New User Registration"
                  description="Rahul Sharma registered a new account"
                  time="10 minutes ago"
                  type="user"
                />
                <ActivityItem
                  title="Course Enrollment"
                  description="Priya Patel enrolled in 'Digital Marketing Masterclass'"
                  time="25 minutes ago"
                  type="course"
                />
                <ActivityItem
                  title="Payment Received"
                  description="₹12,500 payment received from Amit Kumar"
                  time="1 hour ago"
                  type="payment"
                />
                <ActivityItem
                  title="KYC Submitted"
                  description="Neha Singh submitted KYC documents for verification"
                  time="2 hours ago"
                  type="kyc"
                />
                <ActivityItem
                  title="New Affiliate"
                  description="Vikram Joshi registered as an affiliate"
                  time="3 hours ago"
                  type="affiliate"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Platform Performance</CardTitle>
              <CardDescription>Key performance metrics and system analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <PerformanceMetric title="Page Load Time" value="0.8s" trend="-12%" isGood={true} />
                  <PerformanceMetric title="Server Response" value="120ms" trend="-8%" isGood={true} />
                  <PerformanceMetric title="Error Rate" value="0.05%" trend="-24%" isGood={true} />
                </div>

                <div className="rounded-lg border p-6">
                  <h3 className="mb-4 text-lg font-medium">Performance Chart</h3>
                  <div className="h-[300px] w-full rounded-md bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">Performance metrics chart will be displayed here</p>
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

// Stats Card Component
function StatsCard({
  title,
  value,
  change,
  changeType,
  icon,
  description,
}: {
  title: string
  value: string
  change: string
  changeType: "increase" | "decrease" | "warning"
  icon: React.ReactNode
  description: string
}) {
  const getChangeColor = () => {
    switch (changeType) {
      case "increase":
        return "text-green-600"
      case "decrease":
        return "text-red-600"
      case "warning":
        return "text-orange-600"
      default:
        return "text-gray-600"
    }
  }

  const getChangeIcon = () => {
    switch (changeType) {
      case "increase":
        return <TrendingUp className="h-3 w-3" />
      case "decrease":
        return <TrendingDown className="h-3 w-3" />
      case "warning":
        return <Clock className="h-3 w-3" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <div className={`flex items-center gap-1 text-xs ${getChangeColor()}`}>
              {getChangeIcon()}
              <span>{change}</span>
              {description && <span className="text-gray-500">{description}</span>}
            </div>
          </div>
          <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Stat Item Component
function StatItem({
  label,
  value,
  percentage,
  color,
}: {
  label: string
  value: string
  percentage: number
  color: string
}) {
  const getColorClass = () => {
    switch (color) {
      case "blue":
        return "bg-blue-500"
      case "green":
        return "bg-green-500"
      case "purple":
        return "bg-purple-500"
      case "orange":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-gray-600 dark:text-gray-400">{value}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div className={`h-2 rounded-full ${getColorClass()}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

// Status Item Component
function StatusItem({
  title,
  description,
  status,
  statusType,
}: {
  title: string
  description: string
  status: string
  statusType: "success" | "warning" | "error"
}) {
  const getStatusColor = () => {
    switch (statusType) {
      case "success":
        return "text-green-600 bg-green-50 dark:bg-green-950/50"
      case "warning":
        return "text-orange-600 bg-orange-50 dark:bg-orange-950/50"
      case "error":
        return "text-red-600 bg-red-50 dark:bg-red-950/50"
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-950/50"
    }
  }

  const getStatusIcon = () => {
    switch (statusType) {
      case "success":
        return <CheckCircle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "error":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${getStatusColor()}`}>{getStatusIcon()}</div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <Badge variant="outline" className={getStatusColor()}>
        {status}
      </Badge>
    </div>
  )
}

// Metric Card Component
function MetricCard({
  title,
  value,
  trend,
  trendUp,
  description,
}: {
  title: string
  value: string
  trend: string
  trendUp: boolean
  description: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <div className={`flex items-center gap-1 text-xs ${trendUp ? "text-green-600" : "text-red-600"}`}>
              {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend}
            </div>
          </div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Event Item Component
function EventItem({
  title,
  description,
  date,
  type,
}: {
  title: string
  description: string
  date: string
  type: "launch" | "payment" | "maintenance"
}) {
  const getTypeIcon = () => {
    switch (type) {
      case "launch":
        return <BookOpen className="h-4 w-4" />
      case "payment":
        return <DollarSign className="h-4 w-4" />
      case "maintenance":
        return <Clock className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border">
      <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600">{getTypeIcon()}</div>
      <div className="flex-1">
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{date}</div>
    </div>
  )
}

// Activity Item Component
function ActivityItem({
  title,
  description,
  time,
  type,
}: {
  title: string
  description: string
  time: string
  type: "user" | "course" | "payment" | "kyc" | "affiliate"
}) {
  const getTypeIcon = () => {
    switch (type) {
      case "user":
        return <Users className="h-4 w-4" />
      case "course":
        return <BookOpen className="h-4 w-4" />
      case "payment":
        return <DollarSign className="h-4 w-4" />
      case "kyc":
        return <FileText className="h-4 w-4" />
      case "affiliate":
        return <Users className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getTypeBg = () => {
    switch (type) {
      case "user":
        return "bg-blue-50 dark:bg-blue-950/50 text-blue-600"
      case "course":
        return "bg-green-50 dark:bg-green-950/50 text-green-600"
      case "payment":
        return "bg-purple-50 dark:bg-purple-950/50 text-purple-600"
      case "kyc":
        return "bg-orange-50 dark:bg-orange-950/50 text-orange-600"
      case "affiliate":
        return "bg-blue-50 dark:bg-blue-950/50 text-blue-600"
      default:
        return "bg-gray-50 dark:bg-gray-950/50 text-gray-600"
    }
  }

  return (
    <div className="flex items-start gap-4">
      <div className={`p-2 rounded-full ${getTypeBg()}`}>{getTypeIcon()}</div>
      <div className="flex-1">
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  )
}

// Performance Metric Component
function PerformanceMetric({
  title,
  value,
  trend,
  isGood,
}: {
  title: string
  value: string
  trend: string
  isGood: boolean
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <div className={`flex items-center gap-1 text-xs ${isGood ? "text-green-600" : "text-red-600"}`}>
            {isGood ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
