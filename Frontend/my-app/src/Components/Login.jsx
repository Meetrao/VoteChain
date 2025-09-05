import React, { useState } from "react";
import FaceCaptureMulti from "./FaceCapture";

export default function Login() {
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
        res = await fetch("http://localhost:5000/api/auth/login/password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voter_id: form.voter_id, password: form.password }),
          credentials: "include",
        });
      } else if (method === "face") {
        if (!faceEmbedding) {
          setMessage("❌ Please capture your face before logging in.");
          setLoading(false);
          return;
        }
        res = await fetch("http://localhost:5000/api/auth/login/face", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voter_id: form.voter_id, face_embedding: faceEmbedding }),
          credentials: "include",
        });
      } else if (method === "otp-verify") {
        res = await fetch("http://localhost:5000/api/auth/login/otp/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voter_id: form.voter_id, otp: form.otp }),
          credentials: "include",
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      setMessage("✅ " + data.message);
      console.log("Logged in user:", data.user);
    } catch (error) {
      setMessage("❌ " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Request OTP separately
  const handleRequestOTP = async () => {
    try {
      setMessage("Sending OTP...");
      const res = await fetch("http://localhost:5000/api/auth/login/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voter_id: form.voter_id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage("📲 OTP sent to your registered phone");
      setMethod("otp-verify"); // switch to OTP verification step
    } catch (error) {
      setMessage("❌ " + error.message);
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
      <h2>Login</h2>

      {/* Method Switcher */}
      <div style={{ marginBottom: 20 }}>
        <button type="button" onClick={() => setMethod("password")}>Password</button>
        <button type="button" onClick={() => setMethod("face")}>Face</button>
        <button type="button" onClick={() => setMethod("otp")}>OTP</button>
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
