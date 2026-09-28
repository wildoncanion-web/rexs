"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TransactionList } from "@/components/dashboard/transaction-list"
import { Loader2 } from "lucide-react"
import { getFirebaseDb } from "@/lib/firebase"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import type { Transaction } from "@/lib/transactions"

export default function TransactionsPage() {
  const { user, userProfile, loading } = useAuth()
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
              <TransactionList transactions={transactions} loading={loadingTx} timezone={userProfile?.timezone} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
