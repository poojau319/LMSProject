import { useEffect, useState } from "react";
import axios from "axios";

function AdminAnalytics() {
  const [data, setData] = useState(null);
const [refreshing, setRefreshing] = useState(false);

const token = localStorage.getItem("token");

const fetchAnalytics = async () => {
  try {
    setRefreshing(true);

    const res = await axios.get(
      "http://localhost:5000/api/admin/analytics",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setData(res.data);
  } catch (error) {
    console.error("Analytics Error:", error);

    alert(
      error.response?.data?.message ||
        "Unable to load analytics."
    );
  } finally {
    setRefreshing(false);
  }
};
  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-8 py-7 text-center">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-gray-700 font-semibold">
            Loading analytics...
          </p>

          <p className="text-sm text-gray-400 mt-1">
            Preparing platform insights
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-7xl mx-auto">

        {/* ================= HEADER ================= */}

        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-900 to-blue-700 rounded-3xl p-6 md:p-8 mb-8 shadow-lg">

          <div className="absolute -right-16 -top-20 w-56 h-56 bg-white/10 rounded-full" />
          <div className="absolute right-20 -bottom-24 w-48 h-48 bg-white/5 rounded-full" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div>
              <p className="text-blue-200 text-sm font-bold uppercase tracking-wider">
                Administration
              </p>

              <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-2">
                Platform Analytics
              </h1>

              <p className="text-blue-100/80 mt-2 max-w-2xl">
                Monitor users, courses, enrollments, revenue and overall
                learning platform performance.
              </p>
            </div>

            <button
  type="button"
  onClick={fetchAnalytics}
  disabled={refreshing}
  className="self-start md:self-auto bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-3 rounded-xl font-semibold backdrop-blur-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
>
  {refreshing ? (
    <span className="flex items-center gap-2">
      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      Refreshing...
    </span>
  ) : (
    "↻ Refresh Data"
  )}
</button>

          </div>
        </div>

        {/* ================= USER ANALYTICS ================= */}

        <SectionHeader
          eyebrow="Users"
          title="User Analytics"
          description="Overview of registered users across the platform."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">

          <StatCard
            title="Total Users"
            value={data.users.total}
            icon="👥"
            subtitle="All registered users"
          />

          <StatCard
            title="Students"
            value={data.users.students}
            icon="🎓"
            subtitle="Registered learners"
          />

          <StatCard
            title="Instructors"
            value={data.users.instructors}
            icon="👨‍🏫"
            subtitle="Course creators"
          />

          <StatCard
            title="Admins"
            value={data.users.admins}
            icon="🛡️"
            subtitle="Platform administrators"
          />

        </div>

        {/* ================= COURSE ANALYTICS ================= */}

        <SectionHeader
          eyebrow="Courses"
          title="Course Analytics"
          description="Track course creation and approval activity."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">

          <StatCard
            title="Total Courses"
            value={data.courses.total}
            icon="📚"
            subtitle="Courses on platform"
          />

          <StatCard
            title="Pending"
            value={data.courses.pending}
            icon="⏳"
            subtitle="Awaiting review"
          />

          <StatCard
            title="Approved"
            value={data.courses.approved}
            icon="✅"
            subtitle="Published courses"
          />

          <StatCard
            title="Rejected"
            value={data.courses.rejected}
            icon="❌"
            subtitle="Rejected submissions"
          />

        </div>

        {/* ================= PLATFORM PERFORMANCE ================= */}

        <SectionHeader
          eyebrow="Performance"
          title="Platform Performance"
          description="Key metrics showing overall platform activity."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">

          <PerformanceCard
            title="Total Enrollments"
            value={data.enrollments.total}
            icon="📝"
            description="Total student course enrollments"
          />

          <PerformanceCard
            title="Total Revenue"
            value={`₹${Number(
              data.revenue.total
            ).toLocaleString()}`}
            icon="💰"
            description="Platform generated revenue"
            highlight
          />

          <PerformanceCard
            title="Average Rating"
            value={`${data.feedback.averageRating || 0} / 5`}
            icon="⭐"
            description="Average student feedback rating"
          />

        </div>

        {/* ================= QUICK SUMMARY ================= */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-10">

          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">

            <div className="flex items-start justify-between gap-4 mb-6">

              <div>
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                  Platform Summary
                </p>

                <h2 className="text-xl font-bold text-gray-900 mt-1">
                  Current Platform Snapshot
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  A quick look at the current state of your LMS.
                </p>
              </div>

              <div className="hidden sm:flex w-11 h-11 bg-blue-50 rounded-xl items-center justify-center text-xl">
                📊
              </div>

            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              <MiniMetric
                label="Users"
                value={data.users.total}
              />

              <MiniMetric
                label="Courses"
                value={data.courses.total}
              />

              <MiniMetric
                label="Enrollments"
                value={data.enrollments.total}
              />

              <MiniMetric
                label="Revenue"
                value={`₹${Number(
                  data.revenue.total
                ).toLocaleString()}`}
              />

            </div>

          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-sm">

            <p className="text-blue-100 text-sm font-semibold uppercase tracking-wide">
              Course Approval
            </p>

            <h2 className="text-xl font-bold mt-1">
              Approval Overview
            </h2>

            <div className="mt-6">

              <div className="flex items-end justify-between">

                <span className="text-blue-100 text-sm">
                  Approved Courses
                </span>

                <span className="text-3xl font-extrabold">
                  {data.courses.approved}
                </span>

              </div>

              <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">

                <div
                  className="h-full bg-white rounded-full"
                  style={{
                    width:
                      data.courses.total > 0
                        ? `${Math.min(
                            (data.courses.approved /
                              data.courses.total) *
                              100,
                            100
                          )}%`
                        : "0%",
                  }}
                />

              </div>

              <div className="flex justify-between text-xs text-blue-100 mt-2">
                <span>
                  {data.courses.pending} pending
                </span>

                <span>
                  {data.courses.rejected} rejected
                </span>
              </div>

            </div>

          </div>

        </div>

        {/* ================= TOP COURSES ================= */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          <div className="p-6 md:p-7 border-b border-gray-100">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

              <div>

                <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide">
                  Performance Ranking
                </p>

                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
                  Most Popular Courses
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Courses with the highest student enrollment.
                </p>

              </div>

              <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center text-xl">
                🏆
              </div>

            </div>

          </div>

          {data.topCourses.length === 0 ? (

            <div className="p-10 text-center">

              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                📚
              </div>

              <p className="font-semibold text-gray-700">
                No course data available
              </p>

              <p className="text-sm text-gray-400 mt-1">
                Popular courses will appear here once enrollments are recorded.
              </p>

            </div>

          ) : (

            <div className="divide-y divide-gray-100">

              {data.topCourses.map((course, index) => (

                <div
                  key={course._id}
                  className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 hover:bg-gray-50 transition"
                >

                  <div className="flex items-center gap-4">

                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-extrabold ${
                        index === 0
                          ? "bg-yellow-100 text-yellow-700"
                          : index === 1
                          ? "bg-gray-100 text-gray-700"
                          : index === 2
                          ? "bg-orange-100 text-orange-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {index + 1}
                    </div>

                    <div className="min-w-0">

                      <h3 className="font-bold text-gray-900 truncate">
                        {course.title}
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        Instructor:{" "}
                        <span className="font-medium text-gray-600">
                          {course.instructor?.name || "Unknown"}
                        </span>
                      </p>

                    </div>

                  </div>

                  <div className="flex items-center gap-6 sm:text-right">

                    <div>

                      <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                        Enrollments
                      </p>

                      <p className="font-bold text-gray-900 mt-1">
                        {course.enrollments}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                        Rating
                      </p>

                      <p className="font-bold text-gray-900 mt-1">
                        ⭐ {course.rating || 0}/5
                      </p>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

        {/* ================= FOOTER ================= */}

        <div className="mt-8 text-center">

          <p className="text-xs text-gray-400">
            LMS Administration • Platform Analytics
          </p>

        </div>

      </div>
    </div>
  );
}


/* =====================================================
   SECTION HEADER
===================================================== */

function SectionHeader({
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="mb-5">

      <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">
        {eyebrow}
      </p>

      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
        {title}
      </h2>

      <p className="text-sm text-gray-500 mt-1">
        {description}
      </p>

    </div>
  );
}


/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  title,
  value,
  icon,
  subtitle,
}) {
  return (
    <div className="group relative overflow-hidden bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">

      <div className="absolute -right-8 -top-8 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-125 transition-transform duration-300" />

      <div className="relative">

        <div className="flex items-start justify-between gap-4">

          <div>

            <p className="text-sm font-semibold text-gray-500">
              {title}
            </p>

            <p className="text-3xl font-extrabold text-gray-900 mt-3 tracking-tight">
              {value}
            </p>

          </div>

          <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center text-xl shrink-0">
            {icon}
          </div>

        </div>

        <div className="w-10 h-1 bg-blue-600 rounded-full mt-4" />

        <p className="text-xs text-gray-400 mt-3">
          {subtitle}
        </p>

      </div>

    </div>
  );
}


/* =====================================================
   PERFORMANCE CARD
===================================================== */

function PerformanceCard({
  title,
  value,
  icon,
  description,
  highlight = false,
}) {
  return (
    <div
      className={`rounded-2xl p-6 border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
        highlight
          ? "bg-gradient-to-br from-emerald-500 to-teal-600 border-transparent text-white"
          : "bg-white border-gray-100"
      }`}
    >

      <div className="flex items-start justify-between">

        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
            highlight
              ? "bg-white/15"
              : "bg-indigo-50"
          }`}
        >
          {icon}
        </div>

        {highlight && (
          <span className="text-xs font-bold bg-white/15 px-3 py-1 rounded-full">
            Revenue
          </span>
        )}

      </div>

      <p
        className={`text-sm font-semibold mt-5 ${
          highlight
            ? "text-emerald-50"
            : "text-gray-500"
        }`}
      >
        {title}
      </p>

      <p
        className={`text-3xl font-extrabold mt-2 ${
          highlight
            ? "text-white"
            : "text-gray-900"
        }`}
      >
        {value}
      </p>

      <p
        className={`text-xs mt-3 ${
          highlight
            ? "text-emerald-100"
            : "text-gray-400"
        }`}
      >
        {description}
      </p>

    </div>
  );
}


/* =====================================================
   MINI METRIC
===================================================== */

function MiniMetric({ label, value }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
        {label}
      </p>

      <p className="text-xl font-extrabold text-gray-900 mt-2">
        {value}
      </p>

    </div>
  );
}


export default AdminAnalytics;