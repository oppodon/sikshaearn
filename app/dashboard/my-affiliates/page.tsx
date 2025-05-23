"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, User, TrendingUp, DollarSign, AlertCircle } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"

interface AffiliateStats {
  directReferrals: number
  tier2Referrals: number
  totalEarnings: number
  directEarnings: number
  tier2Earnings: number
  conversionRate: number
}

interface AffiliateData {
  stats: AffiliateStats
  directAffiliates: any[]
  tier2Affiliates: any[]
}

export default function MyAffiliatesPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<AffiliateData>({
    stats: {
      directReferrals: 0,
      tier2Referrals: 0,
      totalEarnings: 0,
      directEarnings: 0,
      tier2Earnings: 0,
      conversionRate: 0,
    },
    directAffiliates: [],
    tier2Affiliates: [],
  })

  useEffect(() => {
    const fetchAffiliateData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/affiliate/referrals")

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        // Ensure we have the expected structure
        if (result && typeof result === "object") {
          setData({
            stats: result.stats || {
              directReferrals: 0,
              tier2Referrals: 0,
              totalEarnings: 0,
              directEarnings: 0,
              tier2Earnings: 0,
              conversionRate: 0,
            },
            directAffiliates: result.directAffiliates || [],
            tier2Affiliates: result.tier2Affiliates || [],
          })
        } else {
          throw new Error("Invalid response format")
        }
      } catch (err: any) {
        console.error("Error fetching affiliate data:", err)
        setError(err.message || "Failed to load affiliate data")
      } finally {
        setLoading(false)
      }
    }

    fetchAffiliateData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Affiliates</h1>
          <p className="text-muted-foreground">Track your referrals and their performance</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full max-w-md" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}. Please try refreshing the page or contact support if the problem persists.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const { stats, directAffiliates, tier2Affiliates } = data

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Affiliates</h1>
        <p className="text-muted-foreground">Track your referrals and their performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Direct Referrals</span>
            </div>
            <div className="mt-1 text-2xl font-bold">{stats.directReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Tier 2 Referrals</span>
            </div>
            <div className="mt-1 text-2xl font-bold">{stats.tier2Referrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Conversion Rate</span>
            </div>
            <div className="mt-1 text-2xl font-bold">{stats.conversionRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Earnings</span>
            </div>
            <div className="mt-1 text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commission Structure</CardTitle>
          <CardDescription>You earn commission on two tiers of referrals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Direct Referrals (Tier 1)</h3>
                <Badge variant="outline" className="bg-green-50">
                  65% Commission
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                You earn 65% commission on all purchases made by users you directly refer.
              </p>
              <div className="text-sm font-medium">Earnings so far: {formatCurrency(stats.directEarnings)}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Second-Level Referrals (Tier 2)</h3>
                <Badge variant="outline" className="bg-blue-50">
                  5% Commission
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                You earn 5% commission on purchases made by users referred by your direct referrals.
              </p>
              <div className="text-sm font-medium">Earnings so far: {formatCurrency(stats.tier2Earnings)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="direct">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="direct">Direct Referrals</TabsTrigger>
          <TabsTrigger value="tier2">Tier 2 Referrals</TabsTrigger>
        </TabsList>

        <TabsContent value="direct" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Direct Referrals</CardTitle>
              <CardDescription>Users who signed up using your referral link</CardDescription>
            </CardHeader>
            <CardContent>
              {directAffiliates.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Purchases</TableHead>
                      <TableHead>Spent</TableHead>
                      <TableHead>Your Commission</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {directAffiliates.map((affiliate: any) => (
                      <TableRow key={affiliate._id}>
                        <TableCell className="font-medium">{affiliate.name}</TableCell>
                        <TableCell>{affiliate.email}</TableCell>
                        <TableCell>{formatDate(affiliate.createdAt)}</TableCell>
                        <TableCell>{affiliate.purchases || 0}</TableCell>
                        <TableCell>{formatCurrency(affiliate.totalSpent || 0)}</TableCell>
                        <TableCell>{formatCurrency(affiliate.commission || 0)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  You don't have any direct referrals yet. Share your affiliate link to start earning!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tier2" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tier 2 Referrals</CardTitle>
              <CardDescription>Users referred by your direct referrals</CardDescription>
            </CardHeader>
            <CardContent>
              {tier2Affiliates.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Referred By</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Purchases</TableHead>
                      <TableHead>Spent</TableHead>
                      <TableHead>Your Commission</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tier2Affiliates.map((affiliate: any) => (
                      <TableRow key={affiliate._id}>
                        <TableCell className="font-medium">{affiliate.name}</TableCell>
                        <TableCell>{affiliate.email}</TableCell>
                        <TableCell>{affiliate.referredBy}</TableCell>
                        <TableCell>{formatDate(affiliate.createdAt)}</TableCell>
                        <TableCell>{affiliate.purchases || 0}</TableCell>
                        <TableCell>{formatCurrency(affiliate.totalSpent || 0)}</TableCell>
                        <TableCell>{formatCurrency(affiliate.commission || 0)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  You don't have any tier 2 referrals yet. Encourage your direct referrals to share their links!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
