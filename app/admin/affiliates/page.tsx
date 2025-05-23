import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Download, Filter, MoreHorizontal, Search, UserPlus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function AffiliatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold tracking-tight">Affiliate Management</h1>
        <div className="flex items-center gap-2">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Affiliate
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <h3 className="text-sm font-medium text-muted-foreground">Total Affiliates</h3>
              <p className="text-3xl font-bold">128</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <h3 className="text-sm font-medium text-muted-foreground">Active Affiliates</h3>
              <p className="text-3xl font-bold">98</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <h3 className="text-sm font-medium text-muted-foreground">Total Commissions</h3>
              <p className="text-3xl font-bold">₹245,890</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <h3 className="text-sm font-medium text-muted-foreground">Pending Payouts</h3>
              <p className="text-3xl font-bold">₹32,450</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Affiliates</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search affiliates..."
                className="w-full pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4 grid w-full grid-cols-4">
              <TabsTrigger value="all">All Affiliates</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Referrals</TableHead>
                    <TableHead>Earnings</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affiliates.map((affiliate) => (
                    <TableRow key={affiliate.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={affiliate.avatar || "/placeholder.svg"} alt={affiliate.name} />
                            <AvatarFallback>
                              {affiliate.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{affiliate.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{affiliate.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            affiliate.status === "active"
                              ? "border-green-200 bg-green-50 text-green-700"
                              : affiliate.status === "pending"
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : "border-gray-200 bg-gray-50 text-gray-700"
                          }
                        >
                          {affiliate.status.charAt(0).toUpperCase() + affiliate.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{affiliate.referrals}</TableCell>
                      <TableCell>₹{affiliate.earnings}</TableCell>
                      <TableCell>{affiliate.joined}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>Edit Affiliate</DropdownMenuItem>
                            <DropdownMenuItem>View Earnings</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Deactivate Affiliate</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing <strong>1-10</strong> of <strong>128</strong> affiliates
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

const affiliates = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    status: "active",
    referrals: 24,
    earnings: 12450,
    joined: "Jan 15, 2023",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 2,
    name: "Priya Patel",
    email: "priya.patel@example.com",
    status: "active",
    referrals: 18,
    earnings: 9800,
    joined: "Feb 22, 2023",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 3,
    name: "Amit Kumar",
    email: "amit.kumar@example.com",
    status: "pending",
    referrals: 0,
    earnings: 0,
    joined: "Mar 10, 2023",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 4,
    name: "Neha Gupta",
    email: "neha.gupta@example.com",
    status: "active",
    referrals: 15,
    earnings: 7500,
    joined: "Apr 05, 2023",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 5,
    name: "Vikram Singh",
    email: "vikram.singh@example.com",
    status: "inactive",
    referrals: 3,
    earnings: 1200,
    joined: "May 18, 2023",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 6,
    name: "Ananya Desai",
    email: "ananya.desai@example.com",
    status: "active",
    referrals: 21,
    earnings: 10500,
    joined: "Jun 30, 2023",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 7,
    name: "Rajesh Khanna",
    email: "rajesh.khanna@example.com",
    status: "active",
    referrals: 12,
    earnings: 6000,
    joined: "Jul 12, 2023",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 8,
    name: "Meera Joshi",
    email: "meera.joshi@example.com",
    status: "active",
    referrals: 9,
    earnings: 4500,
    joined: "Aug 05, 2023",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 9,
    name: "Arjun Reddy",
    email: "arjun.reddy@example.com",
    status: "inactive",
    referrals: 2,
    earnings: 1000,
    joined: "Sep 20, 2023",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 10,
    name: "Kavita Sharma",
    email: "kavita.sharma@example.com",
    status: "active",
    referrals: 16,
    earnings: 8000,
    joined: "Oct 14, 2023",
    avatar: "/placeholder-user.jpg",
  },
]
