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
import { Search, Download, Eye, ArrowRight, AlertCircle, FileText, CreditCard, Smartphone, Wallet } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

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
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-md">
            Pending
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 shadow-md">
            Completed
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-gradient-to-r from-red-400 to-rose-500 text-white border-0 shadow-md">Rejected</Badge>
        )
      case "processing":
        return (
          <Badge className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white border-0 shadow-md">
            Processing
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-400 to-slate-500 text-white border-0 shadow-md">{status}</Badge>
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

  const renderPagination = () => {
    if (totalPages <= 1) return null

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            />
          </PaginationItem>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNumber

            if (totalPages <= 5) {
              pageNumber = i + 1
            } else if (currentPage <= 3) {
              pageNumber = i + 1
              if (i === 4)
                return (
                  <PaginationItem key="ellipsis-end">
                    <PaginationEllipsis />
                  </PaginationItem>
                )
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i
              if (i === 0)
                return (
                  <PaginationItem key="ellipsis-start">
                    <PaginationEllipsis />
                  </PaginationItem>
                )
            } else {
              if (i === 0)
                return (
                  <PaginationItem key="ellipsis-start">
                    <PaginationEllipsis />
                  </PaginationItem>
                )
              if (i === 4)
                return (
                  <PaginationItem key="ellipsis-end">
                    <PaginationEllipsis />
                  </PaginationItem>
                )
              pageNumber = currentPage - 1 + i
            }

            return (
              <PaginationItem key={pageNumber}>
                <PaginationLink isActive={currentPage === pageNumber} onClick={() => setCurrentPage(pageNumber)}>
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            )
          })}

          <PaginationItem>
            <PaginationNext
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }

  const renderKYCAlert = () => {
    if (kycStatus.status === null) {
      return (
        <Alert className="border-red-200 bg-gradient-to-r from-red-50 to-rose-50 shadow-lg mb-6">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">KYC Verification Required</AlertTitle>
          <AlertDescription className="text-red-700">
            You need to complete KYC verification before you can withdraw funds.
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard/kyc")}
                className="border-red-200 text-red-700 hover:bg-red-50 shadow-md"
              >
                <FileText className="mr-2 h-4 w-4" />
                Complete KYC Verification
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )
    } else if (kycStatus.status === "pending") {
      return (
        <Alert className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 shadow-lg mb-6">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">KYC Verification Pending</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Your KYC verification is currently under review. You'll be able to withdraw funds once it's approved.
          </AlertDescription>
        </Alert>
      )
    } else if (kycStatus.status === "rejected") {
      return (
        <Alert className="border-red-200 bg-gradient-to-r from-red-50 to-rose-50 shadow-lg mb-6">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">KYC Verification Rejected</AlertTitle>
          <AlertDescription className="text-red-700">
            Your KYC verification was rejected. Please submit a new verification.
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard/kyc")}
                className="border-red-200 text-red-700 hover:bg-red-50 shadow-md"
              >
                <FileText className="mr-2 h-4 w-4" />
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto py-6 px-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto py-6 px-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Withdrawal History</h1>
            <p className="text-gray-600 mt-1">Track and manage your withdrawal requests</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/withdrawal")}
              className="shadow-md hover:shadow-lg transition-shadow"
            >
              Request Withdrawal
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {renderKYCAlert()}

        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
            <div className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Your Withdrawals
                </CardTitle>
                <CardDescription className="text-blue-100">View and track your withdrawal requests</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search withdrawals..."
                    className="pl-9 w-[200px] md:w-[300px] bg-white/90 border-white/20"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6 bg-gray-100 p-1 rounded-lg">
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
                  value="completed"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300"
                >
                  Completed
                </TabsTrigger>
                <TabsTrigger
                  value="rejected"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300"
                >
                  Rejected
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                {withdrawals.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center mb-4 shadow-lg">
                      <Download className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No withdrawals found</h3>
                    <p className="text-gray-600 mb-6">
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
                    <div className="rounded-lg border border-gray-200 overflow-hidden shadow-lg">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50">
                            <TableHead className="font-semibold text-gray-700">Date</TableHead>
                            <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                            <TableHead className="font-semibold text-gray-700">Method</TableHead>
                            <TableHead className="font-semibold text-gray-700">Status</TableHead>
                            <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
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
                                <TableCell className="font-medium">{formatDate(withdrawal.createdAt)}</TableCell>
                                <TableCell className="font-bold text-green-600">
                                  {formatCurrency(withdrawal.amount)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {getMethodIcon(withdrawal.method)}
                                    <span>{getMethodDisplay(withdrawal.method)}</span>
                                  </div>
                                </TableCell>
                                <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewWithdrawal(withdrawal)}
                                    className="hover:bg-blue-50"
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex items-center justify-end space-x-2 py-4">{renderPagination()}</div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* View Withdrawal Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-md bg-gradient-to-br from-white to-blue-50 border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">Withdrawal Details</DialogTitle>
              <DialogDescription className="text-gray-600">Request ID: {selectedWithdrawal?._id}</DialogDescription>
            </DialogHeader>

            {selectedWithdrawal && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200">
                    <p className="text-sm text-green-800 font-medium">Amount</p>
                    <p className="font-bold text-green-900">{formatCurrency(selectedWithdrawal.amount)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedWithdrawal.status)}</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-200">
                  <p className="text-sm text-purple-800 font-medium">Payment Method</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getMethodIcon(selectedWithdrawal.method)}
                    <span className="font-medium text-purple-900">{getMethodDisplay(selectedWithdrawal.method)}</span>
                  </div>
                </div>

                {selectedWithdrawal.method === "bank_transfer" && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Bank Details</p>
                    <div className="bg-gradient-to-br from-gray-50 to-slate-100 p-4 rounded-lg border border-gray-200 text-sm">
                      <p className="mb-1">
                        <span className="font-medium text-gray-700">Bank:</span>{" "}
                        <span className="text-gray-900">
                          {selectedWithdrawal.accountDetails?.bankName
                            ? selectedWithdrawal.accountDetails.bankName
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())
                            : "N/A"}
                        </span>
                      </p>
                      <p className="mb-1">
                        <span className="font-medium text-gray-700">Account Name:</span>{" "}
                        <span className="text-gray-900">{selectedWithdrawal.accountDetails?.accountName || "N/A"}</span>
                      </p>
                      <p className="mb-1">
                        <span className="font-medium text-gray-700">Account Number:</span>{" "}
                        <span className="text-gray-900">
                          {selectedWithdrawal.accountDetails?.accountNumber || "N/A"}
                        </span>
                      </p>
                      {selectedWithdrawal.accountDetails?.branch && (
                        <p>
                          <span className="font-medium text-gray-700">Branch:</span>{" "}
                          <span className="text-gray-900">{selectedWithdrawal.accountDetails.branch}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {(selectedWithdrawal.method === "esewa" || selectedWithdrawal.method === "khalti") && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Payment Details</p>
                    <div className="bg-gradient-to-br from-gray-50 to-slate-100 p-4 rounded-lg border border-gray-200 text-sm">
                      <p>
                        <span className="font-medium text-gray-700">Phone Number:</span>{" "}
                        <span className="text-gray-900">{selectedWithdrawal.accountDetails?.phoneNumber || "N/A"}</span>
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-orange-50 to-amber-100 border border-orange-200">
                    <p className="text-sm text-orange-800 font-medium">Request Date</p>
                    <p className="text-orange-900 font-medium">{formatDate(selectedWithdrawal.createdAt)}</p>
                  </div>
                  {selectedWithdrawal.processedAt && (
                    <div className="p-3 rounded-lg bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200">
                      <p className="text-sm text-green-800 font-medium">Processed Date</p>
                      <p className="text-green-900 font-medium">{formatDate(selectedWithdrawal.processedAt)}</p>
                    </div>
                  )}
                </div>

                {selectedWithdrawal.transactionId && (
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium">Transaction ID</p>
                    <p className="font-mono text-sm text-blue-900 break-all">{selectedWithdrawal.transactionId}</p>
                  </div>
                )}

                {selectedWithdrawal.rejectionReason && (
                  <div className="p-3 rounded-lg bg-gradient-to-br from-red-50 to-rose-100 border border-red-200">
                    <p className="text-sm text-red-800 font-medium">Rejection Reason</p>
                    <p className="text-red-900 text-sm">{selectedWithdrawal.rejectionReason}</p>
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
