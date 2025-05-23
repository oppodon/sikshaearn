"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Users, TrendingUp } from "lucide-react"

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
}

export default function LeaderboardPage() {
  const [earningsLeaderboard, setEarningsLeaderboard] = useState<LeaderboardEntry[]>([])
  const [referralsLeaderboard, setReferralsLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("all")

  useEffect(() => {
    fetchLeaderboardData()
  }, [period])

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true)

      // Fetch earnings leaderboard
      const earningsResponse = await fetch(`/api/leaderboard/earnings?period=${period}&limit=10`)
      if (earningsResponse.ok) {
        const earningsData = await earningsResponse.json()
        setEarningsLeaderboard(earningsData.leaderboard)
      }

      // Fetch referrals leaderboard
      const referralsResponse = await fetch("/api/leaderboard/referrals?limit=10")
      if (referralsResponse.ok) {
        const referralsData = await referralsResponse.json()
        setReferralsLeaderboard(referralsData.leaderboard)
      }
    } catch (error) {
      console.error("Error fetching leaderboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount = 0) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case 2:
        return "bg-gray-100 text-gray-800 border-gray-200"
      case 3:
        return "bg-amber-100 text-amber-800 border-amber-200"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Affiliate Leaderboard</h2>
        </div>
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Affiliate Leaderboard</h2>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="earnings" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
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
          <Card>
            <CardHeader>
              <CardTitle>Top Affiliate Earners</CardTitle>
              <CardDescription>
                {period === "all"
                  ? "Affiliates who have earned the most commission all time"
                  : period === "month"
                    ? "Affiliates who have earned the most commission this month"
                    : "Affiliates who have earned the most commission this week"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-12 gap-4 p-4 font-medium">
                  <div className="col-span-1">Rank</div>
                  <div className="col-span-3">Affiliate</div>
                  <div className="col-span-2">Username</div>
                  <div className="col-span-2">Transactions</div>
                  <div className="col-span-2">Direct</div>
                  <div className="col-span-2">Total Earnings</div>
                </div>

                {earningsLeaderboard.length === 0 ? (
                  <div className="p-8 text-center">
                    <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No earnings data available for this period</p>
                  </div>
                ) : (
                  earningsLeaderboard.map((affiliate) => (
                    <div key={affiliate.id} className="grid grid-cols-12 gap-4 border-t p-4 items-center">
                      <div className="col-span-1">
                        <Badge
                          variant="outline"
                          className={`w-8 h-8 rounded-full flex items-center justify-center p-0 ${getRankBadgeColor(affiliate.rank)}`}
                        >
                          {affiliate.rank}
                        </Badge>
                      </div>
                      <div className="col-span-3 flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={affiliate.image || `/placeholder.svg?height=32&width=32`}
                            alt={affiliate.name}
                          />
                          <AvatarFallback>{affiliate.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium truncate">{affiliate.name}</span>
                      </div>
                      <div className="col-span-2 text-muted-foreground">@{affiliate.username}</div>
                      <div className="col-span-2">{affiliate.transactionCount} sales</div>
                      <div className="col-span-2">{formatCurrency(affiliate.directEarnings)}</div>
                      <div className="col-span-2 font-semibold">{formatCurrency(affiliate.totalEarnings)}</div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals">
          <Card>
            <CardHeader>
              <CardTitle>Most Referrals</CardTitle>
              <CardDescription>Affiliates who have referred the most users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-12 gap-4 p-4 font-medium">
                  <div className="col-span-1">Rank</div>
                  <div className="col-span-3">Affiliate</div>
                  <div className="col-span-3">Username</div>
                  <div className="col-span-5">Total Referrals</div>
                </div>

                {referralsLeaderboard.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No referral data available yet</p>
                  </div>
                ) : (
                  referralsLeaderboard.map((affiliate) => (
                    <div key={affiliate.id} className="grid grid-cols-12 gap-4 border-t p-4 items-center">
                      <div className="col-span-1">
                        <Badge
                          variant="outline"
                          className={`w-8 h-8 rounded-full flex items-center justify-center p-0 ${getRankBadgeColor(affiliate.rank)}`}
                        >
                          {affiliate.rank}
                        </Badge>
                      </div>
                      <div className="col-span-3 flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={affiliate.image || `/placeholder.svg?height=32&width=32`}
                            alt={affiliate.name}
                          />
                          <AvatarFallback>{affiliate.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium truncate">{affiliate.name}</span>
                      </div>
                      <div className="col-span-3 text-muted-foreground">@{affiliate.username}</div>
                      <div className="col-span-5">
                        <div className="flex items-center gap-2">
                          <div className="h-2 bg-primary/20 rounded-full w-full max-w-xs">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{
                                width: `${Math.min(100, (affiliate.referrals! / (referralsLeaderboard[0]?.referrals || 1)) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="font-semibold">{affiliate.referrals}</span>
                        </div>
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
  )
}
