import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios"

const PublicElectionPage = () => {
  const [phase, setPhase] = useState("Loading...");
  const [title, setTitle] = useState("");

  useEffect(() => {
    const fetchElectionPhase = async () => {
      try {
        const res = await axios.get("/voting/getElection");
        setPhase(res.data.election?.phase || "No elections are currently going on");
        setTitle(res.data.election?.title || "");
      } catch (error) {
        if (
          error.response &&
          error.response.status === 404 &&
          error.response.data &&
          error.response.data.message === "No election found"
        ) {
          setPhase("no elections are currently going on");
          setTitle("");
        } else {
          setPhase("Error fetching phase");
          setTitle("");
        }
      }
    };

    fetchElectionPhase();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
        gap: "30px",
        textAlign: "center",
      }}
    >
      <h2>
        {title && (
          <>
            Election Name: <span style={{ color: "#2563eb" }}>{title}</span>
            <br />
          </>
        )}
        Election Phase: <span style={{ color: "#2563eb" }}>{phase}</span>
      </h2>

      <div style={{ display: "flex", gap: "20px" }}>
        <Link to="/login">
          <button style={{ padding: "12px 24px", fontSize: "16px" }}>Login</button>
        </Link>
        <Link to="/register">
          <button style={{ padding: "12px 24px", fontSize: "16px" }}>Register</button>
        </Link>
        {phase === "registration" && (
          <Link to="/CandidateRegister">
            <button style={{ padding: "12px 24px", fontSize: "16px" }}>
              Candidate Registration
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default PublicElectionPage;