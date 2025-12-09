import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import CustomerList from "./components/CustomerList";
import Contact from "./components/Contact";

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-[#0a0a0f] text-gray-100 font-sans">
        {/* Left Side: Navigation */}
        <Sidebar />

        {/* Right Side: Main Content Area */}
        <main className="flex-1 ml-64 p-8">
          <div className="max-w-6xl mx-auto">
            <Routes>
              {/* This switch determines which component to show */}
              <Route path="/" element={<CustomerList />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
