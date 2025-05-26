"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, Users, TrendingUp, Medal, Award, Crown, RefreshCw, Star, Zap } from "lucide-react"
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
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg"
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white shadow-lg"
      case 3:
        return "bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-lg"
      default:
        return "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300"
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-200" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-200" />
      case 3:
        return <Award className="h-5 w-5 text-orange-200" />
      default:
        return <Star className="h-4 w-4 text-blue-600" />
    }
  }

  const getTopThreeCard = (affiliate: LeaderboardEntry, type: "earnings" | "referrals") => (
    <div
      key={affiliate.id}
      className={`relative overflow-hidden rounded-2xl p-6 ${
        affiliate.rank === 1
          ? "bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-white"
          : affiliate.rank === 2
            ? "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 text-white"
            : "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 text-white"
      } transform hover:scale-105 transition-all duration-300 shadow-xl`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 opacity-20">{getRankIcon(affiliate.rank)}</div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-16 w-16 border-4 border-white/30">
                <AvatarImage src={affiliate.image || `/placeholder.svg?height=64&width=64`} alt={affiliate.name} />
                <AvatarFallback className="bg-white/20 text-white text-lg font-bold">
                  {affiliate.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -top-2 -right-2 bg-white rounded-full p-1">{getRankIcon(affiliate.rank)}</div>
            </div>
            <div>
              <h3 className="font-bold text-xl">{affiliate.name}</h3>
              <p className="text-white/80">@{affiliate.username}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">#{affiliate.rank}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-white/80 text-sm">{type === "earnings" ? "Total Earnings" : "Referrals"}</div>
            <div className="text-2xl font-bold">
              {type === "earnings" ? formatCurrency(affiliate.totalEarnings || 0) : affiliate.referrals || 0}
            </div>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-white/80 text-sm">{type === "earnings" ? "Transactions" : "Total Sales"}</div>
            <div className="text-2xl font-bold">
              {type === "earnings"
                ? `${affiliate.transactionCount || 0} sales`
                : formatCurrency(affiliate.totalSales || 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSkeletonRows = () => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium">
            <Trophy className="h-4 w-4" />
            Affiliate Champions
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Leaderboard
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Celebrating our top performers and their incredible achievements in the affiliate program
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-700">Performance Period</span>
          </div>
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px] border-gray-200 rounded-xl">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">🏆 All Time</SelectItem>
                <SelectItem value="month">📅 This Month</SelectItem>
                <SelectItem value="week">⚡ This Week</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="rounded-xl border-gray-200 hover:bg-blue-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="earnings" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-white rounded-2xl p-2 shadow-lg border border-gray-100">
            <TabsTrigger
              value="earnings"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Top Earners
            </TabsTrigger>
            <TabsTrigger
              value="referrals"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
            >
              <Users className="h-4 w-4 mr-2" />
              Most Referrals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="earnings" className="space-y-8">
            {/* Top 3 Cards */}
            {!loading && earningsLeaderboard.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {earningsLeaderboard.slice(0, 3).map((affiliate) => getTopThreeCard(affiliate, "earnings"))}
              </div>
            )}

            {/* Rest of the leaderboard */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-xl">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Trophy className="h-6 w-6" />
                  Complete Rankings
                </CardTitle>
                <CardDescription className="text-blue-100">
                  {period === "all"
                    ? "All-time affiliate earnings champions"
                    : period === "month"
                      ? "This month's top performers"
                      : "This week's rising stars"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <div className="space-y-4">{renderSkeletonRows()}</div>
                ) : earningsLeaderboard.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-12 w-12 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
                    <p className="text-gray-600">No earnings data available for this period</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {earningsLeaderboard.slice(3).map((affiliate) => (
                      <div
                        key={affiliate.id}
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Badge
                            className={`w-10 h-10 rounded-full flex items-center justify-center p-0 ${getRankBadgeColor(affiliate.rank)}`}
                          >
                            {affiliate.rank <= 3 ? getRankIcon(affiliate.rank) : affiliate.rank}
                          </Badge>
                          <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                            <AvatarImage
                              src={affiliate.image || `/placeholder.svg?height=48&width=48`}
                              alt={affiliate.name}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white font-bold">
                              {affiliate.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-gray-900">{affiliate.name}</div>
                            <div className="text-sm text-gray-600">@{affiliate.username}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-gray-900">
                            {formatCurrency(affiliate.totalEarnings || 0)}
                          </div>
                          <div className="text-sm text-gray-600">{affiliate.transactionCount || 0} sales</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrals" className="space-y-8">
            {/* Top 3 Cards */}
            {!loading && referralsLeaderboard.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {referralsLeaderboard.slice(0, 3).map((affiliate) => getTopThreeCard(affiliate, "referrals"))}
              </div>
            )}

            {/* Rest of the leaderboard */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-xl">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Users className="h-6 w-6" />
                  Referral Champions
                </CardTitle>
                <CardDescription className="text-green-100">
                  Affiliates who have built the strongest networks
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <div className="space-y-4">{renderSkeletonRows()}</div>
                ) : referralsLeaderboard.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-12 w-12 text-green-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
                    <p className="text-gray-600">No referral data available yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {referralsLeaderboard.slice(3).map((affiliate) => (
                      <div
                        key={affiliate.id}
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Badge
                            className={`w-10 h-10 rounded-full flex items-center justify-center p-0 ${getRankBadgeColor(affiliate.rank)}`}
                          >
                            {affiliate.rank <= 3 ? getRankIcon(affiliate.rank) : affiliate.rank}
                          </Badge>
                          <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                            <AvatarImage
                              src={affiliate.image || `/placeholder.svg?height=48&width=48`}
                              alt={affiliate.name}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-green-400 to-blue-400 text-white font-bold">
                              {affiliate.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-gray-900">{affiliate.name}</div>
                            <div className="text-sm text-gray-600">@{affiliate.username}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-gray-900">{affiliate.referrals || 0} referrals</div>
                          <div className="text-sm text-gray-600">{formatCurrency(affiliate.totalCommission || 0)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
