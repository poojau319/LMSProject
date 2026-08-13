import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const API = "https://lmsproject-ntug.onrender.com/api";

function StudentCourseDetails() {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);

  const [error, setError] = useState("");

  // =====================================================
  // LECTURE PROGRESS
  // =====================================================

  const [completedLectures, setCompletedLectures] = useState(0);
  const [completingLecture, setCompletingLecture] = useState(null);
  const [lectureSuccess, setLectureSuccess] = useState("");

  const token = localStorage.getItem("token");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // =====================================================
  // FETCH COURSE
  // =====================================================

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API}/courses/${id}`,
        authConfig
      );

      setCourse(response.data);
    } catch (error) {
      console.error("Course details error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load course."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH STUDENT PROGRESS
  // =====================================================

  const fetchProgress = async () => {
    if (!id || !token) return;

    try {
      const response = await axios.get(
        `${API}/progress/${id}`,
        authConfig
      );

      const progress = response.data;

      // Backend stores completedLectures as NUMBER
      setCompletedLectures(
        Number(progress?.completedLectures) || 0
      );
    } catch (error) {
      console.error("Progress fetch error:", error);
    }
  };

  // =====================================================
  // MARK LECTURE COMPLETE
  // =====================================================

  const markLectureComplete = async (lectureIndex) => {
    if (!token) {
      alert("Please login first.");
      return;
    }

    try {
      setCompletingLecture(lectureIndex);
      setLectureSuccess("");

      // Example:
      // Lecture 1 -> 1
      // Lecture 2 -> 2
      // Lecture 3 -> 3

      const newCompletedCount = lectureIndex + 1;

      await axios.put(
        `${API}/progress/${id}/lecture`,
        {
          completedLectures: newCompletedCount,
        },
        authConfig
      );

      // Update UI immediately
      setCompletedLectures(newCompletedCount);

      setLectureSuccess(
        "Lecture completed successfully ✅"
      );

      // Refresh actual progress from backend
      await fetchProgress();

      setTimeout(() => {
        setLectureSuccess("");
      }, 3000);
    } catch (error) {
      console.error(
        "Complete lecture error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to mark lecture as completed."
      );
    } finally {
      setCompletingLecture(null);
    }
  };

  // =====================================================
  // CHECK LECTURE COMPLETION
  // =====================================================

  const isLectureCompleted = (lectureIndex) => {
    return lectureIndex < completedLectures;
  };

  // =====================================================
  // FETCH ASSIGNMENTS
  // =====================================================

  const fetchAssignments = async () => {
    try {
      setAssignmentsLoading(true);

      const response = await axios.get(
        `${API}/assignments/course/${id}`,
        authConfig
      );

      setAssignments(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Assignments error:",
        error
      );

      setAssignments([]);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  // =====================================================
  // FETCH FEEDBACK
  // =====================================================

  const fetchFeedback = async () => {
    try {
      setFeedbackLoading(true);

      const response = await axios.get(
        `${API}/feedback/${id}`,
        authConfig
      );

      setFeedback(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Feedback error:",
        error
      );

      setFeedback([]);
    } finally {
      setFeedbackLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    if (!id) return;

    fetchCourse();
    fetchAssignments();
    fetchFeedback();
    fetchProgress();
  }, [id]);

  // =====================================================
  // YOUTUBE URL -> EMBED URL
  // =====================================================

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;

    try {
      const parsedUrl = new URL(url);

      let videoId = "";

      if (
        parsedUrl.hostname.includes(
          "youtube.com"
        )
      ) {
        videoId =
          parsedUrl.searchParams.get("v") || "";

        if (!videoId) {
          const embedMatch =
            parsedUrl.pathname.match(
              /\/embed\/([^/]+)/
            );

          if (embedMatch) {
            videoId = embedMatch[1];
          }
        }

        if (!videoId) {
          const shortsMatch =
            parsedUrl.pathname.match(
              /\/shorts\/([^/]+)/
            );

          if (shortsMatch) {
            videoId = shortsMatch[1];
          }
        }
      }

      if (
        parsedUrl.hostname ===
        "youtu.be"
      ) {
        videoId =
          parsedUrl.pathname
            .replace("/", "")
            .split("?")[0];
      }

      if (!videoId) {
        return null;
      }

      return `https://www.youtube.com/embed/${videoId}`;
    } catch (error) {
      console.error(
        "Invalid YouTube URL:",
        error
      );

      return null;
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white shadow rounded-xl px-8 py-6 text-gray-600">
          Loading course...
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">

          <div className="bg-red-100 border border-red-200 text-red-700 p-5 rounded-xl">
            {error || "Course not found."}
          </div>

          <Link
            to="/student-courses"
            className="inline-block mt-5 bg-blue-600 text-white px-5 py-2.5 rounded-lg"
          >
            ← Back to Courses
          </Link>

        </div>
      </div>
    );
  }

  const lectures = Array.isArray(course.lectures)
    ? course.lectures
    : [];

  const quizzes = Array.isArray(course.quizzes)
    ? course.quizzes
    : [];

  // =====================================================
  // LECTURE PROGRESS CALCULATION
  // =====================================================

  const totalLectures = lectures.length;

  const completedLectureCount = Math.min(
    completedLectures,
    totalLectures
  );

  const lecturePercentage =
    totalLectures > 0
      ? Math.round(
          (completedLectureCount /
            totalLectures) *
            100
        )
      : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">

      <div className="max-w-6xl mx-auto">

        {/* =====================================================
            BACK
        ===================================================== */}

        <div className="mb-6">
          <Link
            to="/student-courses"
            className="text-blue-600 font-semibold hover:underline"
          >
            ← Back to My Courses
          </Link>
        </div>

        {/* =====================================================
            COURSE HEADER
        ===================================================== */}

        <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 mb-8">

          <div className="flex flex-col md:flex-row gap-6">

            {course.image && (
              <img
                src={course.image}
                alt={course.title}
                className="w-full md:w-64 h-40 object-cover rounded-xl"
              />
            )}

            <div className="flex-1">

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {course.title}
              </h1>

              {course.description && (
                <p className="mt-3 text-gray-600 leading-relaxed">
                  {course.description}
                </p>
              )}

              <div className="flex flex-wrap gap-3 mt-5">

                <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                  Duration:{" "}
                  {course.duration || "N/A"}
                </span>

                <span className="bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">
                  Level:{" "}
                  {course.level || "N/A"}
                </span>

                <span className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                  {lectures.length} Lecture
                  {lectures.length !== 1
                    ? "s"
                    : ""}
                </span>

                <span className="bg-orange-50 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold">
                  {quizzes.length} Quiz Question
                  {quizzes.length !== 1
                    ? "s"
                    : ""}
                </span>

              </div>

            </div>

          </div>

          {/* =====================================================
              LECTURE PROGRESS
          ===================================================== */}

          {totalLectures > 0 && (
            <div className="mt-7 pt-6 border-t">

              <div className="flex justify-between items-center mb-2">

                <p className="font-semibold text-gray-800">
                  Lecture Progress
                </p>

                <p className="text-sm font-semibold text-blue-600">
                  {completedLectureCount} /{" "}
                  {totalLectures} completed
                </p>

              </div>

              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">

                <div
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{
                    width: `${lecturePercentage}%`,
                  }}
                />

              </div>

              <p className="text-xs text-gray-500 mt-2">
                {lecturePercentage}% lectures completed
              </p>

            </div>
          )}

        </div>

        {/* =====================================================
            SUCCESS MESSAGE
        ===================================================== */}

        {lectureSuccess && (
          <div className="bg-green-100 border border-green-200 text-green-700 p-4 rounded-xl mb-6">
            {lectureSuccess}
          </div>
        )}

        {/* =====================================================
            LECTURES
        ===================================================== */}

        <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 mb-8">

          <div className="flex items-center justify-between mb-6">

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Course Lectures 🎥
              </h2>

              <p className="text-gray-500 mt-1">
                Watch lectures and mark them as completed.
              </p>
            </div>

            <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold">
              {completedLectureCount}/
              {lectures.length}
            </span>

          </div>

          {lectures.length === 0 ? (

            <div className="bg-gray-50 rounded-xl p-8 text-center">

              <div className="text-5xl mb-3">
                🎥
              </div>

              <h3 className="text-xl font-semibold text-gray-800">
                No lectures available
              </h3>

              <p className="text-gray-500 mt-2">
                Your instructor has not added any
                lectures yet.
              </p>

            </div>

          ) : (

            <div className="space-y-8">

              {lectures.map(
                (lecture, index) => {

                  const youtubeEmbed =
                    getYouTubeEmbedUrl(
                      lecture.youtubeUrl
                    );

                  const completed =
                    isLectureCompleted(index);

                  const completing =
                    completingLecture === index;

                  return (
                    <div
                      key={
                        lecture._id || index
                      }
                      className={`border rounded-2xl overflow-hidden ${
                        completed
                          ? "border-green-300"
                          : "border-gray-200"
                      }`}
                    >

                      {/* LECTURE HEADER */}

                      <div
                        className={`p-5 md:p-6 border-b ${
                          completed
                            ? "bg-green-50"
                            : "bg-gray-50"
                        }`}
                      >

                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">

                          <div>

                            <div className="flex items-center gap-2">

                              <p className="text-sm text-blue-600 font-semibold">
                                Lecture {index + 1}
                              </p>

                              {completed && (
                                <span className="text-xs bg-green-600 text-white px-2.5 py-1 rounded-full font-semibold">
                                  ✓ Completed
                                </span>
                              )}

                            </div>

                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
                              {lecture.title}
                            </h3>

                          </div>

                          {lecture.duration && (
                            <span className="bg-white border text-gray-700 px-3 py-1.5 rounded-full text-sm font-semibold">
                              ⏱ {lecture.duration}
                            </span>
                          )}

                        </div>

                        {lecture.description && (
                          <p className="text-gray-600 mt-3 leading-relaxed">
                            {lecture.description}
                          </p>
                        )}

                      </div>

                      {/* LECTURE CONTENT */}

                      <div className="p-5 md:p-6">

                        {youtubeEmbed ? (

                          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">

                            <iframe
                              src={youtubeEmbed}
                              title={lecture.title}
                              className="absolute inset-0 w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            />

                          </div>

                        ) : lecture.videoUrl ? (

                          <div className="bg-black rounded-xl overflow-hidden">

                            <video
                              src={lecture.videoUrl}
                              controls
                              preload="metadata"
                              className="w-full max-h-[600px]"
                              onEnded={() =>
                                markLectureComplete(
                                  index
                                )
                              }
                            >
                              Your browser does not
                              support video playback.
                            </video>

                          </div>

                        ) : null}

                        {/* NO CONTENT */}

                        {!youtubeEmbed &&
                          !lecture.videoUrl &&
                          !lecture.pdfUrl && (
                            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-xl">
                              No lecture content is available.
                            </div>
                          )}

                        {/* ACTIONS */}

                        <div className="flex flex-wrap gap-3 mt-5">

                          {lecture.youtubeUrl && (
                            <a
                              href={lecture.youtubeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-semibold transition"
                            >
                              ▶ Open YouTube
                            </a>
                          )}

                          {lecture.videoUrl && (
                            <a
                              href={lecture.videoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold transition"
                            >
                              🎥 Open Video
                            </a>
                          )}

                          {lecture.pdfUrl && (
                            <a
                              href={lecture.pdfUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-semibold transition"
                            >
                              📄 Open PDF
                            </a>
                          )}

                        </div>

                        {/* PDF */}

                        {lecture.pdfUrl && (
                          <div className="mt-6">

                            <p className="font-semibold text-gray-800 mb-3">
                              📄 Lecture Notes
                            </p>

                            <div className="border rounded-xl overflow-hidden">

                              <iframe
                                src={lecture.pdfUrl}
                                title={`${lecture.title} PDF`}
                                className="w-full h-[500px]"
                              />

                            </div>

                          </div>
                        )}

                        {/* COMPLETE BUTTON */}

                        <div className="mt-6 pt-5 border-t">

                          {completed ? (

                            <div className="w-full bg-green-100 border border-green-200 text-green-700 py-3 rounded-lg text-center font-semibold">
                              ✓ Lecture Completed
                            </div>

                          ) : (

                            <button
                              type="button"
                              disabled={completing}
                              onClick={() =>
                                markLectureComplete(
                                  index
                                )
                              }
                              className={`w-full py-3 rounded-lg text-white font-semibold transition ${
                                completing
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-blue-600 hover:bg-blue-700"
                              }`}
                            >
                              {completing
                                ? "Saving Progress..."
                                : "Mark Lecture as Complete ✓"}
                            </button>

                          )}

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </div>

        {/* =====================================================
            ASSIGNMENTS
        ===================================================== */}

        <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 mb-8">

          <div className="flex justify-between items-center mb-6">

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Assignments 📝
              </h2>

              <p className="text-gray-500 mt-1">
                Open assignments and submit your work.
              </p>
            </div>

            <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold">
              {assignments.length}
            </span>

          </div>

          {assignmentsLoading ? (

            <div className="bg-gray-50 p-8 rounded-xl text-center text-gray-500">
              Loading assignments...
            </div>

          ) : assignments.length === 0 ? (

            <div className="bg-gray-50 p-8 rounded-xl text-center">

              <div className="text-4xl mb-3">
                📝
              </div>

              <h3 className="font-semibold text-gray-800">
                No assignments available
              </h3>

            </div>

          ) : (

            <div className="space-y-4">

              {assignments.map(
                (assignment, index) => (

                  <div
                    key={
                      assignment._id ||
                      index
                    }
                    className="border border-gray-200 p-5 rounded-xl hover:shadow-md transition"
                  >

                    <div className="flex flex-col md:flex-row md:justify-between gap-4">

                      <div>

                        <p className="text-sm text-blue-600 font-semibold">
                          Assignment {index + 1}
                        </p>

                        <h3 className="font-bold text-xl mt-1">
                          {assignment.title}
                        </h3>

                        {assignment.description && (
                          <p className="text-gray-600 mt-2">
                            {assignment.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-3 mt-3">

                          {assignment.dueDate && (
                            <span className="text-sm bg-red-50 text-red-700 px-3 py-1 rounded-full">
                              Due:{" "}
                              {new Date(
                                assignment.dueDate
                              ).toLocaleDateString()}
                            </span>
                          )}

                          <span className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full">
                            Marks:{" "}
                            {assignment.totalMarks}
                          </span>

                        </div>

                      </div>

                      <div className="flex items-center">

                        <Link
                          to={`/student/assignment/${assignment._id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition"
                        >
                          Open Assignment →
                        </Link>

                      </div>

                    </div>

                  </div>
                )
              )}

            </div>

          )}

        </div>

        {/* =====================================================
            QUIZ + FEEDBACK
        ===================================================== */}

        <div className="grid md:grid-cols-2 gap-6 mb-8">

          {/* QUIZ */}

          <div className="bg-white p-6 rounded-2xl shadow-sm border">

            <div className="text-4xl mb-3">
              🧠
            </div>

            <h2 className="text-xl font-bold">
              Course Quiz
            </h2>

            <p className="text-gray-600 mt-2">
              {quizzes.length} question
              {quizzes.length !== 1
                ? "s"
                : ""}{" "}
              available.
            </p>

            {quizzes.length > 0 ? (

              <Link
                to={`/student/quiz/${course._id}`}
                className="inline-block mt-4 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold transition"
              >
                Take Quiz →
              </Link>

            ) : (

              <button
                type="button"
                disabled
                className="mt-4 bg-gray-300 text-gray-600 px-5 py-2.5 rounded-lg font-semibold cursor-not-allowed"
              >
                No Quiz Available
              </button>

            )}

          </div>

          {/* FEEDBACK */}

          <div className="bg-white p-6 rounded-2xl shadow-sm border">

            <div className="text-4xl mb-3">
              ⭐
            </div>

            <h2 className="text-xl font-bold">
              Course Feedback
            </h2>

            <p className="text-gray-600 mt-2">
              Share your experience with this course.
            </p>

            <Link
              to={`/student/feedback/${course._id}`}
              className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition"
            >
              Give Feedback →
            </Link>

          </div>

        </div>

        {/* =====================================================
            STUDENT REVIEWS
        ===================================================== */}

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden mb-8">

          <div className="p-6 border-b border-gray-200">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div>

                <h2 className="text-2xl font-bold text-gray-900">
                  Student Reviews ⭐
                </h2>

                <p className="text-gray-500 mt-1">
                  See what other students think about this course.
                </p>

              </div>

              <div className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-xl font-semibold">
                {feedback.length}{" "}
                {feedback.length === 1
                  ? "Review"
                  : "Reviews"}
              </div>

            </div>

          </div>

          {feedbackLoading ? (

            <div className="p-8 text-center text-gray-500">
              Loading reviews...
            </div>

          ) : feedback.length === 0 ? (

            <div className="p-10 text-center">

              <div className="text-4xl mb-3">
                ⭐
              </div>

              <h3 className="text-lg font-semibold text-gray-800">
                No reviews yet
              </h3>

              <p className="text-gray-500 mt-1">
                Be the first student to share your experience.
              </p>

            </div>

          ) : (

            <div className="divide-y divide-gray-200">

              {feedback.map((item) => {

                const rating = Math.min(
                  Math.max(
                    Number(item.rating) || 0,
                    0
                  ),
                  5
                );

                return (
                  <div
                    key={item._id}
                    className="p-6 hover:bg-gray-50 transition"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex items-center gap-3">

                        <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                          {item.student?.name
                            ?.charAt(0)
                            ?.toUpperCase() ||
                            "S"}
                        </div>

                        <div>

                          <h3 className="font-semibold text-gray-900">
                            {item.student?.name ||
                              "Student"}
                          </h3>

                          <p className="text-xs text-gray-500 mt-1">
                            {item.createdAt
                              ? new Date(
                                  item.createdAt
                                ).toLocaleDateString()
                              : ""}
                          </p>

                        </div>

                      </div>

                      <div className="text-right">

                        <div className="text-lg tracking-wide">

                          {"⭐".repeat(rating)}

                          <span className="text-gray-300">
                            {"⭐".repeat(
                              5 - rating
                            )}
                          </span>

                        </div>

                        <p className="text-xs text-gray-500 mt-1">
                          {rating}/5
                        </p>

                      </div>

                    </div>

                    {item.comment && (
                      <div className="mt-5 bg-gray-50 border border-gray-100 rounded-xl p-4">

                        <p className="text-gray-700 leading-relaxed">
                          "{item.comment}"
                        </p>

                      </div>
                    )}

                  </div>
                );
              })}

            </div>

          )}

        </div>

      </div>
    </div>
  );
}

export default StudentCourseDetails;