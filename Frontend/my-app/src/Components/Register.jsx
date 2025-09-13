import React from "react";
import { ethers } from "ethers";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FaceCaptureMulti from "./FaceCapture";
import axios from "axios";
import { ADMIN_WALLET } from "../constants";

export default function Register() {
  const navigate = useNavigate();
  const [faceEmbedding, setFaceEmbedding] = useState(null);
  const [showFace, setShowFace] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone_number: "",
    voter_id: "",
    userWalletAddress: "",
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
      alert("wallet connection failed");
    }
  };

  const handleEmbeddingData = async (embedingData) => {
    setFaceEmbedding(embedingData);
  };

  const handleChange = async (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        ...form,
        face_embedding: faceEmbedding,
      });
      setResult(res.data);

      // Redirect to Voting Dashboard on success (2xx/201)
      if (res.status >= 200 && res.status < 300) {
        setTimeout(() => {
          navigate("/VotingDashboard");
        }, 1000);
      }
    } catch (error) {
      setResult({
        ok: false,
        message: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex">
      {/* Left side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-white items-center justify-center p-12">
        <div className="max-w-full text-center">
          <img
            src="https://i.pinimg.com/1200x/ac/9c/81/ac9c81e8f02498c42e37c3f480e659b9.jpg"
            alt="Register Illustration"
            className="rounded-3xl"
          />
        </div>
      </div>

      {/* Right side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Back button */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              ← Back to Home
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-black/10 p-8 shadow-xl">
            <div className="text-center mb-6">
              <h2 className="text-4xl font-normal font-montserrat text-black mb-2">
                Register
              </h2>
              <p className="text-sm text-gray-600 font-montserrat">
                Create your blockchain voting account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Connect wallet */}
              <div>
                <button
                  type="button"
                  onClick={connectWallet}
                  className="w-full py-3 rounded-full bg-black hover:bg-gray-900 text-white font-medium transition-colors"
                >
                  {form.userWalletAddress ? "Wallet Connected" : "Connect MetaMask"}
                </button>
              </div>

              <div>
                <input
                  name="name"
                  type="text"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 focus:border-[#8B5CF6] focus:ring-0 focus:outline-none px-3 py-2 rounded-full"
                />
              </div>

              <div>
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 focus:border-[#8B5CF6] focus:ring-0 focus:outline-none px-3 py-2 rounded-full"
                />
              </div>

              <div>
                <input
                  name="phone_number"
                  type="tel"
                  placeholder="Phone Number"
                  value={form.phone_number}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 focus:border-[#8B5CF6] focus:ring-0 focus:outline-none px-3 py-2 rounded-full"
                />
              </div>

              <div>
                <input
                  name="voter_id"
                  type="text"
                  placeholder="Voter ID"
                  value={form.voter_id}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 focus:border-[#8B5CF6] focus:ring-0 focus:outline-none px-3 py-2 rounded-full"
                />
              </div>

              <div>
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 focus:border-[#8B5CF6] focus:ring-0 focus:outline-none px-3 py-2 rounded-full"
                />
              </div>

              <div>
                <input
                  name="userWalletAddress"
                  type="text"
                  placeholder="Wallet Address"
                  value={form.userWalletAddress}
                  readOnly
                  className="w-full border border-gray-300 bg-gray-50 px-3 py-2 rounded-md text-sm"
                />
              </div>

              {/* Face capture */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowFace(true)}
                  className="w-full bg-black hover:bg-gray-900 text-white py-3 rounded-full font-medium transition-colors mb-4"
                >
                  {faceEmbedding ? "✓ Face Captured" : "Capture Face for Registration"}
                </button>

                {showFace && (
                  <div className="border border-gray-300 rounded-3xl p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-2">Face capture component</p>
                    <FaceCaptureMulti
                      frameCount={5}
                      interval={400}
                      onCaptureComplete={handleEmbeddingData}
                    />
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black hover:bg-gray-900 disabled:bg-gray-400 text-white py-3 rounded-full font-medium transition-colors"
              >
                {loading ? "Registering..." : "Register"}
              </button>

              {result && (
                <div
                  className={`mt-3 text-center text-sm p-3 rounded-2xl border ${result.ok
                    ? "bg-green-100 text-green-700 border-green-200"
                    : "bg-red-100 text-green-700 border-red-200"
                    }`}
                >
                  {result.message}
                  {result?.data?.txHash && <div className="mt-1">Tx: {result.data.txHash}</div>}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}