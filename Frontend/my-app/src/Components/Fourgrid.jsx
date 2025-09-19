import { ArrowRight } from "lucide-react"

export default function CharityLandingPage() {
  return (
    <main className="bg-background">
      <section className="max-w-7xl mx-auto px-6 py-5">
        {/* Navigation Links */}
        <div className="flex gap-8 mb-12">
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium border border-gray-200 p-4 rounded-full ">
            Our Positive Impact Across the Globe
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium border border-gray-200 p-4 rounded-full ">
            Core Values Guiding Our Global Mission
          </a>
        </div>

        {/* Main Content */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-5xl font-bold text-foreground leading-tight text-balance mb-8 max-w-7xl">
            Over 80,000 lives have been touched by our charity's work. We focus on empowering individuals, improving
            communities, and fostering sustainable development across more than 50 countries. Through targeted
            initiatives, we have enabled access to education, healthcare, and economic opportunities.
          </h1>
        </div>
        {/* Images and Statistics Section */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Photo Strip */}
          <div className="flex gap-4 flex-1">
            <div className="w-32 h-32 bg-muted rounded-3xl overflow-hidden">
              <img
                src="https://i.pinimg.com/736x/b0/bb/8b/b0bb8bd5446b8343fd3ae0f498aa90e5.jpg"
                alt="Child receiving education"
                className="w-full h-full object-cover grayscale"
              />
            </div>
            <div className="w-32 h-32 bg-muted rounded-3xl overflow-hidden">
              <img
                src="https://i.pinimg.com/736x/b0/bb/8b/b0bb8bd5446b8343fd3ae0f498aa90e5.jpg"
                alt="Volunteers helping community"
                className="w-full h-full object-cover grayscale"
              />
            </div>
            <div className="w-32 h-32 bg-muted rounded-3xl overflow-hidden">
              <img
                src="https://i.pinimg.com/736x/b0/bb/8b/b0bb8bd5446b8343fd3ae0f498aa90e5.jpg"
                alt="Children in classroom"
                className="w-full h-full object-cover grayscale"
              />
            </div>
            <div className="w-32 h-32 bg-muted rounded-3xl overflow-hidden">
              <img
                src="https://i.pinimg.com/736x/b0/bb/8b/b0bb8bd5446b8343fd3ae0f498aa90e5.jpg"
                alt="Humanitarian aid distribution"
                className="w-full h-full object-cover grayscale"
              />
            </div>
          </div>

          {/* Statistics Card */}
          <div className="bg-accent text-accent-foreground p-2 rounded-2xl min-w-[280px] lg:max-w-[400px]">
            <div className="space-y-4">
              <div className="text-5xl font-bold">385M+</div>
              <p className="text-accent-foreground/90 text-lg leading-relaxed">
                Children on this planet are in Extreme Poverty
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-2 text-accent-foreground hover:text-accent-foreground/80 transition-colors font-medium"
              >
                Learn More
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
