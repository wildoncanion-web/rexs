"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { getFirebaseDb } from "@/lib/firebase"
import { AdminHeader } from "@/components/admin/admin-header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Clock, DollarSign } from "lucide-react"
import { formatUSDate } from "@/lib/date"

interface InvestmentData {
  id: string
  userId: string
  userEmail: string
  planName: string
  amount: number
  roi: number
  duration: number
  startDate: { seconds: number }
  endDate: { seconds: number }
  status: "active" | "completed" | "cancelled"
  earnings: number
}

export default function AdminInvestmentsPage() {
  const [investments, setInvestments] = useState<InvestmentData[]>([])

  useEffect(() => {
    const fetchInvestments = async () => {
      const db = getFirebaseDb()
      const investmentsQuery = query(collection(db, "investments"), orderBy("startDate", "desc"))
      const snapshot = await getDocs(investmentsQuery)
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as InvestmentData[]
      setInvestments(data)
    }

    fetchInvestments()
  }, [])

  const formatDate = (timestamp: { seconds: number }) => {
    if (!timestamp) return "N/A"
    return formatUSDate(timestamp)
  }

  const calculateProgress = (start: { seconds: number }, end: { seconds: number }) => {
    if (!start || !end) return 0
    const now = Date.now() / 1000
    const total = end.seconds - start.seconds
    const elapsed = now - start.seconds
    return Math.min(100, Math.max(0, (elapsed / total) * 100))
  }

  const totalInvested = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0)
  const totalEarnings = investments.reduce((sum, inv) => sum + (inv.earnings || 0), 0)
  const activeInvestments = investments.filter((inv) => inv.status === "active").length

  return (
    <div>
      <AdminHeader title="Investments" description="Track all user investments and returns" />

      <div className="p-6">
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="flex items-center gap-4 rounded-xl border border-emerald-500/20 bg-zinc-900/50 p-4">
            <div className="rounded-lg bg-emerald-500/20 p-3">
              <DollarSign className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Total Invested</p>
              <p className="text-xl font-bold text-white">${totalInvested.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-emerald-500/20 bg-zinc-900/50 p-4">
            <div className="rounded-lg bg-amber-500/20 p-3">
              <TrendingUp className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Total Earnings</p>
              <p className="text-xl font-bold text-white">${totalEarnings.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-emerald-500/20 bg-zinc-900/50 p-4">
            <div className="rounded-lg bg-sky-500/20 p-3">
              <Clock className="h-6 w-6 text-sky-500" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Active Investments</p>
              <p className="text-xl font-bold text-white">{activeInvestments}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-zinc-900/50">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-500">User</TableHead>
                <TableHead className="text-zinc-500">Plan</TableHead>
                <TableHead className="text-zinc-500">Amount</TableHead>
                <TableHead className="text-zinc-500">ROI</TableHead>
                <TableHead className="text-zinc-500">Progress</TableHead>
                <TableHead className="text-zinc-500">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investments.map((investment) => (
                <TableRow key={investment.id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell className="text-zinc-400">{investment.userEmail}</TableCell>
                  <TableCell className="font-medium text-white">{investment.planName}</TableCell>
                  <TableCell className="text-emerald-400">${(investment.amount || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-amber-400">{investment.roi}%</TableCell>
                  <TableCell>
                    <div className="w-32">
                      <Progress
                        value={calculateProgress(investment.startDate, investment.endDate)}
                        className="h-2 bg-zinc-800"
                      />
                      <p className="mt-1 text-xs text-zinc-500">
                        {formatDate(investment.startDate)} - {formatDate(investment.endDate)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        investment.status === "active"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : investment.status === "completed"
                            ? "bg-sky-500/20 text-sky-400"
                            : "bg-red-500/20 text-red-400"
                      }
                    >
                      {investment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {investments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-zinc-500">
                    No investments yet
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
