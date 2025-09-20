import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PublicElectionPage from "./Components/PublcElectionPage";
import Login from "./Components/Login";
import Register from "./Components/Register";
import AdminDashboard from "./Components/AdminDashboard";
import VotingDashboard from "./Components/VotingDashboard";
import CandidateRegister from "./Components/CandidateRegister";
import Election from "./Components/Election";
import Voters from "./Components/Voters";
import './index.css'

const elections = []; // Define your elections data here
const getPhaseColor = () => {}; // Define your getPhaseColor function here
const renderPhaseButton = () => {}; // Define your renderPhaseButton function here

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<PublicElectionPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/VotingDashboard" element={<VotingDashboard />} />
      <Route path="/CandidateRegister" element={<CandidateRegister />} />
      <Route path="/voters" element={<Voters />} />
      <Route path="/election" element={
        <Election
          elections={elections}
          getPhaseColor={getPhaseColor}
          renderPhaseButton={renderPhaseButton}
        />
      } /> {/* ✅ Individual Route */}
    </Routes>
  </Router>
);

export default App;