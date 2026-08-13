import { useEffect, useMemo, useState } from "react";
import axios from "axios";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);

  const token = localStorage.getItem("token");

  // ================= FETCH USERS =================

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        "https://lmsproject-ntug.onrender.com/api/admin/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Users error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ================= DELETE USER =================

  const deleteUser = async () => {
    if (!selectedUser) return;

    try {
      setDeleting(true);
      setError("");

      await axios.delete(
        `https://lmsproject-ntug.onrender.com/api/admin/users/${selectedUser._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers((prev) =>
        prev.filter(
          (user) => user._id !== selectedUser._id
        )
      );

      setSelectedUser(null);
    } catch (error) {
      console.error("Delete user error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to delete user."
      );
    } finally {
      setDeleting(false);
    }
  };

  // ================= FILTER USERS =================

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        user.name?.toLowerCase().includes(searchText) ||
        user.email?.toLowerCase().includes(searchText);

      const matchesRole =
        roleFilter === "all" ||
        user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  // ================= COUNTS =================

  const totalUsers = users.length;

  const totalStudents = users.filter(
    (user) => user.role === "student"
  ).length;

  const totalInstructors = users.filter(
    (user) => user.role === "instructor"
  ).length;

  const totalAdmins = users.filter(
    (user) => user.role === "admin"
  ).length;

  // ================= ROLE BADGE =================

  const getRoleStyle = (role) => {
    if (role === "admin") {
      return "bg-red-50 text-red-700 border-red-200";
    }

    if (role === "instructor") {
      return "bg-orange-50 text-orange-700 border-orange-200";
    }

    return "bg-blue-50 text-blue-700 border-blue-200";
  };

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">

          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-gray-600 font-medium">
            Loading users...
          </p>

        </div>
      </div>
    );
  }

  // ================= PAGE =================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">

      <div className="max-w-7xl mx-auto">

        {/* ================= HEADER ================= */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

          <div>

            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
              Administration
            </p>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-1">
              User Management
            </h1>

            <p className="text-gray-500 mt-2">
              Manage students, instructors and administrator accounts.
            </p>

          </div>

          <button
            onClick={fetchUsers}
            className="self-start lg:self-auto bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition shadow-sm"
          >
            ↻ Refresh Users
          </button>

        </div>

        {/* ================= ERROR ================= */}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl">

            <p className="font-semibold">
              Something went wrong
            </p>

            <p className="text-sm mt-1">
              {error}
            </p>

          </div>
        )}

        {/* ================= STATISTICS ================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

          {/* TOTAL */}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  Total Users
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {totalUsers}
                </p>

              </div>

              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">
                👥
              </div>

            </div>

          </div>

          {/* STUDENTS */}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  Students
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {totalStudents}
                </p>

              </div>

              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-2xl">
                🎓
              </div>

            </div>

          </div>

          {/* INSTRUCTORS */}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  Instructors
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {totalInstructors}
                </p>

              </div>

              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl">
                👨‍🏫
              </div>

            </div>

          </div>

          {/* ADMINS */}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  Administrators
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {totalAdmins}
                </p>

              </div>

              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-2xl">
                🛡️
              </div>

            </div>

          </div>

        </div>

        {/* ================= USERS PANEL ================= */}

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

          {/* PANEL HEADER */}

          <div className="p-5 md:p-6 border-b border-gray-100">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

              <div>

                <h2 className="text-xl font-bold text-gray-800">
                  Platform Users
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {filteredUsers.length} user
                  {filteredUsers.length !== 1 ? "s" : ""} displayed
                </p>

              </div>

              {/* SEARCH + FILTER */}

              <div className="flex flex-col sm:flex-row gap-3">

                <div className="relative">

                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search name or email..."
                    className="w-full sm:w-72 border border-gray-200 rounded-lg px-4 py-2.5 pl-10 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />

                  <span className="absolute left-3 top-3 text-gray-400">
                    🔎
                  </span>

                </div>

                <select
                  value={roleFilter}
                  onChange={(e) =>
                    setRoleFilter(e.target.value)
                  }
                  className="border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >

                  <option value="all">
                    All Roles
                  </option>

                  <option value="student">
                    Students
                  </option>

                  <option value="instructor">
                    Instructors
                  </option>

                  <option value="admin">
                    Administrators
                  </option>

                </select>

              </div>

            </div>

          </div>

          {/* ================= EMPTY ================= */}

          {filteredUsers.length === 0 && (
            <div className="py-16 text-center px-6">

              <div className="text-5xl mb-4">
                👥
              </div>

              <h3 className="text-xl font-bold text-gray-700">
                No Users Found
              </h3>

              <p className="text-gray-500 mt-2">
                Try changing your search or role filter.
              </p>

            </div>
          )}

          {/* ================= DESKTOP TABLE ================= */}

          {filteredUsers.length > 0 && (
            <div className="hidden md:block overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50">

                  <tr>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      User
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Email
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Role
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Joined
                    </th>

                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-100">

                  {filteredUsers.map((user) => (

                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 transition"
                    >

                      {/* USER */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold uppercase">
                            {user.name?.charAt(0) || "U"}
                          </div>

                          <div>

                            <p className="font-semibold text-gray-800">
                              {user.name || "Unknown User"}
                            </p>

                            <p className="text-xs text-gray-400">
                              ID: {user._id?.slice(-8)}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* EMAIL */}

                      <td className="px-6 py-5 text-gray-600">
                        {user.email || "—"}
                      </td>

                      {/* ROLE */}

                      <td className="px-6 py-5">

                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getRoleStyle(
                            user.role
                          )}`}
                        >
                          {user.role
                            ? user.role.charAt(0).toUpperCase() +
                              user.role.slice(1)
                            : "Unknown"}
                        </span>

                      </td>

                      {/* DATE */}

                      <td className="px-6 py-5 text-gray-500 text-sm">
                        {user.createdAt
                          ? new Date(
                              user.createdAt
                            ).toLocaleDateString()
                          : "—"}
                      </td>

                      {/* ACTION */}

                      <td className="px-6 py-5 text-right">

                        {user.role === "admin" ? (
                          <span className="text-xs text-gray-400 font-medium">
                            Protected
                          </span>
                        ) : (
                          <button
                            onClick={() =>
                              setSelectedUser(user)
                            }
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-semibold transition"
                          >
                            Delete
                          </button>
                        )}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

          {/* ================= MOBILE CARDS ================= */}

          {filteredUsers.length > 0 && (
            <div className="md:hidden divide-y divide-gray-100">

              {filteredUsers.map((user) => (

                <div
                  key={user._id}
                  className="p-5"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex items-center gap-3">

                      <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold uppercase">
                        {user.name?.charAt(0) || "U"}
                      </div>

                      <div>

                        <h3 className="font-bold text-gray-800">
                          {user.name || "Unknown User"}
                        </h3>

                        <p className="text-sm text-gray-500 break-all">
                          {user.email || "No email"}
                        </p>

                      </div>

                    </div>

                    <span
                      className={`shrink-0 inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${getRoleStyle(
                        user.role
                      )}`}
                    >
                      {user.role || "Unknown"}
                    </span>

                  </div>

                  <div className="mt-4 flex items-center justify-between">

                    <p className="text-xs text-gray-400">
                      Joined{" "}
                      {user.createdAt
                        ? new Date(
                            user.createdAt
                          ).toLocaleDateString()
                        : "—"}
                    </p>

                    {user.role !== "admin" && (
                      <button
                        onClick={() =>
                          setSelectedUser(user)
                        }
                        className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-semibold"
                      >
                        Delete
                      </button>
                    )}

                  </div>

                </div>

              ))}

            </div>
          )}

        </div>

      </div>

      {/* ================= DELETE MODAL ================= */}

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">

            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-2xl mb-5">
              ⚠️
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              Delete User?
            </h2>

            <p className="text-gray-500 mt-2 leading-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-800">
                {selectedUser.name}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">

              <button
                onClick={() => setSelectedUser(null)}
                disabled={deleting}
                className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={deleteUser}
                disabled={deleting}
                className="px-4 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {deleting
                  ? "Deleting..."
                  : "Delete User"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default UserManagement;