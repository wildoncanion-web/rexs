import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Shield, Users, TrendingUp, Globe } from "lucide-react"

const stats = [
  { label: "Active Investors", value: "10,000+" },
  { label: "Total Invested", value: "$50M+" },
  { label: "Countries Served", value: "120+" },
  { label: "Years Experience", value: "5+" },
]

const values = [
  {
    icon: Shield,
    title: "Security First",
    description:
      "We employ bank-grade 256-bit encryption and multi-signature wallets to ensure your assets are always protected.",
  },
  {
    icon: Users,
    title: "Client Focused",
    description:
      "Our success is measured by your success. We provide 24/7 support and personalized investment guidance.",
  },
  {
    icon: TrendingUp,
    title: "Consistent Returns",
    description:
      "Our expert trading team and advanced algorithms work around the clock to maximize your investment returns.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Operating in over 120 countries, we provide seamless cryptocurrency investment services worldwide.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative py-20">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          </div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">About INVESTMENT HOLDINGS, LLC</h1>
              <p className="mt-6 text-lg text-muted-foreground">
                We are a leading cryptocurrency investment platform dedicated to helping individuals grow their wealth
                through secure and profitable digital asset investments.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-border bg-card py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-bold text-primary">{stat.value}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Our Story</h2>
                <div className="mt-6 space-y-4 text-muted-foreground">
                  <p>
                    Founded in 2019, INVESTMENT HOLDINGS, LLC was born from a vision to democratize cryptocurrency investing.
                    Our founders, experienced traders and blockchain enthusiasts, recognized that many people were
                    missing out on the crypto revolution due to the complexity and perceived risks involved.
                  </p>
                  <p>
                    Today, we serve over 10,000 active investors across 120+ countries, managing millions in digital
                    assets. Our platform combines cutting-edge technology with expert human oversight to deliver
                    consistent, reliable returns.
                  </p>
                  <p>
                    We believe everyone deserves access to the wealth-building opportunities that cryptocurrency offers.
                    That&apos;s why we&apos;ve built a platform that&apos;s secure, transparent, and accessible to
                    investors of all experience levels.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square overflow-hidden rounded-2xl">
                  <Image
                    src="/modern-office-team-meeting.jpg"
                    alt="INVESTMENT HOLDINGS, LLC team"
                    width={600}
                    height={600}
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="border-t border-border bg-card py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground">Our Values</h2>
              <p className="mt-4 text-muted-foreground">The principles that guide everything we do</p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => (
                <div key={value.title} className="rounded-2xl border border-border bg-secondary/50 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{value.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
