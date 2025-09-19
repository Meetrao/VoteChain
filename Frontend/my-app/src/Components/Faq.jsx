"use client"

import { useState } from "react"
import { ChevronDown, HelpCircle } from "lucide-react"

const faqData = [
  {
    id: 1,
    question: "What is this platform about?",
    answer:
      "This platform is designed to make the voting process more secure, transparent, and accessible for all eligible voters.",
    defaultOpen: true,
  },
  {
    id: 2,
    question: "How do I register to vote?",
    answer:
      "You can register by creating an account on the platform, verifying your identity through approved methods, and setting up your voter profile.",
    defaultOpen: false,
  },
  {
    id: 3,
    question: "Is my vote private?",
    answer:
      "Yes. Your vote remains completely anonymous while still being securely counted toward the final results.",
    defaultOpen: false,
  },
  {
    id: 4,
    question: "Can I check if my vote was counted?",
    answer:
      "Yes. Once you cast your vote, you can track its status through a secure confirmation process provided by the platform.",
    defaultOpen: false,
  },
  {
    id: 5,
    question: "What accessibility features are available?",
    answer:
      "We provide features like voice guidance, large text, and haptic feedback to ensure the platform is inclusive for all voters.",
    defaultOpen: false,
  },
]

export function FAQSection() {
  // only one open at a time
  const [openItem, setOpenItem] = useState(
    faqData.find((item) => item.defaultOpen)?.id || null
  )

  const toggleItem = (id) => {
    setOpenItem((prev) => (prev === id ? null : id)) // close if same, otherwise switch
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* Left Side - Intro Section */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 p-3 bg-white border border-green-600 text-green-600 rounded-full text-sm font-medium">
            <HelpCircle className="w-4 h-4" />
            Frequently Asked Questions
          </div>

          <div className="space-y-2">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight">
              Frequently asked <span className="text-green-600">questions</span>
            </h2>
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
            Find answers to the most common questions about using this voting
            platform. If you need more help, our support team is always
            available.
          </p>
        </div>

        {/* Right Side - FAQ Accordion */}
        <div className="space-y-4">
          {faqData.map((item) => {
            const isOpen = openItem === item.id

            return (
              <div
                key={item.id}
                className="bg-gray-50 rounded-3xl transition-all duration-300 ease-out overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-100/50 transition-all duration-300 ease-out"
                >
                  <span className="font-semibold text-foreground text-lg pr-4">
                    {item.question}
                  </span>
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
                      <p className="text-muted-foreground leading-relaxed">
                        {item.answer}
                      </p>
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