import { useEffect, useState, useRef } from "react"

export default function Home() {
  const [activeStep, setActiveStep] = useState(0)
  const stepRefs = useRef([])
  const containerRef = useRef(null)

  const steps = [
    {
      id: "market-assessment",
      title: "Market Assessment & Competitive Analysis",
      content:
        "In today's rapidly evolving business landscape, identifying and capitalizing on emerging opportunities requires a strategic approach that combines market intelligence, competitive analysis, and innovative thinking. Our comprehensive business strategy framework begins with a thorough assessment of market dynamics and competitive positioning.",
    },
    {
      id: "opportunity-identification",
      title: "Opportunity Identification Process",
      content:
        "The opportunity identification process involves multiple layers of analysis, including customer needs assessment, technology trend evaluation, and regulatory environment scanning. By systematically examining these factors, businesses can uncover hidden opportunities that align with their core competencies and strategic objectives.",
    },
    {
      id: "market-research",
      title: "Market Research & Validation",
      content:
        "Market research plays a crucial role in validating potential opportunities. Through primary and secondary research methodologies, organizations can gather critical insights about customer preferences, market size, growth potential, and competitive intensity. This data-driven approach ensures that strategic decisions are based on solid evidence rather than assumptions.",
    },
    {
      id: "risk-assessment",
      title: "Risk Assessment & Mitigation",
      content:
        "Risk assessment is equally important in the opportunity evaluation process. Every business opportunity carries inherent risks that must be carefully analyzed and mitigated. Our framework includes comprehensive risk modeling that considers financial, operational, regulatory, and reputational factors.",
    },
    {
      id: "implementation-planning",
      title: "Implementation Planning & Execution",
      content:
        "Implementation planning transforms identified opportunities into actionable strategies. This involves resource allocation, timeline development, milestone setting, and performance measurement systems. A well-structured implementation plan increases the likelihood of successful opportunity realization.",
    },
    {
      id: "monitoring-adaptation",
      title: "Continuous Monitoring & Adaptation",
      content:
        "Continuous monitoring and adaptation are essential components of effective opportunity management. Market conditions change rapidly, and successful organizations must remain agile and responsive to evolving circumstances. Regular strategy reviews and course corrections ensure that businesses stay on track toward their objectives.",
    },
  ]

  const title = "Unlocking the opportunity, Business strategy"
  const videoUrl = "/business-strategy-opportunity-unlock.mp4" // replace with your video path

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return

      const containerTop = containerRef.current.offsetTop
      const scrollTop = window.scrollY
      const viewportHeight = window.innerHeight

      stepRefs.current.forEach((stepRef, index) => {
        if (stepRef) {
          const stepTop = stepRef.offsetTop + containerTop
          const stepBottom = stepTop + stepRef.offsetHeight
          const viewportCenter = scrollTop + viewportHeight / 2

          if (viewportCenter >= stepTop && viewportCenter <= stepBottom) {
            setActiveStep(index)
          }
        }
      })
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!steps || steps.length === 0) {
    return <div>No steps provided</div>
  }

  return (
    <div className="min-h-screen bg-white my-20">
        {/* Steps to be Followed Heading */}
          <div className=" text-center">
            <h2 className="text-6xl font-semibold text-slate-800 mb-2">Steps to be Followed</h2>
          </div>
      <div className="flex">
        {/* Left Side - Video and Title */}
        <div className="sticky top-0 h-screen w-1/2 bg-white p-12 flex flex-col justify-center">
          <div className="space-y-8 text-center">
            <div className="w-full h-96 mx-auto bg-gray-100 rounded-3xl flex items-center justify-center overflow-hidden ">
              <video
                src={videoUrl}
                autoPlay
                loop
                muted
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-800 leading-tight text-balance">
                {title.split(", ").map((part, index) => (
                  <span key={index}>
                    {part}
                    {index === 0 && <br />}
                    {index === 1 && <span className="text-green-500 ml-2">{part}</span>}
                    {index !== 1 && index !== 0 && part}
                  </span>
                ))}
              </h1>
            </div>

            {/* Step indicator */}
            <div className="text-sm text-slate-500">
              Step {activeStep + 1} of {steps.length}
            </div>
          </div>
        </div>

        {/* Right Side - Steps with Timeline */}
        <div className="w-1/2 p-12" ref={containerRef}>
          <div className="relative">
            <div className="absolute left-0 top-0 w-0.5 bg-white" style={{ height: "100%" }}>
              <div
                className="w-full bg-green-400 transition-all duration-500 ease-out"
                style={{
                  height: `${((activeStep + 1) / steps.length) * 100}%`,
                }}
              />
            </div>

            <div className="pl-8 space-y-12">
              {steps.map((step, index) => (
                <div key={step.id} ref={(el) => (stepRefs.current[index] = el)} className="relative">
                  <div
                    className={`absolute -left-11 w-6 h-6 rounded-full border-4 border-white shadow-lg transition-all duration-300 ${
                      index <= activeStep ? "bg-green-600" : "bg-slate-300"
                    }`}
                    style={{ top: "0.5rem" }}
                  />

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-800">{step.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-lg">{step.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}