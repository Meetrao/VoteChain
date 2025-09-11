import React, { useEffect, useState } from "react";
import axios from "axios";
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

        // 🔧 NEW: If election is in result phase, fetch results
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

  // 🔧 NEW: Function to fetch results
  const fetchResults = async () => {
    try {
      const { data: resultsRes } = await axios.get("/voting/results");

      // Sort candidates by vote count in descending order
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
      const response = await axios.get("http://localhost:5000/api/voting/debug-user", {
        withCredentials: true
      });
      console.log("User debug data:", response.data);
      alert("Check console for user debug data");
    } catch (error) {
      console.error("Debug failed:", error);
    }
  };

  // 🔧 NEW: Function to render results phase
  const renderResults = () => {
    const totalVotes = results.reduce((sum, candidate) => {
      const votes = Number(candidate.votes) || 0; // 🔧 FIX: Ensure it's a number
      return sum + votes;
    }, 0);

    return (
      <div style={{
        border: "2px solid #28a745",
        borderRadius: 12,
        padding: 32,
        marginBottom: 32,
        backgroundColor: "#f8f9fa"
      }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <h3 style={{
            color: "#28a745",
            fontSize: "28px",
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px"
          }}>
            🏆 Election Results: {election.title}
          </h3>
          <p style={{
            fontSize: "18px",
            color: "#666",
            margin: "5px 0"
          }}>
            Total Votes Cast: <strong>{totalVotes}</strong>
          </p>
          <p style={{
            fontSize: "16px",
            color: "#888",
            fontStyle: "italic"
          }}>
            Results are sorted by vote count (highest to lowest)
          </p>
        </div>

        {results.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "40px",
            color: "#666"
          }}>
            <p style={{ fontSize: "18px" }}>No candidates found for this election.</p>
          </div>
        ) : (
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }}>
            {results.map((candidate, index) => {
              // 🔧 FIX: Safely handle vote count
              const votes = Number(candidate.votes) || 0;
              const isWinner = index === 0 && votes > 0;
              const votePercentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : "0.0";

              return (
                <div
                  key={candidate.candidateWalletAddress || candidate._id}
                  style={{
                    border: isWinner ? "3px solid #ffd700" : "2px solid #ddd",
                    borderRadius: 12,
                    padding: 24,
                    backgroundColor: isWinner ? "#fff9e6" : "white",
                    boxShadow: isWinner
                      ? "0 8px 24px rgba(255, 215, 0, 0.3)"
                      : "0 4px 12px rgba(0, 0, 0, 0.1)",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: "20px"
                  }}
                >
                  {/* Winner Badge */}
                  {isWinner && (
                    <div style={{
                      position: "absolute",
                      top: "-10px",
                      right: "20px",
                      background: "linear-gradient(135deg, #ffd700, #ffed4e)",
                      color: "#333",
                      padding: "8px 16px",
                      borderRadius: "20px",
                      fontWeight: "bold",
                      fontSize: "14px",
                      boxShadow: "0 4px 12px rgba(255, 215, 0, 0.4)",
                      border: "2px solid #ffd700"
                    }}>
                      🏆 WINNER
                    </div>
                  )}

                  {/* Position Number */}
                  <div style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    backgroundColor: isWinner ? "#ffd700" : "#e9ecef",
                    color: isWinner ? "#333" : "#666",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    fontWeight: "bold",
                    flexShrink: 0
                  }}>
                    #{index + 1}
                  </div>

                  {/* Candidate Logo */}
                  {candidate.logo && (
                    <img
                      src={candidate.logo}
                      alt={`${candidate.name} logo`}
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: isWinner ? "3px solid #ffd700" : "2px solid #ddd",
                        flexShrink: 0
                      }}
                    />
                  )}

                  {/* Candidate Info */}
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      margin: "0 0 8px 0",
                      color: isWinner ? "#333" : "#444",
                      fontSize: "24px"
                    }}>
                      {candidate.name || "Unknown Candidate"}
                    </h4>
                    <p style={{
                      margin: "4px 0",
                      color: "#666",
                      fontSize: "16px",
                      fontWeight: "600"
                    }}>
                      Party: {candidate.party || "Independent"}
                    </p>
                    <p style={{
                      margin: "8px 0 0 0",
                      fontStyle: "italic",
                      color: "#777",
                      fontSize: "14px"
                    }}>
                      "{candidate.slogan || "No slogan"}"
                    </p>
                  </div>

                  {/* Vote Count and Percentage */}
                  <div style={{
                    textAlign: "right",
                    minWidth: "150px"
                  }}>
                    <div style={{
                      fontSize: "32px",
                      fontWeight: "bold",
                      color: isWinner ? "#ffd700" : "#28a745",
                      lineHeight: 1
                    }}>
                      {votes}
                    </div>
                    <div style={{
                      fontSize: "14px",
                      color: "#666",
                      marginTop: "4px"
                    }}>
                      votes
                    </div>
                    <div style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: isWinner ? "#333" : "#555",
                      marginTop: "8px"
                    }}>
                      {votePercentage}%
                    </div>
                  </div>

                  {/* Vote Percentage Bar */}
                  <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: `${votePercentage}%`,
                    height: "4px",
                    backgroundColor: isWinner ? "#ffd700" : "#28a745",
                    borderRadius: "0 0 12px 12px"
                  }}></div>
                </div>
              );
            })}
          </div>
        )}

        {/* Election Summary */}
        <div style={{
          marginTop: 30,
          padding: 20,
          backgroundColor: "white",
          borderRadius: 8,
          border: "1px solid #ddd"
        }}>
          <h4 style={{ color: "#333", marginBottom: 15 }}>Election Summary</h4>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
            fontSize: "14px"
          }}>
            <div>
              <strong>Election:</strong> {election.title}
            </div>
            <div>
              <strong>Phase:</strong> <span style={{ color: "#28a745" }}>Results</span>
            </div>
            <div>
              <strong>Total Candidates:</strong> {results.length}
            </div>
            <div>
              <strong>Total Votes:</strong> {totalVotes}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 🔧 NEW: Function to render voting phase (existing code)
  const renderVoting = () => {
    return (
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: 8,
          padding: 24,
          marginBottom: 32,
        }}
      >
        <h3>
          Election:{" "}
          <span style={{ color: "#2563eb" }}>{election.title}</span>
        </h3>
        <p>
          Phase: <b>{election.phase}</b>
        </p>
        <h4>Candidates:</h4>
        {candidates.length === 0 ? (
          <p>No candidates registered yet.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {candidates.map((candidate) => (
              <div
                key={candidate._id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 16,
                  textAlign: "center",
                  backgroundColor: "#f9f9f9",
                }}
              >
                {candidate.logo && (
                  <img
                    src={candidate.logo}
                    alt={`${candidate.name} logo`}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginBottom: 12,
                      border: "2px solid #ddd",
                    }}
                  />
                )}
                <h4 style={{ margin: "8px 0", color: "#333" }}>
                  {candidate.name}
                </h4>
                <p
                  style={{
                    margin: "4px 0",
                    fontWeight: "bold",
                    color: "#666",
                  }}
                >
                  Party: {candidate.party}
                </p>
                <p
                  style={{
                    margin: "8px 0",
                    fontStyle: "italic",
                    color: "#555",
                  }}
                >
                  "{candidate.slogan}"
                </p>

                {/* Vote button - only show in voting phase */}
                {election.phase === "voting" && (
                  <button
                    onClick={() => handleVote(candidate)}
                    style={{
                      marginTop: "12px",
                      padding: "10px 20px",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "14px",
                    }}
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
    <div style={{ padding: 40, maxWidth: 1000, margin: "0 auto" }}>
      <button
        onClick={handleLogout}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          padding: "8px 16px",
          background: "#ef4444",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Logout
      </button>

      <h2>
        {election?.phase === "result" ? "🏆 Election Results" : "Voting Dashboard"}
      </h2>

      {votingMessage && (
        <div
          style={{
            padding: "12px",
            marginBottom: "20px",
            backgroundColor: votingMessage.includes("✅") ? "#d4edda" : "#f8d7da",
            border: `1px solid ${votingMessage.includes("✅") ? "#c3e6cb" : "#f5c6cb"}`,
            borderRadius: "6px",
            color: votingMessage.includes("✅") ? "#155724" : "#721c24",
          }}
        >
          {votingMessage}
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : message ? (
        <p>{message}</p>
      ) : election ? (
        // 🔧 NEW: Conditional rendering based on election phase
        election.phase === "result" ? renderResults() : renderVoting()
      ) : null}

      {/* Debug button - you can remove this later */}
      <button
        onClick={handleDebugUser}
        style={{
          padding: "10px",
          margin: "10px",
          fontSize: "12px",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "4px"
        }}
      >
        Debug User Data
      </button>
    </div>
  );
}
