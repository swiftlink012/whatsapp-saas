import React, { useEffect, useState } from "react";
import axios from "axios";
import ChatPanel from "./ChatPanel"; // <--- Import the new component

const StatCard = ({ title, value, change, color }) => (
  <div className="bg-[#13131f] border border-white/5 p-6 rounded-2xl">
    <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
    <div className="flex items-end justify-between">
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className={`text-xs font-medium px-2 py-1 rounded-full ${color}`}>
        {change}
      </div>
    </div>
  </div>
);

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // NEW: State to track which customer is clicked
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetchCustomers = () => {
    setLoading(true);
    axios
      .get("http://localhost:4000/customers")
      .then((response) => {
        setCustomers(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="space-y-8 relative">
      {/* RENDER CHAT PANEL IF A CUSTOMER IS SELECTED */}
      {selectedCustomer && (
        <>
          {/* Dark Overlay/Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setSelectedCustomer(null)}
          ></div>
          {/* The Panel */}
          <ChatPanel
            customer={selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
          />
        </>
      )}

      {/* 1. Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Overview of your messaging performance
          </p>
        </div>
        <button
          onClick={fetchCustomers}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* 2. Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Customers"
          value={customers.length}
          change="+12% this week"
          color="bg-purple-500/10 text-purple-400"
        />
        <StatCard
          title="Messages Sent"
          value="1,240"
          change="+5% today"
          color="bg-blue-500/10 text-blue-400"
        />
        <StatCard
          title="Active Now"
          value="3"
          change="Live"
          color="bg-green-500/10 text-green-400"
        />
      </div>

      {/* 3. Table */}
      <div className="bg-[#13131f] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">Recent Customers</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading...</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">
                  Phone
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">
                  Name
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {customers.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                  onClick={() => setSelectedCustomer(c)} // <--- CLICK TO OPEN CHAT
                >
                  <td className="px-6 py-4 text-gray-300 font-mono">
                    {c.phone}
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {c.name || "Unknown"}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-purple-400 group-hover:text-purple-300 group-hover:underline">
                      View Chat →
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
