"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Download, Filter, UserPlus, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

interface Affiliate {
  _id: string
  name: string
  email: string
  status: string
  referrals: number
  earnings: number
  joinedAt: string
}

export default function AffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalCommissions: 0,
    pendingPayouts: 0,
  })

  useEffect(() => {
    const fetchAffiliates = async () => {
      try {
        // This would be replaced with a real API call
        // const response = await fetch("/api/admin/affiliates")
        // const data = await response.json()

        // Mock data for demonstration
        const mockAffiliates = [
          {
            _id: "aff1",
            name: "Rahul Sharma",
            email: "rahul.sharma@example.com",
            status: "active",
            referrals: 24,
            earnings: 12450,
            joinedAt: "2023-01-15T00:00:00Z",
          },
          {
            _id: "aff2",
            name: "Priya Patel",
            email: "priya.patel@example.com",
            status: "active",
            referrals: 18,
            earnings: 9800,
            joinedAt: "2023-02-22T00:00:00Z",
          },
          {
            _id: "aff3",
            name: "Amit Kumar",
            email: "amit.kumar@example.com",
            status: "pending",
            referrals: 0,
            earnings: 0,
            joinedAt: "2023-03-10T00:00:00Z",
          },
          {
            _id: "aff4",
            name: "Sneha Gupta",
            email: "sneha.gupta@example.com",
            status: "inactive",
            referrals: 5,
            earnings: 3200,
            joinedAt: "2023-01-05T00:00:00Z",
          },
          {
            _id: "aff5",
            name: "Vikram Singh",
            email: "vikram.singh@example.com",
            status: "active",
            referrals: 32,
            earnings: 18700,
            joinedAt: "2022-11-12T00:00:00Z",
          },
        ]

        setAffiliates(mockAffiliates)

        // Calculate stats
        const active = mockAffiliates.filter((a) => a.status === "active").length
        const totalEarnings = mockAffiliates.reduce((sum, a) => sum + a.earnings, 0)

        setStats({
          total: mockAffiliates.length,
          active: active,
          totalCommissions: totalEarnings,
          pendingPayouts: Math.round(totalEarnings * 0.15), // 15% of total earnings for demo
        })
      } catch (error) {
        console.error("Error fetching affiliates:", error)
        toast.error("Failed to load affiliate data")
      } finally {
        setLoading(false)
      }
    }

    fetchAffiliates()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
            Pending
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
            Inactive
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Affiliate Management</h1>
        <div className="grid gap-6 md:grid-cols-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Affiliate Management</h1>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" /> Add New Affiliate
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Affiliates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Affiliates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalCommissions.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.pendingPayouts.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Affiliates</h2>
        <div className="flex items-center space-x-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search affiliates..." className="w-full bg-background pl-8" />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Affiliates</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">ID</TableHead>
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
                    <TableRow key={affiliate._id}>
                      <TableCell className="font-medium">
                        {affiliate.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </TableCell>
                      <TableCell>{affiliate.name}</TableCell>
                      <TableCell>{affiliate.email}</TableCell>
                      <TableCell>{getStatusBadge(affiliate.status)}</TableCell>
                      <TableCell>{affiliate.referrals}</TableCell>
                      <TableCell>₹{affiliate.earnings.toLocaleString()}</TableCell>
                      <TableCell>{formatDate(affiliate.joinedAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Referrals</TableHead>
                    <TableHead>Earnings</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affiliates
                    .filter((a) => a.status === "active")
                    .map((affiliate) => (
                      <TableRow key={affiliate._id}>
                        <TableCell className="font-medium">
                          {affiliate.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </TableCell>
                        <TableCell>{affiliate.name}</TableCell>
                        <TableCell>{affiliate.email}</TableCell>
                        <TableCell>{affiliate.referrals}</TableCell>
                        <TableCell>₹{affiliate.earnings.toLocaleString()}</TableCell>
                        <TableCell>{formatDate(affiliate.joinedAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affiliates
                    .filter((a) => a.status === "pending")
                    .map((affiliate) => (
                      <TableRow key={affiliate._id}>
                        <TableCell className="font-medium">
                          {affiliate.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </TableCell>
                        <TableCell>{affiliate.name}</TableCell>
                        <TableCell>{affiliate.email}</TableCell>
                        <TableCell>{formatDate(affiliate.joinedAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactive">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Referrals</TableHead>
                    <TableHead>Earnings</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affiliates
                    .filter((a) => a.status === "inactive")
                    .map((affiliate) => (
                      <TableRow key={affiliate._id}>
                        <TableCell className="font-medium">
                          {affiliate.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </TableCell>
                        <TableCell>{affiliate.name}</TableCell>
                        <TableCell>{affiliate.email}</TableCell>
                        <TableCell>{affiliate.referrals}</TableCell>
                        <TableCell>₹{affiliate.earnings.toLocaleString()}</TableCell>
                        <TableCell>{formatDate(affiliate.joinedAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
