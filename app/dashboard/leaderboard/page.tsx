"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, Users, TrendingUp, Medal, Award, Crown, RefreshCw } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface LeaderboardEntry {
  rank: number
  id: string
  name: string
  username: string
  image?: string
  email: string
  totalEarnings?: number
  directEarnings?: number
  tier2Earnings?: number
  transactionCount?: number
  referrals?: number
  totalSales?: number
  totalCommission?: number
}

export default function LeaderboardPage() {
  const [earningsLeaderboard, setEarningsLeaderboard] = useState<LeaderboardEntry[]>([])
  const [referralsLeaderboard, setReferralsLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("all")
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchLeaderboardData()
  }, [period])

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true)
      console.log("Fetching leaderboard data for period:", period)

      const earningsResponse = await fetch(`/api/leaderboard/earnings?period=${period}&limit=20`)
      if (earningsResponse.ok) {
        const earningsData = await earningsResponse.json()
        console.log("Earnings leaderboard data:", earningsData)
        setEarningsLeaderboard(earningsData.leaderboard || [])
      } else {
        console.error("Failed to fetch earnings leaderboard:", await earningsResponse.text())
      }

      const referralsResponse = await fetch("/api/leaderboard/referrals?limit=20")
      if (referralsResponse.ok) {
        const referralsData = await referralsResponse.json()
        console.log("Referrals leaderboard data:", referralsData)
        setReferralsLeaderboard(referralsData.leaderboard || [])
      } else {
        console.error("Failed to fetch referrals leaderboard:", await referralsResponse.text())
      }
    } catch (error) {
      console.error("Error fetching leaderboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchLeaderboardData()
    setRefreshing(false)
  }

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case 2:
        return "bg-gray-100 text-gray-800 border-gray-200"
      case 3:
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-50 text-gray-600 border-gray-200"
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-4 w-4 text-yellow-600" />
      case 2:
        return <Medal className="h-4 w-4 text-gray-600" />
      case 3:
        return <Award className="h-4 w-4 text-orange-600" />
      default:
        return null
    }
  }

  const renderSkeletonRows = () => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <div key={index} className="grid grid-cols-12 gap-4 border-t border-gray-100 p-4 items-center">
          <div className="col-span-1">
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="col-span-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="col-span-2">
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="col-span-2">
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="col-span-2">
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="col-span-2">
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Affiliate Leaderboard</h2>
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px] border-gray-300">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="border-gray-300"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="earnings" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100">
            <TabsTrigger value="earnings">
              <Trophy className="h-4 w-4 mr-2" />
              Top Earners
            </TabsTrigger>
            <TabsTrigger value="referrals">
              <Users className="h-4 w-4 mr-2" />
              Most Referrals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="earnings">
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="border-b border-gray-100 bg-gray-50">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Top Affiliate Earners
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {period === "all"
                    ? "Affiliates who have earned the most commission all time"
                    : period === "month"
                      ? "Affiliates who have earned the most commission this month"
                      : "Affiliates who have earned the most commission this week"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="rounded-md border border-gray-200">
                  <div className="grid grid-cols-12 gap-4 p-4 font-medium bg-gray-50 border-b border-gray-100">
                    <div className="col-span-1 text-gray-700">Rank</div>
                    <div className="col-span-3 text-gray-700">Affiliate</div>
                    <div className="col-span-2 text-gray-700">Username</div>
                    <div className="col-span-2 text-gray-700">Transactions</div>
                    <div className="col-span-2 text-gray-700">Direct</div>
                    <div className="col-span-2 text-gray-700">Total Earnings</div>
                  </div>

                  {loading ? (
                    renderSkeletonRows()
                  ) : earningsLeaderboard.length === 0 ? (
                    <div className="p-12 text-center">
                      <TrendingUp className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No earnings data available</h3>
                      <p className="text-gray-600">No earnings data available for this period</p>
                    </div>
                  ) : (
                    earningsLeaderboard.map((affiliate) => (
                      <div
                        key={affiliate.id}
                        className={`grid grid-cols-12 gap-4 border-t border-gray-100 p-4 items-center hover:bg-gray-50 transition-colors ${
                          affiliate.rank <= 3 ? "bg-gray-50/50" : ""
                        }`}
                      >
                        <div className="col-span-1">
                          <Badge
                            variant="outline"
                            className={`w-8 h-8 rounded-full flex items-center justify-center p-0 ${getRankBadgeColor(
                              affiliate.rank,
                            )}`}
                          >
                            {getRankIcon(affiliate.rank) || affiliate.rank}
                          </Badge>
                        </div>
                        <div className="col-span-3 flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={affiliate.image || `/placeholder.svg?height=32&width=32`}
                              alt={affiliate.name}
                            />
                            <AvatarFallback className="bg-gray-100 text-gray-600">
                              {affiliate.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-gray-900 truncate">{affiliate.name}</span>
                        </div>
                        <div className="col-span-2 text-gray-600">@{affiliate.username}</div>
                        <div className="col-span-2 text-gray-900">{affiliate.transactionCount || 0} sales</div>
                        <div className="col-span-2 text-gray-900">{formatCurrency(affiliate.directEarnings || 0)}</div>
                        <div className="col-span-2 font-semibold text-gray-900">
                          {formatCurrency(affiliate.totalEarnings || 0)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrals">
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="border-b border-gray-100 bg-gray-50">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Users className="h-5 w-5 text-blue-600" />
                  Most Referrals
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Affiliates who have referred the most successful purchases
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="rounded-md border border-gray-200">
                  <div className="grid grid-cols-12 gap-4 p-4 font-medium bg-gray-50 border-b border-gray-100">
                    <div className="col-span-1 text-gray-700">Rank</div>
                    <div className="col-span-3 text-gray-700">Affiliate</div>
                    <div className="col-span-2 text-gray-700">Username</div>
                    <div className="col-span-2 text-gray-700">Referrals</div>
                    <div className="col-span-2 text-gray-700">Total Sales</div>
                    <div className="col-span-2 text-gray-700">Commission</div>
                  </div>

                  {loading ? (
                    renderSkeletonRows()
                  ) : referralsLeaderboard.length === 0 ? (
                    <div className="p-12 text-center">
                      <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No referral data available</h3>
                      <p className="text-gray-600">No referral data available yet</p>
                    </div>
                  ) : (
                    referralsLeaderboard.map((affiliate) => (
                      <div
                        key={affiliate.id}
                        className={`grid grid-cols-12 gap-4 border-t border-gray-100 p-4 items-center hover:bg-gray-50 transition-colors ${
                          affiliate.rank <= 3 ? "bg-gray-50/50" : ""
                        }`}
                      >
                        <div className="col-span-1">
                          <Badge
                            variant="outline"
                            className={`w-8 h-8 rounded-full flex items-center justify-center p-0 ${getRankBadgeColor(
                              affiliate.rank,
                            )}`}
                          >
                            {getRankIcon(affiliate.rank) || affiliate.rank}
                          </Badge>
                        </div>
                        <div className="col-span-3 flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={affiliate.image || `/placeholder.svg?height=32&width=32`}
                              alt={affiliate.name}
                            />
                            <AvatarFallback className="bg-gray-100 text-gray-600">
                              {affiliate.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-gray-900 truncate">{affiliate.name}</span>
                        </div>
                        <div className="col-span-2 text-gray-600">@{affiliate.username}</div>
                        <div className="col-span-2 font-semibold text-gray-900">{affiliate.referrals || 0}</div>
                        <div className="col-span-2 text-gray-900">{formatCurrency(affiliate.totalSales || 0)}</div>
                        <div className="col-span-2 font-semibold text-gray-900">
                          {formatCurrency(affiliate.totalCommission || 0)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
