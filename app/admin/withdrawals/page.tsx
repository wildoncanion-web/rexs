"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, doc, updateDoc, addDoc, Timestamp, query, orderBy, where } from "firebase/firestore"
import { getFirebaseDb } from "@/lib/firebase"
import { AdminHeader } from "@/components/admin/admin-header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpFromLine, Key, CheckCircle, XCircle, Clock, Copy, RefreshCw, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

interface WithdrawalData {
  id: string
  userId: string
  userEmail: string
  userName: string
  amount: number
  crypto?: string
  walletAddress?: string
  withdrawalMethod?: "crypto" | "bank"
  bankDetails?: {
    bankName: string
    accountName: string
    accountNumber: string
    routingNumber: string
    accountType: string
  }
  status: "pending_otp" | "pending" | "processing" | "completed" | "rejected"
  otpVerified: boolean
  createdAt: { seconds: number }
  estimatedCompletion?: Date
}

const Loading = () => null

export default function AdminWithdrawalsPage() {
  const searchParams = useSearchParams()
  const [withdrawals, setWithdrawals] = useState<WithdrawalData[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalData | null>(null)
  const [otpDialogOpen, setOtpDialogOpen] = useState(false)
  const [generatedOtp, setGeneratedOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const fetchWithdrawals = async () => {
    const db = getFirebaseDb()
    const q = query(collection(db, "withdrawals"), orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)
    const data = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as WithdrawalData[]
    setWithdrawals(data)
  }

  useEffect(() => {
    fetchWithdrawals()
  }, [])

  const generateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedOtp(otp)
    return otp
  }

  const handleGenerateOtp = async (withdrawal: WithdrawalData) => {
    setSelectedWithdrawal(withdrawal)
    const otp = generateOtp()
    setOtpDialogOpen(true)

    try {
      const db = getFirebaseDb()
      
      // Save OTP to database
      await addDoc(collection(db, "withdrawal_otps"), {
        withdrawalId: withdrawal.id,
        userId: withdrawal.userId,
        userEmail: withdrawal.userEmail,
        otp: otp,
        used: false,
        createdAt: Timestamp.now(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours expiry
      })

      toast({
        title: "OTP Generated",
        description: `OTP ${otp} generated for ${withdrawal.userEmail}. Share this by email.`,
      })
    } catch (err) {
      console.error("Error generating OTP:", err)
      toast({
        title: "Error",
        description: "Failed to generate OTP",
        variant: "destructive",
      })
    }
  }

  const handleCopyOtp = () => {
    navigator.clipboard.writeText(generatedOtp)
    toast({
      title: "Copied",
      description: "OTP copied to clipboard",
    })
  }

  const handleUpdateStatus = async (withdrawal: WithdrawalData, newStatus: string) => {
    setIsLoading(true)
    try {
      const db = getFirebaseDb()
      await updateDoc(doc(db, "withdrawals", withdrawal.id), {
        status: newStatus,
        updatedAt: Timestamp.now(),
        ...(newStatus === "completed" ? { completedAt: Timestamp.now() } : {}),
      })

      // If completed, also update transaction record
      if (newStatus === "completed") {
        const transQuery = query(
          collection(db, "transactions"),
          where("userId", "==", withdrawal.userId),
          where("type", "==", "withdrawal"),
          where("crypto", "==", withdrawal.crypto)
        )
        const transSnapshot = await getDocs(transQuery)
        if (!transSnapshot.empty) {
          await updateDoc(doc(db, "transactions", transSnapshot.docs[0].id), {
            status: "completed",
          })
        }
      }

      toast({
        title: "Status Updated",
        description: `Withdrawal status updated to ${newStatus}`,
      })
      fetchWithdrawals()
    } catch (err) {
      console.error("Error updating status:", err)
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRejectWithdrawal = async (withdrawal: WithdrawalData) => {
    if (!confirm("Are you sure you want to reject this withdrawal? The funds will be returned to the user's account.")) return

    setIsLoading(true)
    try {
      const db = getFirebaseDb()
      
      // Update withdrawal status
      await updateDoc(doc(db, "withdrawals", withdrawal.id), {
        status: "rejected",
        rejectedAt: Timestamp.now(),
      })

      // Return funds to user
      const userDoc = await getDocs(query(collection(db, "users"), where("__name__", "==", withdrawal.userId)))
      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data()
        const newHoldings = { ...userData.holdings }
        newHoldings[withdrawal.crypto as keyof typeof newHoldings] = 
          (newHoldings[withdrawal.crypto as keyof typeof newHoldings] || 0) + withdrawal.amount

        await updateDoc(doc(db, "users", withdrawal.userId), {
          holdings: newHoldings,
          totalBalance: (userData.totalBalance || 0) + withdrawal.amount,
          availableBalance: (userData.availableBalance || 0) + withdrawal.amount,
        })
      }

      // Add refund transaction
      await addDoc(collection(db, "transactions"), {
        userId: withdrawal.userId,
        userEmail: withdrawal.userEmail,
        type: "refund",
        amount: withdrawal.amount,
        crypto: withdrawal.crypto,
        description: "Withdrawal rejected - funds returned",
        createdAt: Timestamp.now(),
      })

      toast({
        title: "Withdrawal Rejected",
        description: "Funds have been returned to the user's account",
      })
      fetchWithdrawals()
    } catch (err) {
      console.error("Error rejecting withdrawal:", err)
      toast({
        title: "Error",
        description: "Failed to reject withdrawal",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_otp":
        return <Badge className="bg-amber-500/20 text-amber-400">Awaiting OTP</Badge>
      case "pending":
        return <Badge className="bg-blue-500/20 text-blue-400">Pending (2 days)</Badge>
      case "processing":
        return <Badge className="bg-purple-500/20 text-purple-400">Processing</Badge>
      case "completed":
        return <Badge className="bg-emerald-500/20 text-emerald-400">Completed</Badge>
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-400">Rejected</Badge>
      default:
        return <Badge className="bg-zinc-500/20 text-zinc-400">{status}</Badge>
    }
  }

  const filteredWithdrawals = withdrawals.filter((w) => {
    const matchesStatus = statusFilter === "all" || w.status === statusFilter
    const matchesSearch = 
      w.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.walletAddress?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <Suspense fallback={<Loading />}>
      <div>
        <AdminHeader title="Withdrawals Management" description="Manage withdrawal requests and generate OTPs" />

        <div className="p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  placeholder="Search by email, name, or wallet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-zinc-800 bg-zinc-900/50 pl-9 text-white placeholder:text-zinc-500"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-44 border-zinc-800 bg-zinc-900/50 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="border-zinc-800 bg-zinc-950">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending_otp">Awaiting OTP</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={fetchWithdrawals}
              variant="outline"
              className="border-zinc-700 gap-2 bg-transparent"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <div className="rounded-lg border border-amber-500/20 bg-zinc-900/50 p-4">
              <p className="text-sm text-zinc-500">Awaiting OTP</p>
              <p className="text-2xl font-bold text-amber-400">
                {withdrawals.filter((w) => w.status === "pending_otp").length}
              </p>
            </div>
            <div className="rounded-lg border border-blue-500/20 bg-zinc-900/50 p-4">
              <p className="text-sm text-zinc-500">Pending (2 days)</p>
              <p className="text-2xl font-bold text-blue-400">
                {withdrawals.filter((w) => w.status === "pending").length}
              </p>
            </div>
            <div className="rounded-lg border border-emerald-500/20 bg-zinc-900/50 p-4">
              <p className="text-sm text-zinc-500">Completed</p>
              <p className="text-2xl font-bold text-emerald-400">
                {withdrawals.filter((w) => w.status === "completed").length}
              </p>
            </div>
            <div className="rounded-lg border border-red-500/20 bg-zinc-900/50 p-4">
              <p className="text-sm text-zinc-500">Rejected</p>
              <p className="text-2xl font-bold text-red-400">
                {withdrawals.filter((w) => w.status === "rejected").length}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-zinc-900/50">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-500">User</TableHead>
                  <TableHead className="text-zinc-500">Amount</TableHead>
                  <TableHead className="text-zinc-500">Destination</TableHead>
                  <TableHead className="text-zinc-500">Status</TableHead>
                  <TableHead className="text-zinc-500">Date</TableHead>
                  <TableHead className="text-right text-zinc-500">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWithdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell>
                      <div>
                        <p className="font-medium text-white">{withdrawal.userName}</p>
                        <p className="text-sm text-zinc-500">{withdrawal.userEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-white">
                        {withdrawal.withdrawalMethod === "bank" || withdrawal.bankDetails 
                          ? `$${withdrawal.amount.toLocaleString()}` 
                          : `${withdrawal.amount} ${withdrawal.crypto}`}
                      </span>
                    </TableCell>
                    <TableCell>
                      {withdrawal.withdrawalMethod === "bank" || withdrawal.bankDetails ? (
                        <div className="text-xs text-zinc-400">
                          <p className="font-medium text-white">{withdrawal.bankDetails?.bankName || "Bank"}</p>
                          <p>****{withdrawal.bankDetails?.accountNumber?.slice(-4) || "N/A"} ({withdrawal.bankDetails?.accountType || "N/A"})</p>
                        </div>
                      ) : withdrawal.walletAddress && withdrawal.walletAddress.length > 20 ? (
                        <code className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded">
                          {withdrawal.walletAddress.slice(0, 12)}...{withdrawal.walletAddress.slice(-8)}
                        </code>
                      ) : withdrawal.walletAddress ? (
                        <code className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded">
                          {withdrawal.walletAddress}
                        </code>
                      ) : (
                        <span className="text-zinc-500">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                    <TableCell className="text-zinc-400">
                      {new Date(withdrawal.createdAt.seconds * 1000).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {withdrawal.status === "pending_otp" && (
                          <Button
                            size="sm"
                            onClick={() => handleGenerateOtp(withdrawal)}
                            className="bg-amber-600 hover:bg-amber-700 gap-1"
                          >
                            <Key className="h-3 w-3" />
                            Generate OTP
                          </Button>
                        )}
                        {withdrawal.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(withdrawal, "completed")}
                              disabled={isLoading}
                              className="bg-emerald-600 hover:bg-emerald-700 gap-1"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Complete
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectWithdrawal(withdrawal)}
                              disabled={isLoading}
                              className="border-red-500 text-red-400 hover:bg-red-500/10 gap-1"
                            >
                              <XCircle className="h-3 w-3" />
                              Reject
                            </Button>
                          </>
                        )}
                        {withdrawal.status === "processing" && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(withdrawal, "completed")}
                            disabled={isLoading}
                            className="bg-emerald-600 hover:bg-emerald-700 gap-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredWithdrawals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-zinc-500 py-8">
                      <ArrowUpFromLine className="mx-auto h-8 w-8 mb-2 text-zinc-700" />
                      No withdrawals found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <Dialog open={otpDialogOpen} onOpenChange={setOtpDialogOpen}>
          <DialogContent className="border-zinc-800 bg-zinc-950 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-amber-500" />
                OTP Generated
              </DialogTitle>
              <DialogDescription className="text-zinc-500">
                Share this OTP with the user by email
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                <p className="text-sm text-zinc-500 mb-2">User: {selectedWithdrawal?.userEmail}</p>
                <p className="text-sm text-zinc-500 mb-2">
                  Amount: {selectedWithdrawal?.withdrawalMethod === "bank" || selectedWithdrawal?.bankDetails 
                    ? `$${selectedWithdrawal?.amount?.toLocaleString()}` 
                    : `${selectedWithdrawal?.amount} ${selectedWithdrawal?.crypto}`}
                </p>
                <p className="text-sm text-zinc-500 break-all">
                  {selectedWithdrawal?.withdrawalMethod === "bank" || selectedWithdrawal?.bankDetails 
                    ? `Bank: ${selectedWithdrawal?.bankDetails?.bankName} - ****${selectedWithdrawal?.bankDetails?.accountNumber?.slice(-4)}`
                    : `Wallet: ${selectedWithdrawal?.walletAddress || 'N/A'}`}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-zinc-300">OTP Code</Label>
                <div className="flex gap-2">
                  <Input
                    value={generatedOtp}
                    readOnly
                    className="border-zinc-800 bg-zinc-900 text-center text-3xl font-bold tracking-widest text-emerald-400"
                  />
                  <Button onClick={handleCopyOtp} variant="outline" className="border-zinc-700 bg-transparent">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-zinc-500">
                  This OTP expires in 24 hours. Share it securely with the user.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    const newOtp = generateOtp()
                    handleGenerateOtp(selectedWithdrawal!)
                  }}
                  variant="outline"
                  className="flex-1 border-zinc-700"
                >
                  Regenerate OTP
                </Button>
                <Button
                  onClick={() => setOtpDialogOpen(false)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  Done
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Suspense>
  )
}
