"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, MailCheck } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await resetPassword(email)
      // Always show the same success state, regardless of whether the account exists,
      // so we don't leak which emails are registered.
      setSent(true)
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string }

      if (firebaseError.code === "auth/invalid-email") {
        setError("Please enter a valid email address.")
      } else if (firebaseError.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.")
      } else if (firebaseError.code === "auth/user-not-found") {
        // Treat as success to avoid revealing account existence.
        setSent(true)
      } else {
        setError(firebaseError.message || "Failed to send reset email. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto mb-4 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <span className="text-xl font-bold text-primary-foreground">IT</span>
            </div>
            <span className="text-2xl font-bold text-card-foreground">INVESTMENT HOLDINGS, LLC</span>
          </Link>
          {sent ? (
            <>
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <MailCheck className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold text-card-foreground">Check your email</CardTitle>
              <CardDescription className="text-muted-foreground">
                If an account exists for {email}, we&apos;ve sent a link to reset your password.
              </CardDescription>
            </>
          ) : (
            <>
              <CardTitle className="text-2xl font-bold text-card-foreground">Reset your password</CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter your email and we&apos;ll send you a link to reset your password
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSent(false)
                  setEmail("")
                }}
              >
                Use a different email
              </Button>
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-card-foreground">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="bg-input border-border text-card-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending link...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                <Link href="/login" className="flex items-center justify-center gap-2 font-medium text-primary hover:underline">
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
