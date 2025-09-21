import { Star, StarHalf } from "lucide-react"
import Fourgrid from "./Fourgrid"
import Steps from "./Steps"
import Video from "./Video"
import Faq from "./Faq"
import Slider from "./Slider"
import Footer from "./Footer"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import VoiceAssistantButtonBasic from "./VoiceAssistantButtonBasic"
import VoiceAssistantOverlay from "./VoiceAssistantOverlay"


export default function IntegratedHomePage() {
  const [fontSize, setFontSize] = useState(16); // default font size in px

  // Apply font size globally to <html>
  useEffect(() => {
    document.documentElement.style.fontSize = fontSize + "px";
  }, [fontSize]);

  const increaseFont = () => setFontSize((prev) => prev + 2);
  const decreaseFont = () => setFontSize((prev) => (prev > 10 ? prev - 2 : prev));


  const [phase, setPhase] = useState("Loading...")
  const [title, setTitle] = useState("")

  useEffect(() => {
    const fetchElectionPhase = async () => {
      try {
        const res = await axios.get("/voting/getElection")
        setPhase(res.data.election?.phase || "No elections are currently going on")
        setTitle(res.data.election?.title || "")
      } catch (error) {
        if (
          error.response &&
          error.response.status === 404 &&
          error.response.data &&
          error.response.data.message === "No election found"
        ) {
          setPhase("no elections are currently going on")
          setTitle("")
        } else {
          setPhase("Error fetching phase")
          setTitle("")
        }
      }
    }

    fetchElectionPhase()
  }, [])

  const isRegistration = phase === "registration"

  const [language, setLanguage] = useState("en-US");

  const toggleReadAloud = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    } else {
      const textElements = document.querySelectorAll(
        "h1, h2, h3, h4, h5, h6, p, span, li"
      );
      let fullText = "";
      textElements.forEach((el) => (fullText += el.innerText + " "));
      if (!fullText) return;

      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.lang = language;
      utterance.rate = 1;
      utterance.pitch = 1;

      window.speechSynthesis.speak(utterance);
    }
  };

  // Log browser capabilities for debugging (SpeechRecognition, SpeechSynthesis, Vibration)
  useEffect(() => {
    try {
      console.log("SpeechRecognition:", window.SpeechRecognition || window.webkitSpeechRecognition);
      console.log("SpeechSynthesis:", 'speechSynthesis' in window);
      console.log("Vibration:", 'vibrate' in navigator);
    } catch (e) {
      console.warn('Capability check failed', e);
    }
  }, []);

  return (
    <>
      <nav className="w-full bg-white px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          {/* Left Side - Logo and Branding */}
          <div className="flex items-center gap-4">
            {/* Lion Capital of Ashoka Emblem */}
            <div className="flex-shrink-0">
              <img
                src="https://i.postimg.cc/J4C65shv/Screenshot-2025-09-19-at-6-55-43-PM-Photoroom.png"
                alt="Lion Capital of Ashoka"
                className="h-12 w-12 md:h-16 md:w-16 object-cover"
              />
            </div>

            {/* Branding Text */}
            <div className="flex flex-col">
              <h1 className="text-xl md:text-3xl font-semibold text-gray-900 leading-tight">VoteChain</h1>
              <p className="text-sm md:text-base text-gray-600 leading-tight">National Digital Voting Platform</p>
            </div>
          </div>

          {/* Right Side - Language Toggle and Login */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Language Toggle */}
            <div className="flex items-center gap-3 text-sm md:text-base">
              <button
                onClick={() => {
                  const select = document.querySelector(".goog-te-combo");
                  if (select) {
                    select.value = "en";
                    select.dispatchEvent(new Event("change"));
                  }
                }}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                English
              </button>

              <div className="w-px h-4 bg-gray-300"></div>

              <button
                onClick={() => {
                  const select = document.querySelector(".goog-te-combo");
                  if (select) {
                    select.value = "hi";
                    select.dispatchEvent(new Event("change"));
                  }
                }}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                हिंदी
              </button>
            </div>

            <Link to="/login">
              <button data-command="login" className="bg-green-400 text-black font-medium px-4 py-2 md:px-6 md:py-2.5 rounded-full hover:bg-green-500 transition-colors">
                Login
              </button>
            </Link>

            {isRegistration && (
              <Link to="/CandidateRegister">
                <button className="bg-yellow-400 text-black font-medium px-4 py-2 md:px-6 md:py-2.5 rounded-full hover:bg-yellow-500 transition-colors">
                  Candidate Registration
                </button>
              </Link>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={decreaseFont}
                className="px-3 py-2 border rounded-full hover:bg-gray-100"
              >
                A-
              </button>
              <button
                onClick={increaseFont}
                className="px-3 py-2 border rounded-full hover:bg-gray-100"
              >
                A+
              </button>
              <button
                onClick={toggleReadAloud}
                className="px-4 py-2 bg-white border text-black rounded-full hover:bg-slate-50"
                title="Read Aloud"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" /><path d="M16 9a5 5 0 0 1 0 6" /><path d="M19.364 18.364a9 9 0 0 0 0-12.728" /></svg>
              </button>
              <div className="ml-2">
                <VoiceAssistantButtonBasic />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="min-h-fit bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              {/* Main Heading */}
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-black leading-tight">
                  Empower{" "}
                  <span className="relative inline-block">
                    Democracy
                    <svg
                      className="absolute -bottom-2 left-0 w-full h-4"
                      viewBox="0 0 200 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 15C50 5, 100 5, 150 10C170 12, 190 14, 195 15"
                        stroke="black"
                        strokeWidth="2"
                        fill="none"
                      />
                    </svg>
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg">
                  Participate in transparent and secure digital elections. Stay informed about ongoing elections and
                  register easily as a voter or candidate.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-sm">
                {title && (
                  <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                    Election: <span className="font-semibold text-blue-600">{title}</span>
                  </div>
                )}
                <div className="p-3 text-base rounded-full bg-white text-gray-800 border border-gray-200 ">
                  Phase: <span className="font-normal text-green-400">{phase}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                <Link to="/register">
                  <button data-command="register" className="h-12 px-6 bg-green-400 hover:bg-green-500 text-black font-medium rounded-full shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2">
                    Register to Vote
                  </button>
                </Link>

                {isRegistration && (
                  <Link to="/CandidateRegister">
                    <button className="h-12 px-6 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-full shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2">
                      Candidate Registration
                    </button>
                  </Link>
                )}
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
                {/* Security Rating */}
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-black">99.9%</div>
                  <div className="text-sm text-gray-600">Security Rating</div>
                </div>

                {/* Process Steps */}
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-black">3</div>
                  <div className="text-sm text-gray-600">Steps to Vote</div>
                </div>

                {/* Registration Status */}
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-black">{isRegistration ? "Open" : "Closed"}</div>
                  <div className="text-sm text-gray-600">Registration Status</div>
                </div>
              </div>
            </div>

            {/* Right Column - Illustration Placeholder */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-[1200px]">
                <img
                  src="https://i.postimg.cc/VL9YKcLL/image-Photoroom-5.png"
                  alt="Digital voting platform illustration showing secure and transparent election process"
                  className="w-[1200px] h-[600px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Fourgrid />
      <VoiceAssistantOverlay />
      <Steps />
      <Video />
      <Slider />
      <Faq />
      <Footer />
    </>
  )
}