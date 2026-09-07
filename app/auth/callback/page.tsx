"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "needEmail" | "success" | "error">("loading")
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { completeSignIn, isEmailLink } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      if (typeof window === "undefined") return

      if (!isEmailLink(window.location.href)) {
        setStatus("error")
        setError("Invalid or expired sign-in link. Please request a new one.")
        return
      }

      const storedEmail = window.localStorage.getItem("emailForSignIn")
      const storedDisplayName = window.localStorage.getItem("displayNameForSignIn")

      if (storedEmail) {
        try {
          await completeSignIn(storedEmail, storedDisplayName || undefined)
          setStatus("success")
          setTimeout(() => {
            router.push("/dashboard")
          }, 1500)
        } catch (err: unknown) {
          const firebaseError = err as { code?: string; message?: string }
          setStatus("error")
          setError(firebaseError.message || "Failed to complete sign-in. Please try again.")
        }
      } else {
        setStatus("needEmail")
      }
    }

    handleCallback()
  }, [completeSignIn, isEmailLink, router])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await completeSignIn(email)
      setStatus("success")
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string }
      setError(firebaseError.message || "Failed to complete sign-in. Please check your email and try again.")
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
        {status === "loading" && (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">Signing you in...</CardTitle>
              <CardDescription className="text-muted-foreground">
                Please wait while we verify your sign-in link
              </CardDescription>
            </CardHeader>
          </>
        )}

        {status === "needEmail" && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-foreground">Confirm your email</CardTitle>
              <CardDescription className="text-muted-foreground">
                Please enter the email address you used to sign in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Complete Sign In"
                  )}
                </Button>
              </form>
            </CardContent>
          </>
        )}

        {status === "success" && (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">Welcome to INVESTMENT HOLDINGS, LLC!</CardTitle>
              <CardDescription className="text-muted-foreground">
                Sign-in successful. Redirecting to your dashboard...
              </CardDescription>
            </CardHeader>
          </>
        )}

        {status === "error" && (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">Sign-in failed</CardTitle>
              <CardDescription className="text-muted-foreground">{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => router.push("/login")}>
                  Try Again
                </Button>
                <Button className="flex-1" onClick={() => router.push("/register")}>
                  Create Account
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}
