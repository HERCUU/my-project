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

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 text-gray-900">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-gray-500">
              Manage student records (GET, POST, PUT, DELETE)
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition"
          >
            Logout
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">
            {successMsg}
          </div>
        )}

        {/* GET: Single Student Details Card */}
        {selectedStudent && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold">
                  Student Details ({selectedStudent.studentId})
                </h2>
                <p className="text-xs text-gray-500">
                  Fetched from GET /students
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500">Student ID</p>
                <p className="font-medium">{selectedStudent.studentId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Full Name</p>
                <p className="font-medium">{selectedStudent.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Course</p>
                <p className="font-medium">{selectedStudent.course}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Year Level</p>
                <p className="font-medium">Year {selectedStudent.yearLevel}</p>
              </div>
            </div>
          </div>
        )}

        {/* POST: Create Student Form */}
        {showCreateForm && (
          <form
            onSubmit={handleCreate}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold">Create New Student</h2>
                <p className="text-xs text-gray-500">
                  Fill in the details to add a new student (POST /students)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Student ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 2026-0001"
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Juan Dela Cruz"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Course
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., BSCS"
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Year Level
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  required
                  value={newYearLevel}
                  onChange={(e) => setNewYearLevel(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 text-xs font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50"
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
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold">
                  Update Student ({editingStudent.studentId})
                </h2>
                <p className="text-xs text-gray-500">
                  Modify the student details below (PUT /students/:id)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Student ID
                </label>
                <input
                  type="text"
                  required
                  value={editStudentId}
                  onChange={(e) => setEditStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Course
                </label>
                <input
                  type="text"
                  required
                  value={editCourse}
                  onChange={(e) => setEditCourse(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Year Level
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  required
                  value={editYearLevel}
                  onChange={(e) => setEditYearLevel(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-4 py-2 text-xs font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}

        {/* GET: Students Table Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base font-semibold">Students</h2>
              <p className="text-xs text-gray-500">
                A list of all students stored in the backend.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchStudents}
                className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                ↻ Read / Refresh
              </button>
              <button
                onClick={() => {
                  setEditingStudent(null);
                  setSelectedStudent(null);
                  setShowCreateForm(true);
                }}
                className="px-3 py-2 text-xs font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition"
              >
                + Create Student
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500 py-8 text-center">
              Loading students...
            </p>
          ) : students.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">
              No students found. Click &quot;+ Create Student&quot; to add one.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-xs text-gray-500">
                    <th className="py-3 px-4 font-medium">Student ID</th>
                    <th className="py-3 px-4 font-medium">Name</th>
                    <th className="py-3 px-4 font-medium">Course</th>
                    <th className="py-3 px-4 font-medium">Year Level</th>
                    <th className="py-3 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {students.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">
                        {student.studentId}
                      </td>
                      <td className="py-3 px-4">{student.name}</td>
                      <td className="py-3 px-4">{student.course}</td>
                      <td className="py-3 px-4">Year {student.yearLevel}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setShowCreateForm(false);
                            setEditingStudent(null);
                            setSelectedStudent(student);
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-100"
                        >
                          Read
                        </button>
                        <button
                          onClick={() => openEditForm(student)}
                          className="px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleDelete(student)}
                          className="px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100"
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
      </div>
    </div>
  );
}