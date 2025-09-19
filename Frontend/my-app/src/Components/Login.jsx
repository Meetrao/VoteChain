import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FaceCaptureMulti from "./FaceCapture";
import axios from "axios";
import { ADMIN_WALLET } from "../constants.JS";
import { Loader2, User, Lock, Smartphone, Camera } from "lucide-react";

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
      } else if (method === "face") {
        if (!faceEmbedding) {
          setMessage("❌ Please capture your face before logging in.");
          setLoading(false);
          return;
        }
        res = await axios.post("/auth/login/face", {
          voter_id: form.voter_id,
          face_embedding: faceEmbedding,
        });
      } else if (method === "otp-verify") {
        res = await axios.post("/auth/login/otp/verify", {
          voter_id: form.voter_id,
          otp: form.otp,
        });
      }

      const data = res.data;

      setMessage("✅ " + (data.message || "Login successful. You are whitelisted and logged in successfully."));
      localStorage.setItem("currentUser", JSON.stringify(data.user));

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
      if (error.response?.status === 403) {
        setMessage("❌ You are not whitelisted. Registration automatically whitelists you—please register first or contact support.");
      } else {
        setMessage("❌ " + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOTP = async () => {
    if (!form.voter_id?.trim()) {
      setMessage("❌ Enter your Voter ID before requesting OTP");
      return;
    }
    try {
      setMessage("Sending OTP...");
      await axios.post("/auth/login/otp/request", {
        voter_id: form.voter_id,
      });
      setMessage("📲 OTP sent to your registered phone");
      setMethod("otp-verify");
    } catch (error) {
      setMessage("❌ " + (error.response?.data?.message || error.message));
    }
  };

  const handleFaceCaptured = (embedding) => {
    setFaceEmbedding(embedding);
    setShowFace(false);
    setMessage("✅ Face captured, ready to login");
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-white items-center justify-center p-12">
        <div className="max-w-full text-center">
          <img
            src="https://i.postimg.cc/Th8nYtZr/image-Photoroom.png"
            alt="Illustration"
            className="rounded-3xl"
          />
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-3xl border border-black/10">
          <div className="p-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              ← Back to Home
            </button>
          </div>

          <div className="px-6 text-center">
            <h2 className="text-5xl font-normal font-montserrat text-black mb-2">
              Voter Login
            </h2>
            <p className="text-sm text-black/60 font-montserrat mt-1">
              Choose your preferred authentication method
            </p>
          </div>

          <div className="p-6">
            {/* Method Tabs */}
            <div className="grid grid-cols-3 bg-gray-100 rounded-3xl p-2">
              <button
                onClick={() => setMethod("password")}
                className={`flex items-center justify-center gap-1 px-3 py-2 text-base font-normal rounded-full transition-colors ${method === "password" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                <Lock className="h-4 w-4" />
                Password
              </button>
              <button
                onClick={() => setMethod("face")}
                className={`flex items-center justify-center gap-1 px-3 py-2 text-base font-normal rounded-full transition-colors ${method === "face" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                <Camera className="h-4 w-4" />
                Face
              </button>
              <button
                onClick={() => setMethod("otp")}
                className={`flex items-center justify-center gap-1 px-3 py-2 text-base font-normal rounded-full transition-colors ${method === "otp" || method === "otp-verify"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                <Smartphone className="h-4 w-4" />
                OTP
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              {/* Voter ID */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Voter ID</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="voter_id"
                    placeholder="Enter your Voter ID"
                    value={form.voter_id}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-500/30 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Password Method */}
              {method === "password" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium font-montserrat text-gray-700">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-500/30 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Face Method */}
              {method === "face" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Face Recognition</label>
                  <button
                    type="button"
                    onClick={() => setShowFace(true)}
                    className={`w-full px-4 py-2 text-sm font-medium font-montserrat rounded-full border transition-colors ${faceEmbedding
                      ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                  >
                    {faceEmbedding ? "Face Captured ✅" : "Capture Face"}
                  </button>
                  {showFace && (
                    <div className="mt-3">
                      <FaceCaptureMulti
                        frameCount={5}
                        interval={400}
                        onCaptureComplete={handleFaceCaptured}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* OTP Request */}
              {method === "otp" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium font-montserrat text-gray-700">One-Time Password</label>
                  <button
                    type="button"
                    onClick={handleRequestOTP}
                    className="w-full px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    Request OTP
                  </button>
                </div>
              )}

              {/* OTP Verify */}
              {method === "otp-verify" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium font-montserrat text-gray-700">Enter OTP</label>
                  <input
                    type="text"
                    name="otp"
                    placeholder="Enter 6-digit OTP"
                    value={form.otp}
                    onChange={handleChange}
                    maxLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-4 bg-black text-white font-montserrat font-medium rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-gray-900 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            {message && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-full">
                <p className="text-sm text-blue-800">{message}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}