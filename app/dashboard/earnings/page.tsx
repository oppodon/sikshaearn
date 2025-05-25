"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, TrendingUp, Users, DollarSign } from "lucide-react"
import { toast } from "sonner"

interface Earning {
  id: string
  amount: number
  tier: number
  description: string
  packageTitle: string
  customerName: string
  customerEmail: string
  commissionRate: number
  date: string
  status: string
}

interface EarningsSummary {
  totalEarnings: number
  tier1Earnings: number
  tier2Earnings: number
  totalTransactions: number
}

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<Earning[]>([])
  const [summary, setSummary] = useState<EarningsSummary | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchEarnings = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/affiliate/earnings")
      const data = await response.json()

      if (response.ok) {
        setEarnings(data.earnings)
        setSummary(data.summary)
      } else {
        toast.error(data.error || "Failed to fetch earnings")
      }
    } catch (error) {
      console.error("Error fetching earnings:", error)
      toast.error("Failed to fetch earnings")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEarnings()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="shadow-sm border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Earnings Details</h1>
            <p className="text-gray-600">Track your commission earnings from referrals</p>
          </div>
          <Button onClick={fetchEarnings} variant="outline" size="sm" className="border-gray-300">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {summary && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Earnings</CardTitle>
                <div className="p-2 bg-green-50 rounded-lg">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalEarnings)}</div>
                <p className="text-xs text-gray-500">Lifetime earnings</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Direct Referrals</CardTitle>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(summary.tier1Earnings)}</div>
                <p className="text-xs text-gray-500">65% commission</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Second-tier</CardTitle>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(summary.tier2Earnings)}</div>
                <p className="text-xs text-gray-500">5% commission</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Transactions</CardTitle>
                <div className="p-2 bg-orange-50 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{summary.totalTransactions}</div>
                <p className="text-xs text-gray-500">Commission transactions</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="shadow-sm border-gray-200">
          <CardHeader className="border-b border-gray-100 bg-gray-50">
            <CardTitle className="text-gray-900">Earnings History</CardTitle>
            <CardDescription className="text-gray-600">Detailed breakdown of your commission earnings</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {earnings.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No earnings yet</h3>
                <p className="text-gray-600">Start referring customers to earn commissions!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {earnings.map((earning) => (
                  <div
                    key={earning.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={earning.tier === 1 ? "default" : "secondary"}
                          className={
                            earning.tier === 1
                              ? "bg-blue-100 text-blue-800 border-blue-200"
                              : "bg-gray-100 text-gray-800 border-gray-200"
                          }
                        >
                          Tier {earning.tier}
                        </Badge>
                        <span className="font-medium text-gray-900">{earning.packageTitle}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        From: {earning.customerName} ({earning.customerEmail})
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(earning.date)} • {earning.commissionRate}% commission
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-600">+{formatCurrency(earning.amount)}</div>
                      <Badge
                        variant={earning.status === "completed" ? "default" : "secondary"}
                        className={
                          earning.status === "completed"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-gray-100 text-gray-800 border-gray-200"
                        }
                      >
                        {earning.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
