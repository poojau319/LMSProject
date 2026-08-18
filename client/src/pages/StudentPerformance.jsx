import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API =
  "https://lmsproject-ntug.onrender.com/api/instructor/student-performance";

const clamp = (value, min = 0, max = 100) => {
  const number = Number(value);

  if (Number.isNaN(number)) return min;

  return Math.min(Math.max(number, min), max);
};

const getPerformanceStatus = (progress) => {
  const value = clamp(progress);

  if (value >= 75) {
    return {
      label: "Excellent",
      className:
        "bg-green-100 text-green-700 border-green-200",
    };
  }

  if (value >= 40) {
    return {
      label: "Needs Improvement",
      className:
        "bg-yellow-100 text-yellow-700 border-yellow-200",
    };
  }

  return {
    label: "Low Progress",
    className:
      "bg-red-100 text-red-700 border-red-200",
  };
};

function StudentPerformance() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [performance, setPerformance] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [courseFilter, setCourseFilter] = useState("all");

  const [statusFilter, setStatusFilter] = useState("all");

  const [sortBy, setSortBy] = useState("progress-desc");

  // =====================================================
  // FETCH PERFORMANCE
  // =====================================================

  const fetchPerformance = async (showRefresh = false) => {
    if (!token) {
      setError("Your session has expired. Please login again.");
      setLoading(false);
      return;
    }

    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await axios.get(API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.performance)
        ? response.data.performance
        : Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      setPerformance(data);
    } catch (err) {
      console.error("Student performance error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load student performance."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  // =====================================================
  // COURSE LIST
  // =====================================================

  const courses = useMemo(() => {
    const uniqueCourses = new Map();

    performance.forEach((item) => {
      const courseId =
        item.course?._id ||
        item.course?.id ||
        item.course?.title;

      const courseTitle =
        item.course?.title || "Unknown Course";

      if (courseId) {
        uniqueCourses.set(courseId, courseTitle);
      }
    });

    return Array.from(uniqueCourses.entries()).map(
      ([id, title]) => ({
        id,
        title,
      })
    );
  }, [performance]);

  // =====================================================
  // NORMALIZED DATA
  // =====================================================

  const normalizedPerformance = useMemo(() => {
    return performance.map((item) => {
      const progress = clamp(item.percentage);

      const quizScore = Number(item.quizScore) || 0;

      const assignmentMarks =
        Number(item.assignmentMarks) || 0;

      const overall =
        Number(item.overallScore) ||
        Number(item.overall) ||
        Math.round(
          (progress + quizScore + assignmentMarks) / 3
        );

      return {
        ...item,

        normalizedProgress: progress,

        normalizedQuizScore: quizScore,

        normalizedAssignmentMarks: assignmentMarks,

        normalizedOverall: clamp(overall),

        status: getPerformanceStatus(progress),
      };
    });
  }, [performance]);

  // =====================================================
  // FILTER + SEARCH + SORT
  // =====================================================

  const filteredPerformance = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    let result = normalizedPerformance.filter((item) => {
      const studentName =
        item.student?.name?.toLowerCase() || "";

      const studentEmail =
        item.student?.email?.toLowerCase() || "";

      const courseTitle =
        item.course?.title?.toLowerCase() || "";

      const matchesSearch =
        !searchValue ||
        studentName.includes(searchValue) ||
        studentEmail.includes(searchValue) ||
        courseTitle.includes(searchValue);

      const currentCourseId =
        item.course?._id ||
        item.course?.id ||
        item.course?.title;

      const matchesCourse =
        courseFilter === "all" ||
        currentCourseId === courseFilter;

      const matchesStatus =
        statusFilter === "all" ||
        item.status.label === statusFilter;

      return (
        matchesSearch &&
        matchesCourse &&
        matchesStatus
      );
    });

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "progress-asc":
          return (
            a.normalizedProgress -
            b.normalizedProgress
          );

        case "progress-desc":
          return (
            b.normalizedProgress -
            a.normalizedProgress
          );

        case "quiz-desc":
          return (
            b.normalizedQuizScore -
            a.normalizedQuizScore
          );

        case "assignment-desc":
          return (
            b.normalizedAssignmentMarks -
            a.normalizedAssignmentMarks
          );

        case "student-asc":
          return (
            (a.student?.name || "").localeCompare(
              b.student?.name || ""
            )
          );

        default:
          return 0;
      }
    });

    return result;
  }, [
    normalizedPerformance,
    search,
    courseFilter,
    statusFilter,
    sortBy,
  ]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const statistics = useMemo(() => {
    const total = normalizedPerformance.length;

    if (total === 0) {
      return {
        total: 0,
        averageProgress: 0,
        excellent: 0,
        needsImprovement: 0,
        lowProgress: 0,
      };
    }

    const averageProgress = Math.round(
      normalizedPerformance.reduce(
        (sum, item) =>
          sum + item.normalizedProgress,
        0
      ) / total
    );

    const excellent = normalizedPerformance.filter(
      (item) => item.status.label === "Excellent"
    ).length;

    const needsImprovement =
      normalizedPerformance.filter(
        (item) =>
          item.status.label ===
          "Needs Improvement"
      ).length;

    const lowProgress =
      normalizedPerformance.filter(
        (item) => item.status.label === "Low Progress"
      ).length;

    return {
      total,
      averageProgress,
      excellent,
      needsImprovement,
      lowProgress,
    };
  }, [normalizedPerformance]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded-lg w-72" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-32 bg-white rounded-2xl shadow"
                />
              ))}
            </div>

            <div className="h-20 bg-white rounded-2xl shadow" />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-80 bg-white rounded-2xl shadow"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

          <div>
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
              Instructor Analytics
            </p>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-1">
              Student Performance 📊
            </h1>

            <p className="text-gray-500 mt-2">
              Monitor student progress, quiz performance
              and assignment results across your courses.
            </p>
          </div>

          <div className="flex gap-3">

            <button
              type="button"
              onClick={() => fetchPerformance(true)}
              disabled={refreshing}
              className="px-5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50"
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh"}
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/instructor-dashboard")
              }
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              ← Dashboard
            </button>

          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
            <div className="flex gap-3">
              <span>⚠️</span>

              <div>
                <p className="font-semibold">
                  Unable to load performance
                </p>

                <p className="text-sm mt-1">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5 mb-8">

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500">
              Total Records
            </p>

            <p className="text-3xl font-bold text-gray-900 mt-2">
              {statistics.total}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Student-course performance records
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500">
              Average Progress
            </p>

            <p className="text-3xl font-bold text-blue-600 mt-2">
              {statistics.averageProgress}%
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Across all records
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500">
              Excellent
            </p>

            <p className="text-3xl font-bold text-green-600 mt-2">
              {statistics.excellent}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              75% or above
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500">
              Needs Improvement
            </p>

            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {statistics.needsImprovement}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              40% – 74%
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500">
              Low Progress
            </p>

            <p className="text-3xl font-bold text-red-600 mt-2">
              {statistics.lowProgress}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Below 40%
            </p>
          </div>

        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

            {/* Search */}

            <div className="xl:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Student, email or course..."
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Course */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Course
              </label>

              <select
                value={courseFilter}
                onChange={(e) =>
                  setCourseFilter(e.target.value)
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">
                  All Courses
                </option>

                {courses.map((course) => (
                  <option
                    key={course.id}
                    value={course.id}
                  >
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Performance
              </label>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">
                  All Performance
                </option>

                <option value="Excellent">
                  Excellent
                </option>

                <option value="Needs Improvement">
                  Needs Improvement
                </option>

                <option value="Low Progress">
                  Low Progress
                </option>
              </select>
            </div>

            {/* Sort */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sort By
              </label>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="progress-desc">
                  Highest Progress
                </option>

                <option value="progress-asc">
                  Lowest Progress
                </option>

                <option value="quiz-desc">
                  Highest Quiz Score
                </option>

                <option value="assignment-desc">
                  Highest Assignment Marks
                </option>

                <option value="student-asc">
                  Student Name
                </option>
              </select>
            </div>

          </div>

          {/* Filter summary */}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5 pt-4 border-t">

            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-800">
                {filteredPerformance.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-800">
                {performance.length}
              </span>{" "}
              records
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCourseFilter("all");
                setStatusFilter("all");
                setSortBy("progress-desc");
              }}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Clear Filters
            </button>

          </div>
        </div>

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {performance.length === 0 && !error && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">

            <div className="text-6xl mb-5">
              📊
            </div>

            <h2 className="text-2xl font-bold text-gray-800">
              No Student Performance Yet
            </h2>

            <p className="text-gray-500 mt-2 max-w-lg mx-auto">
              Student performance will appear here when
              students enroll and start completing your
              courses, quizzes and assignments.
            </p>

          </div>
        )}

        {/* =================================================
            FILTERED EMPTY
        ================================================= */}

        {performance.length > 0 &&
          filteredPerformance.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">

              <div className="text-5xl mb-4">
                🔍
              </div>

              <h2 className="text-xl font-bold text-gray-800">
                No Matching Records
              </h2>

              <p className="text-gray-500 mt-2">
                Try changing your search or filters.
              </p>

            </div>
          )}

        {/* =================================================
            PERFORMANCE CARDS
        ================================================= */}

        {filteredPerformance.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {filteredPerformance.map(
              (item, index) => {

                const progress =
                  item.normalizedProgress;

                const quizScore =
                  item.normalizedQuizScore;

                const assignmentMarks =
                  item.normalizedAssignmentMarks;

                return (
                  <div
                    key={
                      item._id ||
                      `${item.student?._id}-${item.course?._id}-${index}`
                    }
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
                  >

                    {/* CARD HEADER */}

                    <div className="p-6 border-b border-gray-100">

                      <div className="flex items-start justify-between gap-4">

                        <div className="min-w-0">

                          <h2 className="text-xl font-bold text-gray-900 truncate">
                            {item.student?.name ||
                              "Unknown Student"}
                          </h2>

                          <p className="text-sm text-gray-500 mt-1 truncate">
                            {item.student?.email ||
                              "No email available"}
                          </p>

                        </div>

                        <span
                          className={`shrink-0 px-3 py-1.5 rounded-full border text-xs font-bold ${item.status.className}`}
                        >
                          {item.status.label}
                        </span>

                      </div>

                      {/* COURSE */}

                      <div className="mt-5 bg-blue-50 border border-blue-100 rounded-xl p-4">

                        <p className="text-xs text-blue-500 font-semibold uppercase">
                          Course
                        </p>

                        <p className="font-bold text-blue-800 mt-1">
                          {item.course?.title ||
                            "Unknown Course"}
                        </p>

                      </div>

                    </div>

                    {/* CARD BODY */}

                    <div className="p-6">

                      {/* PROGRESS */}

                      <div className="mb-6">

                        <div className="flex justify-between items-center mb-2">

                          <span className="text-sm font-semibold text-gray-700">
                            Course Progress
                          </span>

                          <span className="text-sm font-bold text-blue-600">
                            {progress}%
                          </span>

                        </div>

                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">

                          <div
                            className="h-full bg-blue-600 rounded-full transition-all"
                            style={{
                              width: `${progress}%`,
                            }}
                          />

                        </div>

                      </div>

                      {/* SCORES */}

                      <div className="grid grid-cols-2 gap-4">

                        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">

                          <p className="text-xs text-purple-500 font-semibold uppercase">
                            Quiz Score
                          </p>

                          <p className="text-2xl font-bold text-purple-700 mt-1">
                            {quizScore}
                          </p>

                        </div>

                        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">

                          <p className="text-xs text-orange-500 font-semibold uppercase">
                            Assignment
                          </p>

                          <p className="text-2xl font-bold text-orange-700 mt-1">
                            {assignmentMarks}
                          </p>

                        </div>

                      </div>

                      {/* STATUS */}

                      <div className="mt-6 pt-5 border-t border-gray-100">

                        <div className="flex items-center justify-between">

                          <span className="text-sm text-gray-500">
                            Overall Progress
                          </span>

                          <span
                            className={`font-bold ${
                              progress >= 75
                                ? "text-green-600"
                                : progress >= 40
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {progress}%
                          </span>

                        </div>

                        <p className="text-xs text-gray-400 mt-2">
                          Based on current course progress
                          and available performance data.
                        </p>

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>
    </div>
  );
}

export default StudentPerformance;