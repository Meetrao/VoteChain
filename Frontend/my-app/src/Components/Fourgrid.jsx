import { ArrowRight } from "lucide-react"

export default function VotingAccessibilityLanding() {
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

        {/* Main Content */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-5xl font-bold text-foreground leading-tight text-balance mb-8 max-w-7xl">
            Making Voting Accessible for All. <br />
            Our platform empowers citizens with inclusive tools like voice
            navigation, haptic feedback, and large text mode to ensure every
            vote counts regardless of ability or device.
          </h1>
        </div>

        {/* Images and Statistics Section */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Demo Screenshot Strip */}
          <div className="flex gap-4 flex-1">
            <div className="w-32 h-32 bg-muted rounded-3xl overflow-hidden">
              <img
                src="/assets/voice-guide-demo.png"
                alt="Voice navigation demo"
                className="w-full h-full object-cover grayscale"
              />
            </div>
            <div className="w-32 h-32 bg-muted rounded-3xl overflow-hidden">
              <img
                src="/assets/haptic-feedback.png"
                alt="Haptic feedback illustration"
                className="w-full h-full object-cover grayscale"
              />
            </div>
            <div className="w-32 h-32 bg-muted rounded-3xl overflow-hidden">
              <img
                src="/assets/large-text-mode.png"
                alt="Large text accessibility"
                className="w-full h-full object-cover grayscale"
              />
            </div>
            <div className="w-32 h-32 bg-muted rounded-3xl overflow-hidden">
              <img
                src="/assets/secure-voting.png"
                alt="Secure and inclusive voting"
                className="w-full h-full object-cover grayscale"
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