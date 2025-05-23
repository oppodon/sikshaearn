"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Copy, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

interface AffiliateStats {
  directReferrals: number
  secondTierReferrals: number
  totalReferrals: number
  earnings: {
    pending: number
    available: number
    withdrawn: number
    processing: number
    total: number
    tier1: number
    tier2: number
  }
  conversionRate: string
  referralCode: string
  referralLink: string
  referralClicks: number
}

interface RecentTransaction {
  id: string
  date: string
  package: string
  amount: number
  commission: number
  customer: string
}

export default function AffiliateDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AffiliateStats | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/dashboard/affiliate-dashboard")
      return
    }

    if (status === "authenticated") {
      fetchAffiliateData()
    }
  }, [status, router])

  const fetchAffiliateData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/affiliate/stats")

      if (!response.ok) {
        throw new Error("Failed to fetch affiliate data")
      }

      const data = await response.json()
      console.log("Affiliate data:", data)
      setStats(data.stats)
      setRecentTransactions(data.recentTransactions || [])
    } catch (error) {
      console.error("Error fetching affiliate data:", error)
      toast({
        title: "Error",
        description: "Failed to load affiliate data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    try {
      setRefreshing(true)
      await fetchAffiliateData()
      toast({
        title: "Success",
        description: "Affiliate data refreshed successfully.",
      })
    } catch (error) {
      console.error("Error refreshing data:", error)
    } finally {
      setRefreshing(false)
    }
  }

  const copyReferralLink = () => {
    if (stats?.referralLink) {
      navigator.clipboard.writeText(stats.referralLink)
      toast({
        title: "Success",
        description: "Referral link copied to clipboard!",
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Affiliate Dashboard</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-8 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Affiliate Dashboard</h2>
        <Button variant="outline" onClick={refreshData} disabled={refreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">Total Earnings</div>
            <div className="text-2xl font-bold">{stats ? formatCurrency(stats.earnings.total) : "₹0"}</div>
            <div className="mt-1 text-xs text-muted-foreground">Lifetime earnings from all referrals</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">Available Balance</div>
            <div className="text-2xl font-bold">{stats ? formatCurrency(stats.earnings.available) : "₹0"}</div>
            <div className="mt-1 text-xs text-muted-foreground">Ready to withdraw</div>
            <Button className="w-full mt-3" size="sm" asChild>
              <Link href="/dashboard/withdrawal">Withdraw Funds</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">Total Referrals</div>
            <div className="text-2xl font-bold">{stats?.totalReferrals || 0}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              <span className="font-medium">{stats?.directReferrals || 0}</span> direct +
              <span className="font-medium"> {stats?.secondTierReferrals || 0}</span> second-tier
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">Conversion Rate</div>
            <div className="text-2xl font-bold">{stats?.conversionRate || 0}%</div>
            <div className="mt-1 text-xs text-muted-foreground">From {stats?.referralClicks || 0} link clicks</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Affiliate Link</CardTitle>
          <CardDescription>Share this link to earn commissions on referrals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-2 p-2 border rounded-md bg-muted/50">
              <span className="text-sm truncate">{stats?.referralLink || "Loading..."}</span>
              <Button variant="ghost" size="icon" className="ml-auto flex-shrink-0" onClick={copyReferralLink}>
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy</span>
              </Button>
            </div>
            <Button className="flex-shrink-0" asChild>
              <Link href="/dashboard/affiliate-link">
                Manage Links
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Earnings Breakdown</CardTitle>
            <CardDescription>Your earnings by status and tier</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="status">
              <TabsList className="mb-4">
                <TabsTrigger value="status">By Status</TabsTrigger>
                <TabsTrigger value="tier">By Tier</TabsTrigger>
              </TabsList>

              <TabsContent value="status">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Pending</span>
                        <span>{formatCurrency(stats?.earnings.pending || 0)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div
                          className="h-full bg-yellow-500 rounded-full"
                          style={{
                            width: `${stats?.earnings.total ? (stats.earnings.pending / stats.earnings.total) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Available</span>
                        <span>{formatCurrency(stats?.earnings.available || 0)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{
                            width: `${stats?.earnings.total ? (stats.earnings.available / stats.earnings.total) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Processing</span>
                        <span>{formatCurrency(stats?.earnings.processing || 0)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${stats?.earnings.total ? (stats.earnings.processing / stats.earnings.total) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Withdrawn</span>
                        <span>{formatCurrency(stats?.earnings.withdrawn || 0)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div
                          className="h-full bg-gray-500 rounded-full"
                          style={{
                            width: `${stats?.earnings.total ? (stats.earnings.withdrawn / stats.earnings.total) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tier">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Direct Referrals (65%)</span>
                        <span>{formatCurrency(stats?.earnings.tier1 || 0)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${stats?.earnings.total ? (stats.earnings.tier1 / stats.earnings.total) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Second-Tier Referrals (5%)</span>
                        <span>{formatCurrency(stats?.earnings.tier2 || 0)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{
                            width: `${stats?.earnings.total ? (stats.earnings.tier2 / stats.earnings.total) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your most recent affiliate earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No transactions yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Share your referral link to start earning</p>
                </div>
              ) : (
                recentTransactions.map((tx, i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{tx.package}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>{new Date(tx.date).toLocaleDateString()}</span>
                        <span className="mx-1">•</span>
                        <span>{tx.customer}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(tx.commission)}</p>
                      <p className="text-xs text-muted-foreground">
                        {((tx.commission / tx.amount) * 100).toFixed(0)}% of {formatCurrency(tx.amount)}
                      </p>
                    </div>
                  </div>
                ))
              )}

              <div className="flex justify-end pt-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/payouts">
                    View All Transactions
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
