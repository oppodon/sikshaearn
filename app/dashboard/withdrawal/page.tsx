"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  FileText,
  Wallet,
  CreditCard,
  Smartphone,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent } from "@/components/ui/tabs"

interface WithdrawalFormData {
  amount: number
  method: "bank_transfer" | "esewa" | "khalti"
  accountDetails: {
    accountName?: string
    accountNumber?: string
    bankName?: string
    branch?: string
    phoneNumber?: string
  }
}

interface EarningsSummary {
  pending: number
  available: number
  withdrawn: number
  processing: number
  total: number
}

interface KYCStatus {
  status: "pending" | "approved" | "rejected" | null
  rejectionReason?: string
}

export default function WithdrawalPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState<WithdrawalFormData>({
    amount: 0,
    method: "bank_transfer",
    accountDetails: {
      accountName: "",
      accountNumber: "",
      bankName: "",
      branch: "",
      phoneNumber: "",
    },
  })
  const [earningsSummary, setEarningsSummary] = useState<EarningsSummary>({
    pending: 0,
    available: 0,
    withdrawn: 0,
    processing: 0,
    total: 0,
  })
  const [kycStatus, setKycStatus] = useState<KYCStatus>({ status: null })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/dashboard/withdrawal")
      return
    }

    if (status === "authenticated") {
      fetchEarningsData()
      fetchKYCStatus()
    }
  }, [status, router])

  const fetchEarningsData = async () => {
    try {
      setLoading(true)
      console.log("🔍 Fetching balance data...")

      const response = await fetch("/api/affiliate/balance")

      if (!response.ok) {
        throw new Error("Failed to fetch balance data")
      }

      const data = await response.json()
      console.log("💰 Balance data received:", data)

      const safeData = {
        pending: Number(data.pending) || 0,
        available: Number(data.available) || 0,
        withdrawn: Number(data.withdrawn) || 0,
        processing: Number(data.processing) || 0,
        total: Number(data.total) || 0,
      }

      console.log("✅ Safe balance data:", safeData)
      setEarningsSummary(safeData)
    } catch (error) {
      console.error("❌ Error fetching balance data:", error)
      toast({
        title: "Error",
        description: "Failed to load balance data. Please try again.",
        variant: "destructive",
      })
      setEarningsSummary({
        pending: 0,
        available: 0,
        withdrawn: 0,
        processing: 0,
        total: 0,
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
          rejectionReason: data.kyc.rejectionReason,
        })
      } else {
        setKycStatus({ status: null })
      }
    } catch (error) {
      console.error("Error fetching KYC status:", error)
      toast({
        title: "Error",
        description: "Failed to load KYC status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === "amount") {
      setFormData({
        ...formData,
        [name]: Number.parseFloat(value) || 0,
      })
    } else if (name.startsWith("accountDetails.")) {
      const field = name.split(".")[1]
      setFormData({
        ...formData,
        accountDetails: {
          ...formData.accountDetails,
          [field]: value,
        },
      })
    }
  }

  const handleMethodChange = (value: "bank_transfer" | "esewa" | "khalti") => {
    setFormData({
      ...formData,
      method: value,
    })
  }

  const handleBankChange = (value: string) => {
    setFormData({
      ...formData,
      accountDetails: {
        ...formData.accountDetails,
        bankName: value,
      },
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.amount < 100) {
      setError("Minimum withdrawal amount is Rs. 100")
      return
    }

    if (formData.amount > earningsSummary.available) {
      setError("Withdrawal amount cannot exceed available balance")
      return
    }

    if (formData.method === "bank_transfer") {
      if (
        !formData.accountDetails.accountName ||
        !formData.accountDetails.accountNumber ||
        !formData.accountDetails.bankName
      ) {
        setError("Please fill in all bank account details")
        return
      }
    } else if (formData.method === "esewa" || formData.method === "khalti") {
      if (!formData.accountDetails.phoneNumber) {
        setError("Please enter your phone number")
        return
      }
    }

    try {
      setSubmitting(true)
      const response = await fetch("/api/affiliate/withdrawals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 403 && data.kycRequired) {
          if (data.kycStatus === "pending") {
            setError("Your KYC verification is pending. Please wait for approval before making a withdrawal.")
          } else if (data.kycStatus === "rejected") {
            setError("Your KYC verification was rejected. Please submit a new KYC verification.")
          } else {
            setError("KYC verification is required for withdrawals. Please complete your KYC verification.")
          }
          return
        }

        throw new Error(data.message || "Failed to submit withdrawal request")
      }

      setSuccess(true)
      toast({
        title: "Success",
        description: "Withdrawal request submitted successfully!",
      })
    } catch (error: any) {
      console.error("Error submitting withdrawal request:", error)
      setError(error.message || "Failed to submit withdrawal request")
      toast({
        title: "Error",
        description: error.message || "Failed to submit withdrawal request",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (amount: number | null | undefined) => {
    const safeAmount = Number(amount) || 0
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(safeAmount)
  }

  const renderKYCAlert = () => {
    if (kycStatus.status === null) {
      return (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">KYC Verification Required</AlertTitle>
          <AlertDescription className="text-red-700">
            You need to complete KYC verification before you can withdraw funds.
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard/kyc")}
                className="border-red-200 text-red-700 hover:bg-red-50"
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
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">KYC Verification Pending</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Your KYC verification is currently under review. You'll be able to withdraw funds once it's approved.
          </AlertDescription>
        </Alert>
      )
    } else if (kycStatus.status === "rejected") {
      return (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">KYC Verification Rejected</AlertTitle>
          <AlertDescription className="text-red-700">
            Your KYC verification was rejected. Reason: {kycStatus.rejectionReason || "Not specified"}
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard/kyc")}
                className="border-red-200 text-red-700 hover:bg-red-50"
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="sm" className="mr-3" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Withdraw Funds</h1>
          </div>
          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-8">
              <div className="flex justify-center items-center py-8">
                <div className="h-8 w-8 border-2 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="sm" className="mr-3" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Withdraw Funds</h1>
          </div>
          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Withdrawal Request Submitted</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Your withdrawal request for {formatCurrency(formData.amount)} has been submitted successfully. Our team
                will process your request within 2-3 business days.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" onClick={() => router.push("/dashboard/payouts")}>
                  View Transactions
                </Button>
                <Button
                  onClick={() => router.push("/dashboard/affiliate-dashboard")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="mr-3" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Withdraw Funds</h1>
        </div>

        {renderKYCAlert() && <div className="mb-6">{renderKYCAlert()}</div>}

        <div className="grid gap-6">
          {/* Balance Overview */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b border-gray-100 bg-gray-50">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Wallet className="h-5 w-5 text-blue-600" />
                Available Balance
              </CardTitle>
              <CardDescription className="text-gray-600">Your current available balance for withdrawal</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(earningsSummary.available)}</div>
                  <div className="text-sm text-gray-500">Available</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-yellow-600">{formatCurrency(earningsSummary.pending)}</div>
                  <div className="text-sm text-gray-500">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">
                    {formatCurrency(earningsSummary.processing)}
                  </div>
                  <div className="text-sm text-gray-500">Processing</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-600">{formatCurrency(earningsSummary.withdrawn)}</div>
                  <div className="text-sm text-gray-500">Withdrawn</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Error</AlertTitle>
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {/* Withdrawal Form */}
          <form onSubmit={handleSubmit}>
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="border-b border-gray-100 bg-gray-50">
                <CardTitle className="text-gray-900">Withdrawal Request</CardTitle>
                <CardDescription className="text-gray-600">Enter your withdrawal details</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-gray-700">
                    Amount (Rs.)
                  </Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    min="100"
                    max={earningsSummary.available}
                    value={formData.amount || ""}
                    onChange={handleInputChange}
                    placeholder="Enter amount"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500">Minimum withdrawal amount: Rs. 100</p>
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-700">Payment Method</Label>
                  <RadioGroup value={formData.method} onValueChange={handleMethodChange} className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                      <CreditCard className="h-4 w-4 text-gray-500" />
                      <Label htmlFor="bank_transfer" className="cursor-pointer font-medium text-gray-700">
                        Bank Transfer
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="esewa" id="esewa" />
                      <Smartphone className="h-4 w-4 text-gray-500" />
                      <Label htmlFor="esewa" className="cursor-pointer font-medium text-gray-700">
                        eSewa
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="khalti" id="khalti" />
                      <Smartphone className="h-4 w-4 text-gray-500" />
                      <Label htmlFor="khalti" className="cursor-pointer font-medium text-gray-700">
                        Khalti
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Tabs value={formData.method} className="mt-6">
                  <TabsContent value="bank_transfer" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bankName" className="text-gray-700">
                          Bank Name
                        </Label>
                        <Select value={formData.accountDetails.bankName} onValueChange={handleBankChange}>
                          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Select bank" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nepal_investment_bank">Nepal Investment Bank</SelectItem>
                            <SelectItem value="nabil_bank">Nabil Bank</SelectItem>
                            <SelectItem value="everest_bank">Everest Bank</SelectItem>
                            <SelectItem value="global_ime_bank">Global IME Bank</SelectItem>
                            <SelectItem value="nmb_bank">NMB Bank</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accountName" className="text-gray-700">
                          Account Holder Name
                        </Label>
                        <Input
                          id="accountName"
                          name="accountDetails.accountName"
                          value={formData.accountDetails.accountName || ""}
                          onChange={handleInputChange}
                          placeholder="Enter account holder name"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required={formData.method === "bank_transfer"}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="accountNumber" className="text-gray-700">
                          Account Number
                        </Label>
                        <Input
                          id="accountNumber"
                          name="accountDetails.accountNumber"
                          value={formData.accountDetails.accountNumber || ""}
                          onChange={handleInputChange}
                          placeholder="Enter account number"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required={formData.method === "bank_transfer"}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="branch" className="text-gray-700">
                          Branch (Optional)
                        </Label>
                        <Input
                          id="branch"
                          name="accountDetails.branch"
                          value={formData.accountDetails.branch || ""}
                          onChange={handleInputChange}
                          placeholder="Enter branch name"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="esewa" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-gray-700">
                        eSewa Registered Phone Number
                      </Label>
                      <Input
                        id="phoneNumber"
                        name="accountDetails.phoneNumber"
                        value={formData.accountDetails.phoneNumber || ""}
                        onChange={handleInputChange}
                        placeholder="Enter phone number"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required={formData.method === "esewa"}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="khalti" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-gray-700">
                        Khalti Registered Phone Number
                      </Label>
                      <Input
                        id="phoneNumber"
                        name="accountDetails.phoneNumber"
                        value={formData.accountDetails.phoneNumber || ""}
                        onChange={handleInputChange}
                        placeholder="Enter phone number"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required={formData.method === "khalti"}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t border-gray-100 flex justify-between">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || earningsSummary.available < 100 || kycStatus.status !== "approved"}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {submitting ? "Processing..." : "Submit Withdrawal Request"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </div>
  )
}
