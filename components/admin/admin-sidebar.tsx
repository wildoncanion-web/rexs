"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  ArrowDownToLine,
  ArrowUpFromLine,
  Wallet,
  Settings,
  LogOut,
  TrendingUp,
  Shield,
  Gift,
  Bell,
  LayoutPanelLeft,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/deposits", label: "Deposits", icon: ArrowDownToLine },
  { href: "/admin/withdrawals", label: "Withdrawals", icon: ArrowUpFromLine },
  { href: "/admin/bonuses", label: "Bonuses", icon: Gift },
  { href: "/admin/wallets", label: "Wallets", icon: Wallet },
  { href: "/admin/investments", label: "Investments", icon: TrendingUp },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-emerald-500/20 bg-zinc-950">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-emerald-500/20 px-6">
          <Shield className="h-8 w-8 text-emerald-500" />
          <div>
            <span className="text-lg font-bold text-white">INVESTMENT HOLDINGS, LLC Admin</span>
            <p className="text-xs text-zinc-500">Control Panel</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white",
                )}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-emerald-500/20 p-4">
          <div className="mb-3 rounded-lg bg-zinc-900/50 p-3">
            <p className="text-xs text-zinc-500">Logged in as</p>
            <p className="truncate text-sm font-medium text-white">{user?.email}</p>
          </div>
          <Link
            href="/dashboard"
            className="mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-all hover:bg-zinc-800/50 hover:text-white"
          >
            <LayoutPanelLeft className="h-5 w-5" />
            My Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  )
}
