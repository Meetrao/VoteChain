import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Use relative /api endpoints; main.jsx config will set axios baseURL to include /api if VITE_API_URL is set

export default function Ballot() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("none");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!currentUser?._id) {
      navigate("/login");
      return;
    }
    refresh();
  }, [navigate]);

  const refresh = async () => {
    try {
      setLoading(true);
      const [phaseRes, candRes] = await Promise.all([
        fetch(`/voting/phase`),
        fetch(`/voting/candidates`),
      ]);
      const phaseData = await phaseRes.json();
      const candData = await candRes.json();
      setPhase(phaseData.phase || "none");
      setCandidates(candData.candidates || []);
      setMessage("");
    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const castVote = async (candidateWalletAddress) => {
    try {
      setMessage("Casting vote...");
      const res = await fetch(`/voting/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ candidateWallet: candidateWalletAddress }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Vote failed");
      setMessage("✅ Vote cast successfully");
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading ballot...</div>;

  if (phase !== "voting") {
    return (
      <div style={{ padding: 20 }}>
        <button onClick={() => navigate("/")}>← Back</button>
        <h3>Voting is not active</h3>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => navigate("/")}>← Back</button>
      </div>
      <h2>Ballot</h2>
      {message && <div style={{ margin: "10px 0" }}>{message}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
        {candidates.map((c) => (
          <div key={c.candidateWalletAddress} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
            {c.logo && (
              <img src={c.logo} alt={`${c.name} logo`} style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover" }} />
            )}
            <h4 style={{ marginTop: 10 }}>{c.name}</h4>
            <p style={{ margin: 0, color: "#6b7280" }}>{c.party}</p>
            <p style={{ fontStyle: "italic" }}>&quot;{c.slogan}&quot;</p>
            <button onClick={() => castVote(c.candidateWalletAddress)} style={{ padding: "10px 16px", background: "#ef4444", color: "white", border: 0, borderRadius: 6, cursor: "pointer" }}>
              Vote
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


