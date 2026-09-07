"use client"

import Image from "next/image"
import { Star, Quote } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const testimonials = [
  {
    name: "Michael Anderson",
    role: "Investor since 2023",
    image: "/professional-white-man-portrait.jpg",
    content:
      "INVESTMENT HOLDINGS, LLC has transformed my portfolio. The returns are consistent and the platform is incredibly easy to use.",
    rating: 5,
  },
  {
    name: "Sarah Mitchell",
    role: "Investor since 2024",
    image: "/professional-white-woman-portrait.jpg",
    content:
      "I was skeptical at first, but after 6 months of steady returns, I'm a believer. Best decision I've made for my crypto investments.",
    rating: 5,
  },
  {
    name: "James Thompson",
    role: "Investor since 2023",
    image: "/professional-white-businessman-portrait.jpg",
    content:
      "The customer support is exceptional and withdrawals are processed within hours. Highly recommend INVESTMENT HOLDINGS, LLC to serious investors.",
    rating: 5,
  },
]

export function Testimonials() {
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="border-t border-border bg-card py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Trusted by Investors Worldwide
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">See what our investors have to say</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`relative flex flex-col rounded-2xl border border-border bg-secondary/50 p-6 transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              } ${hoveredIndex === index ? "-translate-y-2 border-primary/50 shadow-xl shadow-primary/10" : ""}`}
              style={{ transitionDelay: isVisible ? `${index * 150}ms` : "0ms" }}
            >
              {/* Quote icon */}
              <Quote
                className={`absolute top-4 right-4 h-8 w-8 transition-all duration-300 ${
                  hoveredIndex === index ? "text-primary/30 scale-110" : "text-muted/20"
                }`}
              />

              {/* Stars with animation */}
              <div className="mb-4 flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 fill-accent text-accent transition-all duration-300 ${
                      hoveredIndex === index ? "scale-110" : ""
                    }`}
                    style={{ transitionDelay: `${i * 50}ms` }}
                  />
                ))}
              </div>

              <p
                className={`flex-1 text-muted-foreground transition-colors duration-300 ${
                  hoveredIndex === index ? "text-foreground/90" : ""
                }`}
              >
                &ldquo;{testimonial.content}&rdquo;
              </p>

              <div className="mt-6 flex items-center gap-4">
                <div
                  className={`overflow-hidden rounded-full transition-all duration-300 ${
                    hoveredIndex === index ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                  }`}
                >
                  <Image
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className={`rounded-full transition-transform duration-300 ${
                      hoveredIndex === index ? "scale-110" : ""
                    }`}
                  />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
