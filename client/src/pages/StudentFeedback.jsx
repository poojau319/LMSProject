import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

function StudentFeedback() {
  const { courseId } = useParams();

  const [feedback, setFeedback] = useState({
    rating: 5,
    comment: "",
  });

  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const token = localStorage.getItem("token");

  const ratingLabels = {
    1: "Very Poor",
    2: "Poor",
    3: "Average",
    4: "Good",
    5: "Excellent",
  };

  const submitFeedback = async (e) => {
    e.preventDefault();

    if (!feedback.comment.trim()) {
      setMessage("Please share your experience before submitting.");
      setMessageType("error");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");
      setMessageType("");

      await axios.post(
        `http://localhost:5000/api/feedback/${courseId}`,
        {
          rating: Number(feedback.rating),
          comment: feedback.comment.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Thank you! Your feedback was submitted successfully. ⭐");
      setMessageType("success");

      setFeedback({
        rating: 5,
        comment: "",
      });

      setHoverRating(0);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to submit feedback. Please try again."
      );
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedRating = hoverRating || feedback.rating;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-10 sm:px-6">
      <div className="max-w-3xl mx-auto">

        {/* ================= HEADER ================= */}

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 text-3xl mb-4 shadow-sm">
            ⭐
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">
            Share Your Feedback
          </h1>

          <p className="text-slate-500 mt-3 max-w-xl mx-auto leading-relaxed">
            Your feedback helps us improve the learning experience
            and create better courses for everyone.
          </p>
        </div>

        {/* ================= FORM CARD ================= */}

        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden">

          {/* TOP BAR */}

          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 sm:px-8 py-5">
            <h2 className="text-white text-lg font-semibold">
              How was your learning experience?
            </h2>

            <p className="text-blue-100 text-sm mt-1">
              Rate the course and tell us what you think.
            </p>
          </div>

          <form onSubmit={submitFeedback} className="p-6 sm:p-8">

            {/* ================= MESSAGE ================= */}

            {message && (
              <div
                className={`mb-6 rounded-xl px-4 py-3 border ${
                  messageType === "success"
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">
                    {messageType === "success" ? "✓" : "!"}
                  </span>

                  <p className="text-sm font-medium">
                    {message}
                  </p>
                </div>
              </div>
            )}

            {/* ================= RATING ================= */}

            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-700 mb-4">
                Your Rating
              </label>

              <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-2xl py-7 px-4">

                {/* STARS */}

                <div className="flex items-center gap-2 sm:gap-3">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = star <= selectedRating;

                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setFeedback((previous) => ({
                            ...previous,
                            rating: star,
                          }))
                        }
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className={`text-4xl sm:text-5xl transition-all duration-200 focus:outline-none ${
                          active
                            ? "text-yellow-400 scale-110"
                            : "text-slate-300 hover:text-yellow-300"
                        }`}
                        aria-label={`Rate ${star} out of 5`}
                      >
                        ★
                      </button>
                    );
                  })}
                </div>

                {/* RATING TEXT */}

                <div className="mt-4 text-center">
                  <p className="text-lg font-bold text-slate-800">
                    {ratingLabels[selectedRating]}
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    {selectedRating} out of 5 stars
                  </p>
                </div>
              </div>
            </div>

            {/* ================= COMMENT ================= */}

            <div className="mb-7">
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="comment"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Your Feedback
                </label>

                <span className="text-xs text-slate-400">
                  {feedback.comment.length} characters
                </span>
              </div>

              <textarea
                id="comment"
                rows="6"
                value={feedback.comment}
                onChange={(e) =>
                  setFeedback((previous) => ({
                    ...previous,
                    comment: e.target.value,
                  }))
                }
                placeholder="Share your experience with this course. What did you like? What could be improved?"
                className="w-full border border-slate-300 rounded-2xl px-4 py-4 text-slate-700 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />

              <p className="text-xs text-slate-400 mt-2">
                Your honest feedback helps instructors improve their courses.
              </p>
            </div>

            {/* ================= BUTTONS ================= */}

            <div className="flex flex-col-reverse sm:flex-row gap-3">

              <Link
                to={`/student/course/${courseId}`}
                className="flex-1 text-center border border-slate-300 text-slate-700 font-semibold px-6 py-3.5 rounded-xl hover:bg-slate-50 transition"
              >
                Back to Course
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className={`flex-1 px-6 py-3.5 rounded-xl text-white font-semibold transition shadow-sm ${
                  submitting
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
                }`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  "Submit Feedback"
                )}
              </button>

            </div>
          </form>
        </div>

        {/* ================= FOOTER NOTE ================= */}

        <p className="text-center text-xs text-slate-400 mt-6">
          Thank you for helping us make the learning platform better. 💙
        </p>
      </div>
    </div>
  );
}

export default StudentFeedback;