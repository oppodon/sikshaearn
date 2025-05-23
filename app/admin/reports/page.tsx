import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, LineChart, BarChart, PieChart, Calendar } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RevenueChart } from "@/components/admin/charts/revenue-chart"
import { EnrollmentChart } from "@/components/admin/charts/enrollment-chart"
import { CoursePerformanceChart } from "@/components/admin/charts/course-performance-chart"
import { AffiliatePerformanceChart } from "@/components/admin/charts/affiliate-performance-chart"

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
        <div className="flex items-center gap-2">
          <Select defaultValue="30">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="year">This year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <LineChart className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="courses">
            <BarChart className="mr-2 h-4 w-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="affiliates">
            <PieChart className="mr-2 h-4 w-4" />
            Affiliates
          </TabsTrigger>
          <TabsTrigger value="users">
            <Calendar className="mr-2 h-4 w-4" />
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <RevenueChart />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enrollments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <EnrollmentChart />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard title="Total Revenue" value="₹1,245,890" change="+18%" positive={true} />
                <MetricCard title="Average Order Value" value="₹1,299" change="+5%" positive={true} />
                <MetricCard title="Conversion Rate" value="3.2%" change="+0.5%" positive={true} />
                <MetricCard title="Refund Rate" value="1.8%" change="-0.3%" positive={true} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <CoursePerformanceChart />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard title="Total Enrollments" value="5,432" change="+12%" positive={true} />
                <MetricCard title="Completion Rate" value="42%" change="+3%" positive={true} />
                <MetricCard title="Avg. Rating" value="4.7/5" change="+0.2" positive={true} />
                <MetricCard title="Avg. Engagement" value="68%" change="-2%" positive={false} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="affiliates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Affiliate Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <AffiliatePerformanceChart />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Affiliate Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard title="Total Affiliates" value="128" change="+15" positive={true} />
                <MetricCard title="Active Affiliates" value="98" change="+8" positive={true} />
                <MetricCard title="Conversion Rate" value="5.8%" change="+1.2%" positive={true} />
                <MetricCard title="Avg. Commission" value="₹4,250" change="+₹350" positive={true} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <RevenueChart />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <EnrollmentChart />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard title="Total Users" value="2,845" change="+245" positive={true} />
                <MetricCard title="Active Users" value="1,876" change="+132" positive={true} />
                <MetricCard title="Premium Users" value="986" change="+78" positive={true} />
                <MetricCard title="Churn Rate" value="2.3%" change="-0.5%" positive={true} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MetricCard({
  title,
  value,
  change,
  positive,
}: {
  title: string
  value: string
  change: string
  positive: boolean
}) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      <p className={`mt-1 text-xs ${positive ? "text-green-600" : "text-red-600"}`}>{change} from last period</p>
    </div>
  )
}
