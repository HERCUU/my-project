"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { clearTokens } from "@/lib/auth";
import { CONFIG } from "@/lib/config";
import { useAuthGuard } from "@/hooks/useAuthGuard";

interface Student {
  _id: string;
  studentId: string;
  name: string;
  course: string;
  yearLevel: number;
}

export default function DashboardPage() {
  useAuthGuard();
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // GET (Single View) State
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // POST (Create) State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newStudentId, setNewStudentId] = useState("");
  const [newName, setNewName] = useState("");
  const [newCourse, setNewCourse] = useState("");
  const [newYearLevel, setNewYearLevel] = useState<number>(1);
  const [creating, setCreating] = useState(false);

  // PUT (Update) State
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editStudentId, setEditStudentId] = useState("");
  const [editName, setEditName] = useState("");
  const [editCourse, setEditCourse] = useState("");
  const [editYearLevel, setEditYearLevel] = useState<number>(1);
  const [updating, setUpdating] = useState(false);

  // GET: Fetch all students
  const fetchStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiClient<Student[]>(CONFIG.ENDPOINTS.STUDENTS, {
        method: "GET",
      });
      setStudents(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // POST: Create a new student
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    setSuccessMsg("");
    try {
      await apiClient(CONFIG.ENDPOINTS.STUDENTS, {
        method: "POST",
        body: JSON.stringify({
          studentId: newStudentId,
          name: newName,
          course: newCourse,
          yearLevel: Number(newYearLevel),
        }),
      });
      setNewStudentId("");
      setNewName("");
      setNewCourse("");
      setNewYearLevel(1);
      setShowCreateForm(false);
      setSuccessMsg("Student created successfully!");
      await fetchStudents();
    } catch (err: any) {
      setError(err.message || "Failed to create student");
    } finally {
      setCreating(false);
    }
  };

  // Open PUT form
  const openEditForm = (student: Student) => {
    setSelectedStudent(null);
    setShowCreateForm(false);
    setEditingStudent(student);
    setEditStudentId(student.studentId);
    setEditName(student.name);
    setEditCourse(student.course);
    setEditYearLevel(student.yearLevel);
  };

  // PUT: Update existing student
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setUpdating(true);
    setError("");
    setSuccessMsg("");
    try {
      await apiClient(`${CONFIG.ENDPOINTS.STUDENTS}/${editingStudent._id}`, {
        method: "PUT",
        body: JSON.stringify({
          studentId: editStudentId,
          name: editName,
          course: editCourse,
          yearLevel: Number(editYearLevel),
        }),
      });
      setEditingStudent(null);
      setSuccessMsg("Student updated successfully!");
      await fetchStudents();
    } catch (err: any) {
      setError(err.message || "Failed to update student");
    } finally {
      setUpdating(false);
    }
  };

  // DELETE: Delete a student
  const handleDelete = async (student: Student) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${student.name} (${student.studentId})?`
    );
    if (!confirmed) return;

    setError("");
    setSuccessMsg("");
    try {
      await apiClient(`${CONFIG.ENDPOINTS.STUDENTS}/${student._id}`, {
        method: "DELETE",
      });
      if (selectedStudent?._id === student._id) setSelectedStudent(null);
      if (editingStudent?._id === student._id) setEditingStudent(null);
      setSuccessMsg("Student deleted successfully!");
      await fetchStudents();
    } catch (err: any) {
      setError(err.message || "Failed to delete student");
    }
  };

  const handleLogout = () => {
    clearTokens();
    router.push(CONFIG.ROUTES.LOGIN);
  };

  // Derived Stats & Filtered List
  const uniqueCourses = new Set(
    students.map((s) => s.course.trim().toUpperCase())
  ).size;
  const upperclassmenCount = students.filter((s) => s.yearLevel >= 3).length;

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.studentId.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.course.toLowerCase().includes(q)
    );
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Navbar matching Academic Portal theme */}
      <nav className="bg-slate-900 text-white border-b border-slate-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm tracking-wider shadow">
              AP
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">
                Academic Portal
              </h1>
              <p className="text-xs text-slate-400">
                Student Information Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              API Connected
            </span>
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-red-600 hover:border-red-600 hover:text-white transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 md:p-8 space-y-6">
        {/* Page Title & Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Students
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {students.length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
              STU
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Active Programs
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {uniqueCourses}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
              CRS
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Upperclassmen (Yr 3+)
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {upperclassmenCount}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
              3+
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="text-red-500 hover:text-red-700 font-bold text-xs"
            >
              ✕
            </button>
          </div>
        )}
        {successMsg && (
          <div className="p-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <span>{successMsg}</span>
            <button
              onClick={() => setSuccessMsg("")}
              className="text-emerald-500 hover:text-emerald-700 font-bold text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* GET: Single Student Details Card */}
        {selectedStudent && (
          <div className="bg-white p-6 rounded-xl border-l-4 border-l-blue-600 border border-slate-200 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Student Profile
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedStudent.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div>
                <p className="text-xs text-slate-500">Student ID</p>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {selectedStudent.studentId}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Full Name</p>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {selectedStudent.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Course / Program</p>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {selectedStudent.course}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Year Level</p>
                <p className="font-semibold text-slate-800 mt-0.5">
                  Year {selectedStudent.yearLevel}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* POST: Create Student Form */}
        {showCreateForm && (
          <form
            onSubmit={handleCreate}
            className="bg-white p-6 rounded-xl border-l-4 border-l-blue-600 border border-slate-200 shadow-sm space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Register New Student
                </h2>
                <p className="text-xs text-slate-500">
                  Add a new student record to the database (POST /students)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Student ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 25-00234"
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Juan Dela Cruz"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Course
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., BSIS"
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Year Level
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  required
                  value={newYearLevel}
                  onChange={(e) => setNewYearLevel(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-sm transition"
              >
                {creating ? "Creating..." : "Create Student"}
              </button>
            </div>
          </form>
        )}

        {/* PUT: Update Student Form */}
        {editingStudent && (
          <form
            onSubmit={handleUpdate}
            className="bg-white p-6 rounded-xl border-l-4 border-l-amber-500 border border-slate-200 shadow-sm space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Update Student ({editingStudent.studentId})
                </h2>
                <p className="text-xs text-slate-500">
                  Edit the student details below (PUT /students/:id)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Student ID
                </label>
                <input
                  type="text"
                  required
                  value={editStudentId}
                  onChange={(e) => setEditStudentId(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Course
                </label>
                <input
                  type="text"
                  required
                  value={editCourse}
                  onChange={(e) => setEditCourse(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Year Level
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  required
                  value={editYearLevel}
                  onChange={(e) => setEditYearLevel(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 shadow-sm transition"
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}

        {/* GET: Students Directory Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Enrolled Students
              </h2>
              <p className="text-xs text-slate-500">
                Manage student records (GET, POST, PUT, DELETE)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <input
                type="text"
                placeholder="Search ID, name, course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 w-48 sm:w-56"
              />
              <button
                onClick={fetchStudents}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                ↻ Read / Refresh
              </button>
              <button
                onClick={() => {
                  setEditingStudent(null);
                  setSelectedStudent(null);
                  setShowCreateForm(true);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition"
              >
                + Create Student
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Loading student records...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              {searchQuery
                ? "No matching students found."
                : 'No students found. Click "+ Create Student" to add one.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-6">Student ID</th>
                    <th className="py-3.5 px-6">Student Name</th>
                    <th className="py-3.5 px-6">Course</th>
                    <th className="py-3.5 px-6">Year Level</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredStudents.map((student) => (
                    <tr
                      key={student._id}
                      className="hover:bg-blue-50/30 transition"
                    >
                      <td className="py-3.5 px-6 font-mono text-xs font-semibold text-slate-700">
                        {student.studentId}
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {getInitials(student.name)}
                          </div>
                          <span className="font-semibold text-slate-900">
                            {student.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {student.course}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          Year {student.yearLevel}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setShowCreateForm(false);
                            setEditingStudent(null);
                            setSelectedStudent(student);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition"
                        >
                          Read
                        </button>
                        <button
                          onClick={() => openEditForm(student)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleDelete(student)}
                          className="px-2.5 py-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}