"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TransactionList } from "@/components/dashboard/transaction-list"
import { User, Mail, Calendar, Loader2 } from "lucide-react"
import { formatUSDate } from "@/lib/date"
import { getFirebaseDb } from "@/lib/firebase"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import type { Transaction } from "@/lib/transactions"

export default function ProfilePage() {
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
        const q = query(collection(db, "transactions"), where("userId", "==", user.uid), orderBy("createdAt", "desc"))
        const snapshot = await getDocs(q)
        setTransactions(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Transaction[])
      } catch (error) {
        console.error("Error fetching transactions:", error)
      } finally {
        setLoadingTx(false)
      }
    }

    if (user) fetchTransactions()
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
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
            <p className="mt-1 text-muted-foreground">Manage your account information</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="history">Transaction History</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              {/* Profile Info Card */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">Personal Information</CardTitle>
                  <CardDescription>Your account details and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">{userProfile?.displayName}</h3>
                      <p className="text-muted-foreground">Investor</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Full Name</Label>
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-input p-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{userProfile?.displayName}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Email Address</Label>
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-input p-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{user?.email}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Member Since</Label>
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-input p-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">
                          {userProfile?.createdAt
                            ? formatUSDate(new Date(userProfile.createdAt), userProfile.timezone)
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Account Status</Label>
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-input p-3">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-foreground">Active</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Card */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">Security</CardTitle>
                  <CardDescription>Manage your password and security settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
                    <div>
                      <p className="font-medium text-foreground">Password</p>
                      <p className="text-sm text-muted-foreground">Last changed: Never</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Change Password
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">Transaction History</CardTitle>
                  <CardDescription>Every deposit, withdrawal, bonus, credit, and profit adjustment on your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <TransactionList transactions={transactions} loading={loadingTx} timezone={userProfile?.timezone} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
