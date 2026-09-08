import Link from "next/link"
import { ArrowUpRight, BarChart3, CheckCircle2, ChevronRight, CircleDollarSign, ShieldCheck, TrendingUp } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const holdings = [
  { name: "US Equities", symbol: "VTI", value: "$86,420.18", change: "+12.4%", width: "w-[44%]", tone: "bg-primary" },
  { name: "Fixed Income", symbol: "BND", value: "$48,960.42", change: "+4.8%", width: "w-[27%]", tone: "bg-cyan-400" },
  { name: "International", symbol: "VXUS", value: "$32,742.11", change: "+8.1%", width: "w-[18%]", tone: "bg-sky-400" },
  { name: "Cash & equivalents", symbol: "CASH", value: "$19,237.29", change: "+0.4%", width: "w-[11%]", tone: "bg-muted-foreground" },
]

const activity = [
  ["09/05/26", "Dividend received", "VTI distribution", "+$428.20"],
  ["09/03/26", "Automatic contribution", "Investment account", "+$1,250.00"],
  ["09/01/26", "Treasury allocation", "Fixed income portfolio", "-$2,000.00"],
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <section className="border-b border-border bg-card/40">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8 lg:py-28">
            <div className="flex flex-col gap-8">
              <div className="flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <span className="size-2 rounded-full bg-primary" /> Institutional portfolio management
              </div>
              <div className="flex flex-col gap-5">
                <h1 className="max-w-3xl text-balance text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">Clarity for every investment decision.</h1>
                <p className="max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">INVESTMENT HOLDINGS, LLC gives you a disciplined view of your portfolio, your performance, and the opportunities shaping your financial future.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/register" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:opacity-90">Open an account <ArrowUpRight className="size-4" /></Link>
                <Link href="/login" className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-3 font-semibold transition hover:bg-secondary">Sign in to your portfolio <ChevronRight className="size-4" /></Link>
              </div>
              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> Secure account access</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" /> Transparent reporting</span>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-background p-5 shadow-2xl shadow-primary/5">
              <div className="flex items-start justify-between border-b border-border pb-5"><div><p className="text-sm text-muted-foreground">Illustrative portfolio overview</p><p className="mt-2 text-3xl font-semibold">$187,360.00</p></div><div className="flex items-center gap-1 text-sm font-medium text-primary"><TrendingUp className="size-4" /> +9.42%</div></div>
              <div className="flex h-40 items-end gap-2 border-b border-border py-5">{[28, 36, 31, 48, 42, 58, 54, 68, 63, 82, 76, 94].map((height, index) => <div key={index} className="flex-1 rounded-t-sm bg-primary/70" style={{ height: `${height}%` }} />)}</div>
              <div className="flex justify-between pt-4 text-xs text-muted-foreground"><span>Apr 2026</span><span>Sep 2026</span></div>
              <div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-lg bg-secondary p-3"><p className="text-xs text-muted-foreground">Contributions</p><p className="mt-1 font-medium">$24,800.00</p></div><div className="rounded-lg bg-secondary p-3"><p className="text-xs text-muted-foreground">Annualized return</p><p className="mt-1 font-medium text-primary">+14.18%</p></div></div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="flex flex-col gap-3"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">A better view of wealth</p><h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">Built around the information that matters.</h2><p className="max-w-2xl leading-7 text-muted-foreground">See what you own, understand how it is performing, and make your next move with confidence.</p></div>
          <div className="mt-10 grid gap-5 md:grid-cols-3"><div className="rounded-xl border border-border bg-card p-6"><BarChart3 className="size-6 text-primary" /><h3 className="mt-10 text-xl font-semibold text-card-foreground">Performance, in context</h3><p className="mt-3 leading-7 text-muted-foreground">Track returns against your goals with clear time ranges and practical portfolio insights.</p></div><div className="rounded-xl border border-border bg-card p-6"><CircleDollarSign className="size-6 text-primary" /><h3 className="mt-10 text-xl font-semibold text-card-foreground">One consolidated view</h3><p className="mt-3 leading-7 text-muted-foreground">Keep equities, fixed income, cash, and international exposure organized in one place.</p></div><div className="rounded-xl border border-border bg-card p-6"><ShieldCheck className="size-6 text-primary" /><h3 className="mt-10 text-xl font-semibold text-card-foreground">Designed for trust</h3><p className="mt-3 leading-7 text-muted-foreground">Your account experience is built around secure access and transparent reporting.</p></div></div>
        </section>

        <section className="border-y border-border bg-card/30"><div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[1fr_1.2fr] lg:px-8"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Portfolio snapshot</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">Allocation that stays understandable.</h2><p className="mt-4 leading-7 text-muted-foreground">A balanced view helps you see concentration, diversification, and the role each holding plays.</p><Link href="/register" className="mt-7 inline-flex items-center gap-2 font-semibold text-primary">Build your portfolio <ArrowUpRight className="size-4" /></Link></div><div className="rounded-xl border border-border bg-background p-6"><div className="flex h-3 overflow-hidden rounded-full bg-secondary">{holdings.map((holding) => <div key={holding.symbol} className={`${holding.width} ${holding.tone}`} />)}</div><div className="mt-6 flex flex-col gap-4">{holdings.map((holding) => <div key={holding.symbol} className="flex items-center justify-between gap-4 border-b border-border pb-4 last:border-0 last:pb-0"><div className="flex items-center gap-3"><span className={`size-3 rounded-full ${holding.tone}`} /><div><p className="font-medium">{holding.name}</p><p className="text-sm text-muted-foreground">{holding.symbol}</p></div></div><div className="text-right"><p className="font-medium">{holding.value}</p><p className="text-sm text-primary">{holding.change}</p></div></div>)}</div></div></div></section>

        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8"><div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]"><div><div className="flex items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Account activity</p><h2 className="mt-3 text-2xl font-semibold">Recent transactions</h2></div><Link href="/login" className="text-sm font-semibold text-primary">View account <ChevronRight className="ml-1 inline size-4" /></Link></div><div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">{activity.map(([date, title, detail, amount]) => <div key={date} className="flex items-center justify-between gap-4 border-b border-border p-5 last:border-0"><div><p className="font-medium text-card-foreground">{title}</p><p className="mt-1 text-sm text-muted-foreground">{detail} · {date}</p></div><p className="font-medium text-primary">{amount}</p></div>)}</div></div><div className="rounded-xl bg-primary p-7 text-primary-foreground"><p className="text-sm font-semibold uppercase tracking-[0.18em] opacity-75">Your next move</p><h2 className="mt-4 text-3xl font-semibold">Make your portfolio work harder.</h2><p className="mt-4 leading-7 opacity-80">Start with a clearer view of your financial picture.</p><Link href="/register" className="mt-7 inline-flex items-center gap-2 rounded-md bg-primary-foreground px-4 py-3 font-semibold text-primary">Get started <ArrowUpRight className="size-4" /></Link></div></div></section>
      </main>
      <Footer />
    </div>
  )
}
