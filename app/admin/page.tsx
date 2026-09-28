"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { getFirebaseDb } from "@/lib/firebase"
import { AdminHeader } from "@/components/admin/admin-header"
import { StatsCard } from "@/components/admin/stats-card"
import { Users, DollarSign, ArrowDownToLine, TrendingUp, Activity, History } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatUSDateTime } from "@/lib/date"
import {
  getTransactionIcon,
  getTransactionIconColor,
  getTransactionPrefix,
  type Transaction,
} from "@/lib/transactions"

interface UserData {
  uid: string
  email: string
  displayName: string
  totalBalance: number
  createdAt: { seconds: number }
}

interface DepositData {
  id: string
  userId: string
  userEmail: string
  amount: number
  crypto: string
  status: "pending" | "confirmed" | "rejected"
  createdAt: { seconds: number }
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserData[]>([])
  const [deposits, setDeposits] = useState<DepositData[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposits: 0,
    pendingDeposits: 0,
    totalBalance: 0,
  })

  useEffect(() => {
    const fetchData = async () => {
      const db = getFirebaseDb()

      const usersSnapshot = await getDocs(collection(db, "users"))
      const usersData = usersSnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as UserData[]
      setUsers(usersData)

      const depositsQuery = query(collection(db, "deposits"), orderBy("createdAt", "desc"), limit(10))
      const depositsSnapshot = await getDocs(depositsQuery)
      const depositsData = depositsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as DepositData[]
      setDeposits(depositsData)

      const transactionsQuery = query(collection(db, "transactions"), orderBy("createdAt", "desc"), limit(8))
      const transactionsSnapshot = await getDocs(transactionsQuery)
      setTransactions(
        transactionsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Transaction[],
      )

      const totalBalance = usersData.reduce((sum, user) => sum + (user.totalBalance || 0), 0)
      const pendingDeposits = depositsData.filter((d) => d.status === "pending").length

      setStats({
        totalUsers: usersData.length,
        totalDeposits: depositsData.length,
        pendingDeposits,
        totalBalance,
      })
    }

    fetchData()
  }, [])

  return (
    <div>
      <AdminHeader title="Dashboard" description="Overview of your investment platform" />

      <div className="p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers.toString()}
            change="+12% from last month"
            changeType="positive"
            icon={Users}
          />
          <StatsCard
            title="Total Balance"
            value={`$${stats.totalBalance.toLocaleString()}`}
            change="+8.2% from last month"
            changeType="positive"
            icon={DollarSign}
            iconColor="text-amber-500"
          />
          <StatsCard
            title="Total Deposits"
            value={stats.totalDeposits.toString()}
            change={`${stats.pendingDeposits} pending`}
            changeType="neutral"
            icon={ArrowDownToLine}
            iconColor="text-sky-500"
          />
          <StatsCard
            title="Active Investments"
            value="24"
            change="+3 this week"
            changeType="positive"
            icon={TrendingUp}
            iconColor="text-purple-500"
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-emerald-500/20 bg-zinc-900/50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Recent Users</h2>
              <Activity className="h-5 w-5 text-emerald-500" />
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-500">Name</TableHead>
                  <TableHead className="text-zinc-500">Email</TableHead>
                  <TableHead className="text-right text-zinc-500">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.slice(0, 5).map((user) => (
                  <TableRow key={user.uid} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell className="font-medium text-white">{user.displayName || "N/A"}</TableCell>
                    <TableCell className="text-zinc-400">{user.email}</TableCell>
                    <TableCell className="text-right text-emerald-400">
                      ${(user.totalBalance || 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-zinc-500">
                      No users yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-zinc-900/50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Recent Deposits</h2>
              <ArrowDownToLine className="h-5 w-5 text-emerald-500" />
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-500">User</TableHead>
                  <TableHead className="text-zinc-500">Amount</TableHead>
                  <TableHead className="text-right text-zinc-500">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deposits.slice(0, 5).map((deposit) => (
                  <TableRow key={deposit.id} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell className="text-zinc-400">{deposit.userEmail}</TableCell>
                    <TableCell className="font-medium text-white">
                      {deposit.amount} {deposit.crypto}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          deposit.status === "confirmed"
                            ? "default"
                            : deposit.status === "pending"
                              ? "secondary"
                              : "destructive"
                        }
                        className={
                          deposit.status === "confirmed"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : deposit.status === "pending"
                              ? "bg-amber-500/20 text-amber-400"
                              : ""
                        }
                      >
                        {deposit.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {deposits.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-zinc-500">
                      No deposits yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-emerald-500/20 bg-zinc-900/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-emerald-500" />
              <h2 className="text-lg font-semibold text-white">Recent Transaction History</h2>
            </div>
            <Link href="/admin/transactions" className="text-sm font-medium text-emerald-400 hover:text-emerald-300">
              View all
            </Link>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-500">Type</TableHead>
                <TableHead className="text-zinc-500">User</TableHead>
                <TableHead className="text-zinc-500">Date</TableHead>
                <TableHead className="text-right text-zinc-500">Amount</TableHead>
                <TableHead className="text-right text-zinc-500">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => {
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
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-zinc-500">
                    No transactions yet
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
