import { MessageCircle } from "lucide-react"

const TELEGRAM_SUPPORT_URL = "https://telegram.me/InvestmentLLC_Chat"

export function ChatSupport() {
  return (
    <a
      href={TELEGRAM_SUPPORT_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with support on Telegram (opens in a new tab)"
      className="group fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full bg-primary py-3 pl-3 pr-5 text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:bottom-8 sm:right-8"
    >
      <span className="relative flex size-9 items-center justify-center rounded-full bg-primary-foreground/15">
        <MessageCircle className="size-5" aria-hidden="true" />
        <span className="absolute right-0 top-0 size-2.5 rounded-full bg-primary-foreground ring-2 ring-primary" aria-hidden="true" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-semibold">Chat support</span>
        <span className="hidden text-xs opacity-80 sm:block">Message us on Telegram</span>
      </span>
    </a>
  )
}
