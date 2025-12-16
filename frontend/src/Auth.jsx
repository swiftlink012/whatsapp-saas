import React, { useState } from "react";
import { User, Lock, Smartphone, Loader2, ArrowRight } from "lucide-react"; // Added icons for better UI

// Use correct port (4000)
const API_BASE_URL = "http://localhost:4000/api/auth";

function Auth({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // --- API HANDLERS (Logic kept exactly the same) ---

  const handleRegistration = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          mobilenumber: mobileNumber,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: `Success! User ${data.user.username} registered. Please log in.`,
        });
        setIsRegistering(false);
        setPassword("");
      } else {
        setMessage({
          type: "error",
          text: `Registration Failed: ${data.message || "Server error"}`,
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Network error. Check server connection.",
      });
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: `Login Successful! Welcome, ${data.user.username}`,
        });
        if (onLogin) {
          onLogin(data.user);
        }
      } else {
        setMessage({
          type: "error",
          text: `Login Failed: ${data.message || "Invalid credentials"}`,
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Network error. Check server connection.",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setMessage({
        type: "error",
        text: "Username and Password are required.",
      });
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      if (isRegistering) await handleRegistration();
      else await handleLogin();
    } finally {
      setLoading(false);
    }
  };

  const formTitle = isRegistering ? "Create Account" : "Welcome Back";
  const formSubtitle = isRegistering
    ? "Join us to manage your store"
    : "Sign in to access your dashboard";

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor (Optional Glow effects) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[128px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]" />

      {/* Main Card */}
      <div className="w-full max-w-md bg-[#13131f]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-12 w-12 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{formTitle}</h2>
          <p className="text-gray-400 text-sm">{formSubtitle}</p>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`p-3 rounded-lg mb-6 text-sm text-center border ${
              message.type === "error"
                ? "bg-red-500/10 border-red-500/20 text-red-400"
                : "bg-green-500/10 border-green-500/20 text-green-400"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 ml-1">
              Username
            </label>
            <div className="relative group">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 ml-1">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Mobile Number (Registration Only) */}
          {isRegistering && (
            <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-xs font-medium text-gray-400 ml-1">
                Mobile Number
              </label>
              <div className="relative group">
                <Smartphone className="absolute left-3 top-3 h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="+91 99999 99999"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <>
                {isRegistering ? "Create Account" : "Sign In"}
                {!loading && <ArrowRight size={18} />}
              </>
            )}
          </button>
        </form>

        {/* Toggle View */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setMessage("");
              setUsername("");
              setPassword("");
              setMobileNumber("");
            }}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {isRegistering ? (
              <>
                Already have an account?{" "}
                <span className="text-blue-400 hover:underline">Sign in</span>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <span className="text-blue-400 hover:underline">
                  Register now
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Auth;
