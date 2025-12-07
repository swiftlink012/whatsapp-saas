import React from "react";
import CustomerList from "./components/CustomerList";

function App() {
  return (
    // THEME: Deep dark background matching the portfolio
    <div className="min-h-screen w-full bg-[#0a0a0f] text-gray-100 font-sans selection:bg-purple-500 selection:text-white">
      {/* Navbar with Glass Effect */}
      <nav className="border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo Icon */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="font-bold text-white text-lg">W</span>
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              WhatsApp SaaS
            </span>
          </div>

          <div className="text-sm text-gray-400">Admin Panel</div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto p-6">
        <CustomerList />
      </main>
    </div>
  );
}

export default App;
