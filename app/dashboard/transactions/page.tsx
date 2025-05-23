import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Transaction from "@/models/Transaction"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, CheckCircle, Clock, ExternalLink } from "lucide-react"

// Loading component
function TransactionsSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <Skeleton className="h-5 w-40 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-md" />
                <div>
                  <Skeleton className="h-5 w-48 mb-1" />
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-9 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Fetch user transactions
async function getUserTransactions(userId: string) {
  await connectToDatabase()

  const transactions = await Transaction.find({ user: userId })
    .populate("package", "title slug price thumbnail")
    .sort({ createdAt: -1 })
    .lean()

  return transactions
}

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to view your transactions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/login?callbackUrl=/dashboard/transactions">Log In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const transactions = await getUserTransactions(session.user.id)

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">My Transactions</h1>
        <p className="text-muted-foreground">View and manage your payment history</p>
      </div>

      <Tabs defaultValue="all" className="w-full mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <TransactionsList transactions={transactions} />
        </TabsContent>

        <TabsContent value="pending">
          <TransactionsList transactions={transactions.filter((t) => t.status === "pending")} />
        </TabsContent>

        <TabsContent value="approved">
          <TransactionsList transactions={transactions.filter((t) => t.status === "approved")} />
        </TabsContent>

        <TabsContent value="rejected">
          <TransactionsList transactions={transactions.filter((t) => t.status === "rejected")} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TransactionsList({ transactions }) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Transactions Found</CardTitle>
          <CardDescription>You haven't made any payments in this category yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/packages">Browse Packages</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Suspense fallback={<TransactionsSkeleton />}>
      <div className="space-y-6">
        {transactions.map((transaction) => (
          <Card key={transaction._id.toString()} className="transaction-card" data-status={transaction.status}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Transaction #{transaction._id.toString().slice(-6)}</CardTitle>
                  <CardDescription>
                    {new Date(transaction.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardDescription>
                </div>
                <Badge
                  className={
                    transaction.status === "approved"
                      ? "bg-green-500 hover:bg-green-600"
                      : transaction.status === "rejected"
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-yellow-500 hover:bg-yellow-600"
                  }
                >
                  {transaction.status === "approved"
                    ? "Approved"
                    : transaction.status === "rejected"
                      ? "Rejected"
                      : "Pending"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={transaction.package?.thumbnail || "/placeholder.svg?height=64&width=64"}
                      alt={transaction.package?.title || "Package"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{transaction.package?.title || "Package"}</h3>
                    <p className="text-sm text-muted-foreground">
                      Payment Method:{" "}
                      {transaction.paymentMethod?.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </p>
                    <p className="font-medium">₹{transaction.amount}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {transaction.status === "pending" && (
                    <div className="flex items-center text-yellow-600">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-sm">Awaiting approval</span>
                    </div>
                  )}
                  {transaction.status === "approved" && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">
                        {transaction.approvedAt
                          ? `Approved on ${new Date(transaction.approvedAt).toLocaleDateString()}`
                          : "Payment verified"}
                      </span>
                    </div>
                  )}
                  {transaction.status === "rejected" && (
                    <div className="flex items-center text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">{transaction.rejectionReason || "Payment rejected"}</span>
                    </div>
                  )}
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/transactions/${transaction._id}`}>
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Suspense>
  )
}
