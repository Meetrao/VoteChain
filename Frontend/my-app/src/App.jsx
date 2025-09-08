import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PublicElectionPage from "./Components/PublicElectionPage";
import Login from "./Components/Login";
import Register from "./Components/Register";
import AdminDashboard from "./Components/AdminDashboard";
import CandidateRegister from "./Components/CandidateRegister";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<PublicElectionPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/candidate-register" element={<CandidateRegister />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
