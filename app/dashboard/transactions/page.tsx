"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownLeft, Gift, CreditCard, TrendingUp, Loader2 } from "lucide-react"
import { getFirebaseDb } from "@/lib/firebase"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { formatUSDate } from "@/lib/date"

interface Transaction {
  id: string
  type: "deposit" | "withdrawal" | "bonus" | "credit" | "profit" | "earning"
  amount: number
  crypto?: string
  description?: string
  status?: string
  createdAt: { seconds: number }
}

export default function TransactionsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingTx, setLoadingTx] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return
      
      try {
        const db = getFirebaseDb()
        const q = query(
          collection(db, "transactions"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        )
        const snapshot = await getDocs(q)
        const txs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Transaction[]
        setTransactions(txs)
      } catch (error) {
        console.error("Error fetching transactions:", error)
      } finally {
        setLoadingTx(false)
      }
    }

    if (user) {
      fetchTransactions()
    }
  }, [user])

  const getIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="h-6 w-6 text-primary" />
      case "withdrawal":
        return <ArrowUpRight className="h-6 w-6 text-red-500" />
      case "bonus":
        return <Gift className="h-6 w-6 text-amber-500" />
      case "credit":
        return <CreditCard className="h-6 w-6 text-blue-500" />
      case "profit":
      case "earning":
        return <TrendingUp className="h-6 w-6 text-primary" />
      default:
        return <ArrowUpRight className="h-6 w-6 text-muted-foreground" />
    }
  }

  const getAmountColor = (type: string) => {
    switch (type) {
      case "deposit":
      case "bonus":
      case "credit":
      case "profit":
      case "earning":
        return "text-primary"
      case "withdrawal":
        return "text-red-500"
      default:
        return "text-foreground"
    }
  }

  const getPrefix = (type: string) => {
    return ["withdrawal"].includes(type) ? "-" : "+"
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="px-4 py-8 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Transaction History</h1>
            <p className="mt-1 text-muted-foreground">View all your deposits, withdrawals, and earnings</p>
          </div>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">All Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTx ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <ArrowUpRight className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="mt-6 text-lg font-medium text-foreground">No transactions yet</p>
                  <p className="mt-2 max-w-sm text-muted-foreground">
                    Your transaction history will appear here once you make your first deposit
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                          {getIcon(tx.type)}
                        </div>
                        <div>
                          <p className="font-medium capitalize text-foreground">{tx.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatUSDate(tx.createdAt)}
                          </p>
                          {tx.description && (
                            <p className="text-xs text-muted-foreground">{tx.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${getAmountColor(tx.type)}`}>
                          {getPrefix(tx.type)}${tx.amount.toLocaleString()} {tx.crypto || "USD"}
                        </p>
                        {tx.status && (
                          <p className={`text-sm capitalize ${
                            tx.status === "completed" || tx.status === "confirmed"
                              ? "text-primary"
                              : tx.status === "pending"
                                ? "text-amber-500"
                                : "text-destructive"
                          }`}>
                            {tx.status}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
