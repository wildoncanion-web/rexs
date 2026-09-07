"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Bell, ChevronDown, Loader2, Search, Shield, TrendingDown, TrendingUp } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const performanceData = [
  { date: "Sep 1", value: 118400 },
  { date: "Sep 2", value: 119800 },
  { date: "Sep 3", value: 119200 },
  { date: "Sep 4", value: 121600 },
  { date: "Sep 5", value: 120900 },
  { date: "Sep 6", value: 123100 },
  { date: "Sep 7", value: 124500 },
]

const allocation = [
  { name: "Stocks", value: 60, color: "var(--chart-1)" },
  { name: "Crypto", value: 20, color: "var(--chart-2)" },
  { name: "Bonds", value: 20, color: "var(--chart-3)" },
]

const watchlist = [
  { symbol: "AAPL", name: "Apple Inc.", price: "$227.16", change: "+2.14%", positive: true, points: "0,18 8,15 16,17 24,10 32,12 40,5" },
  { symbol: "TSLA", name: "Tesla, Inc.", price: "$345.34", change: "-1.28%", positive: false, points: "0,5 8,9 16,7 24,13 32,11 40,18" },
  { symbol: "MSFT", name: "Microsoft Corp.", price: "$507.80", change: "+0.86%", positive: true, points: "0,15 8,11 16,14 24,8 32,10 40,4" },
]

const transactions = [
  { date: "09/05", title: "AAPL Dividend Received", detail: "Dividend income", amount: "+$42.80", positive: true },
  { date: "09/04", title: "Cash Deposit", detail: "Bank transfer", amount: "+$500.00", positive: true },
  { date: "09/03", title: "BTC Purchase", detail: "0.0124 BTC", amount: "-$742.60", positive: false },
]

function MiniSparkline({ points, positive }: { points: string; positive: boolean }) {
  return (
    <svg viewBox="0 0 40 22" className="h-6 w-12" aria-hidden="true" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={positive ? "var(--primary)" : "var(--destructive)"} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

export default function DashboardPage() {
  const { user, userProfile, loading, isAdmin } = useAuth()
  const router = useRouter()
  const [range, setRange] = useState("1W")
  const [tradeType, setTradeType] = useState("buy")

  useEffect(() => {
    if (!loading && !user) router.push("/login")
  }, [user, loading, router])

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="size-8 animate-spin text-primary" /></div>
  if (!user) return null

  const displayName = userProfile?.displayName?.split(" ")[0] || "Investor"

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="mx-auto flex max-w-[1500px] flex-col gap-6 px-4 py-6 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">Portfolio overview</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Good morning, {displayName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Here&apos;s what&apos;s happening with your investments today.</p>
          </div>
          {isAdmin && <Link href="/admin"><Button variant="outline" className="gap-2"><Shield data-icon="inline-start" /> Admin panel</Button></Link>}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.9fr)]">
          <section className="flex min-w-0 flex-col gap-6">
            <Card className="border-border bg-card shadow-none">
              <CardContent className="p-6 md:p-8">
                <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
                <div className="mt-2 flex flex-wrap items-end gap-4">
                  <p className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">$124,500.00</p>
                  <p className="mb-1 flex items-center gap-1 text-sm font-medium text-primary"><TrendingUp className="size-4" /> +$1,240.50 (1.12%) Today</p>
                </div>
                <div className="mt-8 flex flex-col gap-5">
                  <ToggleGroup type="single" value={range} onValueChange={(value) => value && setRange(value)} className="justify-start gap-1">
                    {['1D', '1W', '1M', '1Y', 'ALL'].map((item) => <ToggleGroupItem key={item} value={item} className="h-8 rounded-md px-3 text-xs data-[state=on]:bg-secondary data-[state=on]:text-foreground">{item}</ToggleGroupItem>)}
                  </ToggleGroup>
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performanceData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                        <defs><linearGradient id="portfolio-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.24} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient></defs>
                        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                        <YAxis hide domain={['dataMin - 2000', 'dataMax + 1000']} />
                        <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" }} formatter={(value: number) => [`$${value.toLocaleString()}`, "Value"]} />
                        <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2.5} fill="url(#portfolio-fill)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-border bg-card shadow-none"><CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle className="text-base">Asset Allocation</CardTitle><Button variant="ghost" size="sm" className="text-xs text-muted-foreground">View details</Button></CardHeader><CardContent><div className="flex items-center gap-6"><div className="relative size-32 shrink-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={allocation} dataKey="value" innerRadius={43} outerRadius={60} paddingAngle={3} strokeWidth={0}>{allocation.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie></PieChart></ResponsiveContainer><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-lg font-semibold">100%</span><span className="text-[10px] text-muted-foreground">allocated</span></div></div><div className="flex flex-1 flex-col gap-3">{allocation.map((item) => <div key={item.name} className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-muted-foreground"><span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span><span className="font-medium text-foreground">{item.value}%</span></div>)}</div></div></CardContent></Card>
              <Card className="border-border bg-card shadow-none"><CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle className="text-base">Recent Transactions</CardTitle><Link href="/dashboard/transactions" className="text-xs text-primary hover:underline">View all</Link></CardHeader><CardContent className="flex flex-col gap-4">{transactions.map((item) => <div key={item.title} className="flex items-center gap-3"><div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-muted-foreground">{item.date.slice(3)}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-foreground">{item.title}</p><p className="text-xs text-muted-foreground">{item.detail}</p></div><span className={item.positive ? "text-sm font-medium text-primary" : "text-sm font-medium text-destructive"}>{item.amount}</span></div>)}</CardContent></Card>
            </div>
          </section>

          <aside className="flex min-w-0 flex-col gap-6">
            <Card className="border-border bg-card shadow-none"><CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle className="text-base">Watchlist</CardTitle><Button variant="ghost" size="icon" aria-label="Search watchlist"><Search /></Button></CardHeader><CardContent className="flex flex-col gap-1">{watchlist.map((item) => <div key={item.symbol} className="flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-secondary"><div className="flex size-9 items-center justify-center rounded-md bg-secondary font-mono text-xs font-semibold text-foreground">{item.symbol.slice(0, 1)}</div><div className="min-w-0 flex-1"><p className="font-mono text-sm font-semibold text-foreground">{item.symbol}</p><p className="truncate text-xs text-muted-foreground">{item.name}</p></div><MiniSparkline points={item.points} positive={item.positive} /><div className="text-right"><p className="text-sm font-medium text-foreground">{item.price}</p><Badge variant={item.positive ? "default" : "destructive"} className="mt-1 px-1.5 py-0 text-[10px]">{item.change}</Badge></div></div>)}</CardContent></Card>
            <Card className="border-border bg-card shadow-none"><CardHeader><CardTitle className="text-base">Quick Trade</CardTitle><p className="text-sm text-muted-foreground">Place an order in your portfolio</p></CardHeader><CardContent className="flex flex-col gap-4"><ToggleGroup type="single" value={tradeType} onValueChange={(value) => value && setTradeType(value)} className="grid grid-cols-2 rounded-md bg-secondary p-1"><ToggleGroupItem value="buy" className="h-9 rounded-sm text-sm data-[state=on]:bg-card data-[state=on]:text-primary">Buy</ToggleGroupItem><ToggleGroupItem value="sell" className="h-9 rounded-sm text-sm data-[state=on]:bg-card data-[state=on]:text-destructive">Sell</ToggleGroupItem></ToggleGroup><label className="flex flex-col gap-2 text-sm font-medium text-foreground">Ticker Symbol<Input placeholder="e.g. AAPL" className="h-11 bg-secondary/50 font-mono uppercase" /></label><label className="flex flex-col gap-2 text-sm font-medium text-foreground">Amount ($)<Input type="number" placeholder="0.00" className="h-11 bg-secondary/50 font-mono" /></label><Button className="h-11 w-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90">Execute Order</Button><p className="text-center text-xs text-muted-foreground">Orders execute during regular market hours.</p></CardContent></Card>
          </aside>
        </div>
      </main>
    </div>
  )
}
