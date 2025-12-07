import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <div className="mt-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Customers</h1>
          <p className="text-gray-400">Manage and track your WhatsApp leads</p>
        </div>

        <button
          onClick={fetchCustomers}
          className="group relative inline-flex items-center justify-center px-6 py-2.5 overflow-hidden font-medium text-white transition duration-300 ease-out rounded-lg shadow-md group"
        >
          {/* Purple Gradient Button Background */}
          <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 opacity-100 group-hover:opacity-90 transition-opacity"></span>
          <span className="relative flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              ></path>
            </svg>
            Refresh Data
          </span>
        </button>
      </div>

      {/* Dark Glass Card */}
      <div className="bg-[#13131f] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div
              className="animate-spin inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mb-3"
              role="status"
            ></div>
            <p>Syncing with database...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-4 text-xs font-semibold text-purple-400 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-purple-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-purple-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-purple-400 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {customers.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-200 font-mono">
                        {c.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-300 font-medium">
                        {c.name || (
                          <span className="text-gray-600 italic">Unknown</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_10px_rgba(74,222,128,0.1)]">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}

                {customers.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No customers found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
