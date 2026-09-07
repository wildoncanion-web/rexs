import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    category: "Getting Started",
    questions: [
      {
        question: "How do I create an account?",
        answer:
          "Creating an account is simple. Click the 'Get Started' button, fill in your email, create a password, and verify your email address. Once verified, you can start investing immediately.",
      },
      {
        question: "What is the minimum deposit amount?",
        answer:
          "The minimum deposit varies by cryptocurrency. For BTC, the minimum is 0.0001 BTC. For ETH, the minimum is 0.001 ETH. For USDC and USDT, the minimum is $10. For LTC, it's 0.01 LTC, and for DOGE, it's 10 DOGE.",
      },
      {
        question: "How long does it take for deposits to be credited?",
        answer:
          "Deposit confirmation times depend on the blockchain network. Bitcoin typically takes 3 confirmations (30-60 minutes), while USDC and USDT on their respective networks usually take 10-20 minutes.",
      },
    ],
  },
  {
    category: "Investment Plans",
    questions: [
      {
        question: "How do investment plans work?",
        answer:
          "Our investment plans offer fixed ROI over specific durations. Simply choose a plan that fits your goals, deposit the required amount, and earn daily returns. At the end of the term, your principal plus earnings are available for withdrawal.",
      },
      {
        question: "Can I withdraw my investment before the term ends?",
        answer:
          "Early withdrawals are available but may be subject to fees depending on your plan. Premium and Elite plan holders enjoy more flexible withdrawal terms. Contact support for specific details about your investment.",
      },
      {
        question: "Are the returns guaranteed?",
        answer:
          "While we have a strong track record of delivering consistent returns, all investments carry inherent risks. Our expert team uses advanced strategies to minimize risks, but cryptocurrency markets can be volatile. We recommend only investing what you can afford to risk.",
      },
    ],
  },
  {
    category: "Security",
    questions: [
      {
        question: "How do you protect my funds?",
        answer:
          "We employ multiple layers of security including 256-bit SSL encryption, cold storage for the majority of assets, multi-signature wallets, and regular security audits by third-party firms. Your funds are insured against theft and hacking.",
      },
      {
        question: "Is my personal information safe?",
        answer:
          "Absolutely. We follow strict data protection protocols and comply with international privacy standards. Your personal information is encrypted and never shared with third parties without your consent.",
      },
      {
        question: "What should I do if I suspect unauthorized activity?",
        answer:
          "If you notice any suspicious activity on your account, immediately change your password and contact our support team at support@tsvi-investments.com. We have a 24/7 security team ready to assist you.",
      },
    ],
  },
  {
    category: "Withdrawals",
    questions: [
      {
        question: "How do I withdraw my funds?",
        answer:
          "Navigate to the withdrawals section in your dashboard, select the cryptocurrency and amount you wish to withdraw, and enter your wallet address. Withdrawals are typically processed within 24 hours.",
      },
      {
        question: "Are there any withdrawal fees?",
        answer:
          "We charge minimal network fees to cover blockchain transaction costs. These fees vary by cryptocurrency and network congestion. The exact fee is displayed before you confirm your withdrawal.",
      },
      {
        question: "Is there a maximum withdrawal limit?",
        answer:
          "Standard accounts have a daily withdrawal limit of $10,000. Premium and Elite investors enjoy higher limits. For large withdrawals exceeding $50,000, please contact our support team in advance.",
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Frequently Asked Questions
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Find answers to common questions about INVESTMENT HOLDINGS, LLC. Can&apos;t find what you&apos;re looking for?
                Contact our support team.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Sections */}
        <section className="pb-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-12">
              {faqs.map((section) => (
                <div key={section.category}>
                  <h2 className="mb-6 text-2xl font-bold text-foreground">{section.category}</h2>
                  <Accordion type="single" collapsible className="space-y-4">
                    {section.questions.map((faq, index) => (
                      <AccordionItem
                        key={index}
                        value={`${section.category}-${index}`}
                        className="rounded-xl border border-border bg-card px-6"
                      >
                        <AccordionTrigger className="text-left text-foreground hover:no-underline">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
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
