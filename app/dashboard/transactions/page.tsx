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
import { AlertCircle, CheckCircle, Clock, ExternalLink, CreditCard, Smartphone, Wallet } from "lucide-react"

// Loading component
function TransactionsSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="shadow-lg border-0">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-lg" />
                <div>
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-32 mb-2" />
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto py-12 px-6">
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Authentication Required
              </CardTitle>
              <CardDescription className="text-red-100">Please log in to view your transactions.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Button
                asChild
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
              >
                <Link href="/login?callbackUrl=/dashboard/transactions">Log In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const transactions = await getUserTransactions(session.user.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Transactions</h1>
          <p className="text-gray-600">View and manage your payment history</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm mb-6">
          <CardContent className="p-6">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-6 bg-gray-100 p-1 rounded-lg grid w-full grid-cols-4">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300"
                >
                  Pending
                </TabsTrigger>
                <TabsTrigger
                  value="approved"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300"
                >
                  Approved
                </TabsTrigger>
                <TabsTrigger
                  value="rejected"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300"
                >
                  Rejected
                </TabsTrigger>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function TransactionsList({ transactions }) {
  if (transactions.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-gradient-to-br from-gray-50 to-blue-50">
        <CardHeader className="bg-gradient-to-r from-gray-500 to-slate-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            No Transactions Found
          </CardTitle>
          <CardDescription className="text-gray-100">
            You haven't made any payments in this category yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Button
            asChild
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
          >
            <Link href="/packages">Browse Packages</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case "bank_transfer":
      case "bank transfer":
        return <CreditCard className="h-4 w-4" />
      case "esewa":
      case "khalti":
        return <Smartphone className="h-4 w-4" />
      default:
        return <Wallet className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 shadow-md">
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-gradient-to-r from-red-400 to-rose-500 text-white border-0 shadow-md">Rejected</Badge>
        )
      case "pending":
        return (
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-md">
            Pending
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-400 to-slate-500 text-white border-0 shadow-md">{status}</Badge>
        )
    }
  }

  return (
    <Suspense fallback={<TransactionsSkeleton />}>
      <div className="space-y-6">
        {transactions.map((transaction) => (
          <Card
            key={transaction._id.toString()}
            className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-gray-900">
                    Transaction #{transaction._id.toString().slice(-6)}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {new Date(transaction.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardDescription>
                </div>
                {getStatusBadge(transaction.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                    <Image
                      src={transaction.package?.thumbnail || "/placeholder.svg?height=64&width=64"}
                      alt={transaction.package?.title || "Package"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{transaction.package?.title || "Package"}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getPaymentMethodIcon(transaction.paymentMethod)}
                      <p className="text-sm text-gray-600">
                        {transaction.paymentMethod?.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </p>
                    </div>
                    <p className="font-bold text-lg text-green-600">₹{transaction.amount}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {transaction.status === "pending" && (
                    <div className="flex items-center text-yellow-600 p-2 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Awaiting approval</span>
                    </div>
                  )}
                  {transaction.status === "approved" && (
                    <div className="flex items-center text-green-600 p-2 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">
                        {transaction.approvedAt
                          ? `Approved on ${new Date(transaction.approvedAt).toLocaleDateString()}`
                          : "Payment verified"}
                      </span>
                    </div>
                  )}
                  {transaction.status === "rejected" && (
                    <div className="flex items-center text-red-600 p-2 rounded-lg bg-gradient-to-r from-red-50 to-rose-50 border border-red-200">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">{transaction.rejectionReason || "Payment rejected"}</span>
                    </div>
                  )}
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-gray-300 hover:bg-blue-50 hover:border-blue-300 shadow-md"
                  >
                    <Link href={`/dashboard/transactions/${transaction._id}`}>
                      <ExternalLink className="h-4 w-4 mr-2" />
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
