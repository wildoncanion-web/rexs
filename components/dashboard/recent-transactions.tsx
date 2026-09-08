"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownLeft, Gift, CreditCard, TrendingUp, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getFirebaseDb } from "@/lib/firebase"
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore"

interface Transaction {
  id: string
  type: "deposit" | "withdrawal" | "bonus" | "credit" | "profit" | "earning"
  amount: number
  crypto?: string
  description?: string
  status?: string
  createdAt: { seconds: number }
}

export function RecentTransactions() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return
      
      try {
        const db = getFirebaseDb()
        const q = query(
          collection(db, "transactions"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(5)
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
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [user])

  const getIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="h-5 w-5 text-primary" />
      case "withdrawal":
        return <ArrowUpRight className="h-5 w-5 text-destructive" />
      case "bonus":
        return <Gift className="h-5 w-5 text-amber-500" />
      case "credit":
        return <CreditCard className="h-5 w-5 text-blue-500" />
      case "profit":
      case "earning":
        return <TrendingUp className="h-5 w-5 text-primary" />
      default:
        return <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
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
        return "text-destructive"
      default:
        return "text-foreground"
    }
  }

  const getPrefix = (type: string) => {
    return ["withdrawal"].includes(type) ? "-" : "+"
  }

  if (loading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <ArrowUpRight className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">No transactions yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Make your first deposit to start investing</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 border-b border-border/70 py-3 last:border-0">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    {getIcon(tx.type)}
                  </div>
                  <div>
                    <p className="truncate text-sm font-medium capitalize text-foreground">{tx.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(tx.createdAt.seconds * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${getAmountColor(tx.type)}`}>
                    {getPrefix(tx.type)}${tx.amount.toLocaleString()} {tx.crypto || "USD"}
                  </p>
                  {tx.description && (
                    <p className="text-xs text-muted-foreground truncate max-w-[120px]">{tx.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
