import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function InstructorDashboard() {
  const [stats, setStats] = useState({
    courses: 0,
    students: 0,
    lectures: 0,
    quizzes: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "https://lmsproject-ntug.onrender.com/api/instructor/my-courses",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const courses = response.data || [];

      const totalStudents = courses.reduce(
        (total, course) =>
          total +
          (Array.isArray(course.students)
            ? course.students.length
            : course.totalStudents || 0),
        0
      );

      const totalLectures = courses.reduce(
        (total, course) =>
          total +
          (Array.isArray(course.lectures)
            ? course.lectures.length
            : 0),
        0
      );

      const totalQuizzes = courses.reduce(
        (total, course) =>
          total +
          (Array.isArray(course.quizzes)
            ? course.quizzes.length
            : 0),
        0
      );

      setStats({
        courses: courses.length,
        students: totalStudents,
        lectures: totalLectures,
        quizzes: totalQuizzes,
      });
    } catch (err) {
      console.error("Instructor dashboard error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load instructor dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    } else {
      setError("Authentication required.");
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <p className="text-gray-600">
            Loading instructor dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-7xl mx-auto">

        {/* ================= HEADER ================= */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Instructor Dashboard 👨‍🏫
          </h1>

          <p className="text-gray-500 mt-2">
            Monitor your courses, students and learning content.
          </p>
        </div>

        {/* ================= ERROR ================= */}

        {error && (
          <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* ================= STATISTICS ================= */}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

          {/* COURSES */}

          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500">
              Total Courses
            </p>

            <p className="text-3xl font-bold text-blue-600 mt-2">
              {stats.courses}
            </p>
          </div>

          {/* STUDENTS */}

          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500">
              Total Students
            </p>

            <p className="text-3xl font-bold text-green-600 mt-2">
              {stats.students}
            </p>
          </div>

          {/* LECTURES */}

          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500">
              Total Lectures
            </p>

            <p className="text-3xl font-bold text-purple-600 mt-2">
              {stats.lectures}
            </p>
          </div>

          {/* QUIZZES */}

          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500">
              Quiz Questions
            </p>

            <p className="text-3xl font-bold text-orange-500 mt-2">
              {stats.quizzes}
            </p>
          </div>

        </div>

        {/* ================= QUICK ACTIONS ================= */}

        <div className="bg-white rounded-xl shadow p-6 mb-10">

          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Quick Actions
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

            <Link
              to="/instructor/my-courses"
              className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
            >
              <h3 className="font-bold text-lg text-gray-800">
                📚 My Courses
              </h3>

              <p className="text-gray-500 text-sm mt-2">
                View and manage your created courses.
              </p>
            </Link>

            <Link
              to="/instructor/create-course"
              className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
            >
              <h3 className="font-bold text-lg text-gray-800">
                ➕ Create & Manage Course
              </h3>

              <p className="text-gray-500 text-sm mt-2">
                Create courses and manage lectures,
                assignments and quizzes.
              </p>
            </Link>

            <Link
              to="/instructor/student-performance"
              className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
            >
              <h3 className="font-bold text-lg text-gray-800">
                📊 Student Performance
              </h3>

              <p className="text-gray-500 text-sm mt-2">
                Monitor student progress and performance.
              </p>
            </Link>

          </div>

        </div>

        {/* ================= INFORMATION ================= */}

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Instructor Workspace
          </h2>

          <p className="text-gray-600 leading-7">
            Use the navigation menu to manage your courses,
            upload learning content, create assignments and
            quizzes, and monitor student performance.
          </p>

        </div>

      </div>
    </div>
  );
}

export default InstructorDashboard;