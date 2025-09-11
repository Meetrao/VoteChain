import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PublicElectionPage from "./Components/PublcElectionPage";
import Login from "./Components/Login";
import Register from "./Components/Register";
import AdminDashboard from "./Components/AdminDashboard";
import VotingDashboard from "./Components/VotingDashboard";
import CandidateRegister from "./Components/CandidateRegister";

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<PublicElectionPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/VotingDashboard" element={<VotingDashboard />} />
      <Route path="/CandidateRegister" element={<CandidateRegister />} />
    </Routes>
  </Router>
);

export default App;
