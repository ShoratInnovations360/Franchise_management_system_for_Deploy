import { Bell, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";

export default function Header({
  onNotificationsClick,
  unreadCount = 0,
  onGoHome,
  onLogout,
  email_user,
  onMenuToggle,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  
  return (
    <header className="w-full flex items-center justify-between px-4 sm:px-6 py-3 bg-white border-b shadow-sm relative">
      {/* Left */}
      <div className="flex items-center gap-4">
        {/* Hamburger for mobile */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <Menu className="h-6 w-6 text-gray-700" />
        </button>

        <Button
          onClick={() => onGoHome && onGoHome("dashboard")}
          className="bg-red-600 hover:bg-red-700 text-white text-xl sm:text-xl font-bold px-3 sm:px-4 py-2 rounded-md shadow-md w-auto"
        >
          Shorat Innovations
        </Button>
      </div>

      {/* Middle - Search (hidden on mobile) */}
      

      {/* Right - Notifications & Profile */}
      <div className="flex items-center gap-4 sm:gap-6 relative">
        {/* Notifications */}
        <div className="relative cursor-pointer" onClick={onNotificationsClick}>
          <Bell className="h-6 w-6 text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="h-9 w-9 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-bold">
              A
            </div>
            {/* Hide text on small screens */}
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-medium text-gray-900">Admin</span>
              <span className="text-xs text-gray-500">{email_user}</span>
            </div>
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg py-1 z-50">
              <button
                onClick={() => setDropdownOpen(false)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                Profile
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onLogout && onLogout();
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
