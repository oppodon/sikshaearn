"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RefreshCw, Link, Users, TrendingUp, AlertCircle } from "lucide-react"
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
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Affiliate Dashboard</h2>
          <Skeleton className="h-10 w-10" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    <Skeleton className="h-4 w-24" />
                  </CardTitle>
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-7 w-20 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Affiliate Dashboard</h2>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <div className="flex justify-center mt-8">
          <Button onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? "Refreshing..." : "Try Again"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Affiliate Dashboard</h2>
        <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          <span className="sr-only">Refresh</span>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalEarnings || 0)}</div>
            <p className="text-xs text-muted-foreground">Lifetime earnings from all referrals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">₹</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.availableBalance || 0)}</div>
            <p className="text-xs text-muted-foreground">Ready to withdraw</p>
            {stats?.availableBalance ? (
              <Button className="mt-2 w-full" size="sm" onClick={handleWithdraw}>
                Withdraw Funds
              </Button>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReferrals || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.directReferrals || 0} direct + {stats?.tier2Referrals || 0} second-tier
            </p>
            {stats?.totalReferrals ? (
              <Button variant="outline" className="mt-2 w-full" size="sm" onClick={handleViewReferrals}>
                View Referrals
              </Button>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.conversionRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              From {stats?.linkClicks || 0} link {stats?.linkClicks === 1 ? "click" : "clicks"}
            </p>
            {stats?.totalReferrals ? (
              <Button variant="outline" className="mt-2 w-full" size="sm" onClick={handleViewLeaderboard}>
                View Leaderboard
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="balance" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="balance">Balance Details</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="balance">
          <Card>
            <CardHeader>
              <CardTitle>Balance Breakdown</CardTitle>
              <CardDescription>Your current balance status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Available</h4>
                    <p className="text-xl font-bold">{formatCurrency(stats?.availableBalance || 0)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Pending</h4>
                    <p className="text-xl font-bold">{formatCurrency(stats?.pendingBalance || 0)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Processing</h4>
                    <p className="text-xl font-bold">{formatCurrency(stats?.processingBalance || 0)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Withdrawn</h4>
                    <p className="text-xl font-bold">{formatCurrency(stats?.withdrawnBalance || 0)}</p>
                  </div>
                </div>
                {stats?.availableBalance ? (
                  <Button className="w-full mt-4" onClick={handleWithdraw}>
                    Withdraw Funds
                  </Button>
                ) : (
                  <Button className="w-full mt-4" variant="outline" disabled>
                    No Funds Available
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Referral Performance</CardTitle>
              <CardDescription>Your referral statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Direct Referrals</h4>
                    <p className="text-xl font-bold">{stats?.directReferrals || 0}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Second-Tier Referrals</h4>
                    <p className="text-xl font-bold">{stats?.tier2Referrals || 0}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Link Clicks</h4>
                    <p className="text-xl font-bold">{stats?.linkClicks || 0}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Conversion Rate</h4>
                    <p className="text-xl font-bold">{stats?.conversionRate || 0}%</p>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline" onClick={handleViewReferrals}>
                  View All Referrals
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
