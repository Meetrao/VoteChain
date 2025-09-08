import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [currentElection, setCurrentElection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [newElection, setNewElection] = useState({
    title: "",
    description: "",
    startTime: ""
  });

  const ADMIN_WALLET = "0x2e6B08165B256Ed35fc7bA9De8998c2A06D4C936";

  useEffect(() => {
    // Check if user is admin
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (currentUser.userWalletAddress !== ADMIN_WALLET) {
      navigate("/");
      return;
    }
    fetchCurrentElection();
  }, [navigate]);

  const fetchCurrentElection = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/voting/current");
      const data = await response.json();
      if (response.ok) {
        setCurrentElection(data);
      }
    } catch (error) {
      console.error("Error fetching election:", error);
    }
  };

  const createElection = async () => {
    if (!newElection.title || !newElection.startTime) {
      setMessage("❌ Please fill all required fields");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/voting/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newElection),
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("✅ Election created successfully!");
        setNewElection({ title: "", description: "", startTime: "" });
        fetchCurrentElection();
      } else {
        setMessage("❌ " + (data.message || "Failed to create election"));
      }
    } catch (error) {
      setMessage("❌ " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const startVotingPhase = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/voting/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Registration phase ended. Voting has started!");
        fetchCurrentElection();
      } else {
        setMessage("❌ " + (data.message || "Failed to start voting phase"));
      }
    } catch (error) {
      console.error("Error in startVotingPhase:", error);
      setMessage("❌ " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const endVotingPhase = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/voting/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("✅ Voting phase ended. Results are now available!");
        fetchCurrentElection();
      } else {
        setMessage("❌ " + (data.message || "Failed to end voting phase"));
      }
    } catch (error) {
      setMessage("❌ " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  const renderCurrentElectionStatus = () => {
    if (!currentElection) {
      return (
        <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px", margin: "20px 0" }}>
          <h3>No Active Election</h3>
          <p>Create a new election to begin the process.</p>
        </div>
      );
    }

    return (
      <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px", margin: "20px 0" }}>
        <h3>Current Election: {currentElection.title || "Untitled Election"}</h3>
        <p><strong>Status:</strong> {currentElection.phase || currentElection.status || "Unknown"}</p>
        <p><strong>Description:</strong> {currentElection.description || "No description"}</p>
        <p><strong>Start Time:</strong> {currentElection.startTime ? new Date(currentElection.startTime).toLocaleString() : "Not set"}</p>
        <p><strong>Candidates:</strong> {currentElection.candidates?.length || 0}</p>

        <div style={{ marginTop: "20px" }}>
          <h4>Phase Controls:</h4>

          {(currentElection.phase === "registration" || currentElection.status === "REGISTRATION_OPEN") && (
            <button
              onClick={startVotingPhase}
              disabled={loading}
              style={{
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "16px",
                marginRight: "10px"
              }}
            >
              {loading ? "Processing..." : "Start Voting Phase"}
            </button>
          )}

          {(currentElection.phase === "voting" || currentElection.status === "VOTING_OPEN") && (
            <button
              onClick={endVotingPhase}
              disabled={loading}
              style={{
                padding: "10px 20px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "16px",
                marginRight: "10px"
              }}
            >
              {loading ? "Processing..." : "End Voting & Show Results"}
            </button>
          )}

          {(currentElection.phase === "result" || currentElection.status === "RESULTS") && (
            <p style={{ color: "#27ae60", fontWeight: "bold" }}>
              ✅ Election completed. Results are available to public.
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h1>Admin Dashboard</h1>
        <button
          onClick={logout}
          style={{
            padding: "8px 16px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>

      {message && (
        <div
          style={{
            padding: "10px",
            marginBottom: "20px",
            borderRadius: "5px",
            backgroundColor: message.includes("✅") ? "#d4edda" : "#f8d7da",
            color: message.includes("✅") ? "#155724" : "#721c24",
            border: `1px solid ${message.includes("✅") ? "#c3e6cb" : "#f5c6cb"}`
          }}
        >
          {message}
        </div>
      )}

      {renderCurrentElectionStatus()}

      {/* Create New Election Form */}
      <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#f8f9fa" }}>
        <h3>Create New Election</h3>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Election Title *
          </label>
          <input
            type="text"
            value={newElection.title}
            onChange={(e) => setNewElection({ ...newElection, title: e.target.value })}
            placeholder="e.g., Student Council Election 2024"
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "5px",
              fontSize: "16px"
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Description
          </label>
          <textarea
            value={newElection.description}
            onChange={(e) => setNewElection({ ...newElection, description: e.target.value })}
            placeholder="Brief description of the election"
            rows={3}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "5px",
              fontSize: "16px",
              resize: "vertical"
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Start Time *
          </label>
          <input
            type="datetime-local"
            value={newElection.startTime}
            onChange={(e) => setNewElection({ ...newElection, startTime: e.target.value })}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "5px",
              fontSize: "16px"
            }}
          />
          <small style={{ color: "#6b7280", fontSize: "12px" }}>
            Election phases will be controlled manually by admin buttons
          </small>
        </div>

        <button
          onClick={createElection}
          disabled={loading}
          style={{
            padding: "12px 24px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          {loading ? "Creating..." : "Create Election"}
        </button>
      </div>

      <div style={{ marginTop: "30px", padding: "20px", backgroundColor: "#e9ecef", borderRadius: "8px" }}>
        <h4>Election Workflow:</h4>
        <ol>
          <li><strong>Registration Phase:</strong> Candidates can register for the election</li>
          <li><strong>Voting Phase:</strong> Voters can cast their votes</li>
          <li><strong>Results Phase:</strong> Election results are displayed publicly</li>
        </ol>
      </div>
    </div>
  );
};

export default AdminDashboard;
