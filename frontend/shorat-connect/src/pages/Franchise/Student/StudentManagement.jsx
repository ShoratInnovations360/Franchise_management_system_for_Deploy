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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, UserPlus, Edit, Trash2 } from "lucide-react";
import { getApi } from "@/utils/api"; // <-- dynamic axios instance

// ------------------------
// Helpers
const formatINR = (n) => `₹${Number(n || 0).toLocaleString()}`;

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

// ------------------------
// Add/Edit Student Dialog
const StudentDialog = ({ onSave, batches, loggedInFranchise, student }) => {
  const [open, setOpen] = useState(false);
  const isEdit = !!student;

  const emptyForm = {
    name: "",
    email: "",
    phone: "",
    batch: batches[0]?.id || "",
    fees_paid: "",
    total_fees: "",
    status: "Active",
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (open) {
      if (isEdit) {
        setForm({
          name: student?.name || "",
          email: student?.email || "",
          phone: student?.phone || "",
          batch: student?.batch || batches[0]?.id || "",
          fees_paid: student?.fees_paid?.toString() || "",
          total_fees: student?.total_fees?.toString() || "",
          status: student?.status || "Active",
        });
      } else {
        setForm(emptyForm);
      }
    }
  }, [open, student, batches]);

  const handleSave = async () => {
    try {
      const api = getApi(); // dynamic axios
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        batch: Number(form.batch),
        franchise_id: loggedInFranchise?.id,
        fees_paid: Number(form.fees_paid) || 0,
        total_fees: Number(form.total_fees) || 0,
        status: form.status,
      };

      const response = isEdit
        ? await api.put(`students/${student.id}/`, payload)
        : await api.post("students/", payload);

      onSave(response.data);
      setOpen(false);
    } catch (err) {
      console.error("Failed to save student:", err.response || err);
      alert(
        `Error saving student: ${JSON.stringify(err.response?.data || err)}`
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className={`flex items-center gap-1 rounded-xl ${
            isEdit
              ? "bg-gray-200 hover:bg-gray-300 text-gray-800"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
          onClick={(e) => {
            if (!batches || batches.length === 0) {
              e.preventDefault();
              alert("No batch exists! Please create a batch first.");
              return;
            }
            setOpen(true);
          }}
        >
          {isEdit ? <Edit className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
          {isEdit ? "Edit" : "Add Student"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Student" : "Add New Student"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {["name", "email", "phone"].map((field) => (
            <div key={field} className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
              <Label className="sm:text-right capitalize">{field}</Label>
              <Input
                className="sm:col-span-3"
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              />
            </div>
          ))}

          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
            <Label className="sm:text-right capitalize">Batch</Label>
            <Select
              value={String(form.batch)}
              onValueChange={(v) => setForm({ ...form, batch: v })}
            >
              <SelectTrigger className="sm:col-span-3">
                <SelectValue
                  placeholder={batches.length ? "Select Batch" : "No batch created"}
                />
              </SelectTrigger>
              <SelectContent>
                {batches.map((b) => (
                  <SelectItem key={b.id} value={String(b.id)}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
            <Label className="sm:text-right capitalize">Franchise</Label>
            <Input
              className="sm:col-span-3"
              value={loggedInFranchise?.name || ""}
              disabled
            />
          </div>

          {["fees_paid", "total_fees"].map((field) => (
            <div key={field} className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
              <Label className="sm:text-right capitalize">{field.replace(/_/g, " ")}</Label>
              <Input
                type="number"
                className="sm:col-span-3"
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              />
            </div>
          ))}

          <div className="flex flex-wrap justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setForm(isEdit ? { ...student } : emptyForm)}
            >
              Reset
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 rounded-2xl"
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ------------------------
// Main Component
export default function StudentManagement() {
  const [rows, setRows] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loggedInFranchise, setLoggedInFranchise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const api = getApi(); // dynamic axios
        const [studentsRes, batchesRes, franchiseRes] = await Promise.all([
          api.get("students/"),
          api.get("batches/"),
          api.get("franchise/"),
        ]);

        const franchiseData = franchiseRes.data;
        setLoggedInFranchise(franchiseData);

        setRows(
          studentsRes.data.map((s) => ({
            ...s,
            fees_paid: s.fees_paid || 0,
            total_fees: s.total_fees || 0,
            franchise: s.franchise || {
              id: franchiseData.id,
              name: franchiseData.name,
            },
          }))
        );
        setBatches(batchesRes.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        alert("Error fetching data from backend");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      const api = getApi(); // dynamic axios
      await api.delete(`students/${id}/`);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Failed to delete student:", err);
      alert("Error deleting student");
    }
  };

  const filtered = rows.filter(
    (r) =>
      q === "" ||
      r.name.toLowerCase().includes(q.toLowerCase()) ||
      r.email.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className=" min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col sm:flex-row items-center gap-3">
          <h1 className="text-3xl sm:text-3xl text-left font-bold">Student Management</h1>

          <div className="flex w-full sm:w-auto ml-auto flex-col sm:flex-row items-center gap-2">
            <div className="w-full flex justify-end">
              <StudentDialog
                onSave={(s) =>
                  setRows((prev) => [s, ...prev.filter((x) => x.id !== s.id)])
                }
                batches={batches}
                loggedInFranchise={loggedInFranchise}
              />
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search student by name or email"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="rounded-2xl pl-8"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl p-4">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Student List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse min-w-[700px]">
                <thead className="text-left text-gray-500">
                  <tr className="border-b text-xs sm:text-sm">
                    <th className="p-2">Name</th>
                    <th className="p-2">Batch</th>
                    <th className="p-2">Fees Paid</th>
                    <th className="p-2">Total Fees</th>
                    <th className="p-2">Remaining</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-gray-500">
                        Loading students...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-gray-500">
                        No students yet
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b last:border-0 hover:bg-gray-50 text-xs sm:text-sm"
                      >
                        <td className="p-2">
                          {r.name}
                          <br />
                          <span className="text-[11px] sm:text-xs text-gray-500">
                            {r.email}
                          </span>
                        </td>
                        <td className="p-2">{r.batch_name || r.batch}</td>
                        <td className="p-2">{formatINR(r.fees_paid)}</td>
                        <td className="p-2">{formatINR(r.total_fees)}</td>
                        <td className="p-2">
                          {formatINR(r.total_fees - r.fees_paid)}
                        </td>
                        <td className="p-2">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="p-2 flex flex-wrap gap-2">
                          <StudentDialog
                            student={r}
                            onSave={(s) =>
                              setRows((prev) =>
                                prev.map((x) => (x.id === s.id ? s : x))
                              )
                            }
                            batches={batches}
                            loggedInFranchise={loggedInFranchise}
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => handleDelete(r.id)}
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
