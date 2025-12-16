import React from "react";
import {
  LayoutDashboard,
  Users,
  Utensils, 
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ user, onLogout }) {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: Users, label: "Customers", path: "/customers" },
    { icon: Utensils, label: "Menu Management", path: "/menu" },
    { icon: MessageSquare, label: "Contact", path: "/contact" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0a0a0f] border-r border-gray-800 flex flex-col z-50">
      {/* Logo Area */}
      <div className="p-6 flex items-center gap-3 border-b border-gray-800">
        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">W</span>
        </div>
        <span className="text-xl font-bold text-white tracking-tight">
          SaaS Admin
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-blue-600/10 text-blue-500"
                  : "text-gray-400 hover:bg-[#13131f] hover:text-gray-100"
              }`}
            >
              <item.icon
                size={20}
                className={`${
                  isActive
                    ? "text-blue-500"
                    : "text-gray-500 group-hover:text-gray-100"
                }`}
              />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Area */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#13131f] border border-gray-800">
          {/* Avatar */}
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
            {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.username || "Admin"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.mobilenumber || "Online"}
            </p>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            title="Log Out"
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
