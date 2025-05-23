"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, Search, FileDown, Eye } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"

interface Withdrawal {
  _id: string
  user: {
    _id: string
    name: string
    email: string
    image?: string
  }
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
  processedBy?: string
  rejectionReason?: string
  transactionId?: string
}

export default function WithdrawalsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [activeTab, setActiveTab] = useState("pending")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
  const [transactionId, setTransactionId] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)

  useEffect(() => {
    fetchWithdrawals()
  }, [activeTab])

  const fetchWithdrawals = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/withdrawals?status=${activeTab === "all" ? "" : activeTab}`)

      if (!response.ok) {
        throw new Error("Failed to fetch withdrawals")
      }

      const data = await response.json()
      setWithdrawals(data.withdrawals || [])
    } catch (error) {
      console.error("Error fetching withdrawals:", error)
      toast({
        title: "Error",
        description: "Failed to load withdrawals",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedWithdrawal) return
    if (!transactionId.trim()) {
      toast({
        title: "Error",
        description: "Transaction ID is required",
        variant: "destructive",
      })
      return
    }

    try {
      setIsProcessing(true)

      const response = await fetch("/api/admin/withdrawals/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          withdrawalId: selectedWithdrawal._id,
          action: "approve",
          transactionId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to approve withdrawal")
      }

      toast({
        title: "Success",
        description: "Withdrawal approved successfully",
      })

      // Update the withdrawal in the list
      setWithdrawals(withdrawals.map((w) => (w._id === selectedWithdrawal._id ? { ...w, status: "completed" } : w)))

      // Close dialog and reset
      setShowApproveDialog(false)
      setTransactionId("")
      setSelectedWithdrawal(null)
      fetchWithdrawals()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedWithdrawal) return

    try {
      setIsProcessing(true)

      if (!rejectionReason.trim()) {
        throw new Error("Please provide a reason for rejection")
      }

      const response = await fetch("/api/admin/withdrawals/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          withdrawalId: selectedWithdrawal._id,
          action: "reject",
          rejectionReason,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to reject withdrawal")
      }

      toast({
        title: "Success",
        description: "Withdrawal rejected successfully",
      })

      // Update the withdrawal in the list
      setWithdrawals(withdrawals.map((w) => (w._id === selectedWithdrawal._id ? { ...w, status: "rejected" } : w)))

      // Close dialog and reset
      setShowRejectDialog(false)
      setRejectionReason("")
      setSelectedWithdrawal(null)
      fetchWithdrawals()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const openApproveDialog = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal)
    setShowApproveDialog(true)
  }

  const openRejectDialog = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal)
    setShowRejectDialog(true)
  }

  const openViewDialog = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal)
    setShowViewDialog(true)
  }

  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      withdrawal.user?.name?.toLowerCase().includes(query) ||
      withdrawal.user?.email?.toLowerCase().includes(query) ||
      withdrawal._id.toLowerCase().includes(query) ||
      (withdrawal.transactionId && withdrawal.transactionId.toLowerCase().includes(query))
    )
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Processing</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a")
    } catch (e) {
      return "Invalid date"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Withdrawal Management</h1>

      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded-md ${activeTab === "all" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            onClick={() => setActiveTab("all")}
          >
            All Withdrawals
          </button>
          <button
            className={`px-4 py-2 rounded-md ${activeTab === "pending" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            onClick={() => setActiveTab("pending")}
          >
            Pending
          </button>
          <button
            className={`px-4 py-2 rounded-md ${activeTab === "completed" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            onClick={() => setActiveTab("completed")}
          >
            Completed
          </button>
          <button
            className={`px-4 py-2 rounded-md ${activeTab === "rejected" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            onClick={() => setActiveTab("rejected")}
          >
            Rejected
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search withdrawals..."
              className="pl-9 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <FileDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-md shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">Withdrawals</h2>
          <p className="text-sm text-gray-500">Manage affiliate withdrawal requests</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="h-8 w-8 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : filteredWithdrawals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No withdrawals found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Method</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWithdrawals.map((withdrawal) => (
                  <tr key={withdrawal._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={withdrawal.user?.image || "/placeholder.svg?height=32&width=32"}
                            alt={withdrawal.user?.name || ""}
                          />
                          <AvatarFallback>
                            {withdrawal.user?.name
                              ? withdrawal.user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                              : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{withdrawal.user?.name || "Unknown User"}</div>
                          <div className="text-sm text-gray-500">{withdrawal.user?.email || "No email"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium">{formatCurrency(withdrawal.amount)}</td>
                    <td className="p-4">{getMethodDisplay(withdrawal.method)}</td>
                    <td className="p-4">{formatDate(withdrawal.createdAt)}</td>
                    <td className="p-4">{getStatusBadge(withdrawal.status)}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-8" onClick={() => openViewDialog(withdrawal)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {withdrawal.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                              onClick={() => openApproveDialog(withdrawal)}
                              disabled={isProcessing}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                              onClick={() => openRejectDialog(withdrawal)}
                              disabled={isProcessing}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Withdrawal Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Withdrawal Details</DialogTitle>
            <DialogDescription>Withdrawal ID: {selectedWithdrawal?._id}</DialogDescription>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Withdrawal Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Withdrawal ID:</span>
                        <span className="font-mono">{selectedWithdrawal._id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Amount:</span>
                        <span className="font-semibold">{formatCurrency(selectedWithdrawal.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Payment Method:</span>
                        <span className="capitalize">{getMethodDisplay(selectedWithdrawal.method)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        {getStatusBadge(selectedWithdrawal.status)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Request Date:</span>
                        <span>{formatDate(selectedWithdrawal.createdAt)}</span>
                      </div>
                      {selectedWithdrawal.processedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Processed Date:</span>
                          <span>{formatDate(selectedWithdrawal.processedAt)}</span>
                        </div>
                      )}
                      {selectedWithdrawal.transactionId && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Transaction ID:</span>
                          <span className="font-mono">{selectedWithdrawal.transactionId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">User Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Name:</span>
                        <span>{selectedWithdrawal.user?.name || "Unknown"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Email:</span>
                        <span>{selectedWithdrawal.user?.email || "Unknown"}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Payment Details</h3>
                  <div className="bg-gray-50 p-4 rounded-md border">
                    {selectedWithdrawal.method === "bank_transfer" ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Bank Name:</span>
                          <span>
                            {selectedWithdrawal.accountDetails?.bankName
                              ? selectedWithdrawal.accountDetails.bankName
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())
                              : "Not provided"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Account Name:</span>
                          <span>{selectedWithdrawal.accountDetails?.accountName || "Not provided"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Account Number:</span>
                          <span className="font-mono">
                            {selectedWithdrawal.accountDetails?.accountNumber || "Not provided"}
                          </span>
                        </div>
                        {selectedWithdrawal.accountDetails?.branch && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Branch:</span>
                            <span>{selectedWithdrawal.accountDetails.branch}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Payment Method:</span>
                          <span>{getMethodDisplay(selectedWithdrawal.method)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Phone Number:</span>
                          <span className="font-mono">
                            {selectedWithdrawal.accountDetails?.phoneNumber || "Not provided"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedWithdrawal.rejectionReason && (
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2 text-red-600">Rejection Reason</h3>
                      <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                        {selectedWithdrawal.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedWithdrawal?.status === "pending" && (
              <div className="flex gap-2 w-full">
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    setShowViewDialog(false)
                    openRejectDialog(selectedWithdrawal)
                  }}
                  disabled={isProcessing}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={() => {
                    setShowViewDialog(false)
                    openApproveDialog(selectedWithdrawal)
                  }}
                  disabled={isProcessing}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Withdrawal Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Withdrawal</DialogTitle>
            <DialogDescription>Enter the transaction ID for this withdrawal.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-500">User</Label>
                <p className="font-medium">{selectedWithdrawal?.user?.name}</p>
              </div>
              <div>
                <Label className="text-gray-500">Amount</Label>
                <p className="font-medium">{selectedWithdrawal ? formatCurrency(selectedWithdrawal.amount) : ""}</p>
              </div>
            </div>
            <div>
              <Label htmlFor="transactionId">Transaction ID</Label>
              <Input
                id="transactionId"
                placeholder="Enter transaction ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="mt-1.5"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Enter the transaction ID from your payment processor</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleApprove} disabled={isProcessing || !transactionId.trim()}>
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : (
                "Approve Withdrawal"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Withdrawal Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Withdrawal</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this withdrawal.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-500">User</Label>
                <p className="font-medium">{selectedWithdrawal?.user?.name}</p>
              </div>
              <div>
                <Label className="text-gray-500">Amount</Label>
                <p className="font-medium">{selectedWithdrawal ? formatCurrency(selectedWithdrawal.amount) : ""}</p>
              </div>
            </div>
            <div>
              <Label htmlFor="reason">Reason for rejection</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for rejection"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mt-1.5"
                rows={3}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isProcessing || !rejectionReason.trim()}>
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : (
                "Reject Withdrawal"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
