import React, { useState, useEffect } from "react";
import { getApi } from "@/utils/api";

const StudentAttendance = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [markedAttendance, setMarkedAttendance] = useState([]);
  const [franchiseName, setFranchiseName] = useState("");
  const [showMonthlySummary, setShowMonthlySummary] = useState(false);
  const [monthlySummary, setMonthlySummary] = useState([]);

  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("role");
  const api = getApi();

  // ✅ Fetch franchise
  useEffect(() => {
    if (!token || role !== "franchise_head") return;

    const fetchFranchise = async () => {
      try {
        const res = await api.get("franchise/");
        setFranchiseName(res.data.name || "");
      } catch (err) {
        console.error("Error fetching franchise:", err);
      }
    };
    fetchFranchise();
  }, [token, role, api]);

  // ✅ Fetch students
  useEffect(() => {
    if (role !== "franchise_head" || !franchiseName) return;

    const fetchStudents = async () => {
      try {
        const res = await api.get(`students/?branch=${franchiseName}`);
        setStudents(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };
    fetchStudents();
  }, [franchiseName, role, api]);

  // ✅ Fetch attendance for selected date
  useEffect(() => {
    if (role !== "franchise_head" || !franchiseName) return;

    const fetchAttendance = async () => {
      try {
        const res = await api.get(
          `attendance/student-attendance/?date=${date}&branch=${franchiseName}`
        );
        const data = Array.isArray(res.data) ? res.data : [];
        setMarkedAttendance(data);

        const updatedAttendance = {};
        data.forEach((a) => {
          updatedAttendance[a.student] = {
            status: a.status,
            inTime: a.in_time,
            outTime: a.out_time,
          };
        });
        setAttendance(updatedAttendance);
      } catch (err) {
        console.error("Error fetching attendance:", err);
      }
    };
    fetchAttendance();
  }, [date, franchiseName, role, api]);

  // ✅ Handle time input
  const handleTimeChange = (studentId, field, value) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }));
  };

  // ✅ Mark attendance (with conditions)
  const markAttendance = async (studentId, status) => {
    const inTime = attendance[studentId]?.inTime || "";
    const outTime = attendance[studentId]?.outTime || "";

    // Only allow Absent if no times are entered
    if (
      status === "Absent" &&
      (inTime || outTime)
    ) {
      alert("Cannot mark Absent if In/Out times are already entered.");
      return;
    }

    // Require time for Present, Half Day, WFH
    if (["Present", "Half Day", "WFH"].includes(status)) {
      if (!inTime || !outTime) {
        alert(`Please select both In Time and Out Time before marking as ${status}.`);
        return;
      }
    }

    // Skip if already marked
    if (attendance[studentId]?.status) return;

    const record = {
      student: studentId,
      date,
      in_time: inTime || null,
      out_time: outTime || null,
      status,
      branch: franchiseName,
    };

    try {
      await api.post("attendance/student-attendance/", [record]);
      setAttendance((prev) => ({
        ...prev,
        [studentId]: { ...prev[studentId], status },
      }));
      setMarkedAttendance((prev) => [...prev, record]);
    } catch (err) {
      console.error("Error saving attendance:", err);
      alert("Error saving attendance: " + JSON.stringify(err.response?.data || err));
    }
  };

  // ✅ Fetch monthly summary
  const fetchMonthlySummary = async () => {
    try {
      const month = new Date(date).getMonth() + 1;
      const res = await api.get(
        `attendance/student-monthly-summary/?month=${month}&branch=${franchiseName}`
      );
      const data = Array.isArray(res.data) ? res.data : [];
      setMonthlySummary(data);
      setShowMonthlySummary(true);
    } catch (err) {
      console.error("Error fetching monthly summary:", err);
    }
  };

  if (role !== "franchise_head") {
    return (
      <div className="p-6 text-red-600 font-bold">
        Unauthorized: Only franchise head can mark attendance
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Student Attendance - {franchiseName}
      </h2>

      {/* Controls */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <div className="flex items-center gap-2">
          <label className="font-medium">Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]} // ❌ Only today allowed
            className="border px-3 py-2 rounded shadow-sm focus:ring-2 focus:ring-blue-400 transition"
          />
        </div>
        <button
          onClick={fetchMonthlySummary}
          className="mt-2 sm:mt-0 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow transition"
        >
          View Monthly Attendance
        </button>
      </div>

      {/* Daily Attendance Table */}
      {!showMonthlySummary && (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {["Name", "In Time", "Out Time", "Mark Attendance", "Status"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-gray-700 font-semibold"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2 font-medium">{s.name}</td>
                  <td className="px-4 py-2">
                    <input
                      type="time"
                      step="60"
                      value={attendance[s.id]?.inTime || ""}
                      onChange={(e) =>
                        handleTimeChange(s.id, "inTime", e.target.value)
                      }
                      className="border px-2 py-1 rounded w-full"
                      disabled={!!attendance[s.id]?.status}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="time"
                      step="60"
                      value={attendance[s.id]?.outTime || ""}
                      onChange={(e) =>
                        handleTimeChange(s.id, "outTime", e.target.value)
                      }
                      className="border px-2 py-1 rounded w-full"
                      disabled={!!attendance[s.id]?.status}
                    />
                  </td>
                  <td className="px-4 py-2 flex gap-2 flex-wrap">
                    {["Present", "Absent", "Half Day", "WFH"].map((status) => (
                      <button
                        key={status}
                        onClick={() => markAttendance(s.id, status)}
                        className={`px-3 py-1 rounded font-medium transition ${
                          attendance[s.id]?.status === status
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                        disabled={!!attendance[s.id]?.status}
                      >
                        {status}
                      </button>
                    ))}
                  </td>
                  <td className="px-4 py-2 font-semibold text-blue-600">
                    {attendance[s.id]?.status || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Monthly Summary Table */}
      {showMonthlySummary && (
        <div className="mt-6 bg-white rounded-lg shadow-md border border-gray-200 p-4">
          <h3 className="text-xl font-semibold mb-4">
            Monthly Attendance Summary
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {["Student", "Branch", "Present", "Absent", "Half Day", "WFH"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-gray-700 font-semibold"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {monthlySummary.map((s) => (
                  <tr key={s.student__id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-2 font-medium">{s.student__name}</td>
                    <td className="px-4 py-2">{s.branch}</td>
                    <td className="px-4 py-2 text-green-600 font-semibold">{s.present}</td>
                    <td className="px-4 py-2 text-red-600 font-semibold">{s.absent}</td>
                    <td className="px-4 py-2 text-yellow-600 font-semibold">{s.half_day}</td>
                    <td className="px-4 py-2 text-blue-600 font-semibold">{s.wfh}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={() => setShowMonthlySummary(false)}
            className="mt-4 px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded shadow transition"
          >
            Back to Daily Attendance
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentAttendance;
