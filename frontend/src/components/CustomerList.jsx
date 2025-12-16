import React, { useState, useEffect } from "react";
import { Search, MessageSquare, Tag, Plus, X, UserPlus } from "lucide-react"; // Added UserPlus icon
import ChatPanel from "./ChatPanel";

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("http://localhost:4000/customers");
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error("Failed to fetch customers", err);
    }
  };

  const handleViewChat = (customer) => {
    setSelectedCustomer(customer);
  };

  // --- NEW: START A CHAT WITH A NEW NUMBER ---
  const handleNewChat = async () => {
    const phone = prompt("Enter Phone Number (e.g., 919999999999):");
    if (!phone) return;

    const name = prompt("Enter Name (Optional):") || "New Customer";

    try {
      // 1. Create or Get the customer from the backend
      const res = await fetch("http://localhost:4000/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name }),
      });
      const newCustomer = await res.json();

      // 2. Update the list UI if they are new
      const exists = customers.find((c) => c.id === newCustomer.id);
      if (!exists) {
        setCustomers([newCustomer, ...customers]);
      }

      // 3. Open the Chat Panel immediately
      setSelectedCustomer(newCustomer);
    } catch (err) {
      alert("Error creating chat: " + err.message);
    }
  };

  // --- EXISTING HELPERS ---
  const handleAddTag = async (id, currentTags, newTag) => {
    if (!newTag) return;
    const updatedTags = [...(currentTags || []), newTag];
    await updateCustomer(id, { tags: updatedTags });
  };

  const handleRemoveTag = async (id, currentTags, tagToRemove) => {
    const updatedTags = currentTags.filter((t) => t !== tagToRemove);
    await updateCustomer(id, { tags: updatedTags });
  };

  const updateCustomer = async (id, payload) => {
    try {
      const res = await fetch(`http://localhost:4000/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const updated = await res.json();
      setCustomers(customers.map((c) => (c.id === id ? updated : c)));
      if (selectedCustomer?.id === id) setSelectedCustomer(updated);
    } catch (err) {
      alert("Failed to update customer");
    }
  };

  const openWhatsApp = (phone, name) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, "");
    const finalPhone =
      cleanPhone.length === 10 ? "91" + cleanPhone : cleanPhone;
    const text = `Hi ${name || "there"}, `;
    window.open(
      `https://wa.me/${finalPhone}?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const filtered = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Customers</h1>
          <p className="text-gray-400 mt-1">
            Manage leads, tags, and conversations.
          </p>
        </div>

        <div className="flex gap-3">
          {/* --- NEW BUTTON HERE --- */}
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <UserPlus size={18} /> New Chat
          </button>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 bg-[#13131f] border border-gray-800 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* CUSTOMER TABLE */}
      <div className="bg-[#13131f] rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#1c1c2e] text-gray-400 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Name / Phone</th>
              <th className="px-6 py-4">Tags</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.map((cust) => (
              <tr
                key={cust.id}
                className="hover:bg-[#1c1c2e]/50 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-200">
                    {cust.name || "Unknown"}
                  </div>
                  <div className="text-sm text-gray-500">{cust.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2 items-center">
                    {(cust.tags || []).map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-xs border border-blue-500/20 flex items-center gap-1"
                      >
                        {tag}
                        <button
                          onClick={() =>
                            handleRemoveTag(cust.id, cust.tags, tag)
                          }
                          className="hover:text-white"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    <button
                      onClick={() => {
                        const t = prompt("Enter tag name (e.g. VIP, Lead):");
                        if (t) handleAddTag(cust.id, cust.tags, t);
                      }}
                      className="text-gray-500 hover:text-blue-400 p-1 border border-dashed border-gray-700 rounded opacity-50 hover:opacity-100 transition-opacity flex items-center gap-1 text-xs"
                    >
                      <Plus size={12} /> Add Tag
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button
                    onClick={() => openWhatsApp(cust.phone, cust.name)}
                    className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleViewChat(cust)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <MessageSquare size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CHAT PANEL */}
      {selectedCustomer && (
        <ChatPanel
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}
