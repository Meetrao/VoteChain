import React, { useState } from "react";
import { Link } from 'react-router-dom';
import { Clipboard, Wallet, Vote } from 'lucide-react';

const memberData = [
  {
    id: 1,
    name: "Edgar Rivera",
    company: "Fishermen Labs",
    plan: "Office Member",
    price: "$79.00",
    paymentMethod: "Credit Card",
    status: "Confirmed",
    avatar: "/professional-man-avatar.png",
  },
  {
    id: 2,
    name: "Priya Bollam",
    company: "Airbnb",
    plan: "Part-Time",
    price: "$79.00",
    paymentMethod: "Credit Card",
    status: "Confirmed",
    avatar: "/professional-woman-avatar.png",
    highlighted: true,
  },
  {
    id: 3,
    name: "Edna Lee",
    company: "Spotify",
    plan: "Part-Time",
    price: "$79.00",
    paymentMethod: "Credit Card",
    status: "Not Connected",
    avatar: "/professional-woman-avatar-2.png",
  },
  {
    id: 4,
    name: "Kelly Bates",
    company: "Simply New",
    plan: "Part-Time",
    price: "$79.00",
    paymentMethod: "Credit Card",
    status: "Confirmed",
    avatar: "/professional-woman-avatar-3.jpg",
  },
  {
    id: 5,
    name: "Glen Woods",
    company: "Knife and Fox",
    plan: "Office Member",
    price: "$79.00",
    paymentMethod: "Credit Card",
    status: "Confirmed",
    avatar: "/professional-man-avatar-2.png",
  },
  {
    id: 6,
    name: "Diana Flores",
    company: "Evergreen",
    plan: "Full-Time",
    price: "$79.00",
    paymentMethod: "Credit Card",
    status: "Confirmed",
    avatar: "/professional-woman-avatar-4.jpg",
  },
  {
    id: 7,
    name: "Karla Rodriguez",
    company: "Airbnb",
    plan: "Full-Time",
    price: "$79.00",
    paymentMethod: "Credit Card",
    status: "Confirmed",
    avatar: "/professional-woman-avatar-5.jpg",
  },
  {
    id: 8,
    name: "Nathan Smith",
    company: "Spotify",
    plan: "Office Member",
    price: "$79.00",
    paymentMethod: "Credit Card",
    status: "Confirmed",
    avatar: "/professional-man-avatar-3.jpg",
  },
];

export function MemberAdminDashboard() {
  const [hoveredRow, setHoveredRow] = useState(null);

  const sidebarItems = [
    { icon: Clipboard, label: "Dashboard", route: "/dashboard", active: false },
    { icon: Wallet, label: "Elections", route: "/election", active: false },
    { icon: Vote, label: "Voters", route: "/voters", active: true }, // Voters page active
    // Add more items as needed
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
              className={`flex items-center gap-3 px-3 py-3 rounded-full cursor-pointer transition-colors ${
                item.active ? "bg-green-700 text-white" : "text-green-100 hover:text-white hover:bg-green-700"
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
              <h1 className="text-5xl font-bold text-gray-900">Members List</h1>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 px-8">
            <div className="bg-white shadow-sm rounded-3xl border border-gray-200">
              <div className="p-6">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 pb-4 border-b border-gray-200 text-sm font-medium text-gray-500">
                  <div className="col-span-3">Name </div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-3"></div>
                </div>

                {/* Table Rows */}
                <div className="space-y-0">
                  {memberData.map((member) => (
                    <div
                      key={member.id}
                      className={`grid grid-cols-12 gap-4 py-4 border-b border-gray-100 last:border-b-0 transition-colors hover:bg-green-50 ${
                        member.highlighted
                      }`}
                      onMouseEnter={() => setHoveredRow(member.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      {/* Name */}
                      <div className="col-span-3 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                          <img
                            src={member.avatar || "/placeholder.svg"}
                            alt={member.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              const target = e.target;
                              target.style.display = "none";
                              const fallback = target.nextElementSibling;
                              if (fallback) fallback.style.display = "flex";
                            }}
                          />
                          <div
                            className="h-full w-full bg-gray-200 text-gray-600 text-xs font-medium flex items-center justify-center"
                            style={{ display: "none" }}
                          >
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{member.name}</div>
                        </div>
                      </div>
                      {/* Status */}
                      <div className="col-span-2 flex items-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            member.status === "Voted"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {member.status}
                        </span>
                      </div>
                    </div>
                  ))}
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