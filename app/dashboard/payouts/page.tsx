"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowDownToLine, Calendar, CreditCard, Download, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function PayoutsPage() {
  const [dateRange, setDateRange] = useState("30")

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Payouts</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border bg-white p-1 px-3">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="border-0 p-0 shadow-none focus:ring-0">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" className="bg-white">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-2 text-sm font-medium text-gray-500">Available Balance</div>
            <div className="mb-4">
              <div className="text-2xl font-bold">Rs. 12,450</div>
            </div>
            <Button className="w-full" asChild>
              <Link href="/dashboard/withdrawal">
                <ArrowDownToLine className="mr-2 h-4 w-4" />
                Withdraw
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-2 text-sm font-medium text-gray-500">Pending Earnings</div>
            <div className="mb-4">
              <div className="text-2xl font-bold">Rs. 3,280</div>
              <div className="text-sm text-gray-500">Will be available in 15 days</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-2 text-sm font-medium text-gray-500">Total Paid</div>
            <div className="mb-4">
              <div className="text-2xl font-bold">Rs. 32,781</div>
              <div className="text-sm text-gray-500">Lifetime earnings paid</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-2 text-sm font-medium text-gray-500">Next Payout Date</div>
            <div className="mb-4">
              <div className="text-2xl font-bold">June 15</div>
              <div className="text-sm text-gray-500">Automatic monthly payout</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-0 shadow-sm">
        <CardHeader className="pb-0 pt-6">
          <CardTitle className="text-xl font-bold">Payment Methods</CardTitle>
          <p className="text-sm text-gray-500">Manage your payout methods</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-4 rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-blue-50 p-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Bank Transfer</h3>
                  <p className="text-sm text-gray-500">Nepal Investment Bank ****6789</p>
                </div>
              </div>
              <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-100">Default</Badge>
            </div>
          </div>

          <Button variant="outline" className="bg-white">
            Add Payment Method
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-6 border-0 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-0 pt-6">
          <div>
            <CardTitle className="text-xl font-bold">Transaction History</CardTitle>
            <p className="text-sm text-gray-500">View all your earnings and transactions</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search transactions..." className="pl-9" />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4 grid w-full grid-cols-4 bg-gray-100">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <div className="rounded-lg border">
                <div className="grid grid-cols-5 gap-4 border-b bg-gray-50 p-4 font-medium">
                  <div>Date</div>
                  <div>Product</div>
                  <div>Customer</div>
                  <div>Amount</div>
                  <div>Status</div>
                </div>
                {transactions.map((transaction, i) => (
                  <div key={i} className="grid grid-cols-5 gap-4 border-b p-4 last:border-0">
                    <div className="text-sm">{transaction.date}</div>
                    <div className="text-sm font-medium">{transaction.product}</div>
                    <div className="text-sm">{transaction.customer}</div>
                    <div className="text-sm">Rs. {transaction.amount}</div>
                    <div>
                      <Badge
                        variant="outline"
                        className={
                          transaction.status === "Paid"
                            ? "bg-green-50 text-green-600 border-green-200"
                            : transaction.status === "Pending"
                              ? "bg-yellow-50 text-yellow-600 border-yellow-200"
                              : "bg-blue-50 text-blue-600 border-blue-200"
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">Showing 1-5 of 24 transactions</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="completed" className="mt-0">
              <div className="flex h-40 items-center justify-center rounded-lg border">
                <p className="text-gray-500">No completed transactions to display</p>
              </div>
            </TabsContent>

            <TabsContent value="pending" className="mt-0">
              <div className="flex h-40 items-center justify-center rounded-lg border">
                <p className="text-gray-500">No pending transactions to display</p>
              </div>
            </TabsContent>

            <TabsContent value="failed" className="mt-0">
              <div className="flex h-40 items-center justify-center rounded-lg border">
                <p className="text-gray-500">No failed transactions to display</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

const transactions = [
  {
    date: "2025-05-20",
    product: "Digital Marketing Mastery",
    customer: "r***@gmail.com",
    amount: 300,
    status: "Paid",
  },
  {
    date: "2025-05-18",
    product: "Communication Skill",
    customer: "s***@gmail.com",
    amount: 225,
    status: "Paid",
  },
  {
    date: "2025-05-15",
    product: "Facebook Ads",
    customer: "a***@gmail.com",
    amount: 290,
    status: "Processing",
  },
  {
    date: "2025-05-12",
    product: "Digital Marketing Mastery",
    customer: "p***@gmail.com",
    amount: 300,
    status: "Pending",
  },
  {
    date: "2025-05-10",
    product: "YouTube Mastery",
    customer: "m***@gmail.com",
    amount: 320,
    status: "Paid",
  },
]
