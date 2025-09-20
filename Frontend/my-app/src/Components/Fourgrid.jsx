import { ArrowRight } from "lucide-react"
import { useState, useEffect, useRef } from "react"

export default function VotingAccessibilityLanding() {
  const [scrollY, setScrollY] = useState(0)
  const titleRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Split text into words for animation
  const titleText = "Making Voting Accessible for All. Our platform empowers citizens with inclusive tools like voice navigation, haptic feedback, and large text mode to ensure every vote counts regardless of ability or device."
  const words = titleText.split(' ')

  // Calculate which words should be colored based on scroll
  const getWordColor = (index) => {
    const element = titleRef.current
    if (!element) return 'text-muted-foreground'
    const rect = element.getBoundingClientRect()
    const elementTop = rect.top + window.scrollY
    const elementHeight = rect.height
    const scrollProgress = Math.max(0, scrollY - elementTop + window.innerHeight * 0.7)
    const maxProgress = elementHeight + window.innerHeight * 0.3
    const progress = Math.min(1, scrollProgress / maxProgress)
    const wordsToHighlight = Math.floor(progress * words.length)
    if (index < wordsToHighlight) {
      return 'text-foreground'
    } else if (index === wordsToHighlight) {
      return 'text-foreground animate-pulse'
    }
    return 'text-muted-foreground/60'
  }

  return (
    <main className="bg-background">
      <section className="max-w-7xl mx-auto px-6 py-5">
        {/* Navigation Links */}
        <div className="flex gap-8 mb-12">
          <a
            href="#features"
            className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium border border-gray-200 p-4 rounded-full "
          >
            Accessibility Features for Voters
          </a>
          <a
            href="#trust"
            className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium border border-gray-200 p-4 rounded-full "
          >
            Building Trust & Transparency in Elections
          </a>
        </div>

        {/* Main Content with animated heading */}
        <div className="mb-12">
          <h1
            ref={titleRef}
            className="text-4xl md:text-5xl lg:text-5xl font-bold leading-tight text-balance mb-8 max-w-7xl"
          >
            {words.map((word, index) => (
              <span
                key={index}
                className={`${getWordColor(index)} transition-all duration-500 ease-out inline-block mr-2 mb-2`}
                style={{ transitionDelay: `${index * 20}ms` }}
              >
                {word}
              </span>
            ))}
          </h1>
        </div>

        {/* Images and Statistics Section (updated images) */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Demo Screenshot Strip */}
          <div className="flex flex-1 gap-3">
            <div className="w-36 h-36 bg-muted  overflow-hidden">
              <img
                src="https://i.pinimg.com/736x/e8/3e/6a/e83e6a08501be2042d7b8b3d78adfbc4.jpg"
                alt="Voice navigation demo"
                className="w-full h-full object-cover rounded-3xl "
              />
            </div>
            <div className="w-36 h-36 bg-muted rounded-3xl overflow-hidden">
              <img
                src="https://i.pinimg.com/1200x/09/d4/6a/09d46ab0dcd57db2ce16eeb147ea7dd6.jpg"
                alt="Haptic feedback illustration"
                className="w-full h-full object-cover rounded-3xl "
              />
            </div>
            <div className="w-36 h-36 bg-muted rounded-3xl overflow-hidden">
              <img
                src="https://i.pinimg.com/736x/37/5e/44/375e44aad2c844156bde5ac092ebff59.jpg"
                alt="Large text accessibility"
                className="w-full h-full object-cover rounded-3xl"
              />
            </div>
            <div className="w-36 h-36 bg-muted rounded-3xl overflow-hidden">
              <img
                src="https://i.pinimg.com/736x/a2/99/93/a299939c1b36f67b60f54b2bbc2dd997.jpg"
                alt="Secure and inclusive voting"
                className="w-full h-full object-cover rounded-3xl "
              />
            </div>
          </div>

          {/* Statistics Card */}
          <div className="bg-accent text-accent-foreground p-6 rounded-2xl min-w-[280px] lg:max-w-[400px]">
            <div className="space-y-4">
              <div className="text-5xl font-bold">70M+</div>
              <p className="text-accent-foreground/90 text-lg leading-relaxed">
                Citizens in India live with disabilities our platform ensures
                their equal participation in elections with accessible and
                inclusive tools.
              </p>
              <a
                href="#features"
                className="inline-flex items-center gap-2 text-accent-foreground hover:text-accent-foreground/80 transition-colors font-medium"
              >
                Explore Features
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}