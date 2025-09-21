import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clipboard, Wallet, Vote } from 'lucide-react';
import axios from 'axios';

import { API_URL } from "../constants.JS";

const Election = ({ getPhaseColor, renderPhaseButton }) => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredRow, setHoveredRow] = useState(null);

  const sidebarItems = [
    { icon: Clipboard, label: "Dashboard", route: "/admin", active: false },
    { icon: Wallet, label: "Elections", route: "/election", active: true }, // Elections page
    { icon: Vote, label: "Voters", route: "/voters" },         // Voters page
    // Add more items as needed
  ];

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await axios.get('/voting/all');
        setElections(res.data?.elections || []);
      } catch (error) {
        setElections([]);
      } finally {
        setLoading(false);
      }
    };
    fetchElections();
  }, []);

  // Show only elections that are ended or result phase
  const history = elections.filter(e => e.phase === "ended" || e.phase === "result");

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
              to={item.route} // Add your route path here, e.g. "/dashboard", "/elections", "/voters"
              key={index}
              className={`flex items-center gap-3 px-3 py-3  rounded-full cursor-pointer transition-colors ${item.active ? "bg-green-700 text-white" : "text-green-100 hover:text-white hover:bg-green-700"
                }`}
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
              <h1 className="text-5xl font-bold text-gray-900">Election History</h1>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 px-8">
            <div className="bg-white shadow-sm rounded-3xl border border-gray-200">
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-gray-500 text-lg">Loading...</p>
                  </div>
                ) : history.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-gray-500 text-lg">No past elections found.</p>
                  </div>
                ) : (
                  <>
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 pb-4 border-b border-gray-200 text-sm font-medium text-gray-500">
                      <div className="col-span-4">Election</div>
                      <div className="col-span-2">Phase</div>
                      <div className="col-span-3">Start Date</div>
                      <div className="col-span-2">Blockchain ID</div>
                      <div className="col-span-1">Action</div>
                    </div>

                    {/* Table Rows */}
                    <div className="space-y-0">
                      {history.map((election) => (
                        <div
                          key={election._id}
                          className="grid grid-cols-12 gap-4 py-4 border-b border-gray-100 last:border-b-0 transition-colors hover:bg-green-50"
                          onMouseEnter={() => setHoveredRow(election._id)}
                          onMouseLeave={() => setHoveredRow(null)}
                        >
                          {/* Election Title & Description */}
                          <div className="col-span-4 flex flex-col">
                            <div className="font-semibold text-gray-900 mb-1">{election.title}</div>
                            <div className="text-sm text-gray-600 line-clamp-2">{election.description}</div>
                          </div>

                          {/* Phase */}
                          <div className="col-span-2 flex items-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${election.phase === "ended" || election.phase === "result"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-gray-100 text-gray-600"
                                } ${getPhaseColor ? getPhaseColor(election.phase) : ""}`}
                            >
                              {election.phase.toUpperCase()}
                            </span>
                          </div>

                          {/* Start Date */}
                          <div className="col-span-3 flex items-center">
                            <span className="text-sm text-gray-700">
                              {new Date(election.startTime).toLocaleString()}
                            </span>
                          </div>

                          {/* Blockchain ID */}
                          <div className="col-span-2 flex items-center">
                            <span className="text-sm text-gray-600 font-mono">
                              {election.blockchainElectionId ?
                                election.blockchainElectionId.length > 12
                                  ? `${election.blockchainElectionId.substring(0, 12)}...`
                                  : election.blockchainElectionId
                                : "Not set"
                              }
                            </span>
                          </div>

                          {/* Action Button */}
                          <div className="col-span-1 flex items-center justify-end">
                            {renderPhaseButton ? renderPhaseButton(election) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Election;