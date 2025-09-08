import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CandidateRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    party: "",
    slogan: "",
    candidateWalletAddress: ""
  });
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setLogo(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.party || !formData.slogan || !formData.candidateWalletAddress || !logo) {
      setMessage("❌ Please fill all fields and upload a logo");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("party", formData.party);
      formDataToSend.append("slogan", formData.slogan);
      formDataToSend.append("candidateWalletAddress", formData.candidateWalletAddress);
      formDataToSend.append("logo", logo);

      const response = await fetch("http://localhost:5000/api/candidate/register", {
        method: "POST",
        body: formDataToSend,
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ " + data.message);
        // Reset form
        setFormData({
          name: "",
          party: "",
          slogan: "",
          candidateWalletAddress: ""
        });
        setLogo(null);
        // Redirect to public page after 2 seconds
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        setMessage("❌ " + (data.message || "Registration failed"));
      }
    } catch (error) {
      setMessage("❌ Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <button
          onClick={() => navigate("/")}
          style={backButtonStyle}
        >
          ← Back to Election Page
        </button>

        <h1 style={titleStyle}>📝 Candidate Registration</h1>

        <div style={infoBoxStyle}>
          <h3>📋 Registration Requirements:</h3>
          <ul style={{ textAlign: "left", margin: "10px 0" }}>
            <li>Valid wallet address for blockchain registration</li>
            <li>Profile photo/logo (JPG, PNG format)</li>
            <li>Party affiliation and campaign slogan</li>
            <li>Registration only allowed during registration phase</li>
          </ul>
        </div>

        {message && (
          <div style={{
            ...messageStyle,
            backgroundColor: message.includes("✅") ? "#d4edda" : "#f8d7da",
            color: message.includes("✅") ? "#155724" : "#721c24",
            border: `1px solid ${message.includes("✅") ? "#c3e6cb" : "#f5c6cb"}`
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              style={inputStyle}
              required
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Party Affiliation *</label>
            <input
              type="text"
              name="party"
              value={formData.party}
              onChange={handleInputChange}
              placeholder="e.g., Democratic Party, Independent, etc."
              style={inputStyle}
              required
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Campaign Slogan *</label>
            <input
              type="text"
              name="slogan"
              value={formData.slogan}
              onChange={handleInputChange}
              placeholder="Enter your campaign slogan"
              style={inputStyle}
              required
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Wallet Address *</label>
            <input
              type="text"
              name="candidateWalletAddress"
              value={formData.candidateWalletAddress}
              onChange={handleInputChange}
              placeholder="0x..."
              style={inputStyle}
              required
            />
            <small style={{ color: "#6b7280", fontSize: "12px" }}>
              Your Ethereum wallet address for blockchain registration
            </small>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Profile Logo/Photo *</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={fileInputStyle}
              required
            />
            <small style={{ color: "#6b7280", fontSize: "12px" }}>
              Upload a clear photo or logo (JPG, PNG format)
            </small>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...submitButtonStyle,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Registering..." : "Register as Candidate"}
          </button>
        </form>

        <div style={footerStyle}>
          <p style={{ fontSize: "12px", color: "#6b7280" }}>
            🔒 Your registration will be recorded on the blockchain for transparency
          </p>
        </div>
      </div>
    </div>
  );
};

// Styles
const containerStyle = {
  minHeight: "100vh",
  backgroundColor: "#f3f4f6",
  padding: "20px",
  fontFamily: "Arial, sans-serif",
};

const cardStyle = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "white",
  borderRadius: "12px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  padding: "30px",
};

const backButtonStyle = {
  padding: "8px 16px",
  backgroundColor: "#6b7280",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  marginBottom: "20px",
  fontSize: "14px",
};

const titleStyle = {
  textAlign: "center",
  margin: "0 0 30px 0",
  color: "#1f2937",
  fontSize: "28px",
};

const infoBoxStyle = {
  backgroundColor: "#eff6ff",
  border: "1px solid #bfdbfe",
  borderRadius: "8px",
  padding: "15px",
  marginBottom: "25px",
};

const messageStyle = {
  padding: "10px",
  borderRadius: "5px",
  marginBottom: "20px",
  textAlign: "center",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const fieldStyle = {
  display: "flex",
  flexDirection: "column",
};

const labelStyle = {
  fontWeight: "600",
  marginBottom: "5px",
  color: "#374151",
};

const inputStyle = {
  padding: "12px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "16px",
  transition: "border-color 0.2s",
};

const fileInputStyle = {
  padding: "8px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "14px",
  backgroundColor: "#f9fafb",
};

const submitButtonStyle = {
  padding: "15px",
  backgroundColor: "#3b82f6",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "16px",
  fontWeight: "600",
  marginTop: "10px",
};

const footerStyle = {
  textAlign: "center",
  marginTop: "20px",
  paddingTop: "20px",
  borderTop: "1px solid #e5e7eb",
};

export default CandidateRegister;
