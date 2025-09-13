import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  FileText,
  CreditCard,
  Users,
  Settings,
  Wrench,
  Shield,
  Search,
  Bell,
  TrendingUp,
  TrendingDown,
  LogOut,
  Vote,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

axios.defaults.withCredentials = true;

export default function AdminDashboard() {
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    title: "Election",
    description: "Election Description",
    phase: "pending",
    startTime: "",
  });
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, voterCount: 0 }); // ← add

  const API = "http://localhost:5000/api";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Backend integration: create election
  const handleCreateElection = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("Creating election...");
    try {
      const response = await axios.post(`${API}/voting/create`, {
        title: form.title,
        description: form.description,
        startTime: form.startTime,
      });
      setMessage(response.data?.message || "✅ Election created in pending phase!");
      setForm({
        title: "Election",
        description: "Election Description",
        phase: "pending",
        startTime: "",
      });
      await fetchElections();
    } catch (error) {
      console.error("Create election error:", error);
      setMessage("❌ " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Backend integration: fetch elections
  const fetchElections = async () => {
    try {
      const res = await axios.get(`${API}/voting/all`);
      setElections(res.data?.elections || []);
    } catch (error) {
      console.error("Error fetching elections:", error);
      setElections([]);
    }
  };

  const fetchUserStats = async () => { // ← add
    try {
      const res = await axios.get(`${API}/auth/user-stats`);
      setStats(res.data || { totalUsers: 0, voterCount: 0 });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      setStats({ totalUsers: 0, voterCount: 0 });
    }
  };

  // Backend integration: change phase
  const handleChangePhase = async (id, nextPhase) => {
    try {
      setLoading(true);
      setMessage(`Updating election to ${nextPhase}...`);
      let endpoint = null;
      if (nextPhase === "voting") {
        endpoint = `${API}/voting/start-voting`; // startVotingPhase
      } else if (nextPhase === "result") {
        endpoint = `${API}/voting/start-result`; // startResultPhase
      } else if (nextPhase === "ended") {
        endpoint = `${API}/voting/end-election`; // endElection (also ends on-chain if available)
      } else {
        throw new Error(`Unknown phase: ${nextPhase}`);
      }
      const response = await axios.post(endpoint);
      setMessage(response.data?.message ? `✅ ${response.data.message}` : "✅ Election updated");
      await fetchElections();
    } catch (error) {
      console.error("Phase change error:", error);
      setMessage("❌ " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Backend integration: logout
  const handleLogout = async () => {
    try {
      await axios.post(`${API}/auth/logout`);
    } catch (_) {
      // ignore
    } finally {
      localStorage.removeItem("currentUser");
      window.location.href = "/";
    }
  };

  // Backend integration: check blockchain status
  const handleCheckBlockchainStatus = async () => {
    try {
      setLoading(true);
      setMessage("Checking blockchain status...");
      const response = await axios.get(`${API}/voting/blockchain-status`);
      setMessage("ℹ️ " + (response.data?.message || "Blockchain status fetched"));
    } catch (error) {
      console.error("Check blockchain status error:", error);
      setMessage("❌ " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Backend integration: end blockchain election
  const handleEndBlockchainElection = async () => {
    if (!window.confirm("Are you sure you want to end the active blockchain election? This cannot be undone.")) {
      return;
    }
    try {
      setLoading(true);
      setMessage("Ending blockchain election...");
      const response = await axios.post(`${API}/voting/end-blockchain-election`);
      setMessage("✅ " + (response.data?.message || "Blockchain election ended"));
      await fetchElections();
    } catch (error) {
      console.error("End blockchain election error:", error);
      setMessage("❌ " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
    fetchUserStats(); // ← add
  }, []);

  // Static chart demo data (visual only)
  const electionData = [
    { month: "Jan", pending: 4, active: 2, completed: 8 },
    { month: "Feb", pending: 3, active: 5, completed: 6 },
    { month: "Mar", pending: 2, active: 3, completed: 12 },
    { month: "Apr", pending: 5, active: 4, completed: 9 },
    { month: "May", pending: 1, active: 6, completed: 15 },
    { month: "Jun", pending: 3, active: 2, completed: 11 },
  ];

  const phaseData = [
    { name: "Pending", value: 35, color: "#6366f1" },
    { name: "Registration", value: 25, color: "#06b6d4" },
    { name: "Voting", value: 20, color: "#10b981" },
    { name: "Results", value: 15, color: "#f59e0b" },
    { name: "Ended", value: 5, color: "#6b7280" },
  ];

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: Wallet, label: "Elections" },
    { icon: Receipt, label: "Transactions" },
    { icon: FileText, label: "Reports" },
    { icon: CreditCard, label: "Blockchain" },
    { icon: Users, label: "Users" },
    { icon: Settings, label: "Settings" },
    { icon: Wrench, label: "Utilities" },
    { icon: Shield, label: "Authentication" },
  ];

  const renderPhaseButton = (election) => {
    switch (election.phase) {
      case "pending":
        return (
          <span className="bg-gray-500/20 text-gray-400 px-3 py-1 rounded-full text-sm">
            ⏳ Waiting for start time
          </span>
        );
      case "registration":
        return (
          <button
            onClick={() => handleChangePhase(election._id, "voting")}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition-colors disabled:opacity-50"
          >
            Start Voting Phase
          </button>
        );
      case "voting":
        return (
          <button
            onClick={() => handleChangePhase(election._id, "result")}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition-colors disabled:opacity-50"
          >
            Start Result Phase
          </button>
        );
      case "result":
        return (
          <button
            onClick={() => handleChangePhase(election._id, "ended")}
            disabled={loading}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm transition-colors disabled:opacity-50"
          >
            End Election
          </button>
        );
      case "ended":
        return (
          <span className="bg-gray-500/20 text-gray-400 px-3 py-1 rounded-full text-sm">🏁 Election Ended</span>
        );
      default:
        return null;
    }
  };

  const getPhaseColor = (phase) => {
    switch (phase) {
      case "pending":
        return "text-gray-400";
      case "registration":
        return "text-cyan-400";
      case "voting":
        return "text-green-400";
      case "result":
        return "text-red-400";
      case "ended":
        return "text-gray-400";
      default:
        return "text-white";
    }
  };

  return (
    <div className="min-h-screen bg-black/90 text-white">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-black/50 p-6">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-2xl font-montserrat font-thin">ElectionFarm</span>
        </div>

        <nav className="space-y-2">
          {sidebarItems.map((item, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 px-3 py-2 rounded-full cursor-pointer transition-colors ${item.active ? "bg-white/10 text-white " : "text-white/20 hover:text-white hover:bg-slate-800"
                }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Top Header */}
        <header className="bg-black/50 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-5xl font-montserrat font-normal">Dashboard</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-4 h-4" />
                <input
                  placeholder="Search here ..."
                  className="pl-10 w-96 bg-white/10 text-white placeholder:text-white font-montserrat rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>

              <button className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
                <Bell className="w-5 h-5" />
              </button>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>

              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white text-xs font-thin">
                AD
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Main Dashboard Content */}
          <div className="flex-1 p-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-4xl font-montserrat font-light mb-2">Admin </h2>
              <p className="text-gray-400 font-montserrat">This is what's happening in your election system this month.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/10 rounded-3xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-montserrat">Total Elections</p>
                    <p className="text-3xl font-bold">{elections.length}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-sm font-montserrat">+12%</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center translate-x-4 -translate-y-11">
                    <Vote className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white/10 rounded-3xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-montserrat">Active Elections</p>
                    <p className="text-3xl font-bold">
                      {elections.filter((e) => e.phase === "voting").length}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-sm font-montserrat">+8%</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center -translate-y-11 translate-x-4">
                    <Users className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white/10 rounded-3xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-montserrat">Total Voters</p>
                    <p className="text-3xl font-bold font-montserrat">{stats.voterCount}</p> {/* ← updated */}
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingDown className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 text-sm font-montserrat">-3%</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center -translate-y-9 translate-x-4">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white/10 rounded-3xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-montserrat mb-4">Blockchain Status</p>
                    <p className="text-2xl font-bold text-green-400 font-montserrat">Online</p>
                    <div className="flex items-center gap-1 ">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-green-400 text-sm font-montserrat">Running</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-orange-600/20 rounded-full flex items-center justify-center -translate-y-12 translate-x-4">
                    <Shield className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Election History Chart */}
              <div className="bg-white/10 rounded-3xl">
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-2xl font-normal text-white font-montserrat mb-4">Election History</h3>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-400">Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-400 rounded-full border "></div>
                      <span className="text-gray-400">Active</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={electionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="completed" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="active" fill="#60A5FA" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Election Phases Chart */}
              <div className="bg-white/10 rounded-3xl">
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-2xl font-normal font-montserrat text-white">Elections by Phase</h3>
                </div>
                <div className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={phaseData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {phaseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "10px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {phaseData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm text-gray-400 font-montserrat">{item.name}</span>
                        <span className="text-sm text-white ml-auto">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Message Display */}
            {message && (
              <div
                className={`mb-6 bg-white/10 rounded-3xl p-4 ${message.includes("✅")
                    ? "bg-green-900/20 border-green-800"
                    : message.includes("ℹ")
                      ? "bg-blue-900/20 border-blue-800"
                      : "bg-red-900/20 border-red-800"
                  }`}
              >
                <p
                  className={`${message.includes("✅") ? "text-green-400" : message.includes("ℹ") ? "text-blue-400" : "text-red-400"
                    }`}
                >
                  {message}
                </p>
              </div>
            )}

            {/* Elections List */}
            <div className="bg-white/10 rounded-3xl mb-8">
              <div className="p-6 ">
                <h3 className="text-4xl font-thin font-montserrat text-white">All Elections</h3>
              </div>
              <div className="p-3">
                {elections.length === 0 ? (
                  <p className="text-gray-400">No elections found.</p>
                ) : (
                  <div className="space-y-4">
                    {elections.map((election) => (
                      <div key={election._id} className="bg-white/10 rounded-3xl p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-normal font-montserrat text-white mb-2">{election.title}</h4>
                            <p className="text-gray-400 mb-3">{election.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-400">
                                Phase:{" "}
                                <span className={`font-semibold ${getPhaseColor(election.phase)}`}>
                                  {election.phase.toUpperCase()}
                                </span>
                              </span>
                              <span className="text-gray-400">
                                Start: {new Date(election.startTime).toLocaleString()}
                              </span>
                              <span className="text-gray-400">
                                Blockchain ID: {election.blockchainElectionId || "Not set"}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">{renderPhaseButton(election)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-80 p-8 space-y-6">
            {/* User Profile Card */}
            <div className="bg-white/10 rounded-3xl p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-black/10 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                AD
              </div>
              <h3 className="text-xl font-light font-montserrat text-white">Admin User</h3>
              <p className="text-blue-400 text-sm">admin@electionfarm.com</p>
            </div>

            {/* System Status */}
            <div className="bg-white/10 rounded-3xl">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-montserrat font-normal text-white">System Status</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-montserrat">Elections</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-white font-semibold">{elections.length}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-montserrat">Active Votes</span>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <span className="text-white font-semibold">1,247</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/10 rounded-3xl">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-normal font-montserrat text-white">Quick Actions</h3>
              </div>
              <div className="p-6 space-y-3">
                <button
                  onClick={handleCheckBlockchainStatus}
                  disabled={loading}
                  className="w-full bg-white/10 font-montserrat text-white px-4 py-2 rounded-full flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Shield className="w-4 h-4" />
                  Check Blockchain
                </button>
                <button
                  onClick={handleEndBlockchainElection}
                  disabled={loading}
                  className="w-full bg-red-600 font-montserrat text-white px-4 py-2 rounded-full flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Settings className="w-4 h-4" />
                  End Election
                </button>
              </div>
            </div>

            {/* Create Election Form (duplicate in sidebar for quick access) */}
            <div className="bg-white/10 rounded-3xl">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-montserrat font-normal text-white">Create New Election</h3>
              </div>
              <div className="p-6">
                <form onSubmit={handleCreateElection} className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block font-montserrat">Title</label>
                    <input
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="w-full bg-white/10 text-white rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block font-montserrat">Description</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="w-full bg-white/10 text-white rounded-2xl px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Start Time</label>
                    <input
                      type="datetime-local"
                      name="startTime"
                      value={form.startTime}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="w-full bg-white/10 rounded-3xl text-white  px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white/10 rounded-3xl text-white px-4 py-2 font-montserrat transition-colors disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Create Election"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}