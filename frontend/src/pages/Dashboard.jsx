import React, { useState, useEffect } from "react";
import {
  Search,
  ExternalLink,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  Printer,
  X,
  Maximize2, // New Icon: Enter Zen Mode
  Minimize2, // New Icon: Exit Zen Mode
} from "lucide-react";

// --- COMPONENT: DIGITAL THERMAL RECEIPT ---
const ReceiptModal = ({ order, onClose }) => {
  if (!order) return null;

  let items = [];
  try {
    items =
      typeof order.items === "string" ? JSON.parse(order.items) : order.items;
  } catch (e) {
    items = [];
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex justify-center items-center z-[150] p-4 animate-fade-in">
      <div className="bg-[#fffdf0] text-gray-900 w-full max-w-[320px] shadow-2xl relative animate-slide-up font-mono text-sm leading-tight">
        {/* Jagged Top */}
        <div
          className="absolute -top-3 left-0 w-full h-4 bg-[#fffdf0]"
          style={{
            maskImage:
              "linear-gradient(45deg, transparent 50%, black 50%), linear-gradient(-45deg, transparent 50%, black 50%)",
            maskSize: "16px 16px",
            WebkitMaskImage:
              "linear-gradient(45deg, transparent 50%, black 50%), linear-gradient(-45deg, transparent 50%, black 50%)",
            WebkitMaskSize: "16px 16px",
          }}
        ></div>

        <div className="p-6 pt-8 pb-8 flex flex-col items-center">
          <div className="text-center mb-6 border-b-2 border-dashed border-gray-300 w-full pb-4">
            <h2 className="text-xl font-black uppercase tracking-widest">
              MY RESTAURANT
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              123 Food Street, Tech City
            </p>
            <p className="text-xs text-gray-500">Ph: +91 98765 43210</p>
          </div>

          <div className="w-full mb-4">
            <div className="flex justify-between mb-1">
              <span>ORDER #:</span>
              <span className="font-bold">{order.id}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>DATE:</span>
              <span>{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>TIME:</span>
              <span>
                {new Date(order.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          <div className="w-full border-b-2 border-dashed border-gray-300 mb-4"></div>

          <div className="w-full mb-6">
            <p className="uppercase text-xs text-gray-500 mb-1">CUSTOMER:</p>
            <p className="font-bold text-lg">{order.customer_name}</p>
            <p>{order.phone}</p>
          </div>

          <div className="w-full mb-4">
            <div className="flex justify-between text-xs font-bold border-b border-gray-300 pb-2 mb-2">
              <span>QTY ITEM</span>
              <span>AMT</span>
            </div>
            {items.map((item, i) => (
              <div key={i} className="flex justify-between mb-2">
                <span>
                  {item.qty} x {item.name}
                </span>
                <span>{(item.price * (item.qty || 1)).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="w-full border-b-2 border-dashed border-gray-300 mb-4"></div>

          <div className="w-full flex justify-between items-end text-xl font-bold mb-8">
            <span>TOTAL</span>
            <span>₹{order.amount}</span>
          </div>
          <div className="w-full h-12 bg-gray-900 opacity-80 mb-2"></div>
          <p className="text-[10px] text-center uppercase">
            Thank you for ordering!
          </p>

          <button
            onClick={onClose}
            className="absolute -right-12 top-0 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white print:hidden transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Jagged Bottom */}
        <div
          className="absolute -bottom-3 left-0 w-full h-4 bg-[#fffdf0] rotate-180"
          style={{
            maskImage:
              "linear-gradient(45deg, transparent 50%, black 50%), linear-gradient(-45deg, transparent 50%, black 50%)",
            maskSize: "16px 16px",
            WebkitMaskImage:
              "linear-gradient(45deg, transparent 50%, black 50%), linear-gradient(-45deg, transparent 50%, black 50%)",
            WebkitMaskSize: "16px 16px",
          }}
        ></div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // --- ZEN MODE STATE ---
  const [isZenMode, setIsZenMode] = useState(false);

  const kanbanColumns = {
    pending: {
      label: "New Orders",
      color: "border-amber-500",
      badge: "bg-amber-500/10 text-amber-500",
    },
    completed: {
      label: "Ready / Delivered",
      color: "border-emerald-500",
      badge: "bg-emerald-500/10 text-emerald-500",
    },
    abandoned: {
      label: "Cancelled",
      color: "border-rose-500",
      badge: "bg-rose-500/10 text-rose-500",
    },
  };

  useEffect(() => {
    loadData();
  }, []);

  // Poll for updates every 5 seconds (Simulates real-time)
  useEffect(() => {
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchOrders()]);
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/dashboard/stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/orders?search=${search}`
      );
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setOrders([]);
    }
  };

  const updateStatus = async (id, newStatus) => {
    const prevOrders = [...orders];
    setOrders(
      orders.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );

    try {
      await fetch(`http://localhost:4000/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchStats();
    } catch (err) {
      console.error(err);
      alert("Error updating order");
      setOrders(prevOrders);
    }
  };

  const openWhatsApp = (phone, name) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, "");
    const finalPhone =
      cleanPhone.length === 10 ? "91" + cleanPhone : cleanPhone;
    const text = `Hi ${name || "Customer"}, regarding your order...`;
    window.open(
      `https://wa.me/${finalPhone}?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const parseItems = (itemsJson) => {
    try {
      return typeof itemsJson === "string" ? JSON.parse(itemsJson) : itemsJson;
    } catch (e) {
      return [];
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-400">
        <Loader2 className="animate-spin mr-2" /> Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* --- STANDARD HEADER (Hidden in Zen Mode) --- */}
      {!isZenMode && (
        <div className="flex-none space-y-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-100">Your Orders</h1>
              <p className="text-gray-400 mt-1">Real-time order management</p>
            </div>

            {/* ZEN MODE TOGGLE BUTTON */}
            <button
              onClick={() => setIsZenMode(true)}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded-xl transition-all border border-gray-700 shadow-sm"
            >
              <Maximize2 size={18} />
              <span>Kitchen View</span>
            </button>
          </div>

          {/* Stats Row */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Revenue Today"
                value={`₹${stats.revenue?.total || 0}`}
                trend={stats.revenue?.trend}
                color="bg-emerald-500"
              />
              <StatCard
                title="Orders Done"
                value={stats.orders?.total || 0}
                trend={stats.orders?.trend}
                color="bg-blue-500"
              />
              <StatCard
                title="Pending / Abandoned"
                value={stats.abandoned?.total || 0}
                trend={stats.abandoned?.trend}
                color="bg-rose-500"
              />
            </div>
          )}

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search orders..."
              className="pl-10 pr-4 py-3 bg-[#13131f] border border-gray-800 rounded-xl w-full md:w-96 text-gray-200 focus:outline-none focus:border-blue-500 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* --- KANBAN BOARD SECTION (Adaptive) --- */}
      {/* If Zen Mode is active: 
          - Applies 'fixed inset-0' to cover the entire screen (including sidebar)
          - Sets a high z-index to sit on top of everything
          - Adds padding and specific background 
      */}
      <div
        className={
          isZenMode
            ? "fixed inset-0 z-[100] bg-[#0a0a0f] p-4 flex flex-col"
            : "flex-1 min-h-0"
        }
      >
        {/* ZEN MODE HEADER (Only visible in Zen Mode) */}
        {isZenMode && (
          <div className="flex-none flex justify-between items-center mb-4 bg-[#13131f] p-4 rounded-xl border border-gray-800 shadow-xl animate-slide-down">
            <div className="flex items-center gap-4">
              <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_red]"></div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-widest uppercase leading-none">
                  Kitchen Display System
                </h2>
                <p className="text-xs text-gray-500 font-mono mt-1">
                  LIVE FEED
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="text-gray-200 font-mono text-2xl font-bold block">
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="text-gray-600 text-xs font-bold tracking-wider uppercase">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="h-10 w-px bg-gray-700 mx-2"></div>
              <button
                onClick={() => setIsZenMode(false)}
                className="flex items-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white px-5 py-3 rounded-lg transition-all font-bold"
              >
                <Minimize2 size={20} /> Exit
              </button>
            </div>
          </div>
        )}

        {/* The Kanban Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-0">
          {Object.entries(kanbanColumns).map(([statusKey, config]) => {
            const columnOrders = orders.filter(
              (o) => (o.status || "pending") === statusKey
            );

            return (
              <div
                key={statusKey}
                className={`flex flex-col bg-[#13131f] border border-gray-800 rounded-2xl overflow-hidden h-full ${
                  isZenMode ? "shadow-2xl border-gray-700" : ""
                }`}
              >
                {/* Column Header */}
                <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1c1c2e]/50">
                  <h3 className="font-bold text-gray-300 uppercase text-sm tracking-wider flex items-center gap-2">
                    {config.label}
                  </h3>
                  <span
                    className={`${config.badge} px-2.5 py-0.5 rounded-full text-xs font-bold`}
                  >
                    {columnOrders.length}
                  </span>
                </div>

                {/* Scrollable Card List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  {columnOrders.length === 0 && (
                    <div className="text-center text-gray-600 py-10 italic text-sm">
                      No orders here
                    </div>
                  )}

                  {columnOrders.map((order) => {
                    const items = parseItems(order.items);

                    return (
                      <div
                        key={order.id}
                        className={`bg-[#0a0a0f] rounded-xl p-4 border-l-4 ${config.color} border-gray-800 border-y border-r shadow-lg hover:border-gray-700 transition-all group`}
                      >
                        {/* Order Header */}
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="text-white font-bold text-lg">
                              #{order.id}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                              <Clock size={12} />
                              {new Date(order.created_at).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                            </div>
                          </div>

                          {/* Price & Print */}
                          <div className="flex gap-2 items-center">
                            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded text-sm">
                              ₹{order.amount}
                            </span>
                            <button
                              onClick={() => setSelectedReceipt(order)}
                              className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
                              title="View Receipt"
                            >
                              <Printer size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Customer Info */}
                        <div className="mb-3 pb-3 border-b border-gray-800">
                          <p className="text-gray-300 font-medium text-sm">
                            {order.customer_name}
                          </p>
                          <p className="text-gray-600 text-xs">{order.phone}</p>
                        </div>

                        {/* Items List */}
                        <div className="space-y-2 mb-4">
                          {items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between text-sm text-gray-400"
                            >
                              <span className="flex items-center gap-2">
                                <span className="text-xs bg-gray-800 text-gray-300 px-1.5 rounded">
                                  {item.qty || 1}x
                                </span>
                                {item.name}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-auto pt-2">
                          <button
                            onClick={() =>
                              openWhatsApp(order.phone, order.customer_name)
                            }
                            className="flex-1 py-2 bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-xs font-semibold"
                          >
                            <ExternalLink size={14} /> WhatsApp
                          </button>

                          {statusKey === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  updateStatus(order.id, "completed")
                                }
                                className="p-2 bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors"
                                title="Ready"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button
                                onClick={() =>
                                  updateStatus(order.id, "abandoned")
                                }
                                className="p-2 bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white rounded-lg transition-colors"
                                title="Reject"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RENDER RECEIPT MODAL IF SELECTED */}
      {selectedReceipt && (
        <ReceiptModal
          order={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}

// --- SUB-COMPONENT: STAT CARD ---
function StatCard({ title, value, trend = [], color }) {
  const max = trend?.length > 0 ? Math.max(...trend) : 1;
  const safeMax = max === 0 ? 1 : max;

  return (
    <div className="p-6 bg-[#13131f] rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
      <div className="text-gray-400 text-sm font-medium mb-1">{title}</div>
      <div className="text-3xl font-bold text-gray-100 mb-6">{value}</div>
      <div className="flex items-end h-10 gap-1 mt-auto">
        {(trend || []).map((val, i) => (
          <div
            key={i}
            className={`flex-1 rounded-t-sm ${color} transition-all duration-300`}
            style={{
              height: `${(val / safeMax) * 100}%`,
              opacity: 0.3 + (i / (trend?.length || 1)) * 0.7,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}
