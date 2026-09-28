"use client"

import { ArrowUpRight, Loader2 } from "lucide-react"
import { formatUSDate } from "@/lib/date"
import {
  getTransactionAmountColor,
  getTransactionIcon,
  getTransactionIconColor,
  getTransactionPrefix,
  type Transaction,
} from "@/lib/transactions"

interface TransactionListProps {
  transactions: Transaction[]
  loading?: boolean
  timezone?: string
  emptyTitle?: string
  emptyDescription?: string
}

export function TransactionList({
  transactions,
  loading,
  timezone,
  emptyTitle = "No transactions yet",
  emptyDescription = "Your transaction history will appear here once you make your first deposit",
}: TransactionListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <ArrowUpRight className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="mt-6 text-lg font-medium text-foreground">{emptyTitle}</p>
        <p className="mt-2 max-w-sm text-muted-foreground">{emptyDescription}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((tx) => {
        const Icon = getTransactionIcon(tx.type)
        return (
          <div key={tx.id} className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <Icon className={`h-6 w-6 ${getTransactionIconColor(tx.type)}`} />
              </div>
              <div>
                <p className="font-medium capitalize text-foreground">{tx.type}</p>
                <p className="text-sm text-muted-foreground">{formatUSDate(tx.createdAt, timezone)}</p>
                {tx.description && <p className="text-xs text-muted-foreground">{tx.description}</p>}
              </div>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${getTransactionAmountColor(tx.type)}`}>
                {getTransactionPrefix(tx.type)}${tx.amount.toLocaleString()} {tx.crypto || "USD"}
              </p>
              {tx.status && (
                <p
                  className={`text-sm capitalize ${
                    tx.status === "completed" || tx.status === "confirmed"
                      ? "text-primary"
                      : tx.status === "pending"
                        ? "text-amber-500"
                        : "text-destructive"
                  }`}
                >
                  {tx.status}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
