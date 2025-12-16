import React, { useState, useEffect } from "react";
import {
  Bell,
  Smartphone,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

const NotificationSettings = () => {
  const [enabled, setEnabled] = useState(false);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // 'success' | 'error' | null
  const [statusMessage, setStatusMessage] = useState("");

  // 1. Fetch current settings on load
  useEffect(() => {
    // Note: Assuming you have a way to make authenticated requests (e.g., passing credentials)
    // If you extracted api logic to a helper, use that. For now, adding credentials: 'include'
    fetch("http://localhost:4000/api/settings", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setEnabled(data.daily_summary_enabled || false);
          setPhone(data.notification_phone || "");
        }
      })
      .catch((err) => console.error("Failed to load settings:", err));
  }, []);

  // 2. Save changes automatically when toggled
  const handleToggle = async (newState) => {
    setEnabled(newState);
    try {
      await fetch("http://localhost:4000/api/settings/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: newState, phone: phone }),
        credentials: "include",
      });
    } catch (err) {
      console.error("Failed to save settings");
      setEnabled(!newState);
      alert("Failed to save settings.");
    }
  };

  // 3. Save phone number on blur
  const handleSavePhone = async () => {
    try {
      await fetch("http://localhost:4000/api/settings/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: enabled, phone: phone }),
        credentials: "include",
      });
    } catch (err) {
      console.error("Failed to save phone number");
    }
  };

  // 4. Handle Test Send
  const handleSendTest = async () => {
    setLoading(true);
    setTestStatus(null);
    setStatusMessage("");

    if (!phone) {
      setTestStatus("error");
      setStatusMessage("Please save a phone number first.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:4000/api/settings/test-summary",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json();

      if (res.ok) {
        setTestStatus("success");
        setStatusMessage("✅ Sent! Check your WhatsApp.");
      } else {
        throw new Error(data.error || "Request failed");
      }
    } catch (err) {
      setTestStatus("error");
      setStatusMessage(`❌ Failed: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-100">
          Notification Settings
        </h1>
        <p className="text-gray-400 mt-1">
          Configure automated reports and alerts.
        </p>
      </div>

      {/* Main Card */}
      <div className="max-w-2xl bg-[#13131f] border border-gray-800 rounded-2xl p-8 shadow-xl relative overflow-hidden">
        {/* Decorative Blur */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-[80px] -z-0" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-8">
            <div className="flex gap-4">
              <div className="h-12 w-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20">
                <Bell className="text-green-500 h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-100">
                  Daily Analytics Report
                </h2>
                <p className="text-gray-400 text-sm mt-1 max-w-sm">
                  Get a summary of your store's performance sent to WhatsApp
                  every night at 9:00 PM.
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={() => handleToggle(!enabled)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#13131f] ${
                enabled ? "bg-green-600" : "bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 shadow-lg ${
                  enabled ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="space-y-6">
            {/* Phone Input */}
            <div
              className={`transition-all duration-300 ${
                enabled
                  ? "opacity-100"
                  : "opacity-40 grayscale pointer-events-none"
              }`}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">
                WhatsApp Number
              </label>
              <div className="relative group">
                <Smartphone className="absolute left-3 top-3 h-5 w-5 text-gray-500 group-focus-within:text-green-500 transition-colors" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={handleSavePhone}
                  disabled={!enabled}
                  placeholder="e.g. 919876543210"
                  className="w-full bg-[#0a0a0f] border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 ml-1">
                Enter number with country code (e.g., 91 for India). No '+'
                symbol.
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-800 w-full" />

            {/* Test Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-300">
                  Test Configuration
                </h3>
                {statusMessage && (
                  <div
                    className={`flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full ${
                      testStatus === "success"
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {testStatus === "success" ? (
                      <CheckCircle size={14} />
                    ) : (
                      <AlertCircle size={14} />
                    )}
                    {statusMessage}
                  </div>
                )}
              </div>

              <button
                onClick={handleSendTest}
                disabled={loading || !enabled || !phone}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-xl transition-all border border-gray-700 hover:border-gray-600 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 text-gray-400" />
                    <span className="text-gray-400">Sending...</span>
                  </>
                ) : (
                  <>
                    <Send
                      size={18}
                      className="group-hover:text-green-400 transition-colors"
                    />
                    <span>Send Me a Test Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
