import React from "react";
import { ethers } from "ethers";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FaceCaptureMulti from "./FaceCapture";

export default function Register() {
  const navigate = useNavigate();
  const [faceEmbedding, setFaceEmbedding] = useState(null);
  const [showFace, setShowFace] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null)
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone_number: "",
    voter_id: "",
    userWalletAddress: ""
  });

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("connect the Metamask Wallet");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setForm((prev) => ({ ...prev, userWalletAddress: address }));
    } catch (error) {
      console.error("wallet not connected, error: ", error);
      alert("waller connection failed");
    }
  };

  const handleEmbeddingData = async (embedingData) => {
    setFaceEmbedding(embedingData);
  }

  const handleChange = async (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.userWalletAddress) {
      alert("Connect MetaMask first");
      return;
    }
    if (!faceEmbedding) {
      alert("Please capture your face before submitting");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          face_embedding: faceEmbedding,
        }),
      })
      const data = await res.json();
      setResult(data);

      // Redirect to public page after successful registration
      if (res.ok) {
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      setResult({ ok: false, message: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div style={{ padding: 20 }}>
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
            marginBottom: "20px"
          }}
        >
          ← Back to Home
        </button>
      </div>
      <h2>Register</h2>

      <button onClick={connectWallet}>
        {form.userWalletAddress ? "Wallet Connected" : "Connect MetaMask"}
      </button>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          type="text"
          placeholder="name"
          value={form.name}
          onChange={handleChange}
          required
        /><br />
        <input
          name="email"
          type="email"
          placeholder="email"
          value={form.email}
          onChange={handleChange}
          required
        /><br />
        <input
          name="password"
          type="password"
          placeholder="password"
          value={form.password}
          onChange={handleChange}
          required
        /><br />
        <input
          name="voter_id"
          type="text"
          placeholder="Voter ID"
          value={form.voter_id}
          onChange={handleChange}
          required
        /><br />
        <input
          name="phone_number"
          type="tel"
          placeholder="Phone Number"
          value={form.phone_number}
          onChange={handleChange}
          required
        />

        <div style={{ padding: 40 }}>
          <button type="button" onClick={(e) => { setShowFace(true) }}>
            Capture Face for Registration
          </button>
          {showFace && (
            <FaceCaptureMulti
              frameCount={5}
              interval={400}
              onCaptureComplete={handleEmbeddingData}
            />
          )}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: 20, color: result.ok ? "green" : "red" }}>
          {result.message}
          {result?.data?.txHash && (
            <div>Tx: {result.data.txHash}</div>
          )}
        </div>
      )}

    </>
  );
}