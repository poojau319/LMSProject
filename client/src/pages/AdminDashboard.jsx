import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function AdminDashboard() {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalStudents: 0,
    totalInstructors: 0,
    pendingCourses: 0,
    approvedCourses: 0,
    rejectedCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    totalFeedback: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // ================= FETCH DASHBOARD DATA =================

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
       "http://localhost:5000/api/admin/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAnalytics({
  totalUsers: res.data.totalUsers ?? 0,
  totalCourses: res.data.totalCourses ?? 0,
  totalStudents: res.data.totalStudents ?? 0,
  totalInstructors: res.data.totalInstructors ?? 0,
  pendingCourses: res.data.pendingCourses ?? 0,
  approvedCourses: res.data.approvedCourses ?? 0,
  rejectedCourses: res.data.rejectedCourses ?? 0,
  totalEnrollments: res.data.totalEnrollments ?? 0,
  totalRevenue: res.data.totalRevenue ?? 0,
  totalFeedback: res.data.feedbackCount ?? 0,
});
    } catch (error) {
      console.error("Admin dashboard error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load admin dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>

          <p className="text-gray-600 font-medium">
            Loading admin dashboard...
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
              Admin Dashboard
            </h1>

            <p className="text-gray-500 mt-2">
              Manage your learning platform from one central place.
            </p>
          </div>

          <button
            onClick={fetchDashboardData}
            className="self-start lg:self-auto bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition shadow-sm"
          >
            ↻ Refresh Data
          </button>

        </div>

        {/* ================= ERROR ================= */}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl">
            <p className="font-semibold">
              Dashboard Error
            </p>

            <p className="text-sm mt-1">
              {error}
            </p>
          </div>
        )}

        {/* ================= OVERVIEW ================= */}

        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Platform Overview
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            Quick overview of users and platform content.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

          {/* USERS */}

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Users
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {analytics.totalUsers ?? 0}
                </p>
              </div>

              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">
                👥
              </div>

            </div>

            <p className="text-xs text-gray-400 mt-4">
              Students + instructors
            </p>

          </div>

          {/* COURSES */}

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Courses
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {analytics.totalCourses ?? 0}
                </p>
              </div>

              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-2xl">
                📚
              </div>

            </div>

            <p className="text-xs text-gray-400 mt-4">
              Courses on platform
            </p>

          </div>

          {/* STUDENTS */}

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Students
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {analytics.totalStudents ?? 0}
                </p>
              </div>

              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-2xl">
                🎓
              </div>

            </div>

            <p className="text-xs text-gray-400 mt-4">
              Registered learners
            </p>

          </div>

          {/* INSTRUCTORS */}

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Instructors
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {analytics.totalInstructors ?? 0}
                </p>
              </div>

              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl">
                👨‍🏫
              </div>

            </div>

            <p className="text-xs text-gray-400 mt-4">
              Course creators
            </p>

          </div>

        </div>

        {/* ================= COURSE STATUS ================= */}

        <div className="mt-8 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Course Approval Status
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Monitor courses submitted by instructors.
              </p>
            </div>

            <Link
              to="/admin/courses"
              className="text-blue-600 font-semibold text-sm hover:text-blue-700"
            >
              Manage Courses →
            </Link>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* PENDING */}

            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-5">

              <p className="text-sm text-yellow-700 font-medium">
                Pending Review
              </p>

              <p className="text-3xl font-bold text-yellow-800 mt-2">
                {analytics.pendingCourses ?? 0}
              </p>

            </div>

            {/* APPROVED */}

            <div className="bg-green-50 border border-green-100 rounded-xl p-5">

              <p className="text-sm text-green-700 font-medium">
                Approved
              </p>

              <p className="text-3xl font-bold text-green-800 mt-2">
                {analytics.approvedCourses ?? 0}
              </p>

            </div>

            {/* REJECTED */}

            <div className="bg-red-50 border border-red-100 rounded-xl p-5">

              <p className="text-sm text-red-700 font-medium">
                Rejected
              </p>

              <p className="text-3xl font-bold text-red-800 mt-2">
                {analytics.rejectedCourses ?? 0}
              </p>

            </div>

          </div>

        </div>

        {/* ================= PLATFORM ACTIVITY ================= */}

        <div className="mt-8">

          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Platform Activity
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Important platform metrics at a glance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* ENROLLMENTS */}

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl">
                  📝
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Total Enrollments
                  </p>

                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.totalEnrollments ?? 0}
                  </p>
                </div>

              </div>

            </div>

            {/* REVENUE */}

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl">
                  💰
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Platform Revenue
                  </p>

                  <p className="text-2xl font-bold text-gray-900">
                    ₹{Number(analytics.totalRevenue ?? 0).toLocaleString()}
                  </p>
                </div>

              </div>

            </div>

            {/* FEEDBACK */}

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center text-2xl">
                  ⭐
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Total Feedback
                  </p>

                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.totalFeedback ?? 0}
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ================= ADMIN MODULES ================= */}

        <div className="mt-8">

          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Administration
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Access and manage each admin module.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

            {/* USER MANAGEMENT */}

            <Link
              to="/admin/users"
              className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition"
            >

              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-5">
                👥
              </div>

              <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition">
                User Management
              </h3>

              <p className="text-sm text-gray-500 mt-2 leading-6">
                Manage students and instructors, review user accounts and maintain platform users.
              </p>

              <div className="mt-5 text-sm font-semibold text-blue-600">
                Manage Users →
              </div>

            </Link>

            {/* COURSE APPROVAL */}

            <Link
              to="/admin/courses"
              className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition"
            >

              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-2xl mb-5">
                📚
              </div>

              <h3 className="text-lg font-bold text-gray-800 group-hover:text-green-600 transition">
                Course Approval
              </h3>

              <p className="text-sm text-gray-500 mt-2 leading-6">
                Review instructor courses and approve or reject submitted content.
              </p>

              <div className="mt-5 text-sm font-semibold text-green-600">
                Review Courses →
              </div>

            </Link>

            {/* REVENUE */}

            <Link
              to="/admin/revenue"
              className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition"
            >

              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl mb-5">
                💰
              </div>

              <h3 className="text-lg font-bold text-gray-800 group-hover:text-emerald-600 transition">
                Revenue Dashboard
              </h3>

              <p className="text-sm text-gray-500 mt-2 leading-6">
                Monitor platform revenue, course earnings and financial performance.
              </p>

              <div className="mt-5 text-sm font-semibold text-emerald-600">
                View Revenue →
              </div>

            </Link>

            {/* ANALYTICS */}

            <Link
              to="/admin/analytics"
              className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition"
            >

              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-2xl mb-5">
                📊
              </div>

              <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition">
                Analytics
              </h3>

              <p className="text-sm text-gray-500 mt-2 leading-6">
                Explore detailed platform statistics and performance insights.
              </p>

              <div className="mt-5 text-sm font-semibold text-purple-600">
                View Analytics →
              </div>

            </Link>

          </div>

        </div>

        {/* ================= FEEDBACK ================= */}

        <div className="mt-5">

          <Link
            to="/admin/feedback"
            className="group block bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition"
          >

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center text-2xl">
                  ⭐
                </div>

                <div>

                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-pink-600 transition">
                    Feedback Management
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Review student feedback, ratings and remove inappropriate feedback when required.
                  </p>

                </div>

              </div>

              <span className="text-sm font-semibold text-pink-600">
                Manage Feedback →
              </span>

            </div>

          </Link>

        </div>

        {/* ================= FOOTER INFO ================= */}

        <div className="mt-8 bg-gray-900 rounded-2xl p-6 text-white">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <p className="font-semibold">
                Learning Management System
              </p>

              <p className="text-gray-400 text-sm mt-1">
                Administrator control center
              </p>
            </div>

            <div className="text-sm text-gray-400">
              Admin access • Secure dashboard
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;