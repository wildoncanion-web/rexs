"use client"

import { useEffect, useMemo, useState } from "react"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { getFirebaseDb } from "@/lib/firebase"
import { AdminHeader } from "@/components/admin/admin-header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, History } from "lucide-react"
import { formatUSDateTime } from "@/lib/date"
import {
  getTransactionIcon,
  getTransactionIconColor,
  getTransactionPrefix,
  type Transaction,
} from "@/lib/transactions"

const TYPE_OPTIONS = ["all", "deposit", "withdrawal", "bonus", "credit", "profit", "earning"] as const

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const db = getFirebaseDb()
        const q = query(collection(db, "transactions"), orderBy("createdAt", "desc"))
        const snapshot = await getDocs(q)
        setTransactions(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Transaction[])
      } catch (error) {
        console.error("Error fetching all transactions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesType = typeFilter === "all" || tx.type === typeFilter
      const matchesSearch =
        !search ||
        tx.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
        tx.description?.toLowerCase().includes(search.toLowerCase())
      return matchesType && matchesSearch
    })
  }, [transactions, search, typeFilter])

  return (
    <div>
      <AdminHeader title="Transaction History" description="Every deposit, withdrawal, bonus, credit, and profit adjustment across all users" />

      <div className="p-6">
        <div className="rounded-xl border border-emerald-500/20 bg-zinc-900/50 p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-emerald-500" />
              <h2 className="text-lg font-semibold text-white">All Transactions</h2>
            </div>
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:justify-end">
              <div className="relative sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  placeholder="Search by user email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border-zinc-800 bg-zinc-900 pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="border-zinc-800 bg-zinc-900 sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-zinc-800 bg-zinc-950">
                  {TYPE_OPTIONS.map((type) => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-500">Type</TableHead>
                  <TableHead className="text-zinc-500">User</TableHead>
                  <TableHead className="text-zinc-500">Date</TableHead>
                  <TableHead className="text-zinc-500">Note</TableHead>
                  <TableHead className="text-right text-zinc-500">Amount</TableHead>
                  <TableHead className="text-right text-zinc-500">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((tx) => {
                  const Icon = getTransactionIcon(tx.type)
                  return (
                    <TableRow key={tx.id} className="border-zinc-800 hover:bg-zinc-800/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${getTransactionIconColor(tx.type)}`} />
                          <span className="capitalize text-white">{tx.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-400">{tx.userEmail || "N/A"}</TableCell>
                      <TableCell className="text-zinc-400">{formatUSDateTime(tx.createdAt)}</TableCell>
                      <TableCell className="max-w-[220px] truncate text-zinc-500">{tx.description || "—"}</TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          tx.type === "withdrawal" ? "text-red-400" : "text-emerald-400"
                        }`}
                      >
                        {getTransactionPrefix(tx.type)}${tx.amount.toLocaleString()} {tx.crypto || "USD"}
                      </TableCell>
                      <TableCell className="text-right">
                        {tx.status ? (
                          <Badge
                            className={
                              tx.status === "completed" || tx.status === "confirmed"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : tx.status === "pending"
                                  ? "bg-amber-500/20 text-amber-400"
                                  : "bg-red-500/20 text-red-400"
                            }
                          >
                            {tx.status}
                          </Badge>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-zinc-500">
                      No transactions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  )
}
