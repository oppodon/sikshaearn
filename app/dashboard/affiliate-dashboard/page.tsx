"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RefreshCw, Users, TrendingUp, AlertCircle, DollarSign, Target, Zap } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface AffiliateStats {
  totalEarnings: number
  availableBalance: number
  pendingBalance: number
  processingBalance: number
  withdrawnBalance: number
  totalReferrals: number
  directReferrals: number
  tier2Referrals: number
  conversionRate: number
  linkClicks: number
}

export default function AffiliateDashboardPage() {
  const [stats, setStats] = useState<AffiliateStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchAffiliateData()
  }, [])

  const fetchAffiliateData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("Fetching affiliate stats...")

      const response = await fetch("/api/affiliate/stats")

      if (!response.ok) {
        console.error("Failed to fetch affiliate data:", response.status, response.statusText)
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error("Failed to fetch affiliate data")
      }

      const data = await response.json()
      console.log("Affiliate stats received:", data)
      setStats(data)
    } catch (error) {
      console.error("Error fetching affiliate data:", error)
      setError("Failed to load affiliate data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAffiliateData()
    setRefreshing(false)
  }

  const handleWithdraw = () => {
    router.push("/dashboard/withdrawal")
  }

  const handleViewReferrals = () => {
    router.push("/dashboard/my-affiliates")
  }

  const handleViewLeaderboard = () => {
    router.push("/dashboard/leaderboard")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="shadow-lg border-0">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-8 rounded-lg" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-20 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Affiliate Dashboard</h1>
              <p className="text-gray-600">Manage your affiliate performance and earnings</p>
            </div>
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing} className="shadow-md">
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>

          <Alert className="border-red-200 bg-red-50 shadow-lg">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Error</AlertTitle>
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>

          <div className="flex justify-center mt-8">
            <Button onClick={handleRefresh} disabled={refreshing} className="bg-blue-600 hover:bg-blue-700 shadow-lg">
              {refreshing ? "Refreshing..." : "Try Again"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Affiliate Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your affiliate performance and earnings</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            className="shadow-md hover:shadow-lg transition-shadow"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-green-800">Total Earnings</CardTitle>
              <div className="p-2 bg-green-500 rounded-lg shadow-md">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{formatCurrency(stats?.totalEarnings || 0)}</div>
              <p className="text-xs text-green-700 mt-1">Lifetime earnings from all referrals</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-blue-800">Available Balance</CardTitle>
              <div className="p-2 bg-blue-500 rounded-lg shadow-md">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{formatCurrency(stats?.availableBalance || 0)}</div>
              <p className="text-xs text-blue-700 mt-1">Ready to withdraw</p>
              {stats?.availableBalance ? (
                <Button
                  className="mt-3 w-full bg-blue-600 hover:bg-blue-700 shadow-md"
                  size="sm"
                  onClick={handleWithdraw}
                >
                  Withdraw Funds
                </Button>
              ) : null}
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-violet-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-purple-800">Total Referrals</CardTitle>
              <div className="p-2 bg-purple-500 rounded-lg shadow-md">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{stats?.totalReferrals || 0}</div>
              <p className="text-xs text-purple-700 mt-1">
                {stats?.directReferrals || 0} direct + {stats?.tier2Referrals || 0} second-tier
              </p>
              {stats?.totalReferrals ? (
                <Button
                  variant="outline"
                  className="mt-3 w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                  size="sm"
                  onClick={handleViewReferrals}
                >
                  View Referrals
                </Button>
              ) : null}
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-amber-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-orange-800">Conversion Rate</CardTitle>
              <div className="p-2 bg-orange-500 rounded-lg shadow-md">
                <Target className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{stats?.conversionRate || 0}%</div>
              <p className="text-xs text-orange-700 mt-1">
                From {stats?.linkClicks || 0} link {stats?.linkClicks === 1 ? "click" : "clicks"}
              </p>
              {stats?.totalReferrals ? (
                <Button
                  variant="outline"
                  className="mt-3 w-full border-orange-200 text-orange-700 hover:bg-orange-50"
                  size="sm"
                  onClick={handleViewLeaderboard}
                >
                  View Leaderboard
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <Tabs defaultValue="balance" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 p-1 rounded-lg">
                <TabsTrigger
                  value="balance"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Balance Details
                </TabsTrigger>
                <TabsTrigger
                  value="performance"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Performance
                </TabsTrigger>
              </TabsList>

              <TabsContent value="balance">
                <Card className="border-0 bg-gradient-to-br from-gray-50 to-blue-50 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Balance Breakdown
                    </CardTitle>
                    <CardDescription className="text-blue-100">Your current balance status</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200">
                          <h4 className="text-sm font-medium text-green-800 mb-2">Available</h4>
                          <p className="text-2xl font-bold text-green-900">
                            {formatCurrency(stats?.availableBalance || 0)}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-50 to-amber-100 border border-yellow-200">
                          <h4 className="text-sm font-medium text-yellow-800 mb-2">Pending</h4>
                          <p className="text-2xl font-bold text-yellow-900">
                            {formatCurrency(stats?.pendingBalance || 0)}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200">
                          <h4 className="text-sm font-medium text-blue-800 mb-2">Processing</h4>
                          <p className="text-2xl font-bold text-blue-900">
                            {formatCurrency(stats?.processingBalance || 0)}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-gradient-to-br from-gray-50 to-slate-100 border border-gray-200">
                          <h4 className="text-sm font-medium text-gray-800 mb-2">Withdrawn</h4>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(stats?.withdrawnBalance || 0)}
                          </p>
                        </div>
                      </div>
                      {stats?.availableBalance ? (
                        <Button
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg transform hover:scale-105 transition-all duration-300"
                          onClick={handleWithdraw}
                        >
                          <DollarSign className="mr-2 h-4 w-4" />
                          Withdraw Funds
                        </Button>
                      ) : (
                        <Button className="w-full" variant="outline" disabled>
                          No Funds Available
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance">
                <Card className="border-0 bg-gradient-to-br from-gray-50 to-purple-50 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Referral Performance
                    </CardTitle>
                    <CardDescription className="text-purple-100">Your referral statistics</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200">
                          <h4 className="text-sm font-medium text-blue-800 mb-2">Direct Referrals</h4>
                          <p className="text-2xl font-bold text-blue-900">{stats?.directReferrals || 0}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-200">
                          <h4 className="text-sm font-medium text-purple-800 mb-2">Second-Tier Referrals</h4>
                          <p className="text-2xl font-bold text-purple-900">{stats?.tier2Referrals || 0}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-amber-100 border border-orange-200">
                          <h4 className="text-sm font-medium text-orange-800 mb-2">Link Clicks</h4>
                          <p className="text-2xl font-bold text-orange-900">{stats?.linkClicks || 0}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200">
                          <h4 className="text-sm font-medium text-green-800 mb-2">Conversion Rate</h4>
                          <p className="text-2xl font-bold text-green-900">{stats?.conversionRate || 0}%</p>
                        </div>
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 shadow-lg transform hover:scale-105 transition-all duration-300"
                        onClick={handleViewReferrals}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        View All Referrals
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
