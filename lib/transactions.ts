import { ArrowUpRight, ArrowDownLeft, Gift, CreditCard, TrendingUp, type LucideIcon } from "lucide-react"

export type TransactionType = "deposit" | "withdrawal" | "bonus" | "credit" | "profit" | "earning"

export interface Transaction {
  id: string
  userId?: string
  userEmail?: string
  type: TransactionType
  amount: number
  crypto?: string
  cryptoAmount?: number
  description?: string
  status?: string
  createdAt: { seconds: number }
}

export function getTransactionIcon(type: string): LucideIcon {
  switch (type) {
    case "deposit":
      return ArrowDownLeft
    case "withdrawal":
      return ArrowUpRight
    case "bonus":
      return Gift
    case "credit":
      return CreditCard
    case "profit":
    case "earning":
      return TrendingUp
    default:
      return ArrowUpRight
  }
}

/** Text color used for the amount figure. */
export function getTransactionAmountColor(type: string): string {
  return type === "withdrawal" ? "text-red-500" : "text-primary"
}

/** Text/icon color used for the leading icon, distinguishing bonus/credit from deposit/profit. */
export function getTransactionIconColor(type: string): string {
  switch (type) {
    case "withdrawal":
      return "text-red-500"
    case "bonus":
      return "text-amber-500"
    case "credit":
      return "text-blue-500"
    case "deposit":
    case "profit":
    case "earning":
      return "text-primary"
    default:
      return "text-muted-foreground"
  }
}

export function getTransactionPrefix(type: string): string {
  return type === "withdrawal" ? "-" : "+"
}
