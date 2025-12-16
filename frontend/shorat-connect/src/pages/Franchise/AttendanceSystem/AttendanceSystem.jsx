// import React, { useState, useEffect } from "react";
// import { getApi } from "@/utils/api";

// const StaffAttendance = () => {
//   const [staff, setStaff] = useState([]);
//   const [attendance, setAttendance] = useState({});
//   const today = new Date().toISOString().split("T")[0];
//   const [date, setDate] = useState(today);
//   const [markedAttendance, setMarkedAttendance] = useState([]);
//   const [franchiseName, setFranchiseName] = useState("");
//   const [monthlySummary, setMonthlySummary] = useState([]);
//   const [showMonthlySummary, setShowMonthlySummary] = useState(false);

//   const token = localStorage.getItem("access_token");
//   const role = localStorage.getItem("role");
//   const api = getApi();

//   // Fetch franchise
//   useEffect(() => {
//   if (!token || role !== "franchise_head") return;

//   const fetchFranchise = async () => {
//     try {
//       const res = await api.get("franchise/");
      
//       console.log("Franchise API response:", res.data); // 👈 ADD THIS

//       if (Array.isArray(res.data) && res.data.length > 0) {
//         setFranchiseName(res.data[0].name);
//       }
//     } catch (err) {
//       console.error("Error fetching franchise:", err);
//     }
//   };

//   fetchFranchise();
// }, [token, role]);



//   // Fetch staff
//   useEffect(() => {
//     if (role !== "franchise_head" || !franchiseName) return;

//     const fetchStaff = async () => {
//       try {
//         const res = await api.get(`staff/?branch=${franchiseName}`);
//         setStaff(Array.isArray(res.data) ? res.data : []);
//       } catch (err) {
//         console.error("Error fetching staff:", err);
//       }
//     };
//     fetchStaff();
//   }, [franchiseName, role, api]);

//   // Fetch attendance for selected date
//   useEffect(() => {
//     if (role !== "franchise_head" || !franchiseName) return;

//     const fetchAttendance = async () => {
//       try {
//         const res = await api.get(
//           `attendance/staff-attendance/?date=${date}&branch=${franchiseName}`
//         );
//         const data = Array.isArray(res.data) ? res.data : [];
//         setMarkedAttendance(data);

//         const updatedAttendance = {};
//         data.forEach((a) => {
//           updatedAttendance[a.staff] = {
//             status: a.status,
//             inTime: a.in_time,
//             outTime: a.out_time,
//           };
//         });
//         setAttendance(updatedAttendance);
//       } catch (err) {
//         console.error("Error fetching attendance:", err);
//       }
//     };
//     fetchAttendance();
//   }, [date, franchiseName, role, api]);

//   // Handle input changes
//   const handleTimeChange = (staffId, field, value) => {
//     setAttendance((prev) => ({
//       ...prev,
//       [staffId]: { ...prev[staffId], [field]: value },
//     }));
//   };

//   // Convert 12hr time input to 24hr before sending to backend
//   const convertTo24Hour = (time12h) => {
//     if (!time12h) return null;
//     const [time, modifier] = time12h.split(" ");
//     let [hours, minutes] = time.split(":");
//     if (modifier === "PM" && hours !== "12") hours = String(+hours + 12);
//     if (modifier === "AM" && hours === "12") hours = "00";
//     return `${hours}:${minutes}`;
//   };

//   // Mark attendance
//   const markAttendance = async (staffId, status) => {
//     let inTime = attendance[staffId]?.inTime || "";
//     let outTime = attendance[staffId]?.outTime || "";

//     if (attendance[staffId]?.status) return; // already marked

//     if (status === "Absent") {
//       // Clear times for Absent
//       inTime = "";
//       outTime = "";
//     } else {
//       // Validate times for Present/Half Day/WFH
//       if (!inTime || !outTime) {
//         alert("Please select both In Time and Out Time before marking attendance.");
//         return;
//       }
//     }

//     const record = {
//       staff: staffId,
//       date,
//       in_time: convertTo24Hour(inTime),
//       out_time: convertTo24Hour(outTime),
//       status,
//       branch: franchiseName,
//     };

//     try {
//       await api.post("attendance/staff-attendance/", [record]);
//       setAttendance((prev) => ({
//         ...prev,
//         [staffId]: { ...prev[staffId], status, inTime, outTime },
//       }));
//       setMarkedAttendance((prev) => [...prev, record]);
//     } catch (err) {
//       console.error("Error saving attendance:", err);
//       alert("Error saving attendance: " + JSON.stringify(err.response?.data || err));
//     }
//   };

//   // Fetch monthly summary
//   const fetchMonthlySummary = async () => {
//     try {
//       const month = new Date(date).getMonth() + 1;
//       const res = await api.get(
//         `attendance/monthly-summary/?month=${month}&branch=${franchiseName}`
//       );
//       const data = Array.isArray(res.data) ? res.data : [];

//       const mappedData = data
//         .filter((s) => staff.some((st) => st.id === s.staff__id))
//         .map((s) => ({ ...s, branch: franchiseName }));

//       setMonthlySummary(mappedData);
//       setShowMonthlySummary(true);
//     } catch (err) {
//       console.error("Error fetching monthly summary:", err);
//     }
//   };

//   if (role !== "franchise_head") {
//     return (
//       <div className="p-6 text-red-600 font-bold">
//         Unauthorized: Only franchise head can mark attendance
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 max-w-7xl mx-auto space-y-6">
//       <h2 className="text-3xl font-bold mb-6 text-gray-800">
//         Staff Attendance - {franchiseName}
//       </h2>

//       {/* Controls */}
//       <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow-md border border-gray-200">
//         <div className="flex items-center gap-2">
//           <label className="font-medium">Date:</label>
//           <input
//             type="date"
//             value={date}
//             onChange={(e) => setDate(e.target.value)}
//             className="border px-3 py-2 rounded shadow-sm focus:ring-2 focus:ring-blue-400 transition"
//             max={today} // disallow future
//             min={today} // disallow past
//           />
//         </div>
//         <button
//           onClick={fetchMonthlySummary}
//           className="mt-2 sm:mt-0 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow transition"
//         >
//           View Monthly Attendance
//         </button>
//       </div>

//       {/* Daily Attendance Table */}
//       {!showMonthlySummary && (
//         <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50 sticky top-0">
//               <tr>
//                 {["Name", "In Time", "Out Time", "Mark Attendance", "Status"].map(
//                   (h) => (
//                     <th
//                       key={h}
//                       className="px-4 py-3 text-left text-gray-700 font-semibold"
//                     >
//                       {h}
//                     </th>
//                   )
//                 )}
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-100">
//               {staff.map((s) => (
//                 <tr key={s.id} className="hover:bg-gray-50 transition">
//                   <td className="px-4 py-2 font-medium">{s.name}</td>
//                   <td className="px-4 py-2">
//                     <input
//                       type="time"
//                       value={attendance[s.id]?.inTime || ""}
//                       onChange={(e) =>
//                         handleTimeChange(s.id, "inTime", e.target.value)
//                       }
//                       className="border px-2 py-1 rounded w-full"
//                       step="900"
//                       disabled={!!attendance[s.id]?.status}
//                     />
//                   </td>
//                   <td className="px-4 py-2">
//                     <input
//                       type="time"
//                       value={attendance[s.id]?.outTime || ""}
//                       onChange={(e) =>
//                         handleTimeChange(s.id, "outTime", e.target.value)
//                       }
//                       className="border px-2 py-1 rounded w-full"
//                       step="900"
//                       disabled={!!attendance[s.id]?.status}
//                     />
//                   </td>
//                   <td className="px-4 py-2 flex gap-2 flex-wrap">
//                     {["Present", "Absent", "Half Day", "WFH"].map((status) => (
//                       <button
//                         key={status}
//                         onClick={() => markAttendance(s.id, status)}
//                         className={`px-3 py-1 rounded font-medium transition ${
//                           attendance[s.id]?.status === status
//                             ? "bg-green-500 text-white"
//                             : "bg-gray-200 hover:bg-gray-300"
//                         }`}
//                         disabled={!!attendance[s.id]?.status}
//                       >
//                         {status}
//                       </button>
//                     ))}
//                   </td>
//                   <td className="px-4 py-2 font-semibold text-blue-600">
//                     {attendance[s.id]?.status || "-"}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Monthly Summary Table */}
//       {showMonthlySummary && (
//         <div className="mt-6 bg-white rounded-lg shadow-md border border-gray-200 p-4">
//           <h3 className="text-xl font-semibold mb-4">
//             Monthly Attendance Summary
//           </h3>
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50 sticky top-0">
//                 <tr>
//                   {["Staff", "Branch", "Present", "Absent", "Half Day", "WFH"].map(
//                     (h) => (
//                       <th
//                         key={h}
//                         className="px-4 py-3 text-left text-gray-700 font-semibold"
//                       >
//                         {h}
//                       </th>
//                     )
//                   )}
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-100">
//                 {monthlySummary.map((s) => (
//                   <tr key={s.staff__id} className="hover:bg-gray-50 transition">
//                     <td className="px-4 py-2 font-medium">{s.staff__name}</td>
//                     <td className="px-4 py-2">{s.branch}</td>
//                     <td className="px-4 py-2 text-green-600 font-semibold">{s.present}</td>
//                     <td className="px-4 py-2 text-red-600 font-semibold">{s.absent}</td>
//                     <td className="px-4 py-2 text-yellow-600 font-semibold">{s.half_day}</td>
//                     <td className="px-4 py-2 text-blue-600 font-semibold">{s.wfh}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//           <button
//             onClick={() => setShowMonthlySummary(false)}
//             className="mt-4 px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded shadow transition"
//           >
//             Back to Daily Attendance
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default StaffAttendance;

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getApi } from "@/utils/api";

// Status Badge for attendance
const AttendanceBadge = ({ status }) => {
  let colorClass = "bg-gray-300 text-gray-700";
  if (status === "Present") colorClass = "bg-green-600 text-white";
  else if (status === "Absent") colorClass = "bg-red-600 text-white";
  else if (status === "Half Day") colorClass = "bg-yellow-500 text-white";
  else if (status === "WFH") colorClass = "bg-blue-600 text-white";

  return (
    <Badge className={`px-2 py-1 rounded ${colorClass}`}>{status}</Badge>
  );
};

export default function StaffAttendance() {
  const [role, setRole] = useState("");
  const [token, setToken] = useState("");
  const [franchise, setFranchise] = useState(null);
  const [staff, setStaff] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);

  const api = getApi();

  // Read token and role from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    const storedRole = localStorage.getItem("role");

    if (!storedToken || !storedRole) {
      console.warn("No token or role found");
      return;
    }

    setToken(storedToken);
    setRole(storedRole);
  }, []);

  // Fetch franchise
  useEffect(() => {
    if (role !== "franchise_head") return;

    const fetchFranchise = async () => {
      try {
        const res = await api.get("franchise/");
        console.log("Franchise API:", res.data);

        if (Array.isArray(res.data) && res.data.length > 0) {
          setFranchise(res.data[0]);
        }
      } catch (err) {
        console.error("Error fetching franchise:", err);
      }
    };

    fetchFranchise();
  }, [role]);

  // Fetch staff
  useEffect(() => {
    if (!franchise) return;

    const fetchStaff = async () => {
      setLoading(true);
      try {
        const res = await api.get(`staff/?branch=${franchise.name}`);
        console.log("Staff API:", res.data);
        setStaff(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching staff:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [franchise]);

  // Fetch attendance
  useEffect(() => {
    if (!franchise) return;

    const fetchAttendance = async () => {
      try {
        const res = await api.get(
          `attendance/staff-attendance/?date=${date}&branch=${franchise.name}`
        );
        console.log("Attendance API:", res.data);

        const mapped = {};
        if (Array.isArray(res.data)) {
          res.data.forEach((a) => {
            mapped[a.staff] = { status: a.status };
          });
        }
        setAttendance(mapped);
      } catch (err) {
        console.error("Error fetching attendance:", err);
      }
    };

    fetchAttendance();
  }, [franchise, date]);

  // Mark attendance
  const markAttendance = async (staffId, status) => {
    if (!franchise) return;

    const record = {
      staff: staffId,
      date,
      status,
      branch: franchise.name,
    };

    try {
      await api.post("attendance/staff-attendance/", [record]);
      setAttendance((prev) => ({
        ...prev,
        [staffId]: { status },
      }));
    } catch (err) {
      console.error("Error marking attendance:", err);
      alert("Error marking attendance: " + JSON.stringify(err.response?.data || err));
    }
  };

  if (role !== "franchise_head") {
    return (
      <div className="p-6 text-red-600 font-bold">
        Unauthorized: Only franchise head can view attendance
      </div>
    );
  }

  if (loading) return <div className="p-6">Loading staff...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">
        Staff Attendance – {franchise ? franchise.name : "-"}
      </h2>

      {/* Date selector */}
      <div className="mb-4 flex items-center gap-2">
        <label className="font-medium">Date:</label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={new Date().toISOString().split("T")[0]}
        />
      </div>

      {/* Staff Attendance Table */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Staff List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full text-sm divide-y">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="py-2 px-2 text-left">Name</th>
                  <th className="py-2 px-2 text-left">Mark Attendance</th>
                  <th className="py-2 px-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {staff.length > 0 ? (
                  staff.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="py-2 px-2">{s.name}</td>
                      <td className="py-2 px-2 space-x-2">
                        {["Present", "Absent", "Half Day", "WFH"].map((st) => (
                          <Button
                            key={st}
                            onClick={() => markAttendance(s.id, st)}
                            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            {st}
                          </Button>
                        ))}
                      </td>
                      <td className="py-2 px-2">
                        <AttendanceBadge status={attendance[s.id]?.status || "-"} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center py-6 text-gray-500">
                      No staff found for this franchise
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
