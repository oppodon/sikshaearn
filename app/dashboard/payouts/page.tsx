"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { Search, Download, Eye, AlertCircle, FileText, CreditCard, Smartphone, Wallet, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Withdrawal {
  _id: string
  amount: number
  method: string
  accountDetails: {
    accountName?: string
    accountNumber?: string
    bankName?: string
    branch?: string
    phoneNumber?: string
  }
  status: string
  createdAt: string
  processedAt?: string
  transactionId?: string
  rejectionReason?: string
}

interface KYCStatus {
  status: "pending" | "approved" | "rejected" | null
}

export default function PayoutsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [kycStatus, setKycStatus] = useState<KYCStatus>({ status: null })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/dashboard/payouts")
      return
    }

    if (status === "authenticated") {
      fetchWithdrawals()
      fetchKYCStatus()
    }
  }, [status, router, activeTab, currentPage])

  const fetchWithdrawals = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/affiliate/withdrawals?page=${currentPage}&limit=10&status=${activeTab !== "all" ? activeTab : ""}`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch withdrawals")
      }

      const data = await response.json()
      setWithdrawals(data.withdrawals || [])
      setTotalPages(data.pagination?.pages || 1)
    } catch (error) {
      console.error("Error fetching withdrawals:", error)
      toast({
        title: "Error",
        description: "Failed to load withdrawals",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchKYCStatus = async () => {
    try {
      const response = await fetch("/api/kyc")

      if (!response.ok) {
        throw new Error("Failed to fetch KYC status")
      }

      const data = await response.json()

      if (data.kyc) {
        setKycStatus({
          status: data.kyc.status,
        })
      } else {
        setKycStatus({ status: null })
      }
    } catch (error) {
      console.error("Error fetching KYC status:", error)
    }
  }

  const handleViewWithdrawal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal)
    setViewDialogOpen(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a")
    } catch (e) {
      return "Invalid date"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-sm text-xs">
            Pending
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 shadow-sm text-xs">
            Completed
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-gradient-to-r from-red-400 to-rose-500 text-white border-0 shadow-sm text-xs">
            Rejected
          </Badge>
        )
      case "processing":
        return (
          <Badge className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white border-0 shadow-sm text-xs">
            Processing
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-400 to-slate-500 text-white border-0 shadow-sm text-xs">
            {status}
          </Badge>
        )
    }
  }

  const getMethodDisplay = (method: string) => {
    switch (method) {
      case "bank_transfer":
        return "Bank Transfer"
      case "esewa":
        return "eSewa"
      case "khalti":
        return "Khalti"
      default:
        return method
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "bank_transfer":
        return <CreditCard className="h-4 w-4" />
      case "esewa":
      case "khalti":
        return <Smartphone className="h-4 w-4" />
      default:
        return <Wallet className="h-4 w-4" />
    }
  }

  const renderKYCAlert = () => {
    if (kycStatus.status === null) {
      return (
        <Alert className="border-red-200 bg-gradient-to-r from-red-50 to-rose-50 shadow-sm mb-4">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800 text-sm">KYC Verification Required</AlertTitle>
          <AlertDescription className="text-red-700 text-sm">
            You need to complete KYC verification before you can withdraw funds.
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard/kyc")}
                className="border-red-200 text-red-700 hover:bg-red-50 text-xs h-8"
              >
                <FileText className="mr-1 h-3 w-3" />
                Complete KYC Verification
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )
    } else if (kycStatus.status === "pending") {
      return (
        <Alert className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 shadow-sm mb-4">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800 text-sm">KYC Verification Pending</AlertTitle>
          <AlertDescription className="text-yellow-700 text-sm">
            Your KYC verification is currently under review. You'll be able to withdraw funds once it's approved.
          </AlertDescription>
        </Alert>
      )
    } else if (kycStatus.status === "rejected") {
      return (
        <Alert className="border-red-200 bg-gradient-to-r from-red-50 to-rose-50 shadow-sm mb-4">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800 text-sm">KYC Verification Rejected</AlertTitle>
          <AlertDescription className="text-red-700 text-sm">
            Your KYC verification was rejected. Please submit a new verification.
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard/kyc")}
                className="border-red-200 text-red-700 hover:bg-red-50 text-xs h-8"
              >
                <FileText className="mr-1 h-3 w-3" />
                Submit New KYC Verification
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )
    }

    return null
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex flex-col space-y-2">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex justify-center items-center py-12">
                <div className="h-8 w-8 border-2 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Withdrawals</h1>
            <p className="text-gray-600 text-sm">View and track your withdrawal requests</p>
          </div>
          <Button
            onClick={() => router.push("/dashboard/withdrawal")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Request Withdrawal
          </Button>
        </div>

        {renderKYCAlert()}

        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg p-4">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wallet className="h-5 w-5" />
                  Withdrawal History
                </CardTitle>
                <CardDescription className="text-blue-100 text-sm">Track your withdrawal requests</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search withdrawals..."
                    className="pl-9 w-full sm:w-[200px] bg-white/90 border-white/20 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-10 w-10"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4 bg-gray-100 p-1 rounded-lg h-auto">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300 text-xs py-2"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300 text-xs py-2"
                >
                  Pending
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300 text-xs py-2"
                >
                  Completed
                </TabsTrigger>
                <TabsTrigger
                  value="rejected"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300 text-xs py-2"
                >
                  Rejected
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-4">
                {withdrawals.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center mb-4 shadow-lg">
                      <Download className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No withdrawals found</h3>
                    <p className="text-gray-600 mb-6 text-sm">
                      {activeTab === "all"
                        ? "You haven't made any withdrawal requests yet."
                        : `You don't have any ${activeTab} withdrawals.`}
                    </p>
                    <Button
                      onClick={() => router.push("/dashboard/withdrawal")}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                    >
                      Request Withdrawal
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Mobile Card View */}
                    <div className="block sm:hidden space-y-4">
                      {withdrawals
                        .filter((withdrawal) => {
                          if (!searchQuery) return true
                          const query = searchQuery.toLowerCase()
                          return (
                            withdrawal.method.toLowerCase().includes(query) ||
                            withdrawal.status.toLowerCase().includes(query) ||
                            (withdrawal.transactionId && withdrawal.transactionId.toLowerCase().includes(query))
                          )
                        })
                        .map((withdrawal) => (
                          <Card
                            key={withdrawal._id}
                            className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                          >
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <p className="font-semibold text-gray-900 text-sm">
                                    {formatCurrency(withdrawal.amount)}
                                  </p>
                                  <p className="text-xs text-gray-500">{formatDate(withdrawal.createdAt)}</p>
                                </div>
                                {getStatusBadge(withdrawal.status)}
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {getMethodIcon(withdrawal.method)}
                                  <span className="text-sm text-gray-600">{getMethodDisplay(withdrawal.method)}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewWithdrawal(withdrawal)}
                                  className="text-xs h-8"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden sm:block rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50">
                            <TableHead className="font-semibold text-gray-700 text-sm">Date</TableHead>
                            <TableHead className="font-semibold text-gray-700 text-sm">Amount</TableHead>
                            <TableHead className="font-semibold text-gray-700 text-sm">Method</TableHead>
                            <TableHead className="font-semibold text-gray-700 text-sm">Status</TableHead>
                            <TableHead className="text-right font-semibold text-gray-700 text-sm">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {withdrawals
                            .filter((withdrawal) => {
                              if (!searchQuery) return true
                              const query = searchQuery.toLowerCase()
                              return (
                                withdrawal.method.toLowerCase().includes(query) ||
                                withdrawal.status.toLowerCase().includes(query) ||
                                (withdrawal.transactionId && withdrawal.transactionId.toLowerCase().includes(query))
                              )
                            })
                            .map((withdrawal) => (
                              <TableRow
                                key={withdrawal._id}
                                className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
                              >
                                <TableCell className="font-medium text-sm">
                                  {formatDate(withdrawal.createdAt)}
                                </TableCell>
                                <TableCell className="font-bold text-green-600 text-sm">
                                  {formatCurrency(withdrawal.amount)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {getMethodIcon(withdrawal.method)}
                                    <span className="text-sm">{getMethodDisplay(withdrawal.method)}</span>
                                  </div>
                                </TableCell>
                                <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewWithdrawal(withdrawal)}
                                    className="hover:bg-blue-50 text-xs h-8"
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* View Withdrawal Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-sm bg-gradient-to-br from-white to-blue-50 border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-gray-900">Withdrawal Details</DialogTitle>
              <DialogDescription className="text-gray-600 text-sm">
                Request ID: {selectedWithdrawal?._id?.slice(-6)}
              </DialogDescription>
            </DialogHeader>

            {selectedWithdrawal && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200">
                    <p className="text-xs text-green-800 font-medium">Amount</p>
                    <p className="font-bold text-green-900 text-sm">{formatCurrency(selectedWithdrawal.amount)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200">
                    <p className="text-xs text-blue-800 font-medium">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedWithdrawal.status)}</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-200">
                  <p className="text-xs text-purple-800 font-medium">Payment Method</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getMethodIcon(selectedWithdrawal.method)}
                    <span className="font-medium text-purple-900 text-sm">
                      {getMethodDisplay(selectedWithdrawal.method)}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-gradient-to-br from-orange-50 to-amber-100 border border-orange-200">
                  <p className="text-xs text-orange-800 font-medium">Request Date</p>
                  <p className="text-orange-900 font-medium text-sm">{formatDate(selectedWithdrawal.createdAt)}</p>
                </div>

                {selectedWithdrawal.rejectionReason && (
                  <div className="p-3 rounded-lg bg-gradient-to-br from-red-50 to-rose-100 border border-red-200">
                    <p className="text-xs text-red-800 font-medium">Rejection Reason</p>
                    <p className="text-red-900 text-xs">{selectedWithdrawal.rejectionReason}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
