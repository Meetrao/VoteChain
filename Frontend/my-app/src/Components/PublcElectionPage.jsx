import { Star, StarHalf } from "lucide-react"
import Fourgrid from "./Fourgrid"
import Steps from "./Steps"
import Video from "./Video"
import Faq from "./Faq"
import Slider from "./Slider"
import Footer from "./Footer"

export default function HomePage() {
  return (
    <>
        <nav className="w-full bg-white px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        {/* Left Side - Logo and Branding */}
        <div className="flex items-center gap-4">
          {/* Lion Capital of Ashoka Emblem */}
          <div className="flex-shrink-0">
            <img src="https://i.postimg.cc/J4C65shv/Screenshot-2025-09-19-at-6-55-43-PM-Photoroom.png" alt="Lion Capital of Ashoka" className="h-12 w-12 md:h-16 md:w-16 object-cover" />
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
            <button className="text-gray-700 hover:text-gray-900 font-medium transition-colors">English</button>
            <div className="w-px h-4 bg-gray-300"></div>
            <button className="text-gray-700 hover:text-gray-900 font-medium transition-colors">हिंदी</button>
          </div>

          {/* Login Button */}
          <button className="bg-green-400 hover:bg-blue-800 text-black font-medium px-4 py-2 md:px-6 md:py-2.5 rounded-full ">
            Login
          </button>
        </div>
      </div>
    </nav>
    <main className="min-h-fit bg-white">
      <div className="container mx-auto px-4 ">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Main Heading */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-medium text-black leading-tight">
                Put{" "}
                <span className="relative inline-block">
                  people first
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
                Fast, user-friendly and engaging - turn HR into people and culture and streamline your daily operations
                with your own branded app.
              </p>
            </div>

            {/* Email Signup Form */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-md">
              <input
                type="email"
                placeholder="Enter work email"
                className="flex-1 h-12 px-4 border border-gray-200 rounded-full shadow-sm bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              />
              <button className="h-12 px-6 bg-green-400 hover:bg-green-500 text-black font-medium rounded-full shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2">
                Book a demo
              </button>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
              {/* Daily Activity */}
              <div className="space-y-1">
                <div className="text-3xl font-bold text-black">75.2%</div>
                <div className="text-sm text-gray-600">Average daily activity</div>
              </div>

              {/* Daily Users */}
              <div className="space-y-1">
                <div className="text-3xl font-bold text-black">~20k</div>
                <div className="text-sm text-gray-600">Average daily users</div>
              </div>
            </div>
          </div>

          {/* Right Column - Illustration Placeholder */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-[1200px]">
              <img
                src="https://i.postimg.cc/VL9YKcLL/image-Photoroom-5.png"
                alt="Mobile app illustration showing HR and people management interfaces"
                className="w-[1200px] h-[600px] object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
    <Fourgrid/>
    <Steps/>
    <Video/>
    <Slider/>
    <Faq/>
    <Footer/>
    </>
  )
}
