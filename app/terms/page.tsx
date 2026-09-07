import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Terms of Service</h1>
              <p className="mt-6 text-muted-foreground">Last updated: January 13, 2026</p>
            </div>
          </div>
        </section>

        {/* Terms Content */}
        <section className="pb-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="prose prose-invert max-w-none space-y-8">
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 text-xl font-bold text-foreground">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By accessing or using INVESTMENT HOLDINGS, LLC (&quot;the Platform&quot;), you agree to be bound by these
                  Terms of Service. If you do not agree to these terms, please do not use our services.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 text-xl font-bold text-foreground">2. Eligibility</h2>
                <p className="text-muted-foreground">
                  You must be at least 18 years old and legally capable of entering into binding contracts to use our
                  services. By using the Platform, you represent and warrant that you meet these requirements.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 text-xl font-bold text-foreground">3. Account Registration</h2>
                <p className="text-muted-foreground">
                  To use our services, you must create an account. You agree to provide accurate, current, and complete
                  information during registration and to keep your account information updated. You are responsible for
                  maintaining the confidentiality of your account credentials.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 text-xl font-bold text-foreground">4. Investment Risks</h2>
                <p className="text-muted-foreground">
                  Cryptocurrency investments carry inherent risks including market volatility, regulatory changes, and
                  potential loss of principal. Past performance does not guarantee future results. You should only
                  invest funds you can afford to lose and consider seeking independent financial advice.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 text-xl font-bold text-foreground">5. Deposits and Withdrawals</h2>
                <p className="text-muted-foreground">
                  All deposits must be made to the wallet addresses provided on our platform. We are not responsible for
                  funds sent to incorrect addresses. Withdrawal requests are processed within 24-48 hours subject to
                  security verification.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 text-xl font-bold text-foreground">6. Prohibited Activities</h2>
                <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                  <li>Using the Platform for money laundering or terrorist financing</li>
                  <li>Attempting to gain unauthorized access to other accounts</li>
                  <li>Manipulating or attempting to manipulate the Platform</li>
                  <li>Using automated systems or bots without authorization</li>
                  <li>Violating any applicable laws or regulations</li>
                </ul>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 text-xl font-bold text-foreground">7. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  To the maximum extent permitted by law, INVESTMENT HOLDINGS, LLC shall not be liable for any indirect,
                  incidental, special, consequential, or punitive damages arising from your use of the Platform or any
                  investment losses.
                </p>
              </div>

              <div id="privacy" className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 text-xl font-bold text-foreground">8. Privacy Policy</h2>
                <p className="mb-4 text-muted-foreground">
                  We collect and process personal information in accordance with our Privacy Policy. By using the
                  Platform, you consent to such processing and warrant that all data provided by you is accurate.
                </p>
                <h3 className="mb-2 font-semibold text-foreground">Data We Collect:</h3>
                <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                  <li>Account information (name, email, password)</li>
                  <li>Transaction history and wallet addresses</li>
                  <li>Device and browser information</li>
                  <li>Usage data and analytics</li>
                </ul>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 text-xl font-bold text-foreground">9. Contact Information</h2>
                <p className="text-muted-foreground">
                  For questions about these Terms of Service, please contact us at support@investmentholdingsllc.org or through
                  our Contact page.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
