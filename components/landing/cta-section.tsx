"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export function CTASection() {
  const [isVisible, setIsVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  return (
    <section ref={sectionRef} className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          className={`relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center sm:px-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
          }`}
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.15) 0%, transparent 50%), var(--primary)`,
          }}
        >
          <div className="relative z-10">
            <div
              className={`mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <Sparkles className="h-4 w-4 animate-pulse text-white" />
              <span className="text-sm font-medium text-white">Limited Time Offer</span>
            </div>

            <h2
              className={`text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "300ms" }}
            >
              Ready to Start Investing?
            </h2>

            <p
              className={`mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80 transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "400ms" }}
            >
              Join thousands of investors who trust INVESTMENT HOLDINGS, LLC for their cryptocurrency portfolio management.
            </p>

            <div
              className={`mt-8 transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "500ms" }}
            >
              <Link href="/register">
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  Create Free Account <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Animated background circles */}
          <div className="absolute inset-0 -z-0 overflow-hidden">
            <div
              className={`absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 transition-all duration-1000 ${
                isVisible ? "scale-100 opacity-100" : "scale-50 opacity-0"
              }`}
              style={{ transitionDelay: "300ms" }}
            />
            <div
              className={`absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-white/10 transition-all duration-1000 ${
                isVisible ? "scale-100 opacity-100" : "scale-50 opacity-0"
              }`}
              style={{ transitionDelay: "500ms" }}
            />
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-white/5 transition-all duration-1000 ${
                isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"
              }`}
              style={{ transitionDelay: "700ms" }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
