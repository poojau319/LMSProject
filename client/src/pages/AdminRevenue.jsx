import { useEffect, useState } from "react";
import axios from "axios";

function AdminRevenue() {
  const [data, setData] = useState({
    totalRevenue: 0,
    totalEnrollments: 0,
    totalCourses: 0,
    revenueByCourse: [],
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchRevenue = async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const res = await axios.get(
        "http://localhost:5000/api/admin/revenue",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setData({
        totalRevenue: Number(res.data.totalRevenue) || 0,
        totalEnrollments:
          Number(res.data.totalEnrollments) || 0,
        totalCourses:
          Number(res.data.totalCourses) || 0,
        revenueByCourse:
          Array.isArray(res.data.revenueByCourse)
            ? res.data.revenueByCourse
            : [],
      });
    } catch (err) {
      console.error("Revenue fetch error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load revenue data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl border shadow-sm p-8 text-center">
            <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />

            <p className="text-gray-600 font-medium">
              Loading revenue data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Revenue Dashboard
            </h1>

            <p className="text-gray-500 mt-2">
              Monitor approved course revenue and student enrollments.
            </p>
          </div>

          <button
            onClick={() => fetchRevenue(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2.5 rounded-lg font-semibold transition"
          >
            {refreshing ? (
              <>
                <span className="animate-spin">
                  ⟳
                </span>
                Refreshing...
              </>
            ) : (
              <>
                ↻ Refresh
              </>
            )}
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
            <div className="flex items-center justify-between gap-4">
              <span>{error}</span>

              <button
                onClick={() => fetchRevenue()}
                className="font-semibold underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* STATS */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

          {/* TOTAL REVENUE */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Revenue
                </p>

                <h2 className="text-3xl font-bold text-green-600 mt-2">
                  {formatCurrency(data.totalRevenue)}
                </h2>
              </div>

              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl">
                ₹
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Based on approved course enrollments
            </p>
          </div>

          {/* ENROLLMENTS */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Enrollments
                </p>

                <h2 className="text-3xl font-bold text-blue-600 mt-2">
                  {data.totalEnrollments.toLocaleString("en-IN")}
                </h2>
              </div>

              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
                👥
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Across approved courses
            </p>
          </div>

          {/* COURSES */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Approved Courses
                </p>

                <h2 className="text-3xl font-bold text-purple-600 mt-2">
                  {data.totalCourses.toLocaleString("en-IN")}
                </h2>
              </div>

              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl">
                📚
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Available in revenue calculation
            </p>
          </div>
        </div>

        {/* COURSE REVENUE */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

          <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Course Revenue
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Revenue generated from approved courses.
              </p>
            </div>

            <span className="text-sm text-gray-500">
              {data.revenueByCourse.length} course
              {data.revenueByCourse.length !== 1
                ? "s"
                : ""}
            </span>
          </div>

          {data.revenueByCourse.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">
                📊
              </div>

              <h3 className="text-lg font-semibold text-gray-800">
                No approved courses available
              </h3>

              <p className="text-gray-500 mt-2">
                Revenue data will appear here once courses
                are approved.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Course
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Instructor
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Price
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Enrollments
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Revenue
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {data.revenueByCourse.map((course) => (
                    <tr
                      key={course._id}
                      className="border-b last:border-b-0 hover:bg-gray-50 transition"
                    >

                      {/* COURSE */}
                      <td className="px-6 py-5">
                        <div className="font-semibold text-gray-900">
                          {course.title}
                        </div>

                        <div className="text-xs text-gray-400 mt-1">
                          {course.rating
                            ? `⭐ ${course.rating}`
                            : "No rating yet"}
                        </div>
                      </td>

                      {/* INSTRUCTOR */}
                      <td className="px-6 py-5">
                        <div className="text-gray-800 font-medium">
                          {course.instructor?.name ||
                            "Unknown"}
                        </div>

                        <div className="text-xs text-gray-400 mt-1">
                          {course.instructor?.email || ""}
                        </div>
                      </td>

                      {/* PRICE */}
                      <td className="px-6 py-5">
                        {Number(course.price) === 0 ? (
                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                            Free
                          </span>
                        ) : (
                          <span className="font-semibold text-gray-800">
                            {formatCurrency(course.price)}
                          </span>
                        )}
                      </td>

                      {/* ENROLLMENTS */}
                      <td className="px-6 py-5">
                        <span className="font-semibold text-blue-600">
                          {Number(
                            course.enrollments || 0
                          ).toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* REVENUE */}
                      <td className="px-6 py-5">
                        <span className="font-bold text-green-600">
                          {formatCurrency(course.revenue)}
                        </span>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </div>

        {/* NOTE */}
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">
              Revenue calculation:
            </span>{" "}
            Course Price × Number of Enrolled Students.
            Only approved courses are included.
          </p>
        </div>

      </div>
    </div>
  );
}

export default AdminRevenue;