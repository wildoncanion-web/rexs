// Centralized date/time formatting so every timestamp in the app renders in US Eastern
// Time with US (en-US) conventions, regardless of the visitor's device locale/timezone.

const US_TIME_ZONE = "America/New_York"

type SecondsTimestamp = { seconds: number }
type DateInput = Date | SecondsTimestamp | number | string

function toDate(input: DateInput): Date {
  if (input instanceof Date) return input
  if (typeof input === "number") return new Date(input)
  if (typeof input === "string") return new Date(input)
  return new Date(input.seconds * 1000)
}

/** e.g. "Jan 5, 2026" */
export function formatUSDate(input: DateInput): string {
  return toDate(input).toLocaleDateString("en-US", {
    timeZone: US_TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/** e.g. "Jan 5" (used for compact chart axes) */
export function formatUSShortDate(input: DateInput): string {
  return toDate(input).toLocaleDateString("en-US", {
    timeZone: US_TIME_ZONE,
    month: "short",
    day: "numeric",
  })
}

/** e.g. "Jan 5, 2026, 3:45 PM ET" */
export function formatUSDateTime(input: DateInput): string {
  const formatted = toDate(input).toLocaleString("en-US", {
    timeZone: US_TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
  return `${formatted} ET`
}

/** Current hour (0-23) in US Eastern Time, regardless of the visitor's device timezone. */
export function getUSHour(): number {
  const hourString = new Date().toLocaleString("en-US", {
    timeZone: US_TIME_ZONE,
    hour: "numeric",
    hour12: false,
  })
  // "24" is returned for midnight in some environments; normalize it to 0.
  return Number.parseInt(hourString, 10) % 24
}

/** "Good morning" / "Good afternoon" / "Good evening" based on the current US Eastern hour. */
export function getUSGreeting(): string {
  const hour = getUSHour()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}
