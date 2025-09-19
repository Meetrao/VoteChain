"use client"

import { useState } from "react"
import { ChevronDown, HelpCircle } from "lucide-react"

const faqData = [
  {
    id: 1,
    question: "What is Nicepay?",
    answer:
      "Nicepay is an all-in-one financial management platform designed to simplify payments, automate invoicing, track expenses in real-time, and ensure secure transactions for businesses of all sizes.",
    defaultOpen: true,
  },
  {
    id: 2,
    question: "How does Nicepay work?",
    answer:
      "Nicepay integrates seamlessly with your existing business processes, providing automated payment processing, real-time expense tracking, and comprehensive financial reporting through an intuitive dashboard.",
    defaultOpen: false,
  },
  {
    id: 3,
    question: "Is Nicepay secure?",
    answer:
      "Yes, Nicepay employs bank-level security measures including 256-bit SSL encryption, PCI DSS compliance, and multi-factor authentication to ensure your financial data is always protected.",
    defaultOpen: false,
  },
  {
    id: 4,
    question: "Can Nicepay integrate with other accounting software?",
    answer:
      "Nicepay offers seamless integrations with popular accounting software like QuickBooks, Xero, and FreshBooks, ensuring your financial data stays synchronized across all platforms.",
    defaultOpen: false,
  },
]

export function FAQSection() {
  const [openItems, setOpenItems] = useState(faqData.filter((item) => item.defaultOpen).map((item) => item.id))

  const toggleItem = (id) => {
    setOpenItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* Left Side - Intro Section */}
        <div className="space-y-6">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-3 p-3 bg-white border border-green-400 text-green-400 rounded-full text-sm font-medium">
            <HelpCircle className="w-4 h-4" />
            Frequently asked questions
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight">
              Frequently asked <span className="text-green-400">questions</span>
            </h2>
          </div>

          {/* Description */}
          <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
            Choose a plan that fits your business needs and budget. No hidden fees, no surprises—just straightforward
            pricing for powerful financial management.
          </p>
        </div>

        {/* Right Side - FAQ Accordion */}
        <div className="space-y-4">
          {faqData.map((item) => {
            const isOpen = openItems.includes(item.id)

            return (
              <div
                key={item.id}
                className="bg-gray-50 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 ease-out overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-100/50 transition-all duration-300 ease-out"
                >
                  <span className="font-semibold text-foreground text-lg pr-4">{item.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-green-600 transition-transform duration-300 ease-out flex-shrink-0 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`transition-all duration-300 ease-out overflow-hidden ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-5">
                    <div className="pt-2 border-t border-gray-200/50">
                      <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}


export default FAQSection
