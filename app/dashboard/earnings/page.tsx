import { Suspense } from "react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"

async function getBalance() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user/balance`, {
      cache: "no-store",
    })

    if (!res.ok) {
      throw new Error("Failed to fetch balance")
    }

    return res.json()
  } catch (error) {
    console.error("Error fetching balance:", error)
    return {
      balance: {
        totalEarnings: 0,
        availableBalance: 0,
        pendingBalance: 0,
        withdrawnBalance: 0,
        processingBalance: 0,
      },
      recentTransactions: [],
    }
  }
}

async function getTransactions(params = {}) {
  const queryString = new URLSearchParams(params).toString()
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user/balance/transactions?${queryString}`, {
      cache: "no-store",
    })

    if (!res.ok) {
      throw new Error("Failed to fetch transactions")
    }

    return res.json()
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return {
      transactions: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      },
    }
  }
}

function BalanceSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function TransactionSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function BalanceCards({ balance }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(balance.totalEarnings)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(balance.availableBalance)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Pending Balance</CardTitle>
          <CardDescription className="text-xs">Available in 14 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(balance.pendingBalance)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Withdrawn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(balance.withdrawnBalance + balance.processingBalance)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TransactionList({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No transactions found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <Card key={transaction._id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{transaction.description}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(transaction.createdAt).toLocaleDateString()} •
                  {transaction.status === "pending" ? " Pending" : " Completed"}
                </p>
              </div>
              <div className={`text-lg font-bold ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                {transaction.type === "credit" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default async function EarningsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/dashboard/earnings")
  }

  const { balance, recentTransactions } = await getBalance()
  const { transactions: allTransactions } = await getTransactions({ limit: 10 })
  const { transactions: commissionTransactions } = await getTransactions({ category: "commission", limit: 10 })
  const { transactions: withdrawalTransactions } = await getTransactions({ category: "withdrawal", limit: 10 })

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Earnings Dashboard</h1>
        <p className="text-muted-foreground">Track your affiliate earnings and manage your balance</p>
      </div>

      <Suspense fallback={<BalanceSkeleton />}>
        <BalanceCards balance={balance} />
      </Suspense>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Suspense fallback={<TransactionSkeleton />}>
            <TransactionList transactions={allTransactions} />
          </Suspense>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4">
          <Suspense fallback={<TransactionSkeleton />}>
            <TransactionList transactions={commissionTransactions} />
          </Suspense>
        </TabsContent>

        <TabsContent value="withdrawals" className="space-y-4">
          <Suspense fallback={<TransactionSkeleton />}>
            <TransactionList transactions={withdrawalTransactions} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
