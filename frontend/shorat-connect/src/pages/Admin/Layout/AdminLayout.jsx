import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Header from "./Header";
import { AdminSidebar } from "../Layout/AdminSidebar";
import { DashboardContent } from "../Dashboard/DashboardContent";
import FranchiseManagement from "../Franchise/FranchiseManagement";
import StaffManagement from "../staff/StaffManagement";
import { NotificationPage } from "../Notifications/NotificationPage";
import StudentManagement from "../Student/StudentManagement";
import CourseManagement from "../course/CourseManagement";
import BatchManagement from "../Batches/BatchManagement";
import AttendanceSystem from "../AttendanceSystem/AttendanceSystem";
import ReportAnalysis from "../Report and Analysis/ReportAnalysis";
import EventsWorkshop from "../Events&Workshop/EventsWorkshop";
import AdminProfile from "../Profile/AdminProfile";
import AdminSetting from "../Setting/AdminSetting";
import PaymentBilling from "../Payment&Billing/PaymentBilling";
import StudentAttendanceList from "../AttendanceSystem/StudentAttendance";

export default function AdminLayout({ onLogout, user }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [franchises] = useState([
    { id: 1, name: "Franchise A" },
    { id: 2, name: "Franchise B" },
  ]);

  const [notifications, setNotifications] = useState([]);
  const API_BASE = "http://127.0.0.1:8000/api/notifications/";

  useEffect(() => {
    fetch(API_BASE)
      .then((res) => res.json())
      .then((data) => setNotifications(data))
      .catch((err) => console.error("Error fetching notifications:", err));
  }, []);

  const handleMarkRead = (id) => {
    fetch(`${API_BASE}${id}/mark_read/`, { method: "POST" }).then(() => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    });
  };

  const handleMarkAllRead = () => {
    fetch(`${API_BASE}mark_all_read/`, { method: "POST" }).then(() => {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    });
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      {/* ✅ Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header
          onNotificationsClick={() => navigate("/admin/notifications")}
          unreadCount={unreadCount}
          onGoHome={() => navigate("/admin/dashboard")}
          onLogout={onLogout}
          email_user={user?.email}
          onMenuToggle={() => setMobileOpen(true)}
        />
      </div>

      {/* ✅ Main Layout Area */}
      <div className="flex flex-1 pt-16 overflow-hidden">
        {/* ✅ Sidebar (Independent Scrollable Area, slightly lifted up) */}
        <div className="h-[calc(100vh-4rem)] overflow-y-auto bg-white shadow-sm pt-1 overflow-y-auto scrollbar-hide
">
          <div className="-mt-2"> {/* 👈 small lift of content */}
            <AdminSidebar
              mobileOpen={mobileOpen}
              onClose={() => setMobileOpen(false)}
              unreadCount={unreadCount}
            />
          </div>
        </div>

        {/* ✅ Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto bg-gray-50">
          <Routes>
            <Route path="dashboard" element={<DashboardContent />} />
            <Route path="settings" element={<AdminSetting />} />
            <Route path="franchise" element={<FranchiseManagement />} />
            <Route path="course" element={<CourseManagement />} />
            <Route path="staff" element={<StaffManagement />} />
            <Route path="student" element={<StudentManagement />} />
            <Route path="payments" element={<PaymentBilling />} />
            <Route path="batch" element={<BatchManagement />} />
            <Route path="attendance" element={<AttendanceSystem />} />
            <Route path="reports" element={<ReportAnalysis />} />
            <Route path="events" element={<EventsWorkshop />} />
            <Route path="stud_attendance" element={<StudentAttendanceList />} />
            <Route
              path="notifications"
              element={
                <NotificationPage
                  franchises={franchises}
                  notifications={notifications}
                  setNotifications={setNotifications}
                  onMarkRead={handleMarkRead}
                  onMarkAllRead={handleMarkAllRead}
                />
              }
            />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
