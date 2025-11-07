// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import {
// Card,
// CardContent,
// CardDescription,
// CardHeader,
// CardTitle,
// } from "@/components/ui/card";
// import {
// Table,
// TableBody,
// TableCell,
// TableHead,
// TableHeader,
// TableRow,
// } from "@/components/ui/table";
// import { Input } from "@/components/ui/input";
// import {
// Dialog,
// DialogContent,
// DialogHeader,
// DialogTitle,
// DialogFooter,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import {
// Select,
// SelectContent,
// SelectItem,
// SelectTrigger,
// SelectValue,
// } from "@/components/ui/select";
// import { getApi } from "@/utils/api";
// import { Eye, EyeOff } from "lucide-react";

// export default function FranchiseManagementWrapper() {
// const [activePage, setActivePage] = useState({
// page: "franchise",
// franchise: null,
// });

// return (
// <>
// {activePage.page === "franchise" && ( <FranchiseManagement setActivePage={setActivePage} />
// )}
// </>
// );
// }

// function FranchiseManagement({ setActivePage }) {
// const [search, setSearch] = useState("");
// const [statusFilter, setStatusFilter] = useState("All");
// const [selectedFranchise, setSelectedFranchise] = useState(null);
// const [open, setOpen] = useState(false);
// const [showPassword, setShowPassword] = useState(false);

// // Form State
// const [name, setName] = useState("");
// const [location, setLocation] = useState("");
// const [startDate, setStartDate] = useState("");
// const [status, setStatus] = useState("");
// const [email, setEmail] = useState("");
// const [password, setPassword] = useState("");

// // Backend data
// const [franchises, setFranchises] = useState([]);

// // Fetch franchises
// const fetchFranchises = async () => {
// try {
// const api = getApi();
// const res = await api.get("add-franchise/franchise/");
// setFranchises(res.data.results || res.data || []);
// } catch (err) {
// console.error("Fetch error:", err);
// setFranchises([]);
// }
// };

// useEffect(() => {
// fetchFranchises();
// }, []);

// // Save or Update franchise
// const handleSave = async () => {
// const nameRegex = /^(?=.*[A-Za-z])[A-Za-z0-9]+$/;
// const locationRegex = /^(?=.*[A-Za-z])[A-Za-z0-9\s,.'-]+$/;
// const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,}$/;
// const passwordRegex = /^[A-Za-z0-9]{6,}$/;


// // ✅ Validation
// if (!nameRegex.test(name)) {
//   alert(
//     "Franchise Name must contain at least one letter and can only include letters and numbers (no spaces or special characters)."
//   );
//   return;
// }

// if (!emailRegex.test(email)) {
//   alert("Enter a valid email address in lowercase only.");
//   return;
// }

// if (!location) {
//   alert("Location is required.");
//   return;
// }

// if (!locationRegex.test(location)) {
//   alert(
//     "Location must contain at least one letter and can include letters, numbers, spaces, commas, periods, hyphens, and apostrophes."
//   );
//   return;
// }

// if (!startDate) {
//   alert("Start Date is required.");
//   return;
// }

// if (!status) {
//   alert("Status is required.");
//   return;
// }

// // ✅ Password validation (only when adding or changing password)
// if (!selectedFranchise || password) {
//   if (!password) {
//     alert("Password is required for new franchise.");
//     return;
//   }

//   if (!/^[A-Z]/.test(password)) {
//     alert("First letter of password must be uppercase.");
//     return;
//   }

//   if (!passwordRegex.test(password)) {
//     alert(
//       "Password must be at least 6 characters long and contain only letters and numbers (no spaces)."
//     );
//     return;
//   }
// }

// try {
//   const api = getApi();

//   if (!selectedFranchise) {
//     // Create new franchise
//     const payload = {
//       name,
//       location,
//       email: email.toLowerCase(),
//       password: password || "123456",
//       start_date: startDate,
//       status,
//     };

//     const res = await api.post("add-franchise/franchise/", payload);
//     if (res.data?.id) setFranchises([res.data, ...franchises]);
//     else await fetchFranchises();

//     alert(
//       `Franchise added successfully! Default password: ${
//         password || "123456"
//       }`
//     );
//   } else {
//     // Update existing
//     const payload = {
//       name,
//       location,
//       start_date: startDate,
//       status,
//     };
//     if (email && email !== selectedFranchise.email)
//       payload.email = email.toLowerCase();
//     if (password) payload.password = password;

//     await api.patch(
//       `add-franchise/franchise/${encodeURIComponent(
//         selectedFranchise.name
//       )}/`,
//       payload
//     );
//     await fetchFranchises();
//     alert("Franchise updated successfully!");
//   }

//   // Reset form
//   setName("");
//   setLocation("");
//   setEmail("");
//   setPassword("");
//   setStartDate("");
//   setStatus("");
//   setSelectedFranchise(null);
//   setOpen(false);
//   setShowPassword(false);
// } catch (err) {
//   console.error("Save error:", err.response?.data || err.message);
//   const errorMsg =
//     err.response?.data?.email ||
//     err.response?.data?.detail ||
//     "An error occurred while saving. Please check the data and try again.";
//   alert(errorMsg);
// }


// };

// const handleDelete = async (name) => {
// if (window.confirm("Are you sure you want to delete this franchise?")) {
// try {
// const api = getApi();
// await api.delete(`add-franchise/franchise/${encodeURIComponent(name)}/`);
// setFranchises((prev) => prev.filter((f) => f.name !== name));
// if (selectedFranchise?.name === name) setSelectedFranchise(null);
// } catch (err) {
// console.error("Delete error:", err.response?.data || err.message);
// alert(err.response?.data?.detail || "Failed to delete franchise.");
// }
// }
// };

// const handleToggleStatus = async (franchise) => {
// const updatedStatus = franchise.status === "active" ? "inactive" : "active";
// try {
// const api = getApi();
// await api.patch(
// `add-franchise/franchise/${encodeURIComponent(franchise.name)}/`,
// { status: updatedStatus }
// );
// setFranchises((prev) =>
// prev.map((f) =>
// f.id === franchise.id ? { ...f, status: updatedStatus } : f
// )
// );
// } catch (err) {
// console.error("Status toggle error:", err);
// }
// };

// const filteredFranchises = franchises.filter((f) => {
// const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
// const matchesStatus =
// statusFilter === "All" || f.status === statusFilter.toLowerCase();
// return matchesSearch && matchesStatus;
// });

// return ( <div className="p-4 md:p-6"> <h1 className="text-3xl font-bold mb-4 text-left">Franchise Management</h1>

// ```
//   {/* Stats */}
//   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
//     <Card>
//       <CardHeader>
//         <CardTitle>Total Franchises</CardTitle>
//         <CardDescription>All registered franchises</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <p className="text-2xl font-bold">{franchises.length}</p>
//       </CardContent>
//     </Card>

//     <Card>
//       <CardHeader>
//         <CardTitle>Active</CardTitle>
//         <CardDescription>Currently running</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <p className="text-2xl font-bold">
//           {franchises.filter((f) => f.status === "active").length}
//         </p>
//       </CardContent>
//     </Card>

//     <Card>
//       <CardHeader>
//         <CardTitle>Inactive</CardTitle>
//         <CardDescription>Not in operation</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <p className="text-2xl font-bold">
//           {franchises.filter((f) => f.status === "inactive").length}
//         </p>
//       </CardContent>
//     </Card>
//   </div>

//   {/* Search & Filter */}
//   <div className="flex flex-col md:flex-row gap-3 mb-4">
//     <Input
//       placeholder="Search franchise..."
//       value={search}
//       onChange={(e) => setSearch(e.target.value)}
//       className="w-full md:w-1/3"
//     />
//     <select
//       value={statusFilter}
//       onChange={(e) => setStatusFilter(e.target.value)}
//       className="border rounded px-3 py-2 w-full md:w-auto"
//     >
//       <option value="All">All</option>
//       <option value="active">Active</option>
//       <option value="inactive">Inactive</option>
//     </select>
//     <Button
//       className="bg-red-600 text-white hover:bg-red-500 w-full md:w-auto md:ml-auto"
//       onClick={() => {
//         setOpen(true);
//         setSelectedFranchise(null);
//         setName("");
//         setLocation("");
//         setStartDate("");
//         setStatus("");
//         setEmail("");
//         setPassword("");
//       }}
//     >
//       + Add Franchise
//     </Button>
//   </div>

//   {/* Table */}
//   <div className="overflow-x-auto">
//     <Table className="min-w-full">
//       <TableHeader>
//         <TableRow>
//           <TableHead>Name</TableHead>
//           <TableHead>Location</TableHead>
//           <TableHead>Start Date</TableHead>
//           <TableHead>Status</TableHead>
//           <TableHead>Action</TableHead>
//         </TableRow>
//       </TableHeader>
//       <TableBody>
//         {filteredFranchises.map((f) => (
//           <TableRow key={f.id || f.name}>
//             <TableCell>{f.name}</TableCell>
//             <TableCell>{f.location}</TableCell>
//             <TableCell>{f.start_date}</TableCell>
//             <TableCell>
//               <span
//                 onClick={() => handleToggleStatus(f)}
//                 className={`px-2 py-1 text-xs rounded-full cursor-pointer ${
//                   f.status === "active"
//                     ? "bg-green-100 text-green-700"
//                     : "bg-gray-200 text-gray-600"
//                 }`}
//               >
//                 {f.status}
//               </span>
//             </TableCell>
//             <TableCell className="flex flex-col sm:flex-row gap-2">
//               <Button
//                 size="sm"
//                 className="bg-blue-500 hover:bg-blue-600 text-white"
//                 onClick={() => {
//                   setSelectedFranchise(f);
//                   setName(f.name);
//                   setEmail(f.user_email || f.email || "");
//                   setPassword("");
//                   setLocation(f.location);
//                   setStartDate(f.start_date);
//                   setStatus(f.status);
//                   setOpen(true);
//                 }}
//               >
//                 Edit
//               </Button>
//               <Button
//                 size="sm"
//                 className="bg-red-600 hover:bg-red-500 text-white"
//                 onClick={() => handleDelete(f.name)}
//               >
//                 Delete
//               </Button>
//             </TableCell>
//           </TableRow>
//         ))}
//       </TableBody>
//     </Table>
//   </div>

//   {/* Modal */}
//   <Dialog open={open} onOpenChange={setOpen}>
//     <DialogContent className="sm:max-w-lg">
//       <DialogHeader>
//         <DialogTitle>
//           {selectedFranchise ? "Edit Franchise" : "Add Franchise"}
//         </DialogTitle>
//       </DialogHeader>

//       <form
//         className="space-y-2"
//         onSubmit={(e) => {
//           e.preventDefault();
//           handleSave();
//         }}
//       >
//         <div>
//           <Label>Franchise Name</Label>
//           <Input
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             placeholder="Enter name"
//             required
//           />
//         </div>

//         <div>
//           <Label>Email</Label>
//           <Input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             placeholder="Enter email"
//             required
//           />
//         </div>

//         <div className="relative">
//           <Label>Password</Label>
//           <div className="relative">
//             <Input
//               type={showPassword ? "text" : "password"}
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder={
//                 selectedFranchise
//                   ? "Leave blank to keep current password"
//                   : "Enter password (leave blank for default: 123456)"
//               }
//               className="pr-10"
//             />
//             <span
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute inset-y-0 right-2 flex items-center cursor-pointer text-gray-500 hover:text-gray-700"
//             >
//               {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//             </span>
//           </div>
//         </div>

//         <div>
//           <Label>Location</Label>
//           <Input
//             value={location}
//             onChange={(e) => setLocation(e.target.value)}
//             placeholder="Enter location"
//             required
//           />
//         </div>

//         <div>
//           <Label>Start Date</Label>
//           <Input
//             type="date"
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//             required
//           />
//         </div>

//         <div>
//           <Label>Status</Label>
//           <Select value={status} onValueChange={setStatus}>
//             <SelectTrigger>
//               <SelectValue placeholder="Select status" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="active">Active</SelectItem>
//               <SelectItem value="inactive">Inactive</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         <DialogFooter>
//           <Button
//             type="button"
//             variant="outline"
//             onClick={() => setOpen(false)}
//           >
//             Cancel
//           </Button>
//           <Button type="submit" className="bg-green-600 text-white">
//             Save
//           </Button>
//         </DialogFooter>
//       </form>
//     </DialogContent>
//   </Dialog>
// </div>


// );
// }
import React, { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL; // Your backend URL

const FranchiseManagement = () => {
  const [franchises, setFranchises] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const [newFranchise, setNewFranchise] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
    start_date: "",
    status: "active",
  });

  const [editFranchise, setEditFranchise] = useState({
    id: null,
    name: "",
    email: "",
    password: "",
    location: "",
    start_date: "",
    status: "active",
  });

  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("role"); // "admin" or "franchise_head"

  // Fetch franchises
  useEffect(() => {
    const fetchFranchises = async () => {
      try {
        const response = await fetch(`${API_BASE}/add-franchise/franchise/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        const arr = Array.isArray(data.results)
          ? data.results
          : Array.isArray(data)
          ? data
          : [];
        setFranchises(arr);
      } catch (error) {
        console.error("Error fetching franchises:", error);
        setFranchises([]);
      }
    };
    fetchFranchises();
  }, [token]);

  // Add franchise
  const handleAddFranchise = async () => {
    if (role !== "admin") return;
    const { name, email, password, location, start_date, status } = newFranchise;
    if (!name || !email || !password || !location || !start_date || !status) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/add-franchise/franchise/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newFranchise),
      });
      if (!response.ok) throw new Error("Failed to add franchise");
      const saved = await response.json();
      setFranchises((prev) => [...prev, saved]);
      setShowAddModal(false);
      setNewFranchise({
        name: "",
        email: "",
        password: "",
        location: "",
        start_date: "",
        status: "active",
      });
    } catch (error) {
      console.error(error);
      alert("Failed to add franchise!");
    }
  };

  // Delete franchise
  const handleDelete = async (index) => {
    if (role !== "admin") return;
    if (!window.confirm("Are you sure you want to delete this franchise?")) return;

    try {
      const franchise = franchises[index];
      const response = await fetch(
        `${API_BASE}/add-franchise/franchise/${encodeURIComponent(franchise.name)}/`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to delete franchise");
      setFranchises(franchises.filter((_, i) => i !== index));
    } catch (error) {
      console.error(error);
      alert("Failed to delete franchise!");
    }
  };

  // Edit franchise
  const handleEdit = (index) => {
    if (role !== "admin") return;
    setEditIndex(index);
    setEditFranchise({ ...franchises[index] });
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    if (role !== "admin") return;
    try {
      const response = await fetch(
        `${API_BASE}/add-franchise/franchise/${encodeURIComponent(editFranchise.name)}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editFranchise),
        }
      );
      if (!response.ok) throw new Error("Failed to update franchise");
      const updated = await response.json();
      const updatedFranchises = [...franchises];
      updatedFranchises[editIndex] = updated;
      setFranchises(updatedFranchises);
      setShowEditModal(false);
    } catch (error) {
      console.error(error);
      alert("Failed to update franchise!");
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-3xl font-bold mb-4">Franchise Management</h1>

      {/* Add Button */}
      {role === "admin" && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            + Add Franchise
          </button>
        </div>
      )}

      {/* Table Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-200 text-sm sm:text-base">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Location</th>
              <th className="border px-4 py-2">Start Date</th>
              <th className="border px-4 py-2">Status</th>
              {role === "admin" && <th className="border px-4 py-2">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {franchises.length > 0 ? (
              franchises.map((f, index) => (
                <tr key={f.id || index} className="text-center">
                  <td className="border px-4 py-2">{f.name}</td>
                  <td className="border px-4 py-2">{f.email}</td>
                  <td className="border px-4 py-2">{f.location}</td>
                  <td className="border px-4 py-2">{f.start_date}</td>
                  <td className="border px-4 py-2">{f.status}</td>
                  {role === "admin" && (
                    <td className="border px-4 py-2 flex gap-2 justify-center">
                      <button
                        onClick={() => handleEdit(index)}
                        className="text-blue-600 underline hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={role === "admin" ? 6 : 5}
                  className="text-center p-4 text-gray-500"
                >
                  No franchises found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {franchises.length > 0 ? (
          franchises.map((f, index) => (
            <div
              key={f.id || index}
              className="border rounded-lg p-4 shadow-sm bg-white"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold">{f.name}</h2>
                {role === "admin" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(index)}
                      className="text-blue-600 underline hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <p>Email: {f.email}</p>
              <p>Location: {f.location}</p>
              <p>Start Date: {f.start_date}</p>
              <p>Status: {f.status}</p>
            </div>
          ))
        ) : (
          <p className="text-center p-4 text-gray-500">No franchises found.</p>
        )}
      </div>

      {/* Add Franchise Modal */}
      {showAddModal && role === "admin" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Franchise</h2>
            <input
              type="text"
              placeholder="Name"
              value={newFranchise.name}
              onChange={(e) =>
                setNewFranchise({ ...newFranchise, name: e.target.value })
              }
              className="border w-full p-2 mb-3 rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={newFranchise.email}
              onChange={(e) =>
                setNewFranchise({ ...newFranchise, email: e.target.value })
              }
              className="border w-full p-2 mb-3 rounded"
            />
            <input
              type="password"
              placeholder="Password"
              value={newFranchise.password}
              onChange={(e) =>
                setNewFranchise({ ...newFranchise, password: e.target.value })
              }
              className="border w-full p-2 mb-3 rounded"
            />
            <input
              type="text"
              placeholder="Location"
              value={newFranchise.location}
              onChange={(e) =>
                setNewFranchise({ ...newFranchise, location: e.target.value })
              }
              className="border w-full p-2 mb-3 rounded"
            />
            <input
              type="date"
              placeholder="Start Date"
              value={newFranchise.start_date}
              onChange={(e) =>
                setNewFranchise({ ...newFranchise, start_date: e.target.value })
              }
              className="border w-full p-2 mb-3 rounded"
            />
            <select
              value={newFranchise.status}
              onChange={(e) =>
                setNewFranchise({ ...newFranchise, status: e.target.value })
              }
              className="border w-full p-2 mb-3 rounded"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFranchise}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Franchise Modal */}
      {showEditModal && role === "admin" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Franchise</h2>
            <input
              type="text"
              placeholder="Name"
              value={editFranchise.name}
              onChange={(e) =>
                setEditFranchise({ ...editFranchise, name: e.target.value })
              }
              className="border w-full p-2 mb-3 rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={editFranchise.email}
              onChange={(e) =>
                setEditFranchise({ ...editFranchise, email: e.target.value })
              }
              className="border w-full p-2 mb-3 rounded"
            />
            <input
              type="password"
              placeholder="Password (leave blank to keep)"
              value={editFranchise.password}
              onChange={(e) =>
                setEditFranchise({ ...editFranchise, password: e.target.value })
              }
              className="border w-full p-2 mb-3 rounded"
            />
            <input
              type="text"
              placeholder="Location"
              value={editFranchise.location}
              onChange={(e) =>
                setEditFranchise({ ...editFranchise, location: e.target.value })
              }
              className="border w-full p-2 mb-3 rounded"
            />
            <input
              type="date"
              placeholder="Start Date"
              value={editFranchise.start_date}
              onChange={(e) =>
                setEditFranchise({ ...editFranchise, start_date: e.target.value })
              }
              className="border w-full p-2 mb-3 rounded"
            />
            <select
              value={editFranchise.status}
              onChange={(e) =>
                setEditFranchise({ ...editFranchise, status: e.target.value })
              }
              className="border w-full p-2 mb-3 rounded"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FranchiseManagement;
