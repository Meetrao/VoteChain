import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FaceCaptureMulti from "./FaceCapture";
import axios from "axios";
import { ADMIN_WALLET } from "../constants.JS";

// Optionally set baseURL globally
axios.defaults.baseURL = "/api";
axios.defaults.withCredentials = true;

export default function Login() {
  const navigate = useNavigate();
  const [method, setMethod] = useState("password"); // password | face | otp | otp-verify
  const [form, setForm] = useState({
    voter_id: "",
    password: "",
    otp: "",
  });
  const [faceEmbedding, setFaceEmbedding] = useState(null);
  const [showFace, setShowFace] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Update form values
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      let res;

      if (method === "password") {
        res = await axios.post("/auth/login/password", {
          voter_id: form.voter_id,
          password: form.password,
        });
      }
      else if (method === "face") {
        if (!faceEmbedding) {
          setMessage("❌ Please capture your face before logging in.");
          setLoading(false);
          return;
        }
        res = await axios.post("/auth/login/face", {
          voter_id: form.voter_id,
          face_embedding: faceEmbedding, // Correct key for backend
        });
      }
      else if (method === "otp-verify") {
        res = await axios.post("/auth/login/otp/verify", {
          voter_id: form.voter_id,
          otp: form.otp,
        });
      }

      const data = res.data;

      setMessage("✅ " + data.message);
      console.log("Logged in user:", data.user);

      localStorage.setItem("currentUser", JSON.stringify(data.user));

      // Check if user is admin and redirect accordingly
      console.log(data.user.userWalletAddress)
      console.log(ADMIN_WALLET)
      const isAdmin =
        data.user.userWalletAddress?.toLowerCase() === ADMIN_WALLET?.toLowerCase();

      setTimeout(() => {
        if (isAdmin) {
          navigate("/admin");
        } else {
          navigate("/VotingDashboard");
        }
      }, 1500);
    } catch (error) {
      setMessage("❌ " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Request OTP separately
  const handleRequestOTP = async () => {
    try {
      setMessage("Sending OTP...");
      const res = await axios.post("/auth/login/otp/request", {
        voter_id: form.voter_id,
      });
      setMessage("📲 OTP sent to your registered phone");
      setMethod("otp-verify"); // switch to OTP verification step
    } catch (error) {
      setMessage("❌ " + (error.response?.data?.message || error.message));
    }
  };

  // Face embedding callback
  const handleFaceCaptured = (embedding) => {
    setFaceEmbedding(embedding);
    setShowFace(false);
    setMessage("✅ Face captured, ready to login");
  };

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => navigate("/")}
          style={{
            padding: "8px 16px",
            backgroundColor: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          ← Back to Home
        </button>
      </div>
      <h2>Login</h2>

      {/* Method Switcher */}
      <div style={{ marginBottom: 20 }}>
        <button type="button" onClick={() => setMethod("password")}>
          Password
        </button>
        <button type="button" onClick={() => setMethod("face")}>
          Face
        </button>
        <button type="button" onClick={() => setMethod("otp")}>
          OTP
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Always ask for Voter ID */}
        <div>
          <input
            type="text"
            name="voter_id"
            placeholder="Voter ID"
            value={form.voter_id}
            onChange={handleChange}
            required
          />
        </div>

        {method === "password" && (
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
        )}

        {method === "face" && (
          <div>
            <button type="button" onClick={() => setShowFace(true)}>
              {faceEmbedding ? "Face Captured ✅" : "Capture Face"}
            </button>
            {showFace && (
              <FaceCaptureMulti
                frameCount={5}
                interval={400}
                onCaptureComplete={handleFaceCaptured}
              />
            )}
          </div>
        )}

        {method === "otp" && (
          <div>
            <button type="button" onClick={handleRequestOTP}>
              Request OTP
            </button>
          </div>
        )}

        {method === "otp-verify" && (
          <div>
            <input
              type="text"
              name="otp"
              placeholder="Enter OTP"
              value={form.otp}
              onChange={handleChange}
              required
            />
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
