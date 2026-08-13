import { useEffect, useState } from "react";
import axios from "axios";

function FeedbackManagement() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const token = localStorage.getItem("token");

  const fetchFeedback = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "https://lmsproject-ntug.onrender.com/api/admin/feedback",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFeedback(res.data);
    } catch (error) {
      console.error("Fetch feedback error:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteFeedback = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this feedback?"
    );

    if (!confirmed) return;

    try {
      setDeleting(id);

      await axios.delete(
        `https://lmsproject-ntug.onrender.com/api/admin/feedback/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFeedback((prev) =>
        prev.filter((item) => item._id !== id)
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete feedback."
      );
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={
              star <= rating
                ? "text-yellow-400 text-lg"
                : "text-gray-300 text-lg"
            }
          >
            ★
          </span>
        ))}

        <span className="ml-2 text-sm font-semibold text-gray-600">
          {rating}/5
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Feedback Management
              </h1>

              <p className="text-slate-500 mt-1">
                Review and manage feedback submitted by students.
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Feedback
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-2">
              {feedback.length}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Average Rating
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-2">
              {feedback.length
                ? (
                    feedback.reduce(
                      (sum, item) => sum + Number(item.rating || 0),
                      0
                    ) / feedback.length
                  ).toFixed(1)
                : "0.0"}
              <span className="text-base text-slate-400 ml-1">
                / 5
              </span>
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Positive Ratings
            </p>

            <p className="text-3xl font-bold text-emerald-600 mt-2">
              {
                feedback.filter(
                  (item) => Number(item.rating) >= 4
                ).length
              }
            </p>
          </div>

        </div>

        {/* Feedback Section */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">

          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Student Reviews
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Latest feedback from your learners
              </p>
            </div>

            <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold">
              {feedback.length} Reviews
            </span>
          </div>

          {/* Loading */}
          {loading && (
            <div className="p-12 text-center">
              <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div>

              <p className="text-slate-500 mt-4">
                Loading feedback...
              </p>
            </div>
          )}

          {/* Empty */}
          {!loading && feedback.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
                <span className="text-2xl">💬</span>
              </div>

              <h3 className="text-lg font-semibold text-slate-900 mt-4">
                No feedback yet
              </h3>

              <p className="text-slate-500 mt-1">
                Student reviews will appear here once submitted.
              </p>
            </div>
          )}

          {/* Feedback Cards */}
          {!loading && feedback.length > 0 && (
            <div className="divide-y divide-slate-100">

              {feedback.map((item) => (
                <div
                  key={item._id}
                  className="p-6 hover:bg-slate-50 transition"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

                    {/* Left */}
                    <div className="flex gap-4 flex-1">

                      {/* Avatar */}
                      <div className="w-12 h-12 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                        {item.student?.name
                          ?.charAt(0)
                          ?.toUpperCase() || "S"}
                      </div>

                      <div className="flex-1">

                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-bold text-slate-900">
                            {item.student?.name || "Unknown Student"}
                          </h3>

                          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                            Student
                          </span>
                        </div>

                        {/* Course */}
                        <p className="text-sm text-slate-500 mt-1">
                          Course:{" "}
                          <span className="font-medium text-slate-700">
                            {item.course?.title || "Unknown Course"}
                          </span>
                        </p>

                        {/* Rating */}
                        <div className="mt-3">
                          {renderStars(Number(item.rating || 0))}
                        </div>

                        {/* Comment */}
                        <div className="mt-4 bg-slate-50 border border-slate-100 rounded-2xl p-4">
                          <p className="text-slate-700 leading-relaxed">
                            “{item.comment || "No written feedback."}”
                          </p>
                        </div>

                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex lg:flex-col items-center lg:items-end gap-3">

                      {item.createdAt && (
                        <p className="text-xs text-slate-400">
                          {new Date(
                            item.createdAt
                          ).toLocaleDateString()}
                        </p>
                      )}

                      <button
                        onClick={() => deleteFeedback(item._id)}
                        disabled={deleting === item._id}
                        className="px-4 py-2 rounded-xl border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 transition disabled:opacity-50"
                      >
                        {deleting === item._id
                          ? "Deleting..."
                          : "Delete"}
                      </button>

                    </div>

                  </div>
                </div>
              ))}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default FeedbackManagement;