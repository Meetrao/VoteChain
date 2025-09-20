import { useState, useEffect } from "react"
import axios from "axios"
import {
  Clipboard,
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
} from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { Link } from "react-router-dom"

axios.defaults.withCredentials = true

export default function AdminDashboard() {
  const [message, setMessage] = useState("")
  const [form, setForm] = useState({
    title: "Election",
    description: "Election Description",
    phase: "pending",
    startTime: "",
  })
  const [elections, setElections] = useState([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ totalUsers: 0, voterCount: 0 })

  const API = "http://localhost:5000/api"

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Backend integration: create election
  const handleCreateElection = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("Creating election...")
    try {
      const response = await axios.post(`${API}/voting/create`, {
        title: form.title,
        description: form.description,
        startTime: form.startTime,
      })
      setMessage(response.data?.message || "✅ Election created in pending phase!")
      setForm({
        title: "Election",
        description: "Election Description",
        phase: "pending",
        startTime: "",
      })
      await fetchElections()
    } catch (error) {
      console.error("Create election error:", error)
      setMessage("❌ " + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  // Backend integration: fetch elections
  const fetchElections = async () => {
    try {
      const res = await axios.get(`${API}/voting/all`)
      setElections(res.data?.elections || [])
    } catch (error) {
      console.error("Error fetching elections:", error)
      setElections([])
    }
  }

  const fetchUserStats = async () => {
    try {
      const res = await axios.get(`${API}/auth/user-stats`)
      setStats(res.data || { totalUsers: 0, voterCount: 0 })
    } catch (error) {
      console.error("Error fetching user stats:", error)
      setStats({ totalUsers: 0, voterCount: 0 })
    }
  }

  // Backend integration: change phase
  const handleChangePhase = async (id, nextPhase) => {
    try {
      setLoading(true)
      setMessage(`Updating election to ${nextPhase}...`)
      let endpoint = null
      if (nextPhase === "voting") {
        endpoint = `${API}/voting/start-voting`
      } else if (nextPhase === "result") {
        endpoint = `${API}/voting/start-result`
      } else if (nextPhase === "ended") {
        endpoint = `${API}/voting/end-election`
      } else {
        throw new Error(`Unknown phase: ${nextPhase}`)
      }
      const response = await axios.post(endpoint)
      setMessage(response.data?.message ? `✅ ${response.data.message}` : "✅ Election updated")
      await fetchElections()
    } catch (error) {
      console.error("Phase change error:", error)
      setMessage("❌ " + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  // Backend integration: logout
  const handleLogout = async () => {
    try {
      await axios.post(`${API}/auth/logout`)
    } catch (_) {
      // ignore
    } finally {
      localStorage.removeItem("currentUser")
      window.location.href = "/"
    }
  }

  // Backend integration: check blockchain status
  const handleCheckBlockchainStatus = async () => {
    try {
      setLoading(true)
      setMessage("Checking blockchain status...")
      const response = await axios.get(`${API}/voting/blockchain-status`)
      setMessage("ℹ️ " + (response.data?.message || "Blockchain status fetched"))
    } catch (error) {
      console.error("Check blockchain status error:", error)
      setMessage("❌ " + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  // Backend integration: end blockchain election
  const handleEndBlockchainElection = async () => {
    if (!window.confirm("Are you sure you want to end the active blockchain election? This cannot be undone.")) {
      return
    }
    try {
      setLoading(true)
      setMessage("Ending blockchain election...")
      const response = await axios.post(`${API}/voting/end-blockchain-election`)
      setMessage("✅ " + (response.data?.message || "Blockchain election ended"))
      await fetchElections()
    } catch (error) {
      console.error("End blockchain election error:", error)
      setMessage("❌ " + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchElections()
    fetchUserStats()
  }, [])

  // Static chart demo data (visual only)
  const electionData = [
    { month: "Jan", pending: 4, active: 2, completed: 8 },
    { month: "Feb", pending: 3, active: 5, completed: 6 },
    { month: "Mar", pending: 2, active: 3, completed: 12 },
    { month: "Apr", pending: 5, active: 4, completed: 9 },
    { month: "May", pending: 1, active: 6, completed: 15 },
    { month: "Jun", pending: 3, active: 2, completed: 11 },
  ]

  const phaseData = [
    { name: "Pending", value: 35, color: "#25D366" },
    { name: "Registration", value: 25, color: "#128C7E" },
    { name: "Voting", value: 20, color: "#075E54" },
    { name: "Results", value: 15, color: "#34B7F1" },
    { name: "Ended", value: 5, color: "#9CA3AF" },
  ]

  const sidebarItems = [
    { icon: Clipboard, label: "Dashboard", route: "/admin", active: true },
    { icon: Wallet, label: "Elections", route: "/election" }, // Elections page
    { icon: Vote, label: "Voters", route: "/voters" },         // Voters page
    // Add more items as needed
  ]

  const renderPhaseButton = (election) => {
    switch (election.phase) {
      case "pending":
        return (
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">⏳ Waiting for start time</span>
        )
      case "registration":
        return (
          <button
            onClick={() => handleChangePhase(election._id, "voting")}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition-colors disabled:opacity-50"
          >
            Start Voting Phase
          </button>
        )
      case "voting":
        return (
          <button
            onClick={() => handleChangePhase(election._id, "result")}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm transition-colors disabled:opacity-50"
          >
            Start Result Phase
          </button>
        )
      case "result":
        return (
          <button
            onClick={() => handleChangePhase(election._id, "ended")}
            disabled={loading}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm transition-colors disabled:opacity-50"
          >
            End Election
          </button>
        )
      case "ended":
        return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">🏁 Election Ended</span>
      default:
        return null
    }
  }

  const getPhaseColor = (phase) => {
    switch (phase) {
      case "pending":
        return "text-gray-500"
      case "registration":
        return "text-blue-500"
      case "voting":
        return "text-green-600"
      case "result":
        return "text-orange-500"
      case "ended":
        return "text-gray-500"
      default:
        return "text-gray-700"
    }
  }

  // Determine blockchain status
  let blockchainStatus = "Offline";
  let blockchainStatusColor = "text-red-600";
  let blockchainDotColor = "bg-red-500";
  let blockchainStatusText = "Stopped";
  if (elections.length > 0) {
    const allEnded = elections.every(e => e.phase === "ended");
    if (!allEnded) {
      blockchainStatus = "Online";
      blockchainStatusColor = "text-green-600";
      blockchainDotColor = "bg-green-500";
      blockchainStatusText = "Running";
    }
  }

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

      {/* Main Content */}
      <div className="ml-64">
        {/* Top Header */}
        <header className="bg-white px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-5xl font-montserrat font-normal text-gray-800">Dashboard</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  placeholder="Search here ..."
                  className="pl-10 w-96 bg-gray-100 text-gray-800 placeholder:text-gray-500 font-montserrat rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white"
                />
              </div>

              <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors">
                <Bell className="w-5 h-5" />
              </button>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>

              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 text-xs font-semibold">
                AD
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Main Dashboard Content */}
          <div className="flex-1 p-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-montserrat">Total Elections</p>
                    <p className="text-3xl font-bold text-gray-800">{elections.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center translate-x-4 -translate-y-8">
                    <Vote className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-montserrat">Active Elections</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {elections.filter((e) => e.phase === "voting").length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center -translate-y-8 translate-x-4">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-montserrat">Total Voters</p>
                    <p className="text-3xl font-bold font-montserrat text-gray-800">{stats.voterCount}</p>
                    <div className="flex items-center gap-1 mt-2">
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center -translate-y-7 translate-x-4">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-montserrat mb-4">Blockchain Status</p>
                    <p className={`text-2xl font-bold ${blockchainStatusColor} font-montserrat`}>{blockchainStatus}</p>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 ${blockchainDotColor} rounded-full`}></div>
                      <span className={`${blockchainStatusColor} text-sm font-montserrat`}>{blockchainStatusText}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center -translate-y-12 translate-x-4">
                    <Shield className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Election History Chart */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-2xl font-normal text-gray-800 font-montserrat mb-4">Election History</h3>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      <span className="text-gray-600">Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-gray-600">Active</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={electionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #E5E7EB",
                          borderRadius: "8px",
                          color: "#374151",
                        }}
                      />
                      <Bar dataKey="completed" fill="#25D366" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="active" fill="#128C7E" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* Create Election Form */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-montserrat font-normal text-gray-800">Create New Election</h3>
                </div>
                <div className="p-6">
                  <form onSubmit={handleCreateElection} className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block font-montserrat">Title</label>
                      <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        className="w-full bg-gray-50 text-gray-800 border border-gray-200 rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block font-montserrat">Description</label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        className="w-full bg-gray-50 text-gray-800 border border-gray-200 rounded-2xl px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">Start Time</label>
                      <input
                        type="datetime-local"
                        name="startTime"
                        value={form.startTime}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        className="w-full bg-gray-50 border border-gray-200 rounded-3xl text-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-green-600 hover:bg-green-700 rounded-3xl text-white px-4 py-2 font-montserrat transition-colors disabled:opacity-50"
                    >
                      {loading ? "Creating..." : "Create Election"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
            {/* Current Elections */}
            <div className="bg-white rounded-3xl mb-8 shadow-sm border border-gray-100">
              <div className="p-6">
                <h3 className="text-4xl font-Bold font-montserrat text-gray-800">Current Elections</h3>
              </div>
              <div className="p-3">
                {elections.filter(e => e.phase === "registration" || e.phase === "voting").length === 0 ? (
                  <p className="text-gray-500">No current elections found.</p>
                ) : (
                  <div className="space-y-4">
                    {elections
                      .filter(e => e.phase === "registration" || e.phase === "voting")
                      .map((election) => (
                        <div key={election._id} className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-normal text-gray-800 mb-2">{election.title}</h4>
                              <p className="text-gray-600 mb-3">{election.description}</p>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-gray-600">
                                  Phase:{" "}
                                  <span className={`font-semibold ${getPhaseColor(election.phase)}`}>
                                    {election.phase.toUpperCase()}
                                  </span>
                                </span>
                                <span className="text-gray-600">
                                  Start: {new Date(election.startTime).toLocaleString()}
                                </span>
                                <span className="text-gray-600">
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

            {/* Election History */}

          </div>

          {/* Right Sidebar */}
          <div className="w-80 p-8 space-y-6">
            {/* System Status */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-montserrat font-normal text-gray-800">System Status</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-montserrat">Elections</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-gray-800 font-semibold">{elections.length}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-montserrat">Active Votes</span>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <span className="text-gray-800 font-semibold">1,247</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-normal font-montserrat text-gray-800">Quick Actions</h3>
              </div>
              <div className="p-6 space-y-3">
                <button
                  onClick={handleCheckBlockchainStatus}
                  disabled={loading}
                  className="w-full bg-green-100 hover:bg-green-200 font-montserrat text-green-700 px-4 py-2 rounded-full flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Shield className="w-4 h-4" />
                  Check Blockchain
                </button>
                <button
                  onClick={handleEndBlockchainElection}
                  disabled={loading}
                  className="w-full bg-red-100 hover:bg-red-200 font-montserrat text-red-700 px-4 py-2 rounded-full flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Settings className="w-4 h-4" />
                  End Election
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
