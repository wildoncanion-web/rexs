"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { LineChart, Loader2, Plus, Shield, TrendingDown, TrendingUp, Wallet } from "lucide-react"
import { collection, getDocs, orderBy, query, where } from "firebase/firestore"
import { useAuth } from "@/contexts/auth-context"
import { getFirebaseDb } from "@/lib/firebase"
import { cryptoToUsd } from "@/lib/crypto-prices"
import { formatUSShortDate, getUSGreeting } from "@/lib/date"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface LedgerTransaction {
  id: string
  type: "deposit" | "withdrawal" | "bonus" | "credit" | "profit" | "earning"
  amount: number
  createdAt: { seconds: number }
}

const ALLOCATION_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

export default function DashboardPage() {
  const { user, userProfile, loading, isAdmin } = useAuth()
  const router = useRouter()
  const [range, setRange] = useState("1W")
  const [ledger, setLedger] = useState<LedgerTransaction[]>([])
  const [ledgerLoading, setLedgerLoading] = useState(true)
  // Start null and set on mount to avoid a server/client hydration mismatch, since the
  // greeting depends on the current time in US Eastern rather than any fixed server render.
  const [greeting, setGreeting] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) router.push("/login")
  }, [user, loading, router])

  useEffect(() => {
    setGreeting(getUSGreeting())
    const interval = setInterval(() => setGreeting(getUSGreeting()), 60_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchLedger = async () => {
      if (!user) return
      try {
        const db = getFirebaseDb()
        const q = query(collection(db, "transactions"), where("userId", "==", user.uid), orderBy("createdAt", "asc"))
        const snapshot = await getDocs(q)
        setLedger(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as LedgerTransaction[])
      } catch (error) {
        console.error("Error fetching balance history:", error)
      } finally {
        setLedgerLoading(false)
      }
    }
    fetchLedger()
  }, [user])

  const totalBalance = userProfile?.totalBalance || 0

  // Every transaction is stored as a positive amount; only "withdrawal" reduces the balance.
  // Walk the real ledger to build an honest balance-over-time series ending at the current total.
  const performanceData = useMemo(() => {
    if (ledger.length === 0) {
      return [{ date: "Now", value: totalBalance }]
    }
    const signedDelta = (tx: LedgerTransaction) => (tx.type === "withdrawal" ? -tx.amount : tx.amount)
    const netChange = ledger.reduce((sum, tx) => sum + signedDelta(tx), 0)
    let running = totalBalance - netChange
    const points = [{ date: "Start", value: running }]
    for (const tx of ledger) {
      running += signedDelta(tx)
      points.push({ date: formatUSShortDate(tx.createdAt), value: running })
    }
    return points
  }, [ledger, totalBalance])

  const todaysChange = useMemo(() => {
    // Determine "today" using US Eastern Time, not the visitor's local timezone.
    const nowInUS = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }))
    nowInUS.setHours(0, 0, 0, 0)
    const cutoff = nowInUS.getTime() / 1000
    const signedDelta = (tx: LedgerTransaction) => (tx.type === "withdrawal" ? -tx.amount : tx.amount)
    return ledger.filter((tx) => tx.createdAt.seconds >= cutoff).reduce((sum, tx) => sum + signedDelta(tx), 0)
  }, [ledger])

  const allocation = useMemo(() => {
    const holdings = userProfile?.holdings
    if (!holdings) return []
    return Object.entries(holdings)
      .map(([crypto, amount], index) => ({
        name: crypto,
        usd: cryptoToUsd(crypto, amount || 0),
        color: ALLOCATION_COLORS[index % ALLOCATION_COLORS.length],
      }))
      .filter((entry) => entry.usd > 0)
  }, [userProfile])

  const holdingsTotal = allocation.reduce((sum, entry) => sum + entry.usd, 0)

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="size-8 animate-spin text-primary" /></div>
  if (!user) return null

  const displayName = userProfile?.displayName?.split(" ")[0] || "Investor"

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="mx-auto flex max-w-[1600px] flex-col gap-6 px-4 py-6 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">Portfolio overview</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{greeting || "Welcome"}, {displayName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Here&apos;s what&apos;s happening with your investments today.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/deposit"><Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"><Plus data-icon="inline-start" /> Deposit</Button></Link>
            {isAdmin && <Link href="/admin"><Button variant="outline" className="gap-2"><Shield data-icon="inline-start" /> Admin panel</Button></Link>}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,65fr)_minmax(300px,35fr)]">
          <section className="flex min-w-0 flex-col gap-6">
            <Card className="border-border bg-card shadow-none">
              <CardContent className="p-6 md:p-8">
                <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
                <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
                  <p className="text-4xl font-semibold tracking-tight text-card-foreground md:text-5xl">
                    ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  {todaysChange !== 0 && (
                    <p className={`mb-1 flex items-center gap-1 text-sm font-medium ${todaysChange > 0 ? "text-primary" : "text-destructive"}`}>
                      {todaysChange > 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                      {todaysChange > 0 ? "+" : ""}
                      ${Math.abs(todaysChange).toLocaleString(undefined, { maximumFractionDigits: 2 })} Today
                    </p>
                  )}
                </div>
                <div className="mt-8 flex flex-col gap-5">
                  <ToggleGroup type="single" value={range} onValueChange={(value) => value && setRange(value)} className="justify-start gap-1">
                    {['1D', '1W', '1M', '1Y', 'ALL'].map((item) => <ToggleGroupItem key={item} value={item} className="h-8 rounded-full px-3 text-xs text-muted-foreground data-[state=on]:bg-secondary data-[state=on]:text-foreground">{item}</ToggleGroupItem>)}
                  </ToggleGroup>
                  <div className="h-[260px] w-full">
                    {ledgerLoading ? (
                      <div className="flex h-full items-center justify-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
                    ) : ledger.length === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-center">
                        <LineChart className="size-8 text-muted-foreground" />
                        <p className="text-sm font-medium text-card-foreground">No activity yet</p>
                        <p className="text-xs text-muted-foreground">Your balance history will appear here once you make a deposit.</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={performanceData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                          <defs><linearGradient id="portfolio-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.24} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient></defs>
                          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                          <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
                          <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" }} formatter={(value: number) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, "Balance"]} />
                          <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2.5} fill="url(#portfolio-fill)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-border bg-card shadow-none">
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-base font-semibold tracking-tight">Asset Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                  {allocation.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
                      <Wallet className="size-8 text-muted-foreground" />
                      <p className="text-sm font-medium text-card-foreground">No holdings yet</p>
                      <p className="text-xs text-muted-foreground">Make a deposit to see your allocation here.</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-6">
                      <div className="relative size-32 shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={allocation} dataKey="usd" innerRadius={43} outerRadius={60} paddingAngle={3} strokeWidth={0}>
                              {allocation.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-lg font-semibold">${holdingsTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                          <span className="text-[10px] text-muted-foreground">in crypto</span>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col gap-3">
                        {allocation.map((item) => (
                          <div key={item.name} className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-muted-foreground">
                              <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                              {item.name}
                            </span>
                            <span className="min-w-12 text-right font-mono text-sm font-semibold tabular-nums text-card-foreground">
                              {holdingsTotal > 0 ? Math.round((item.usd / holdingsTotal) * 100) : 0}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <RecentTransactions />
            </div>
          </section>

          <aside className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
            <Card className="border-border bg-card shadow-none">
              <CardHeader>
                <CardTitle className="text-base">Crypto Holdings</CardTitle>
                <p className="text-sm text-muted-foreground">Your balance by coin, set by the account admin</p>
              </CardHeader>
              <CardContent className="flex flex-col gap-1">
                {(["BTC", "USDT", "LTC"] as const).map((crypto) => {
                  const amount = userProfile?.holdings?.[crypto] || 0
                  return (
                    <div key={crypto} className="flex items-center justify-between rounded-lg px-2 py-3 transition-colors hover:bg-secondary">
                      <div>
                        <p className="font-mono text-sm font-semibold text-card-foreground">{crypto}</p>
                        <p className="text-xs text-muted-foreground">{amount.toLocaleString(undefined, { maximumFractionDigits: 8 })} {crypto}</p>
                      </div>
                      <p className="text-sm font-medium text-card-foreground">
                        ${cryptoToUsd(crypto, amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
            <Card className="border-border bg-card shadow-none">
              <CardHeader>
                <CardTitle className="text-base">Need to add funds?</CardTitle>
                <p className="text-sm text-muted-foreground">Send crypto to your deposit address and your balance updates once confirmed.</p>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Link href="/dashboard/deposit"><Button className="h-11 w-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90">Go to Deposit</Button></Link>
                <Link href="/dashboard/withdraw"><Button variant="outline" className="h-11 w-full">Withdraw funds</Button></Link>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  )
}
