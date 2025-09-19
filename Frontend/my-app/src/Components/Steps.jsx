import { useEffect, useState, useRef } from "react"

export default function Home() {
  const [activeStep, setActiveStep] = useState(0)
  const stepRefs = useRef([])
  const containerRef = useRef(null)

  const steps = [
    {
      id: "install-metamask",
      title: "Install MetaMask",
      content:
        "Download and install the MetaMask extension from metamask.io on your browser. This will serve as your digital wallet and secure identity for voting.",
    },
    {
      id: "create-wallet",
      title: "Create or Import Wallet",
      content:
        "Open MetaMask and either create a new wallet or import an existing one using your Secret Recovery Phrase. This wallet will generate your unique blockchain address for voting.",
    },
    {
      id: "secure-seed",
      title: "Secure Your Recovery Phrase",
      content:
        "Write down the 12-word Secret Recovery Phrase and store it safely offline. This is your master key — never share it. Losing it means losing access to your voting account.",
    },
    {
      id: "register-voter",
      title: "Register as a Voter",
      content:
        "Go to the voting dApp and connect your MetaMask wallet. Provide your voter ID for verification. Once approved, your wallet address will be linked to your voter profile.",
    },
    {
      id: "login-wallet",
      title: "Login Using Wallet",
      content:
        "On election day, open the dApp and click 'Connect Wallet'. MetaMask will prompt you to sign a secure message, confirming your identity without exposing your private key.",
    },
    {
      id: "cast-vote",
      title: "Cast Your Vote",
      content:
        "After login, select your candidate and confirm your vote. MetaMask will sign and submit the transaction to the blockchain, ensuring your vote is secure, transparent, and tamper-proof.",
    },
  ]

  const title = "MetaMask Setup for Blockchain Voting"
  const videoUrl = "/metamask-voting-demo.mp4" // Replace with your own demo video path

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
      {/* Heading */}
      <div className="text-center">
        <h2 className="text-6xl font-semibold text-slate-800 mb-2">
          Steps to Set Up MetaMask for Voting
        </h2>
      </div>
      <div className="flex">
        {/* Left Side - Video + Title */}
        <div className="sticky top-0 h-screen w-1/2 bg-white p-12 flex flex-col justify-center">
          <div className="space-y-8 text-center">
            <div className="w-full h-96 mx-auto bg-gray-100 rounded-3xl flex items-center justify-center overflow-hidden ">
              <video
                src="https://res.cloudinary.com/dcnt7n5bo/video/upload/v1758318092/IMG_6410_jyibq2.mp4"
                autoPlay
                loop
                muted
                className="w-full h-full object-cover  rounded-3xl"
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-800 leading-tight">
                {title}
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
            <div
              className="absolute left-0 top-0 w-0.5 bg-white"
              style={{ height: "100%" }}
            >
              <div
                className="w-full bg-green-400 transition-all duration-500 ease-out"
                style={{
                  height: `${((activeStep + 1) / steps.length) * 100}%`,
                }}
              />
            </div>

            <div className="pl-8 space-y-12">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  ref={(el) => (stepRefs.current[index] = el)}
                  className="relative"
                >
                  <div
                    className={`absolute -left-11 w-6 h-6 rounded-full border-4 border-white shadow-lg transition-all duration-300 ${
                      index <= activeStep ? "bg-green-600" : "bg-slate-300"
                    }`}
                    style={{ top: "0.5rem" }}
                  />

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-800">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-lg">
                      {step.content}
                    </p>
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