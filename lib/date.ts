// Centralized date/time formatting. Every timestamp renders using US (en-US) conventions,
// but in the *viewer's own* time zone -- captured from their browser at sign up / sign in and
// stored on their profile -- so greetings and dates reflect where that person actually is.
// Falls back to US Eastern Time when no zone is known yet (e.g. during server rendering).

const FALLBACK_TIME_ZONE = "America/New_York"

type SecondsTimestamp = { seconds: number }
type DateInput = Date | SecondsTimestamp | number | string

function toDate(input: DateInput): Date {
  if (input instanceof Date) return input
  if (typeof input === "number") return new Date(input)
  if (typeof input === "string") return new Date(input)
  return new Date(input.seconds * 1000)
}

/** The current device/browser's IANA time zone, e.g. "Africa/Lagos" or "Asia/Kolkata". */
export function getBrowserTimeZone(): string | undefined {
  if (typeof window === "undefined") return undefined
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined
  } catch {
    return undefined
  }
}

function resolveTimeZone(timeZone?: string): string {
  return timeZone || getBrowserTimeZone() || FALLBACK_TIME_ZONE
}

/** e.g. "Jan 5, 2026" */
export function formatUSDate(input: DateInput, timeZone?: string): string {
  return toDate(input).toLocaleDateString("en-US", {
    timeZone: resolveTimeZone(timeZone),
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/** e.g. "Jan 5" (used for compact chart axes) */
export function formatUSShortDate(input: DateInput, timeZone?: string): string {
  return toDate(input).toLocaleDateString("en-US", {
    timeZone: resolveTimeZone(timeZone),
    month: "short",
    day: "numeric",
  })
}

/** e.g. "Jan 5, 2026, 3:45 PM" in the given (or detected) time zone */
export function formatUSDateTime(input: DateInput, timeZone?: string): string {
  return toDate(input).toLocaleString("en-US", {
    timeZone: resolveTimeZone(timeZone),
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

/** Current hour (0-23) in the given (or detected) time zone. */
export function getHourInZone(timeZone?: string): number {
  const hourString = new Date().toLocaleString("en-US", {
    timeZone: resolveTimeZone(timeZone),
    hour: "numeric",
    hour12: false,
  })
  // "24" is returned for midnight in some environments; normalize it to 0.
  return Number.parseInt(hourString, 10) % 24
}

/** "Good morning" / "Good afternoon" / "Good evening" based on the hour in the given time zone. */
export function getGreeting(timeZone?: string): string {
  const hour = getHourInZone(timeZone)
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}
