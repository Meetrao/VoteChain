import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../constants.JS";
import { useNavigate } from "react-router-dom";

axios.defaults.withCredentials = true;

export default function VotingDashboard() {
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [votingMessage, setVotingMessage] = useState("");
  const navigate = useNavigate();

  const fetchElectionAndCandidates = async () => {
    setLoading(true);
    setMessage("");
    try {
      const { data: electionRes } = await axios.get("/voting/getElection");

      if (!electionRes?.election) {
        setElection(null);
        setCandidates([]);
        setResults([]);
        setMessage("No election is currently going on.");
      } else {
        setElection(electionRes.election);

        // Fetch candidates for this election
        const { data: candRes } = await axios.get("/candidate/list", {
          params: { electionId: electionRes.election._id },
        });
        setCandidates(candRes?.candidates || []);

        // If election is in result phase, fetch results
        if (electionRes.election.phase === "result") {
          await fetchResults();
        }
      }
    } catch (error) {
      console.error("Error fetching election:", error);
      setElection(null);
      setCandidates([]);
      setResults([]);
      if (error.response?.status === 404) {
        setMessage("No election is currently going on.");
      } else {
        setMessage("Failed to fetch election data.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const { data: resultsRes } = await axios.get("/voting/results");
      const sortedResults = resultsRes.results.sort((a, b) => b.votes - a.votes);
      setResults(sortedResults);
      console.log("Fetched results:", sortedResults);
    } catch (error) {
      console.error("Error fetching results:", error);
      setResults([]);
    }
  };

  useEffect(() => {
    fetchElectionAndCandidates();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout");
      localStorage.removeItem("currentUser");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed!");
    }
  };

  const handleVote = async (candidate) => {
    try {
      setVotingMessage(`Voting for ${candidate.name}...`);

      console.log("Candidate object:", candidate);
      console.log("Sending candidateWalletAddress:", candidate.candidateWalletAddress);

      const response = await axios.post("/voting/vote", {
        candidateWalletAddress: candidate.candidateWalletAddress
      });

      setVotingMessage(`✅ Successfully voted for ${candidate.name}!`);

      setTimeout(() => {
        setVotingMessage("");
      }, 3000);

    } catch (error) {
      console.error("Voting failed:", error);
      console.error("Error response:", error.response?.data);
      setVotingMessage(`❌ ${error.response?.data?.message || "Voting failed!"}`);

      setTimeout(() => {
        setVotingMessage("");
      }, 5000);
    }
  };

  const handleDebugUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/voting/debug-user`, {
        withCredentials: true
      });
      console.log("User debug data:", response.data);
      alert("Check console for user debug data");
    } catch (error) {
      console.error("Debug failed:", error);
    }
  };

  // Results view (styled, logic unchanged)
  const renderResults = () => {
    const totalVotes = results.reduce((sum, candidate) => {
      const votes = Number(candidate.votes) || 0;
      return sum + votes;
    }, 0);

    return (
      <div className="space-y-6">
        {/* Summary Card */}
        <div className="bg-white rounded-3xl border border-black/10 p-6 md:p-8 shadow-sm">
          <div className="text-center mb-6">
            <h3 className="text-2xl md:text-3xl font-montserrat font-semibold text-emerald-600">
              🏆 Election Results: {election.title}
            </h3>
            <p className="text-gray-600 mt-2">
              Total Votes Cast: <span className="font-semibold text-gray-800">{totalVotes}</span>
            </p>
            <p className="text-sm text-gray-500 italic mt-1">
              Results are sorted by vote count (highest to lowest)
            </p>
          </div>

          {results.length === 0 ? (
            <div className="text-center text-gray-600 py-10">
              <p className="text-lg">No candidates found for this election.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {results.map((candidate, index) => {
                const votes = Number(candidate.votes) || 0;
                const isWinner = index === 0 && votes > 0;
                const votePercentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : "0.0";

                return (
                  <div
                    key={candidate.candidateWalletAddress || candidate._id}
                    className={`relative rounded-2xl border p-4 md:p-6 bg-white shadow-sm flex flex-col md:flex-row items-center gap-4 md:gap-6 ${isWinner ? "border-yellow-300 ring-1 ring-yellow-200" : "border-gray-200"
                      }`}
                  >
                    {/* Winner badge */}
                    {isWinner && (
                      <div className="absolute -top-3 right-4 bg-yellow-400 text-gray-900 font-semibold text-xs px-3 py-1 rounded-full shadow">
                        🏆 WINNER
                      </div>
                    )}

                    {/* Position */}
                    <div
                      className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-lg md:text-xl font-bold flex-shrink-0 ${isWinner ? "bg-yellow-300 text-gray-900" : "bg-gray-100 text-gray-600"
                        }`}
                    >
                      #{index + 1}
                    </div>

                    {/* Logo */}
                    {candidate.logo && (
                      <img
                        src={candidate.logo}
                        alt={`${candidate.name} logo`}
                        className={`w-16 h-16 md:w-20 md:h-20 rounded-full object-cover flex-shrink-0 ${isWinner ? "ring-2 ring-yellow-300" : "ring-1 ring-gray-200"
                          }`}
                      />
                    )}

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left">
                      <h4 className={`text-xl md:text-2xl font-semibold ${isWinner ? "text-gray-900" : "text-gray-800"}`}>
                        {candidate.name || "Unknown Candidate"}
                      </h4>
                      <p className="text-gray-600 font-semibold mt-1">Party: {candidate.party || "Independent"}</p>
                      <p className="text-gray-500 italic mt-2">"{candidate.slogan || "No slogan"}"</p>
                    </div>

                    {/* Votes */}
                    <div className="text-right min-w-[120px]">
                      <div className={`text-3xl font-bold leading-none ${isWinner ? "text-yellow-500" : "text-emerald-600"}`}>
                        {votes}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">votes</div>
                      <div className={`mt-2 text-lg font-semibold ${isWinner ? "text-gray-800" : "text-gray-700"}`}>
                        {votePercentage}%
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-gray-200 rounded-full md:absolute md:bottom-0 md:left-0 md:rounded-b-2xl md:rounded-t-none">
                      <div
                        className={`h-1.5 rounded-full ${isWinner ? "bg-yellow-400" : "bg-emerald-600"}`}
                        style={{ width: `${votePercentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Election Summary (minimal) */}
        <div className="bg-white rounded-2xl border border-black/10 p-5 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Election Summary</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="bg-gray-50 rounded-xl p-3">
              <span className="text-gray-500">Election</span>
              <div className="font-semibold text-gray-800">{election.title}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <span className="text-gray-500">Phase</span>
              <div className="font-semibold text-emerald-600">Results</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <span className="text-gray-500">Total Candidates</span>
              <div className="font-semibold text-gray-800">{results.length}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <span className="text-gray-500">Total Votes</span>
              <div className="font-semibold text-gray-800">{totalVotes}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Voting view (styled, logic unchanged)
  const renderVoting = () => {
    return (
      <div className="bg-white rounded-3xl border border-black/10 p-6 md:p-8 shadow-sm">
        <div className="mb-4">
          <h3 className="text-xl md:text-2xl font-semibold text-gray-800">
            Election: <span className="text-blue-600">{election.title}</span>
          </h3>
          <p className="text-gray-600">
            Phase: <b className="text-gray-800">{election.phase}</b>
          </p>
        </div>

        <h4 className="text-lg font-semibold text-gray-800 mb-4">Candidates</h4>

        {candidates.length === 0 ? (
          <p className="text-gray-600">No candidates registered yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {candidates.map((candidate) => (
              <div
                key={candidate._id}
                className="border border-gray-200 rounded-2xl p-5 text-center bg-gray-50"
              >
                {candidate.logo && (
                  <img
                    src={candidate.logo}
                    alt={`${candidate.name} logo`}
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-3 ring-1 ring-gray-300"
                  />
                )}
                <h4 className="text-lg font-semibold text-gray-800">{candidate.name}</h4>
                <p className="text-gray-600 font-semibold mt-1">Party: {candidate.party}</p>
                <p className="text-gray-500 italic mt-2">"{candidate.slogan}"</p>

                {election.phase === "voting" && (
                  <button
                    onClick={() => handleVote(candidate)}
                    className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm transition-colors"
                  >
                    Vote for {candidate.name}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logout */}
        <div className="flex items-center justify-end mb-6">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm font-semibold shadow-md transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-montserrat font-extrabold text-gray-900">
            {election?.phase === "result" ? "🏆 Election Results" : "Voting Dashboard"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">Overview and actions for the current election.</p>
        </div>

        {votingMessage && (
          <div
            className={`mb-6 rounded-2xl px-5 py-3 border shadow-sm ${votingMessage.includes("✅")
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
              }`}
          >
            {votingMessage}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-3 text-gray-600 justify-center py-20">
            <svg className="animate-spin h-8 w-8 text-gray-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <span className="text-lg">Loading election data...</span>
          </div>
        ) : message ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-md">
            <p className="text-gray-600 text-2xl">{message}</p>
          </div>
        ) : election ? (
          <div className="grid grid-cols-1 gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>{election.phase === "result" ? renderResults() : renderVoting()}</div>
              <aside className="hidden lg:block">
                <div className="sticky top-20 space-y-4">
                  <div className="bg-white p-4 rounded-2xl shadow-md border">
                    <h4 className="text-sm text-gray-500">Election</h4>
                    <div className="text-lg font-semibold text-gray-900">{election.title}</div>
                    <div className="mt-2 text-xs text-gray-500">Phase: <span className="font-semibold text-emerald-600">{election.phase}</span></div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl shadow-md border">
                    <h4 className="text-sm text-gray-500">Quick Actions</h4>
                    <div className="mt-3 flex flex-col gap-2">
                      <button onClick={handleDebugUser} className="text-sm px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Debug User</button>
                      <button className="text-sm px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">View Voter List</button>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}