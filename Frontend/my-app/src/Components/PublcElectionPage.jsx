import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Shield, CheckCircle, Calendar as CalendarIcon, UserPlus } from "lucide-react";

const PublicElectionPage = () => {
  const [phase, setPhase] = useState("Loading...");
  const [title, setTitle] = useState("");

  useEffect(() => {
    const fetchElectionPhase = async () => {
      try {
        const res = await axios.get("/voting/getElection");
        setPhase(res.data.election?.phase || "No elections are currently going on");
        setTitle(res.data.election?.title || "");
      } catch (error) {
        if (
          error.response &&
          error.response.status === 404 &&
          error.response.data &&
          error.response.data.message === "No election found"
        ) {
          setPhase("no elections are currently going on");
          setTitle("");
        } else {
          setPhase("Error fetching phase");
          setTitle("");
        }
      }
    };

    fetchElectionPhase();
  }, []);

  const isRegistration = phase === "registration";

  return (
    <div className="min-h-screen w-full bg-white text-black flex flex-col items-center px-4 md:px-12 lg:px-20">
      {/* Header */}
      <header className="w-full flex justify-between items-center py-6">
        <div className="flex items-center gap-2">
          <span className="font-thin font-montserrat text-4xl">VOTECHAIN</span>
        </div>
        <div className="flex items-center gap-4">
          {isRegistration && (
            <Link to="/CandidateRegister" className="inline-block">
              <button
                className="relative font-bold text-base cursor-pointer rounded-full bg-stone-800 text-stone-800 p-[1px] transform -translate-x-1 -translate-y-1 transition-all duration-150 ease-in-out outline-2 outline-transparent outline-offset-[5px] shadow-[0.5px_0.5px_0_0_#292524,1px_1px_0_0_#292524,1.5px_1.5px_0_0_#292524,2px_2px_0_0_#292524,2.5px_2.5px_0_0_#292524,3px_3px_0_0_#292524,0_0_0_2px_#fafaf9,0.5px_0.5px_0_2px_#fafaf9,1px_1px_0_2px_#fafaf9,1.5px_1.5px_0_2px_#fafaf9,2px_2px_0_2px_#fafaf9,2.5px_2.5px_0_2px_#fafaf9,3px_3px_0_2px_#fafaf9,3.5px_3.5px_0_2px_#fafaf9,4px_4px_0_2px_#fafaf9] hover:translate-x-0 hover:translate-y-0 hover:shadow-[0_0_0_2px_#fafaf9] focus-visible:outline-yellow-400 focus-visible:outline-dashed"
                aria-label="Candidate Registration"
              >
                <div className="relative bg-yellow-400 rounded-full border-2 border-white/30">
                  <span className="relative flex items-center justify-center px-5 py-3">
                    Candidate Registration
                  </span>
                </div>
              </button>
            </Link>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="text-center max-w-4xl mt-10 md:mt-16">
        <h1 className="text-3xl md:text-6xl font-semibold font-montserrat tracking-tight leading-tight">
          Empower Democracy, Make Your Voice Count
        </h1>
        <p className="text-gray-500 mt-4 font-montserrat">
          Participate in transparent and secure digital elections. Stay informed about ongoing elections and register easily as a voter or candidate.
        </p>

        {/* Election status */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2 text-sm">
          {title && (
            <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 border border-gray-200">
              Election: <span className="font-semibold text-blue-600">{title}</span>
            </div>
          )}
          <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 border border-gray-200">
            Phase: <span className="font-semibold text-blue-600">{phase}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <Link to="/login">
            <button className="relative font-bold text-base cursor-pointer rounded-full bg-stone-800 text-stone-800 p-[1px] transform -translate-x-1 -translate-y-1 transition-all duration-150 ease-in-out outline-2 outline-transparent outline-offset-[5px] shadow-[0.5px_0.5px_0_0_#292524,1px_1px_0_0_#292524,1.5px_1.5px_0_0_#292524,2px_2px_0_0_#292524,2.5px_2.5px_0_0_#292524,3px_3px_0_0_#292524,0_0_0_2px_#fafaf9,0.5px_0.5px_0_2px_#fafaf9,1px_1px_0_2px_#fafaf9,1.5px_1.5px_0_2px_#fafaf9,2px_2px_0_2px_#fafaf9,2.5px_2.5px_0_2px_#fafaf9,3px_3px_0_2px_#fafaf9,3.5px_3.5px_0_2px_#fafaf9,4px_4px_0_2px_#fafaf9] hover:translate-x-0 hover:translate-y-0 hover:shadow-[0_0_0_2px_#fafaf9] focus-visible:outline-yellow-400 focus-visible:outline-dashed">
              <div className="relative bg-yellow-400 rounded-full border-2 border-white/30">
                <span className="relative flex items-center justify-center px-6 py-3">
                  Login
                </span>
              </div>
            </button>
          </Link>

          <Link to="/register">
            <button className="relative font-bold text-base cursor-pointer rounded-full bg-stone-800 text-stone-800 p-[1px] transform -translate-x-1 -translate-y-1 transition-all duration-150 ease-in-out outline-2 outline-transparent outline-offset-[5px] shadow-[0.5px_0.5px_0_0_#292524,1px_1px_0_0_#292524,1.5px_1.5px_0_0_#292524,2px_2px_0_0_#292524,2.5px_2.5px_0_0_#292524,3px_3px_0_0_#292524,0_0_0_2px_#fafaf9,0.5px_0.5px_0_2px_#fafaf9,1px_1px_0_2px_#fafaf9,1.5px_1.5px_0_2px_#fafaf9,2px_2px_0_2px_#fafaf9,2.5px_2.5px_0_2px_#fafaf9,3px_3px_0_2px_#fafaf9,3.5px_3.5px_0_2px_#fafaf9,4px_4px_0_2px_#fafaf9] hover:translate-x-0 hover:translate-y-0 hover:shadow-[0_0_0_2px_#fafaf9] focus-visible:outline-yellow-400 focus-visible:outline-dashed">
              <div className="relative bg-yellow-400 rounded-full border-2 border-white/30">
                <span className="relative flex items-center justify-center px-6 py-3">
                  Register
                </span>
              </div>
            </button>
          </Link>

          {isRegistration && (
            <Link to="/CandidateRegister">
              <button className="relative font-bold text-base cursor-pointer rounded-full bg-stone-800 text-stone-800 p-[1px] transform -translate-x-1 -translate-y-1 transition-all duration-150 ease-in-out outline-2 outline-transparent outline-offset-[5px] shadow-[0.5px_0.5px_0_0_#292524,1px_1px_0_0_#292524,1.5px_1.5px_0_0_#292524,2px_2px_0_0_#292524,2.5px_2.5px_0_0_#292524,3px_3px_0_0_#292524,0_0_0_2px_#fafaf9,0.5px_0.5px_0_2px_#fafaf9,1px_1px_0_2px_#fafaf9,1.5px_1.5px_0_2px_#fafaf9,2px_2px_0_2px_#fafaf9,2.5px_2.5px_0_2px_#fafaf9,3px_3px_0_2px_#fafaf9,3.5px_3.5px_0_2px_#fafaf9,4px_4px_0_2px_#fafaf9] hover:translate-x-0 hover:translate-y-0 hover:shadow-[0_0_0_2px_#fafaf9] focus-visible:outline-yellow-400 focus-visible:outline-dashed">
                <div className="relative bg-yellow-400 rounded-full border-2 border-white/30">
                  <span className="relative flex items-center justify-center px-6 py-3">
                    Candidate Registration
                  </span>
                </div>
              </button>
            </Link>
          )}
        </div>
      </section>

      {/* Current Election */}
      <section className="w-full mt-12 md:mt-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl md:text-4xl font-montserrat font-semibold">Current Election</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Security Card */}
          <div className="bg-white/90 border-2 p-6 rounded-3xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase font-montserrat">Security</h3>
              <h2 className="text-lg font-semibold mt-2 font-montserrat">Secure & Transparent</h2>
              <p className="text-sm text-gray-800 mt-2 font-montserrat">
                Advanced encryption and blockchain ensure every vote is safe and verifiable.
              </p>
            </div>
            <div className="flex justify-between items-center mt-6">
              <span className="font-bold">99.9%</span>
              <Shield className="w-5 h-5 text-black" />
            </div>
            <span className="text-xs text-gray-800 mt-1">Security Rating</span>
          </div>

          {/* Process Card */}
          <div className="bg-white/90 border-2 text-black p-6 rounded-3xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase">Process</h3>
              <h2 className="text-lg font-semibold mt-2">Simple Steps</h2>
              <p className="text-sm text-gray-800 mt-2">
                Register, verify, and vote — all in just three quick steps.
              </p>
            </div>
            <div className="flex justify-between items-center mt-6">
              <span className="font-bold">3 Steps</span>
              <CheckCircle className="w-5 h-5 text-black" />
            </div>
            <span className="text-xs text-gray-800 mt-1">To Vote</span>
          </div>

          {/* Schedule Card */}
          <div className="bg-white/90 border-2 p-6 rounded-3xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase">Schedule</h3>
              <h2 className="text-lg font-semibold mt-2">Upcoming Elections</h2>
              <p className="text-sm text-gray-800 mt-2">
                Stay updated on election dates and never miss your chance.
              </p>
            </div>
            <div className="flex justify-between items-center mt-6">
              <span className="font-bold">{new Date().toLocaleString("en-US", { month: "short", day: "2-digit" })}</span>
              <CalendarIcon className="w-5 h-5 text-black" />
            </div>
            <span className="text-xs text-gray-800 mt-1">Next Election</span>
          </div>

          {/* Candidate Card */}
          <div className="bg-white/90 border-2 p-6 rounded-3xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase">Participate</h3>
              <h2 className="text-lg font-semibold mt-2">Become a Candidate</h2>
              <p className="text-sm text-gray-800 mt-2">
                Ready to lead? Register as a candidate and make an impact.
              </p>
            </div>
            <div className="flex justify-between items-center mt-6">
              <span className="font-bold">Join Now</span>
              <UserPlus className="w-5 h-5 text-black" />
            </div>
            <span className="text-xs text-gray-800 mt-1">Registration {isRegistration ? "Open" : "Closed"}</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PublicElectionPage;