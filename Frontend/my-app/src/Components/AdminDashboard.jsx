import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    title: "Election",
    description: "Election Description",
    phase: "pending",
    startTime: "",
  });
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateElection = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("Creating election...");

    try {
      const response = await axios.post("http://localhost:5000/api/voting/create", {
        title: form.title,
        description: form.description,
        startTime: form.startTime
      });

      console.log("Election created:", response.data);
      setMessage("✅ Election created in pending phase!");

      setForm({
        title: "Election",
        description: "Election Description",
        phase: "pending",
        startTime: "",
      });

      fetchElections();
    } catch (error) {
      console.error("Create election error:", error);
      setMessage("❌ " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchElections = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/voting/all");
      console.log("Fetched elections:", res.data);
      setElections(res.data.elections || []);
    } catch (error) {
      console.error("Error fetching elections:", error);
      setElections([]);
    }
  };

  const handleChangePhase = async (id, nextPhase) => {
    try {
      setLoading(true);
      setMessage(`Updating election to ${nextPhase}...`);

      let endpoint;
      if (nextPhase === "voting") {
        endpoint = "http://localhost:5000/api/voting/start-voting";      // ✅ Calls startVotingPhase
      } else if (nextPhase === "result") {
        endpoint = "http://localhost:5000/api/voting/start-result";      // ✅ Calls startResultPhase
      } else if (nextPhase === "ended") {
        endpoint = "http://localhost:5000/api/voting/end-election";      // ✅ Calls endElection
      } else {
        throw new Error(`Unknown phase: ${nextPhase}`);
      }

      const response = await axios.post(endpoint);
      setMessage(`✅ ${response.data.message}`);
      fetchElections();

    } catch (error) {
      console.error("Phase change error:", error);
      setMessage("❌ " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/logout");
      localStorage.removeItem("currentUser");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem("currentUser");
      window.location.href = "/";
    }
  };

  const handleCheckBlockchainStatus = async () => {
    try {
      setLoading(true);
      setMessage("Checking blockchain status...");

      const response = await axios.get("http://localhost:5000/api/voting/blockchain-status");
      setMessage("ℹ️ " + response.data.message);
    } catch (error) {
      console.error("Check blockchain status error:", error);
      setMessage("❌ " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEndBlockchainElection = async () => {
    if (!window.confirm("Are you sure you want to end the active blockchain election? This cannot be undone.")) {
      return;
    }

    try {
      setLoading(true);
      setMessage("Ending blockchain election...");

      const response = await axios.post("http://localhost:5000/api/voting/end-blockchain-election");
      setMessage("✅ " + response.data.message);
      fetchElections();
    } catch (error) {
      console.error("End blockchain election error:", error);
      setMessage("❌ " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const renderPhaseButton = (election) => {
    const buttonStyle = {
      padding: "8px 16px",
      border: "none",
      borderRadius: "4px",
      cursor: loading ? "not-allowed" : "pointer",
      marginTop: "10px",
      fontWeight: "bold",
      opacity: loading ? 0.6 : 1
    };

    switch (election.phase) {
      case "pending":
        return (
          <span style={{
            color: "#6c757d",
            fontStyle: "italic",
            marginTop: "10px",
            display: "block"
          }}>
            ⏳ Waiting for start time ({new Date(election.startTime).toLocaleString()})
          </span>
        );
      case "registration":
        return (
          <button
            onClick={() => handleChangePhase(election._id, "voting")}
            disabled={loading}
            style={{
              ...buttonStyle,
              backgroundColor: "#28a745",
              color: "white"
            }}
          >
            Start Voting Phase
          </button>
        );
      case "voting":
        return (
          <button
            onClick={() => handleChangePhase(election._id, "result")}
            disabled={loading}
            style={{
              ...buttonStyle,
              backgroundColor: "#dc3545",
              color: "white"
            }}
          >
            Start Result Phase
          </button>
        );
      case "result":
        return (
          <button
            onClick={() => handleChangePhase(election._id, "ended")}
            disabled={loading}
            style={{
              ...buttonStyle,
              backgroundColor: "#6c757d",
              color: "white"
            }}
          >
            End Election
          </button>
        );
      case "ended":
        return (
          <span style={{
            color: "#6c757d",
            fontWeight: "bold",
            marginTop: "10px",
            display: "block"
          }}>
            🏁 Election Ended
          </span>
        );
      default:
        return null;
    }
  };

  const getPhaseColor = (phase) => {
    switch (phase) {
      case "pending": return "#6c757d";
      case "registration": return "#17a2b8";
      case "voting": return "#28a745";
      case "result": return "#dc3545";
      case "ended": return "#6c757d";
      default: return "#000";
    }
  };

  return (
    <div style={{ padding: 40 }}>
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

      <h2>Admin Dashboard</h2>

      {/* Blockchain Management Section */}
      <div style={{
        marginBottom: 32,
        padding: 20,
        border: "2px solid #dc3545",
        borderRadius: 8,
        backgroundColor: "#fef2f2"
      }}>
        <h3 style={{ color: "#dc3545", margin: "0 0 15px 0" }}>⚠️ Blockchain Management</h3>
        <p style={{ marginBottom: 15, color: "#666" }}>
          Use these tools to manage blockchain elections
        </p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={handleCheckBlockchainStatus}
            disabled={loading}
            style={{
              padding: "10px 20px",
              backgroundColor: loading ? "#6c757d" : "#17a2b8",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            Check Blockchain Status
          </button>
          <button
            onClick={handleEndBlockchainElection}
            disabled={loading}
            style={{
              padding: "10px 20px",
              backgroundColor: loading ? "#6c757d" : "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            End Blockchain Election
          </button>
        </div>
      </div>

      {/* Create Election Form */}
      <form
        onSubmit={handleCreateElection}
        style={{
          maxWidth: 400,
          marginBottom: 32,
          border: "1px solid #ddd",
          padding: 20,
          borderRadius: 8,
          backgroundColor: "#f8f9fa"
        }}
      >
        <h3>Create New Election</h3>
        <div style={{ marginBottom: 15 }}>
          <label>Title:</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            disabled={loading}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              opacity: loading ? 0.6 : 1
            }}
          />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label>Description:</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            disabled={loading}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              minHeight: "60px",
              opacity: loading ? 0.6 : 1
            }}
          />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label>Phase:</label>
          <select
            name="phase"
            value={form.phase}
            disabled
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          >
            <option value="pending">Pending</option>
          </select>
        </div>
        <div style={{ marginBottom: 15 }}>
          <label>Start Time:</label>
          <input
            type="datetime-local"
            name="startTime"
            value={form.startTime}
            onChange={handleChange}
            required
            disabled={loading}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              opacity: loading ? 0.6 : 1
            }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: loading ? "#6c757d" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Creating..." : "Create Election"}
        </button>
      </form>

      {/* Message Display */}
      {message && (
        <p style={{
          padding: "10px",
          borderRadius: "4px",
          backgroundColor: message.includes("✅") ? "#d4edda" : message.includes("ℹ️") ? "#d1ecf1" : "#f8d7da",
          color: message.includes("✅") ? "#155724" : message.includes("ℹ️") ? "#0c5460" : "#721c24",
          border: `1px solid ${message.includes("✅") ? "#c3e6cb" : message.includes("ℹ️") ? "#bee5eb" : "#f5c6cb"}`,
          marginBottom: 20
        }}>
          {message}
        </p>
      )}

      {/* Elections List */}
      <h3>All Elections</h3>
      {elections.length === 0 ? (
        <p>No elections found.</p>
      ) : (
        elections.map((election) => (
          <div
            key={election._id}
            style={{
              border: "2px solid #ddd",
              padding: 20,
              marginBottom: 16,
              borderRadius: 8,
              backgroundColor: "#f8f9fa"
            }}
          >
            <h4 style={{ margin: "0 0 10px 0" }}>{election.title}</h4>
            <p style={{ margin: "5px 0", color: "#666" }}>{election.description}</p>
            <p style={{ margin: "5px 0" }}>
              Phase: <b style={{ color: getPhaseColor(election.phase) }}>{election.phase.toUpperCase()}</b>
            </p>
            <p style={{ margin: "5px 0", color: "#666" }}>
              Start Time: {new Date(election.startTime).toLocaleString()}
            </p>
            <p style={{ margin: "5px 0", color: "#666" }}>
              Blockchain ID: {election.blockchainElectionId || "Not set"}
            </p>
            {renderPhaseButton(election)}
          </div>
        ))
      )}
    </div>
  );
}