import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getApi } from "@/utils/api";
import { Calendar as CalendarIcon } from "lucide-react";

// Helper: Get today’s date
const API_DATE_TODAY = () => new Date().toISOString().split("T")[0];

export default function StaffAttendance() {
  const api = getApi();
  const [date, setDate] = useState(API_DATE_TODAY());
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [staffList, setStaffList] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [showMonthly, setShowMonthly] = useState(false);
  const [monthlySummary, setMonthlySummary] = useState([]);

  // Load email from localStorage
  useEffect(() => {
    setEmail(localStorage.getItem("email") || "");
  }, []);

  // Fetch staff list
  useEffect(() => {
    const loadStaff = async () => {
      try {
        const res = await api.get(`staff/`);
        const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setStaffList(data);
      } catch (e) {
        console.error("Failed to load staff list", e);
      }
    };
    loadStaff();
  }, [api]);

  // Fetch attendance for selected date
  useEffect(() => {
    const loadAttendance = async () => {
      if (!date) return;
      try {
        setLoading(true);
        const res = await api.get(`attendance/staff-attendance/`, { params: { date } });
        const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setAttendanceList(data);
        setError(null);
      } catch (e) {
        console.error("Failed to load attendance", e);
        setError("Failed to load attendance");
      } finally {
        setLoading(false);
      }
    };
    loadAttendance();
  }, [api, date]);

  // Resolve current staff by email
  const currentStaff = useMemo(() => {
    if (!email) return null;
    return (
      staffList.find(
        (s) =>
          s.email === email ||
          s.user_email === email ||
          s.user?.email === email
      ) || null
    );
  }, [staffList, email]);

  const franchiseName = useMemo(() => {
    if (!currentStaff) return "";
    return (
      currentStaff.franchise_name ||
      currentStaff.franchise?.name ||
      currentStaff.franchise ||
      ""
    );
  }, [currentStaff]);

  const myAttendance = useMemo(() => {
    if (!currentStaff?.id) return [];
    return attendanceList.filter(
      (a) => a.staff === currentStaff.id || a.staff_id === currentStaff.id
    );
  }, [attendanceList, currentStaff]);

  // Fetch monthly summary
  useEffect(() => {
    const fetchMonthly = async () => {
      if (!showMonthly || !currentStaff?.id) return;
      try {
        const month = new Date(date).getMonth() + 1;
        const res = await api.get(`attendance/monthly-summary/`, {
          params: { month, staff: currentStaff.id },
        });
        const data = Array.isArray(res.data) ? res.data : [];
        setMonthlySummary(data);
      } catch (e) {
        console.error("Failed to load monthly summary", e);
      }
    };
    fetchMonthly();
  }, [api, date, showMonthly, currentStaff]);

  // Badge color by status
  const statusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "present":
        return "bg-green-600";
      case "half day":
      case "half-day":
        return "bg-yellow-500";
      case "wfh":
        return "bg-blue-600";
      case "absent":
      default:
        return "bg-red-500";
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-l border-r border-gray-300">
          {/* Title */}
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-red-600" />
            <h1 className="text-xl sm:text-2xl font-bold">My Attendance</h1>
          </div>

          {/* Right Section */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            <div className="text-sm text-gray-600">
              Franchise: <span className="font-medium">{franchiseName || "-"}</span>
            </div>
            <div className="text-sm text-gray-600">
              Email: <span className="font-medium">{email || "-"}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Date:</span>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-xl h-9 w-full sm:w-auto"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowMonthly((v) => !v)}
              className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm w-full sm:w-auto"
            >
              {showMonthly ? "Back to Daily" : "View Monthly Attendance"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl p-4 grid gap-6 border-b border-l border-r border-gray-300">
        {loading && (
          <div className="text-sm text-gray-500 text-center">Loading attendance...</div>
        )}
        {error && <div className="text-sm text-red-600 text-center">{error}</div>}

        {!currentStaff && (
          <div className="text-sm text-amber-600 text-center">
            Could not match your staff record. Please ensure your profile email matches your staff record.
          </div>
        )}

        {/* Daily Attendance Table */}
        {!showMonthly && (
          <Card className="rounded-2xl shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle>Attendance for {date}</CardTitle>
            </CardHeader>
            <CardContent>
              {myAttendance.length === 0 ? (
                <div className="text-sm text-gray-500 text-center">
                  No attendance record for the selected date.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[400px]">
                    <thead className="text-left text-gray-500 bg-gray-100">
                      <tr>
                        <th className="py-2 px-2">Date</th>
                        <th className="py-2 px-2">In Time</th>
                        <th className="py-2 px-2">Out Time</th>
                        <th className="py-2 px-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myAttendance.map((a, i) => (
                        <tr
                          key={i}
                          className="border-b last:border-0 hover:bg-gray-50"
                        >
                          <td className="py-2 px-2">{a.date}</td>
                          <td className="py-2 px-2">{a.in_time || "-"}</td>
                          <td className="py-2 px-2">{a.out_time || "-"}</td>
                          <td className="py-2 px-2">
                            <Badge className={`${statusColor(a.status)} text-white`}>
                              {a.status || "-"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Monthly Summary Table */}
        {showMonthly && (
          <Card className="rounded-2xl shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle>
                Monthly Summary (Month: {new Date(date).getMonth() + 1})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[400px]">
                  <thead className="text-left text-gray-500 bg-gray-100">
                    <tr>
                      <th className="py-2 px-2">Present</th>
                      <th className="py-2 px-2">Absent</th>
                      <th className="py-2 px-2">Half Day</th>
                      <th className="py-2 px-2">WFH</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlySummary.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-3 text-center text-gray-500"
                        >
                          No data for this month.
                        </td>
                      </tr>
                    ) : (
                      monthlySummary
                        .filter((r) => r.staff__id === currentStaff?.id)
                        .map((r, i) => (
                          <tr key={i} className="border-b last:border-0">
                            <td className="py-2 px-2 text-green-600 font-medium">
                              {r.present}
                            </td>
                            <td className="py-2 px-2 text-red-600 font-medium">
                              {r.absent}
                            </td>
                            <td className="py-2 px-2 text-yellow-600 font-medium">
                              {r.half_day}
                            </td>
                            <td className="py-2 px-2 text-blue-600 font-medium">
                              {r.wfh}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
