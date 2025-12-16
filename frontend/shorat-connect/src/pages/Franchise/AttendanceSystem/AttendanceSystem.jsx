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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

// ===================== API Helper =====================
const getApi = () => {
  const token = localStorage.getItem("access_token");
  return axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api/`,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

// ===================== Staff Dialog =====================
const StaffDialog = ({ open, onClose, onSubmit, staffData, franchises }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    salary: "",
    franchise: franchises?.[0]?.id || "",
    status: "Active",
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (staffData) {
      setFormData({
        name: staffData.name || "",
        email: staffData.email?.toLowerCase() || "",
        password: "",
        phone: staffData.phone || "",
        salary: staffData.salary || "",
        franchise: staffData.franchise || franchises?.[0]?.id || "",
        status: staffData.status || "Active",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        salary: "",
        franchise: franchises?.[0]?.id || "",
        status: "Active",
      });
    }
  }, [staffData, franchises, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "");
      setFormData({ ...formData, [name]: digitsOnly });
    } else if (name === "email") {
      setFormData({ ...formData, [name]: value.toLowerCase() });
    } else if (name === "name") {
      // Only letters and spaces allowed
      const cleanName = value.replace(/[^A-Za-z ]/g, "");
      setFormData({ ...formData, [name]: cleanName });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async () => {
    const { name, email, password, phone, salary, franchise, status } = formData;

    // Required fields
    const requiredFields = ["name", "email", "phone", "salary", "franchise", "status"];
    for (let field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === "") {
        alert(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return;
      }
    }

    // Name validation
    if (name.length > 50) {
      alert("Name cannot exceed 50 characters");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Invalid email address");
      return;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      alert("Phone number must be exactly 10 digits");
      return;
    }

    // Salary validation
    if (isNaN(salary) || Number(salary) <= 0 || salary.toString().length > 9) {
      alert("Salary must be a positive number with max 9 digits");
      return;
    }

    // Password validation (new or changed)
    if (!staffData || password.trim() !== "") {
      if (password.length !== 6) {
        alert("Password must be exactly 6 characters long");
        return;
      }
      if (password[0] !== password[0].toUpperCase()) {
        alert("Password must start with an uppercase letter");
        return;
      }
    }

    try {
      const payload = {
        ...formData,
        franchise: Number(franchise),
        salary: Number(salary),
        role: "Staff",
      };

      if (staffData && !password.trim()) delete payload.password;

      await onSubmit(payload);

      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        salary: "",
        franchise: franchises?.[0]?.id || "",
        status: "Active",
      });

      onClose();
    } catch (error) {
      console.error("Error submitting staff:", error);
      if (error.response) {
        alert("Backend error:\n" + JSON.stringify(error.response.data, null, 2));
      }
    }
  };

  if (!franchises.length) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{staffData ? "Edit Staff" : "Add Staff"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
          <div>
            <Label>Name</Label>
            <Input name="name" value={formData.name} onChange={handleChange} autoComplete="off" placeholder="Letters and spaces only" />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" name="email" value={formData.email} onChange={handleChange} autoComplete="off" placeholder="example@mail.com" />
          </div>
<div className="relative">
  <Label>Password</Label>
  <Input
    type={showPassword ? "text" : "password"}
    name="password"
    value={formData.password}
    onChange={handleChange}
    autoComplete="new-password"
    placeholder={staffData ? "Leave blank to keep current password" : "6 chars, first uppercase"}
    className="pr-10 h-10" // Set a fixed height
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-2 inset-y-0 flex items-center justify-center text-gray-500 mt-5"
  >
    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
  </button>
</div>




          <div>
            <Label>Phone</Label>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="off"
              maxLength={10}
              placeholder="10 digits only"
            />
          </div>
          <div>
            <Label>Salary</Label>
            <Input type="number" name="salary" value={formData.salary} onChange={handleChange} placeholder="Positive number" />
          </div>
          <div>
            <Label>Status</Label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full border rounded-md p-2">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div>
            <Label>Franchise</Label>
            <select name="franchise" value={formData.franchise} onChange={handleChange} className="w-full border rounded-md p-2">
              {franchises.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 justify-end mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>{staffData ? "Update Staff" : "Add Staff"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ===================== Staff Management =====================
const StaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [franchises, setFranchises] = useState([]);

  const api = getApi();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fRes, sRes] = await Promise.all([
          api.get("franchise/"),
          api.get("staff/"),
        ]);
        setFranchises(fRes.data);
        setStaffList(sRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to fetch data. Are you logged in?");
      }
    };
    fetchData();
  }, []);

  const handleAddStaff = async (staffData) => {
    const res = await api.post("staff/", staffData);
    setStaffList((prev) => [...prev, res.data]);
    return res.data;
  };

  const handleUpdateStaff = async (staffData) => {
    const res = await api.put(`staff/${editingStaff.id}/`, staffData);
    setStaffList((prev) => prev.map((s) => (s.id === editingStaff.id ? res.data : s)));
    setEditingStaff(null);
  };

  const handleDeleteStaff = async (staff) => {
    if (!window.confirm(`Are you sure you want to delete ${staff.name}?`)) return;
    await api.delete(`staff/${staff.id}/`);
    setStaffList((prev) => prev.filter((s) => s.id !== staff.id));
  };

  const filteredStaff = staffList.filter((staff) => {
    const matchesStatus = statusFilter === "All" || staff.status === statusFilter;
    const matchesSearch = staff.name.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <Card className="p-4 shadow-lg w-full">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <CardTitle className="text-3xl font-bold">Staff Management</CardTitle>
        <Button onClick={() => { setEditingStaff(null); setDialogOpen(true); }}>
          + Add Staff
        </Button>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-4 items-start sm:items-center">
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm w-full sm:w-auto"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-lg table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Phone</th>
                <th className="p-2 text-left">Salary</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Franchise</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((staff) => (
                <tr key={staff.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{staff.name}</td>
                  <td className="p-2">{staff.phone}</td>
                  <td className="p-2">₹{staff.salary}</td>
                  <td className="p-2">
                    <Badge className={staff.status === "Active" ? "bg-green-500" : "bg-red-500"}>
                      {staff.status}
                    </Badge>
                  </td>
                  <td className="p-2">{staff.franchise_name || staff.franchise?.name || ""}</td>
                  <td className="p-2 flex flex-col sm:flex-row gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setEditingStaff(staff); setDialogOpen(true); }}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteStaff(staff)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      <StaffDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={editingStaff ? handleUpdateStaff : handleAddStaff}
        staffData={editingStaff}
        franchises={franchises}
      />
    </Card>
  );
};

export default StaffManagement;
