"use client"

import Link from "next/link"
import { useState } from "react"
import { Bell, LogOut, Menu, Search, Settings, User, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function DashboardHeader() {
  const { user, userProfile, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl">
    <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-5 px-4 lg:px-8">
      <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5"><span className="flex size-9 items-center justify-center rounded-lg bg-primary font-mono text-lg font-bold text-primary-foreground">IH</span><span className="hidden text-sm font-semibold tracking-wide text-foreground sm:inline">INVESTMENT HOLDINGS</span></Link>
      <nav className="hidden items-center gap-5 lg:flex"><Link href="/dashboard" className="text-sm font-medium text-foreground">Portfolio</Link><Link href="/dashboard/transactions" className="text-sm text-muted-foreground hover:text-foreground">Markets</Link><Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground">Research</Link></nav>
      <div className="relative ml-auto hidden max-w-md flex-1 md:block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search tickers, assets, or news..." className="h-9 border-border bg-secondary/50 pl-9 text-sm" /></div>
      <div className="ml-auto flex items-center gap-1 md:ml-0"><Button variant="ghost" size="icon" aria-label="Notifications"><Bell /></Button><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="gap-2 px-2"><span className="flex size-8 items-center justify-center rounded-full bg-secondary"><User className="size-4 text-primary" /></span><span className="hidden max-w-[130px] truncate text-sm md:inline">{userProfile?.displayName || user?.email}</span></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-56"><div className="px-2 py-1.5"><p className="text-sm font-medium">{userProfile?.displayName || "Investor"}</p><p className="truncate text-xs text-muted-foreground">{user?.email}</p></div><DropdownMenuSeparator /><DropdownMenuItem asChild><Link href="/dashboard/profile"><Settings /> Profile settings</Link></DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onClick={() => logout()} className="text-destructive"><LogOut /> Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu><Button variant="ghost" size="icon" className="lg:hidden" aria-label="Toggle navigation" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X /> : <Menu />}</Button></div>
    </div>
    {mobileMenuOpen && <div className="border-t border-border px-4 py-4 lg:hidden"><nav className="flex flex-col gap-4"><Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium">Portfolio</Link><Link href="/dashboard/transactions" onClick={() => setMobileMenuOpen(false)} className="text-sm text-muted-foreground">Markets</Link><Link href="/faq" onClick={() => setMobileMenuOpen(false)} className="text-sm text-muted-foreground">Research</Link></nav></div>}
  </header>
}
