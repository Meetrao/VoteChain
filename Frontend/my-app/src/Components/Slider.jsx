import { useState } from "react"
import { ChevronLeft, ChevronRight,LockKeyhole } from "lucide-react"


const newsCards = [
  {
    id: 1,
    title: "Calling on WhatsApp: New ways to plan ahead and take part",
    description:
      "Today we're announcing new features on WhatsApp that make group calls easier to plan, and more interactive.",
  },
  {
    id: 2,
    title: "Catch up on conversations with Private Message Summaries",
    description:
      "We're excited to introduce Message Summaries, an option that uses Meta AI to privately and securely summarize unread messages in a chat, so you get an idea of what is…",
  },
  {
    id: 3,
    title: "Enhanced Security Features for Better Privacy",
    description:
      "New end-to-end encryption improvements and privacy controls to keep your conversations more secure than ever before.",
  },
]

export function StayUpToDate() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, newsCards.length - 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, newsCards.length - 1)) % Math.max(1, newsCards.length - 1))
  }

  const visibleCards = newsCards.slice(currentIndex, currentIndex + 2)

  return (
    <section className="w-full bg-green-100 py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Side - Heading & Description */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight">Stay up to date</h2>
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-md">
                Get the latest from WhatsApp: news, useful tips, and our newest features to help you stay connected.
              </p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                className="w-12 h-12 rounded-full border-2 border-black bg-transparent hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                onClick={prevSlide}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                className="w-12 h-12 rounded-full border-2 border-black bg-transparent hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                onClick={nextSlide}
                disabled={currentIndex >= newsCards.length - 2}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right Side - Cards */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {visibleCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-200 border-0 w-full"
                >
                  <div className="space-y-4">
                    {/* WhatsApp Icon */}
                    <div className="w-8 h-8 flex items-center justify-center">
                      <LockKeyhole />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-black leading-tight">{card.title}</h3>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed text-sm">{card.description}</p>

                    {/* Read More Button */}
                    <button className="mt-4 rounded-full border-2 border-gray-300 bg-transparent hover:bg-gray-50 text-black font-medium px-6 py-2 h-auto transition-colors">
                      Read More
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Navigation Dots */}
            <div className="flex justify-center gap-2 md:hidden">
              {Array.from({ length: Math.max(1, newsCards.length - 1) }).map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? "bg-black" : "bg-gray-300"
                  }`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


export default StayUpToDate