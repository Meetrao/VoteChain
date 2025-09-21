import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../constants.JS";
import { Link } from 'react-router-dom';
import { Clipboard, Wallet, Vote } from 'lucide-react';

// Dynamic data from backend
export function MemberAdminDashboard() {
  const [hoveredRow, setHoveredRow] = useState(null);
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVoters = async () => {
      try {
        const response = await axios.get('/voting/voters');
        setVoters(response.data.voters || response.data || []);
      } catch (err) {
        setError("Failed to fetch voters");
      } finally {
        setLoading(false);
      }
    };
    fetchVoters();
  }, []);

  const sidebarItems = [
    { icon: Clipboard, label: "Dashboard", route: "/admin", active: false },
    { icon: Wallet, label: "Elections", route: "/election", active: false },
    { icon: Vote, label: "Voters", route: "/voters", active: true },
  ];

  return (
    <div className="min-h-screen bg-white/10 text-gray-800">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-green-600 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-4xl font-Bold text-white">VoteChain</span>
        </div>
        <nav className="space-y-2">
          {sidebarItems.map((item, index) => (
            <Link
              to={item.route}
              key={index}
              className={`flex items-center gap-3 px-3 py-3 rounded-full cursor-pointer transition-colors ${item.active ? "bg-green-700 text-white" : "text-green-100 hover:text-white hover:bg-green-700"}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-base">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex h-screen bg-white ml-64">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white px-8 py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-5xl font-bold text-gray-900">Voters List</h1>
            </div>
          </div>
          {/* Content Area */}
          <div className="flex-1 px-8">
            <div className="bg-white shadow-sm rounded-3xl border border-gray-200">
              <div className="p-6">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 pb-4 border-b border-gray-200 text-sm font-medium text-gray-500">
                  <div className="col-span-3">Name</div>
                  <div className="col-span-3">Email</div>
                  <div className="col-span-2">Voter ID</div>
                  <div className="col-span-4 text-right pr-6">Phone</div>
                </div>
                {/* Table Rows */}
                <div className="space-y-0">
                  {loading ? (
                    <div className="py-8 text-center text-gray-500">Loading voters...</div>
                  ) : error ? (
                    <div className="py-8 text-center text-red-500">{error}</div>
                  ) : voters.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">No voters found.</div>
                  ) : (
                    voters.filter(voter => voter.name?.toLowerCase() !== "admin").map((voter) => (
                      <div
                        key={voter._id || voter.id}
                        className="grid grid-cols-12 gap-4 py-4 border-b border-gray-100 last:border-b-0 transition-colors hover:bg-green-50"
                      >
                        <div className="col-span-3 flex items-center gap-3">
                          <div className="font-semibold text-gray-900">{voter.name}</div>
                        </div>
                        <div className="col-span-3">{voter.email}</div>
                        <div className="col-span-2">{voter.voter_id}</div>
                        <div className="col-span-4 text-right pr-6">{voter.phone_number}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemberAdminDashboard;