"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Menu, X, Shield } from "lucide-react"
import { useState } from "react"

export function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">T</span>
            </div>
            <span className="text-xl font-bold text-foreground">INVESTMENT HOLDINGS, LLC</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/about" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              About
            </Link>
            <Link href="/faq" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              FAQ
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Contact
            </Link>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            {user ? (
              <>
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="gap-2 text-amber-500 hover:text-amber-400">
                      <Shield className="h-4 w-4" />
                      Admin Panel
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => logout()}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-border py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <Link href="/about" className="text-sm text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>
                About
              </Link>
              <Link href="/faq" className="text-sm text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>
                FAQ
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>
                Contact
              </Link>
              {user ? (
                <>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2 text-amber-500 hover:text-amber-400"
                      >
                        <Shield className="h-4 w-4" />
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      logout()
                      setMobileMenuOpen(false)
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button size="sm" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
