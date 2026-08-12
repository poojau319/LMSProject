import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function StudentProgress() {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingCertificate, setDownloadingCertificate] =
    useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          "http://localhost:5000/api/progress/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setProgress(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Progress error:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load your learning progress."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProgress();
    } else {
      setLoading(false);
      setError("Please login to view your progress.");
    }
  }, [token]);

  // =====================================================
  // DOWNLOAD CERTIFICATE
  // =====================================================

  const downloadCertificate = async (courseId, courseName) => {
    if (!courseId) {
      alert("Course ID is missing.");
      return;
    }

    try {
      setDownloadingCertificate(courseId);

      const response = await axios.get(
        `http://localhost:5000/api/progress/${courseId}/certificate`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `Certificate-${
        courseName || "Course"
      }.pdf`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Certificate download error:",
        error
      );

      // Blob response ko readable error me convert karne ki koshish
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const data = JSON.parse(text);

          alert(
            data.message ||
              "Unable to download certificate."
          );
        } catch {
          alert("Unable to download certificate.");
        }
      } else {
        alert(
          error.response?.data?.message ||
            "Unable to download certificate."
        );
      }
    } finally {
      setDownloadingCertificate(null);
    }
  };

  // =====================================================
  // PROGRESS COLORS
  // =====================================================

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 50) return "text-blue-600";
    if (percentage >= 25) return "text-yellow-600";
    return "text-red-500";
  };

  // =====================================================
  // PROGRESS MESSAGE
  // =====================================================

  const getProgressMessage = (percentage) => {
    if (percentage >= 90) return "Excellent work! 🎉";
    if (percentage >= 75) return "Great progress! 🚀";
    if (percentage >= 50) return "You're doing well! 💪";
    if (percentage > 0) return "Keep learning! 📚";
    return "Let's get started! 🌱";
  };

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalCourses = progress.length;

  const completedCourses = progress.filter(
    (item) => Number(item.percentage) >= 100
  ).length;

  const averageProgress =
    totalCourses > 0
      ? Math.round(
          progress.reduce(
            (sum, item) =>
              sum + (Number(item.percentage) || 0),
            0
          ) / totalCourses
        )
      : 0;

  const certificates = progress.filter(
    (item) => item.certificateIssued
  ).length;

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-7">

          <div className="flex items-center justify-between gap-4">

            <div>
              <p className="text-blue-100 text-xs font-medium mb-1">
                STUDENT DASHBOARD
              </p>

              <h1 className="text-2xl md:text-3xl font-bold">
                My Learning Progress 📊
              </h1>

              <p className="text-blue-100 text-sm mt-1">
                Track your courses and learning achievements.
              </p>
            </div>

            <Link
              to="/courses"
              className="hidden sm:inline-flex bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition"
            >
              Explore Courses →
            </Link>

          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-7">

        {/* ERROR */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (

          <div className="grid md:grid-cols-3 gap-4">

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-white rounded-xl p-5 shadow-sm animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="h-7 bg-gray-200 rounded w-1/3 mb-4" />
                <div className="h-2 bg-gray-200 rounded w-full" />
              </div>
            ))}

          </div>

        ) : progress.length === 0 ? (

          /* EMPTY */
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">

            <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 flex items-center justify-center text-2xl">
              📚
            </div>

            <h2 className="text-xl font-bold text-gray-800 mt-4">
              Start Your Learning Journey
            </h2>

            <p className="text-gray-500 text-sm mt-2">
              Enroll in a course to start tracking your progress.
            </p>

            <Link
              to="/courses"
              className="inline-block mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold"
            >
              Browse Courses
            </Link>

          </div>

        ) : (

          <>
            {/* SUMMARY */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

              <SummaryCard
                title="Enrolled Courses"
                value={totalCourses}
                icon="📚"
              />

              <SummaryCard
                title="Overall Progress"
                value={`${averageProgress}%`}
                icon="📈"
              />

              <SummaryCard
                title="Completed"
                value={completedCourses}
                icon="🎯"
              />

              <SummaryCard
                title="Certificates"
                value={certificates}
                icon="🏆"
              />

            </div>

            {/* TITLE */}
            <div className="mb-5">

              <h2 className="text-xl font-bold text-gray-800">
                Your Courses
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Continue where you left off.
              </p>

            </div>

            {/* COURSES */}
            <div className="grid lg:grid-cols-2 gap-5">

              {progress.map((item, index) => {

                const percentage = Math.min(
                  100,
                  Math.max(
                    0,
                    Number(item.percentage) || 0
                  )
                );

                const totalLectures =
                  Number(item.totalLectures) || 0;

                const completedLectures =
                  Number(item.completedLectures) || 0;

                const lecturePercentage =
                  totalLectures > 0
                    ? Math.round(
                        (completedLectures /
                          totalLectures) *
                          100
                      )
                    : 0;

                const isDownloading =
                  downloadingCertificate ===
                  item.courseId;

                return (
                  <div
                    key={item._id || index}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden"
                  >

                    {/* COURSE CONTENT */}
                    <div className="p-5">

                      {/* TOP */}
                      <div className="flex items-center justify-between gap-3">

                        <div className="flex items-center gap-3 min-w-0">

                          <div className="w-11 h-11 shrink-0 rounded-lg bg-blue-600 text-white flex items-center justify-center text-lg font-bold">
                            {item.courseName
                              ?.charAt(0)
                              ?.toUpperCase() || "C"}
                          </div>

                          <div className="min-w-0">

                            <h3 className="font-bold text-gray-800 truncate">
                              {item.courseName || "Course"}
                            </h3>

                            <p className="text-xs text-gray-500 mt-0.5">
                              {item.level || "Learning Course"}

                              {item.duration
                                ? ` • ${item.duration}`
                                : ""}
                            </p>

                          </div>

                        </div>

                        <div className="text-right shrink-0">

                          <p
                            className={`text-xl font-bold ${getProgressColor(
                              percentage
                            )}`}
                          >
                            {percentage}%
                          </p>

                          <p className="text-[11px] text-gray-400">
                            complete
                          </p>

                        </div>

                      </div>

                      {/* PROGRESS BAR */}
                      <div className="mt-5">

                        <div className="flex justify-between text-xs mb-2">

                          <span className="text-gray-500">
                            Course Progress
                          </span>

                          <span className="font-semibold text-gray-700">
                            {percentage}%
                          </span>

                        </div>

                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">

                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />

                        </div>

                        <p className="text-xs text-blue-600 font-medium mt-2">
                          {getProgressMessage(percentage)}
                        </p>

                      </div>

                      {/* STATS */}
                      <div className="grid grid-cols-3 gap-2 mt-5">

                        <ProgressStat
                          icon="🎥"
                          value={`${completedLectures}/${totalLectures}`}
                          label="Lectures"
                        />

                        <ProgressStat
                          icon="📝"
                          value={`${item.assignmentMarks || 0}%`}
                          label="Assignment"
                        />

                        <ProgressStat
                          icon="🧠"
                          value={`${item.quizScore || 0}%`}
                          label="Quiz"
                        />

                      </div>

                      {/* CERTIFICATE */}
                      {item.certificateIssued ? (

                        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">

                          <div className="flex items-center gap-2">

                            <span className="text-lg">
                              🏆
                            </span>

                            <div>
                              <p className="text-sm font-semibold text-green-700">
                                Certificate Earned
                              </p>

                              <p className="text-[11px] text-green-600">
                                Congratulations! You completed the course.
                              </p>
                            </div>

                          </div>

                          <button
                            type="button"
                            disabled={isDownloading}
                            onClick={() =>
                              downloadCertificate(
                                item.courseId,
                                item.courseName
                              )
                            }
                            className={`mt-3 w-full py-2.5 rounded-lg text-sm font-semibold text-white transition ${
                              isDownloading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                          >
                            {isDownloading
                              ? "Generating Certificate..."
                              : "🏆 Download Certificate"}
                          </button>

                        </div>

                      ) : (

                        <div className="mt-4 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">

                          <span className="text-lg">
                            🎓
                          </span>

                          <div>
                            <p className="text-sm font-semibold text-gray-700">
                              Certificate
                            </p>

                            <p className="text-[11px] text-gray-500">
                              Complete the course to earn it.
                            </p>
                          </div>

                        </div>

                      )}

                    </div>

                    {/* FOOTER */}
                    <div className="border-t border-gray-100 bg-gray-50 px-5 py-3">

                      <div className="flex items-center justify-between">

                        <p className="text-xs text-gray-500">
                          Lectures:{" "}
                          <span className="font-semibold text-gray-700">
                            {lecturePercentage}%
                          </span>
                        </p>

                        {item.courseId && (
                          <Link
                            to={`/student/course/${item.courseId}`}
                            className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                          >
                            Continue Learning →
                          </Link>
                        )}

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>
          </>
        )}

      </div>
    </div>
  );
}

/* ================= SUMMARY CARD ================= */

function SummaryCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-xs text-gray-500">
            {title}
          </p>

          <p className="text-2xl font-bold text-gray-800 mt-1">
            {value}
          </p>

        </div>

        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-lg">
          {icon}
        </div>

      </div>

    </div>
  );
}

/* ================= PROGRESS STAT ================= */

function ProgressStat({ icon, value, label }) {
  return (
    <div className="bg-gray-50 rounded-lg px-2 py-3 text-center">

      <div className="text-sm">
        {icon}
      </div>

      <p className="text-sm font-bold text-gray-800 mt-1">
        {value}
      </p>

      <p className="text-[10px] text-gray-500">
        {label}
      </p>

    </div>
  );
}

export default StudentProgress;