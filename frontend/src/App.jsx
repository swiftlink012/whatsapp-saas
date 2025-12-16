import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Components
import Sidebar from "./components/Sidebar";
import CustomerList from "./components/CustomerList";
import Contact from "./components/Contact";
import NotificationSettings from "./components/NotificationSettings";
import Auth from "./Auth";

// Pages
import Dashboard from "./pages/Dashboard";
import MenuPage from "./pages/MenuPage";

function App() {
  // --- 2. AUTH STATE ---
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  // --- 3. PROTECTION CHECK ---
  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="flex min-h-screen bg-[#0a0a0f] text-gray-100 font-sans">
        {/* Sidebar */}
        <Sidebar onLogout={handleLogout} user={user} />

        {/* Main Content Area */}
        <main className="flex-1 ml-64 p-8">
          <div className="max-w-6xl mx-auto">
            <Routes>
              {/* Dashboard */}
              <Route path="/" element={<Dashboard />} />

              {/* Customer List */}
              <Route path="/customers" element={<CustomerList />} />

              {/* Menu Management */}
              <Route path="/menu" element={<MenuPage />} />

              {/* Contact Page */}
              <Route path="/contact" element={<Contact />} />

              {/* Settings Route */}
              <Route path="/settings" element={<NotificationSettings />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
