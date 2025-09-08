import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PublicElectionPage() {
  const navigate = useNavigate();
  const [electionData, setElectionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const ADMIN_WALLET = "0x2e6B08165B256Ed35fc7bA9De8998c2A06D4C936";

  // Check if current user is admin
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    setIsAdmin(currentUser.userWalletAddress === ADMIN_WALLET);
  }, []);

  // Fetch election status from backend
  const fetchElectionStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/voting/active");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch election status");
      }

      setElectionData(data);
      setError("");
    } catch (err) {
      setError(err.message);
      console.error("Error fetching election status:", err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchElectionStatus();
    const interval = setInterval(fetchElectionStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleString();
  };

  // Get phase color
  const getPhaseColor = (phase) => {
    switch (phase) {
      case "registration": return "#3b82f6"; // blue
      case "voting": return "#ef4444"; // red
      case "result": return "#10b981"; // green
      case "none": return "#6b7280"; // gray
      default: return "#6b7280";
    }
  };

  // Render content based on phase
  const renderPhaseContent = () => {
    if (!electionData) return null;

    switch (electionData.phase) {
      case "registration":
        return (
          <div style={phaseContentStyle}>
            <h3>📝 Registration Phase Active</h3>
            <p>Candidates can register for the election.</p>
            <button
              onClick={() => navigate("/candidate-register")}
              style={buttonStyle("#3b82f6")}
            >
              Register as Candidate
            </button>
          </div>
        );

      case "voting":
        return (
          <div style={phaseContentStyle}>
            <h3>🗳️ Voting Phase Active</h3>
            <p>Voting is now open! Cast your vote for your preferred candidate.</p>
            <button style={buttonStyle("#ef4444")}>
              Vote Now
            </button>
          </div>
        );

      case "result":
        return (
          <div style={phaseContentStyle}>
            <h3>📊 Results Declared</h3>
            <p>Election has ended. View the final results below.</p>
          </div>
        );

      case "none":
      default:
        return (
          <div style={phaseContentStyle}>
            <h3>📅 No Active Election</h3>
            <p>There is currently no election scheduled or ongoing.</p>
            <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "10px" }}>
              Elections will be announced here when they become available.
              You can register as a voter in the meantime.
            </p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>🗳️ VoteChain Election Portal</h1>
          <p style={{ textAlign: "center" }}>Loading election status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>🗳️ VoteChain Election Portal</h1>
          <div style={errorStyle}>
            <h3>❌ Error</h3>
            <p>{error}</p>
            <button onClick={fetchElectionStatus} style={buttonStyle("#6b7280")}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>🗳️ VoteChain Election Portal</h1>

        {/* Phase Status Banner */}
        <div style={{
          ...bannerStyle,
          backgroundColor: getPhaseColor(electionData.phase),
        }}>
          <h2 style={{ margin: 0, color: "white", textTransform: "uppercase" }}>
            {electionData.phase === "none" ? "No Active Elections" : `${electionData.phase} Phase`}
          </h2>
          {electionData.phase === "none" && (
            <p style={{ margin: "10px 0 0 0", color: "white", fontSize: "16px" }}>
              Currently no elections are scheduled
            </p>
          )}
        </div>

        {/* Phase-specific content */}
        {renderPhaseContent()}

        {/* Election Details */}
        {electionData.phase !== "none" && (
          <div style={detailsStyle}>
            <h3>📋 Election Details</h3>
            <div style={infoRowStyle}>
              <span style={labelStyle}>Voting Start:</span>
              <span>{formatDate(electionData.votingStart)}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={labelStyle}>Voting End:</span>
              <span>{formatDate(electionData.votingEnd)}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={labelStyle}>Total Candidates:</span>
              <span>{electionData.candidates?.length || 0}</span>
            </div>
          </div>
        )}

        {/* Candidates List */}
        {electionData.candidates && electionData.candidates.length > 0 && (
          <div style={candidatesStyle}>
            <h3>👥 Candidates</h3>
            <div style={candidateGridStyle}>
              {electionData.candidates.map((candidate) => (
                <div key={candidate.candidateWalletAddress} style={candidateCardStyle}>
                  {candidate.logo && (
                    <img
                      src={candidate.logo}
                      alt={`${candidate.name} logo`}
                      style={candidateLogoStyle}
                    />
                  )}
                  <h4 style={{ margin: "10px 0 5px 0" }}>{candidate.name}</h4>
                  <p style={{ margin: "0 0 5px 0", color: "#6b7280", fontSize: "14px" }}>{candidate.party}</p>
                  <p style={{ margin: 0, fontStyle: "italic", fontSize: "13px" }}>
                    "{candidate.slogan}"
                  </p>
                  {candidate.voteCount !== undefined && (
                    <div style={voteCountStyle}>
                      Votes: {candidate.voteCount}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Auth Actions */}
        <div style={authActionsStyle}>
          {electionData.phase === "none" ? (
            <>
              <p>Get ready for future elections!</p>
              <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "15px" }}>
                Register as a voter now so you'll be ready when elections are announced.
              </p>
            </>
          ) : (
            <p>Already have an account?</p>
          )}
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/login")} style={buttonStyle("#6366f1")}>Login</button>
            <button onClick={() => navigate("/register")} style={buttonStyle("#059669")}>Register as Voter</button>
            {isAdmin && (
              <button onClick={() => navigate("/admin")} style={buttonStyle("#dc2626")}>
                🔧 Admin Dashboard
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <p>🔒 Secured by Blockchain Technology</p>
          <p style={{ fontSize: "12px", color: "#9ca3af" }}>
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}

// Styles
const containerStyle = {
  minHeight: "100vh",
  backgroundColor: "#f3f4f6",
  padding: "20px",
  fontFamily: "Arial, sans-serif",
};

const cardStyle = {
  maxWidth: "900px",
  margin: "0 auto",
  backgroundColor: "white",
  borderRadius: "12px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  overflow: "hidden",
};

const titleStyle = {
  textAlign: "center",
  margin: "30px 0 20px 0",
  color: "#1f2937",
  fontSize: "32px",
};

const bannerStyle = {
  padding: "25px",
  textAlign: "center",
  margin: "0 20px 20px 20px",
  borderRadius: "8px",
};

const phaseContentStyle = {
  padding: "20px 30px",
  textAlign: "center",
  borderBottom: "1px solid #e5e7eb",
  marginBottom: "20px",
};

const detailsStyle = {
  padding: "0 30px 20px 30px",
};

const infoRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "8px 0",
  borderBottom: "1px solid #e5e7eb",
};

const labelStyle = {
  fontWeight: "600",
  color: "#374151",
};

const candidatesStyle = {
  padding: "0 30px 20px 30px",
};

const candidateGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "15px",
  marginTop: "15px",
};

const candidateCardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "15px",
  textAlign: "center",
  backgroundColor: "#f9fafb",
};

const candidateLogoStyle = {
  width: "60px",
  height: "60px",
  borderRadius: "50%",
  objectFit: "cover",
  margin: "0 auto",
  display: "block",
};

const voteCountStyle = {
  marginTop: "10px",
  padding: "5px 10px",
  backgroundColor: "#10b981",
  color: "white",
  borderRadius: "15px",
  fontSize: "12px",
  fontWeight: "bold",
};

const authActionsStyle = {
  textAlign: "center",
  padding: "20px 30px",
  borderTop: "1px solid #e5e7eb",
};

const errorStyle = {
  textAlign: "center",
  padding: "20px",
  color: "#ef4444",
};

const footerStyle = {
  textAlign: "center",
  padding: "20px",
  backgroundColor: "#f9fafb",
  color: "#6b7280",
};

const buttonStyle = (bgColor) => ({
  padding: "12px 24px",
  backgroundColor: bgColor,
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "16px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s",
});
