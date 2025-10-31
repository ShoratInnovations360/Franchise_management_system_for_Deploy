import React, { useState } from "react";
import StaffSidebar from "./StaffSidebarClean";
import { StaffHeader } from "./StaffHeader";

// Import all Staff pages (you can adjust according to your folder structure)
import StaffAttendance from "../Attendance/StaffAttendance";
import StaffSettings from "../Settings/StaffSettings";
import { Menu, X } from "lucide-react";

export const StaffLayout = ({ user, onLogout }) => {
  const [activePage, setActivePage] = useState("Dashboard"); // default matches sidebar label
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

const [notifications, setNotifications] = useState([
    { id: 1, message: "New staff member added", time: "2 min ago", franchiseId: 1, read: false },
    { id: 2, message: "Payment received", time: "10 min ago", franchiseId: 2, read: false },
    { id: 3, message: "Franchise updated profile", time: "30 min ago", franchiseId: 1, read: false },
  ]);

  // Mark read handlers
  const handleMarkRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const renderContent = () => {
    switch (activePage) {
      case "Attendance":
        return <StaffAttendance />;
      case "Settings":
        return <StaffSettings />;
      case "Dashboard":
      default:
        // Show Attendance on Dashboard per requirement
        return <StaffAttendance />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <StaffHeader
        user={user}
        unreadCount={notifications.filter((n) => !n.read).length}
        onMenuToggle={() => setMobileOpen((prev) => !prev)}
        onBellClick={() => setActivePage("Notifications")}
        onLogout={onLogout}
      />

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <StaffSidebar
          activeItem={activePage}
          onItemClick={(label) => {
            setActivePage(label);
            // close mobile drawer after navigation
            if (mobileOpen) setMobileOpen(false);
          }}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          unreadCount={notifications.filter((n) => !n.read).length}
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />

        {/* Main content */}
        <main className="flex-1 p-6 overflow-y-auto relative">
          {/* Floating Hamburger / X button */}
          <div className="mb-4">
            <button
              className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
              onClick={() =>
                window.innerWidth < 1024
                  ? setMobileOpen((prev) => !prev)
                  : setCollapsed((prev) => !prev)
              }
            >
              {window.innerWidth < 1024 ? (
                mobileOpen ? (
                  <X className="h-6 w-6 text-gray-700" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-700" />
                )
              ) : collapsed ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>

          {renderContent()}
        </main>
      </div>
      </div>
    
  );
};

export default StaffLayout;

