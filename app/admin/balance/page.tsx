"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Eye,
  Coins,
  ArrowDownRight,
} from "lucide-react"
import { toast } from "sonner"

interface BalanceData {
  _id: string
  user: {
    _id: string
    name: string
    email: string
    image?: string
    referralCode?: string
  }
  available: number
  pending: number
  processing: number
  withdrawn: number
  lastSyncedAt: string
  createdAt: string
  updatedAt: string
  referredBy?: {
    _id: string
    name: string
    email: string
    referralCode: string
  }
  totalReferrals: number
  totalEarnings: number
  recentTransactions: Array<{
    _id: string
    amount: number
    type: string
    description: string
    createdAt: string
    status: string
  }>
}

interface BalanceStats {
  totalUsers: number
  totalAvailableBalance: number
  totalPendingBalance: number
  totalWithdrawnBalance: number
  totalEarnings: number
  activeAffiliates: number
}

export default function AdminBalancePage() {
  const [balances, setBalances] = useState<BalanceData[]>([])
  const [stats, setStats] = useState<BalanceStats>({
    totalUsers: 0,
    totalAvailableBalance: 0,
    totalPendingBalance: 0,
    totalWithdrawnBalance: 0,
    totalEarnings: 0,
    activeAffiliates: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("totalEarnings")
  const [selectedUser, setSelectedUser] = useState<BalanceData | null>(null)

  useEffect(() => {
    fetchBalanceData()
  }, [])

  const fetchBalanceData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/balance/overview")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch balance data")
      }

      setBalances(data.balances || [])
      setStats(
        data.stats || {
          totalUsers: 0,
          totalAvailableBalance: 0,
          totalPendingBalance: 0,
          totalWithdrawnBalance: 0,
          totalEarnings: 0,
          activeAffiliates: 0,
        },
      )
    } catch (error) {
      console.error("Error fetching balance data:", error)
      toast.error("Failed to load balance data: " + (error instanceof Error ? error.message : String(error)))
      // Set empty data on error
      setBalances([])
      setStats({
        totalUsers: 0,
        totalAvailableBalance: 0,
        totalPendingBalance: 0,
        totalWithdrawnBalance: 0,
        totalEarnings: 0,
        activeAffiliates: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  const syncBalances = async () => {
    try {
      const response = await fetch("/api/admin/sync-balances", { method: "POST" })
      if (!response.ok) {
        throw new Error("Failed to sync balances")
      }
      toast.success("Balances synced successfully")
      fetchBalanceData()
    } catch (error) {
      console.error("Error syncing balances:", error)
      toast.error("Failed to sync balances")
    }
  }

  const exportData = () => {
    const csvData = balances.map((balance) => ({
      Name: balance.user.name,
      Email: balance.user.email,
      ReferralCode: balance.user.referralCode || "N/A",
      Available: balance.available,
      Pending: balance.pending,
      Withdrawn: balance.withdrawn,
      TotalEarnings: balance.totalEarnings,
      TotalReferrals: balance.totalReferrals,
      ReferredBy: balance.referredBy?.name || "Direct",
      LastSync: new Date(balance.lastSyncedAt).toLocaleDateString(),
    }))

    const csv = [Object.keys(csvData[0]).join(","), ...csvData.map((row) => Object.values(row).join(","))].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `balance-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredBalances = balances
    .filter((balance) => {
      const matchesSearch =
        balance.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        balance.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (balance.user.referralCode && balance.user.referralCode.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesFilter =
        filterType === "all" ||
        (filterType === "active" && balance.totalEarnings > 0) ||
        (filterType === "pending" && balance.pending > 0) ||
        (filterType === "affiliates" && balance.totalReferrals > 0)

      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "totalEarnings":
          return b.totalEarnings - a.totalEarnings
        case "available":
          return b.available - a.available
        case "pending":
          return b.pending - a.pending
        case "referrals":
          return b.totalReferrals - a.totalReferrals
        case "name":
          return a.user.name.localeCompare(b.user.name)
        default:
          return 0
      }
    })

  const getBalanceStatusColor = (balance: BalanceData) => {
    if (balance.pending > 1000) return "bg-amber-100 text-amber-800 border-amber-200"
    if (balance.available > 5000) return "bg-green-100 text-green-800 border-green-200"
    if (balance.totalEarnings > 0) return "bg-blue-100 text-blue-800 border-blue-200"
    return "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getBalanceStatus = (balance: BalanceData) => {
    if (balance.pending > 1000) return "High Pending"
    if (balance.available > 5000) return "High Balance"
    if (balance.totalEarnings > 0) return "Active"
    return "Inactive"
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Balance Management</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Balance Management</h1>
          <p className="text-muted-foreground">Monitor and manage user balances and earnings</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={syncBalances} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Balances
          </Button>
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{stats.activeAffiliates} active affiliates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalAvailableBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Ready for withdrawal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Balance</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalPendingBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time earnings</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Balance Overview</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="referrals">Referral Network</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters & Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, or referral code..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="active">Active Earners</SelectItem>
                    <SelectItem value="pending">Pending Balance</SelectItem>
                    <SelectItem value="affiliates">Affiliates</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="totalEarnings">Total Earnings</SelectItem>
                    <SelectItem value="available">Available Balance</SelectItem>
                    <SelectItem value="pending">Pending Balance</SelectItem>
                    <SelectItem value="referrals">Referrals</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Balance Table */}
          <Card>
            <CardHeader>
              <CardTitle>User Balances ({filteredBalances.length})</CardTitle>
              <CardDescription>Detailed view of all user balances and earnings sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Pending</TableHead>
                      <TableHead>Withdrawn</TableHead>
                      <TableHead>Total Earnings</TableHead>
                      <TableHead>Referrals</TableHead>
                      <TableHead>Referred By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBalances.map((balance) => (
                      <TableRow key={balance._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={balance.user.image || "/placeholder.svg"} />
                              <AvatarFallback>{balance.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{balance.user.name}</div>
                              <div className="text-sm text-muted-foreground">{balance.user.email}</div>
                              {balance.user.referralCode && (
                                <div className="text-xs text-blue-600 font-mono">{balance.user.referralCode}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getBalanceStatusColor(balance)}>{getBalanceStatus(balance)}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Coins className="h-4 w-4 text-green-600" />
                            <span className="font-medium">₹{balance.available.toLocaleString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <span className="font-medium">₹{balance.pending.toLocaleString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <ArrowDownRight className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">₹{balance.withdrawn.toLocaleString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                            <span className="font-bold">₹{balance.totalEarnings.toLocaleString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-indigo-600" />
                            <span className="font-medium">{balance.totalReferrals}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {balance.referredBy ? (
                            <div className="text-sm">
                              <div className="font-medium">{balance.referredBy.name}</div>
                              <div className="text-muted-foreground font-mono text-xs">
                                {balance.referredBy.referralCode}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Direct</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => setSelectedUser(balance)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest balance transactions across all users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {balances
                  .flatMap(
                    (balance) =>
                      balance.recentTransactions?.map((tx) => ({
                        ...tx,
                        user: balance.user,
                      })) || [],
                  )
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 20)
                  .map((transaction) => (
                    <div key={transaction._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={transaction.user.image || "/placeholder.svg"} />
                          <AvatarFallback>{transaction.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{transaction.user.name}</div>
                          <div className="text-sm text-muted-foreground">{transaction.description}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-medium ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}
                        >
                          {transaction.type === "credit" ? "+" : "-"}₹{transaction.amount.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Referral Network</CardTitle>
              <CardDescription>View the referral relationships and earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {balances
                  .filter((balance) => balance.totalReferrals > 0)
                  .sort((a, b) => b.totalReferrals - a.totalReferrals)
                  .map((balance) => (
                    <div key={balance._id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={balance.user.image || "/placeholder.svg"} />
                            <AvatarFallback>{balance.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{balance.user.name}</div>
                            <div className="text-sm text-muted-foreground font-mono">{balance.user.referralCode}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">₹{balance.totalEarnings.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">Total Earnings</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="font-bold text-blue-600">{balance.totalReferrals}</div>
                          <div className="text-sm text-muted-foreground">Referrals</div>
                        </div>
                        <div>
                          <div className="font-bold text-green-600">₹{balance.available.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">Available</div>
                        </div>
                        <div>
                          <div className="font-bold text-amber-600">₹{balance.pending.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">Pending</div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto m-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedUser.user.image || "/placeholder.svg"} />
                    <AvatarFallback>{selectedUser.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{selectedUser.user.name}</CardTitle>
                    <CardDescription>{selectedUser.user.email}</CardDescription>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Available Balance</div>
                  <div className="text-2xl font-bold text-green-600">₹{selectedUser.available.toLocaleString()}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Pending Balance</div>
                  <div className="text-2xl font-bold text-amber-600">₹{selectedUser.pending.toLocaleString()}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Total Withdrawn</div>
                  <div className="text-2xl font-bold text-blue-600">₹{selectedUser.withdrawn.toLocaleString()}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Total Earnings</div>
                  <div className="text-2xl font-bold text-purple-600">
                    ₹{selectedUser.totalEarnings.toLocaleString()}
                  </div>
                </div>
              </div>

              {selectedUser.user.referralCode && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium mb-1">Referral Code</div>
                  <div className="font-mono text-lg">{selectedUser.user.referralCode}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {selectedUser.totalReferrals} people referred
                  </div>
                </div>
              )}

              {selectedUser.referredBy && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm font-medium mb-1">Referred By</div>
                  <div className="font-medium">{selectedUser.referredBy.name}</div>
                  <div className="font-mono text-sm text-muted-foreground">{selectedUser.referredBy.referralCode}</div>
                </div>
              )}

              <div>
                <div className="text-sm font-medium mb-3">Recent Transactions</div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedUser.recentTransactions?.map((transaction) => (
                    <div key={transaction._id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div
                        className={`font-medium ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}
                      >
                        {transaction.type === "credit" ? "+" : "-"}₹{transaction.amount.toLocaleString()}
                      </div>
                    </div>
                  )) || <div className="text-center text-muted-foreground py-4">No recent transactions</div>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
