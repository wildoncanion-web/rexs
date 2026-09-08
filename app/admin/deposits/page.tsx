"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, doc, updateDoc, query, orderBy } from "firebase/firestore"
import { getFirebaseDb } from "@/lib/firebase"
import { AdminHeader } from "@/components/admin/admin-header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, X, Clock, Filter } from "lucide-react"
import { formatUSDateTime } from "@/lib/date"

interface DepositData {
  id: string
  userId: string
  userEmail: string
  amount: number
  crypto: string
  status: "pending" | "confirmed" | "rejected"
  txHash?: string
  createdAt: { seconds: number }
}

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<DepositData[]>([])
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "rejected">("all")

  const fetchDeposits = async () => {
    const db = getFirebaseDb()
    const depositsQuery = query(collection(db, "deposits"), orderBy("createdAt", "desc"))
    const snapshot = await getDocs(depositsQuery)
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as DepositData[]
    setDeposits(data)
  }

  useEffect(() => {
    fetchDeposits()
  }, [])

  const handleStatusChange = async (depositId: string, status: "confirmed" | "rejected") => {
    const db = getFirebaseDb()
    await updateDoc(doc(db, "deposits", depositId), { status })
    fetchDeposits()
  }

  const filteredDeposits = deposits.filter((d) => (filter === "all" ? true : d.status === filter))

  const formatDate = (timestamp: { seconds: number }) => {
    if (!timestamp) return "N/A"
    return formatUSDateTime(timestamp)
  }

  return (
    <div>
      <AdminHeader title="Deposits" description="Review and manage user deposits" />

      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-zinc-500" />
            <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <SelectTrigger className="w-40 border-zinc-800 bg-zinc-900/50 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="border-zinc-800 bg-zinc-950">
                <SelectItem value="all">All Deposits</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-amber-500/20 text-amber-400">
              {deposits.filter((d) => d.status === "pending").length} Pending
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-400">
              {deposits.filter((d) => d.status === "confirmed").length} Confirmed
            </Badge>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-zinc-900/50">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-500">User</TableHead>
                <TableHead className="text-zinc-500">Amount</TableHead>
                <TableHead className="text-zinc-500">Crypto</TableHead>
                <TableHead className="text-zinc-500">Date</TableHead>
                <TableHead className="text-zinc-500">Status</TableHead>
                <TableHead className="text-right text-zinc-500">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeposits.map((deposit) => (
                <TableRow key={deposit.id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell className="text-zinc-400">{deposit.userEmail}</TableCell>
                  <TableCell className="font-medium text-white">{deposit.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        deposit.crypto === "BTC"
                          ? "bg-orange-500/20 text-orange-400"
                          : deposit.crypto === "USDC"
                            ? "bg-blue-500/20 text-blue-400"
                            : deposit.crypto === "USDT"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : deposit.crypto === "TON"
                                ? "bg-sky-500/20 text-sky-400"
                                : "bg-slate-500/20 text-slate-400"
                      }
                    >
                      {deposit.crypto}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-500">{formatDate(deposit.createdAt)}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        deposit.status === "confirmed"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : deposit.status === "pending"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-red-500/20 text-red-400"
                      }
                    >
                      {deposit.status === "pending" && <Clock className="mr-1 h-3 w-3" />}
                      {deposit.status === "confirmed" && <Check className="mr-1 h-3 w-3" />}
                      {deposit.status === "rejected" && <X className="mr-1 h-3 w-3" />}
                      {deposit.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {deposit.status === "pending" && (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => handleStatusChange(deposit.id, "confirmed")}
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusChange(deposit.id, "rejected")}
                        >
                          <X className="mr-1 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredDeposits.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-zinc-500">
                    No deposits found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
