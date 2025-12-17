import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, ShieldCheck, UserX } from "lucide-react";// Users = total, ShieldCheck = active, Slash = inactive
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getApi } from "@/utils/api";



// Status Badge
const StatusBadge = ({ status }) => (
  <Badge
    variant={status === "Active" ? "default" : "secondary"}
    className={
      status === "Active"
        ? "bg-green-600 hover:bg-green-600"
        : "bg-gray-400 hover:bg-gray-400"
    }
  >
    {status}
  </Badge>
);

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: "",
    phone: "",
    salary: "",
    status: "Active",
    franchise: "",
  });

  const api = getApi();

  // Fetch staff
  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await api.get("staff/");
      setStaff(res.data);
    } catch (err) {
      console.error("Error fetching staff:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenAddStaff = () => {
    setNewStaff({
      name: "",
      phone: "",
      salary: "",
      status: "Active",
      franchise: "",
    });
    setOpen(true);
  };

  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("staff/", newStaff);
      setOpen(false);
      fetchStaff();
    } catch (err) {
      console.error("Failed to add staff:", err.response?.data || err);
      alert("Failed to add staff: " + JSON.stringify(err.response?.data || err));
    }
  };

  const filteredStaff = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const totals = {
    total: staff.length,
    active: staff.filter((s) => s.status === "Active").length,
    inactive: staff.filter((s) => s.status !== "Active").length,
  };

  if (loading) return <div className="p-4">Loading staff...</div>;

  return (
    <div className=" min-h-screen bg-white text-gray-900 p-4">
      {/* Header */}
      <header className="flex flex-col md:flex-row text-left justify-between items-left mb-4 gap-4">
        <h1 className="text-3xl md:text-3xl font-bold text-left md:text-left">
          Staff Management
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Input
            placeholder="Search by name or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-2xl w-full sm:w-64"
          />
          <Button
            onClick={handleOpenAddStaff}
            className="ml-2 bg-red-600 hover:bg-red-700 text-white"
          >
            + Add Staff
          </Button>
        </div>
      </header>

      {/* Add Staff Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Staff</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddStaffSubmit} className="space-y-4">
            <Input
              name="name"
              value={newStaff.name}
              onChange={(e) =>
                setNewStaff({ ...newStaff, name: e.target.value })
              }
              placeholder="Staff Name"
              required
            />
            <Input
              name="phone"
              value={newStaff.phone}
              onChange={(e) =>
                setNewStaff({ ...newStaff, phone: e.target.value })
              }
              placeholder="Phone Number"
              required
            />
            <Input
              type="number"
              name="salary"
              value={newStaff.salary}
              onChange={(e) =>
                setNewStaff({ ...newStaff, salary: e.target.value })
              }
              placeholder="Salary"
              required
            />
            <select
              name="status"
              value={newStaff.status}
              onChange={(e) =>
                setNewStaff({ ...newStaff, status: e.target.value })
              }
              className="w-full border p-2 rounded"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              Save
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle>Total Staff</CardTitle>
            <Users className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totals.total}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle>Active Staff</CardTitle>
            <ShieldCheck className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totals.active}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
  <CardHeader className="flex justify-between items-center pb-2">
    <CardTitle>Inactive Staff</CardTitle>
    <UserX className="h-5 w-5 text-red-600" /> {/* better icon */}
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold text-red-600">{totals.inactive}</div>
  </CardContent>
</Card>
      </section>

      {/* Staff Table */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Staff List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="py-2 px-2 text-left">Name</th>
                  <th className="py-2 px-2 text-left">Phone</th>
                  <th className="py-2 px-2 text-left">Salary</th>
                  <th className="py-2 px-2 text-left">Status</th>
                  <th className="py-2 px-2 text-left">Franchise</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredStaff.length > 0 ? (
                  filteredStaff.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="py-2 px-2">{s.name}</td>
                      <td className="py-2 px-2">{s.phone}</td>
                      <td className="py-2 px-2">{s.salary}</td>
                      <td className="py-2 px-2">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="py-2 px-2">{s.franchise_name}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-500">
                      No staff available
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
