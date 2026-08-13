import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API = "https://lmsproject-ntug.onrender.com/api/assignments";

function StudentAssignment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);

  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // =====================================================
  // GET ASSIGNMENT
  // =====================================================

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        setError("Please login first.");
        return;
      }

      const response = await axios.get(
        `${API}/single/${id}`,
        authConfig
      );

      setAssignment(response.data);
    } catch (error) {
      console.error("Get assignment error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load assignment."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // GET MY SUBMISSION
  // =====================================================

  const fetchMySubmission = async () => {
    try {
      if (!token) {
        return;
      }

      const response = await axios.get(
        `${API}/${id}/my-submission`,
        authConfig
      );

      setSubmission(response.data);
    } catch (error) {
      console.error(
        "Get submission error:",
        error
      );
    }
  };

  useEffect(() => {
    fetchAssignment();
    fetchMySubmission();
  }, [id]);

  // =====================================================
  // SUBMIT ASSIGNMENT
  // =====================================================

  const handleSubmit = async (e) => {
  e.preventDefault();

  setError("");
  setSuccess("");

  if (!file) {
    setError("Please select a file to submit.");
    return;
  }

  if (!token) {
    setError("Please login first.");
    return;
  }

  try {
    setSubmitting(true);

    // ============================================
    // SUBMIT ASSIGNMENT
    // ============================================

    const formData = new FormData();

    formData.append("file", file);

    const response = await axios.post(
      `${API}/${id}/submit`,
      formData,
      authConfig
    );

    // ============================================
    // GET COURSE ID
    // ============================================

    const courseId =
      typeof assignment.course === "object"
        ? assignment.course?._id
        : assignment.course;

    // ============================================
    // UPDATE PROGRESS
    // ============================================

    if (courseId) {
      await axios.put(
        `https://lmsproject-ntug.onrender.com/api/progress/${courseId}/update`,
        {
          assignmentMarks: 100,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }

    // ============================================
    // SUCCESS
    // ============================================

    setSuccess(
      response.data?.message ||
        "Assignment submitted successfully ✅"
    );

    setFile(null);

    const input =
      document.getElementById("submissionFile");

    if (input) {
      input.value = "";
    }

    await fetchMySubmission();
  } catch (error) {
    console.error(
      "Submit assignment error:",
      error
    );

    setError(
      error.response?.data?.message ||
        "Unable to submit assignment."
    );
  } finally {
    setSubmitting(false);
  }
};

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">
          Loading assignment...
        </p>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error && !assignment) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-100 text-red-700 p-5 rounded-xl">
            {error}
          </div>

          <button
            onClick={() => navigate(-1)}
            className="mt-5 bg-gray-700 text-white px-5 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return null;
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 p-8">

      <div className="max-w-4xl mx-auto">

        {/* BACK BUTTON */}

        <button
          onClick={() => navigate(-1)}
          className="mb-6 bg-gray-700 hover:bg-gray-800 text-white px-5 py-2 rounded-lg"
        >
          ← Back
        </button>

        {/* ASSIGNMENT */}

        <div className="bg-white rounded-2xl shadow-sm border p-8">

          <h1 className="text-3xl font-bold text-gray-900">
            {assignment.title}
          </h1>

          {/* DETAILS */}

          <div className="flex flex-wrap gap-3 mt-5">

            <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full">
              Due:{" "}
              {assignment.dueDate
                ? new Date(
                    assignment.dueDate
                  ).toLocaleDateString()
                : "N/A"}
            </span>

            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full">
              Total Marks:{" "}
              {assignment.totalMarks}
            </span>

          </div>

          {/* DESCRIPTION */}

          <div className="mt-8">

            <h2 className="text-xl font-bold text-gray-800">
              Assignment Instructions
            </h2>

            <p className="mt-3 text-gray-600 whitespace-pre-line leading-relaxed">
              {assignment.description}
            </p>

          </div>

          {/* ASSIGNMENT FILE */}

          {assignment.fileUrl && (
            <div className="mt-8">

              <h2 className="text-xl font-bold text-gray-800">
                Assignment File 📄
              </h2>

              <a
                href={assignment.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-3 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold"
              >
                Open Assignment File →
              </a>

            </div>
          )}

          {/* SUBMISSION STATUS */}

          {submission?.submitted && (
            <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-5">

              <h2 className="text-lg font-bold text-green-700">
                Assignment Submitted ✅
              </h2>

              {submission.submission?.submittedAt && (
                <p className="text-green-700 mt-2">
                  Submitted on:{" "}
                  {new Date(
                    submission.submission.submittedAt
                  ).toLocaleString()}
                </p>
              )}

              {submission.submission?.marks !== null &&
                submission.submission?.marks !== undefined && (
                  <p className="text-green-700 mt-2 font-semibold">
                    Marks:{" "}
                    {submission.submission.marks} /{" "}
                    {assignment.totalMarks}
                  </p>
                )}

              {submission.submission?.feedback && (
                <p className="text-gray-700 mt-3">
                  <strong>Instructor Feedback:</strong>{" "}
                  {submission.submission.feedback}
                </p>
              )}

            </div>
          )}

          {/* SUBMIT / RESUBMIT */}

          <div className="mt-8 border-t pt-8">

            <h2 className="text-xl font-bold text-gray-800">
              {submission?.submitted
                ? "Resubmit Assignment"
                : "Submit Assignment"}
            </h2>

            <p className="text-gray-500 mt-2">
              Upload your completed assignment file.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-5"
            >

              <input
                id="submissionFile"
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) =>
                  setFile(
                    e.target.files?.[0] || null
                  )
                }
                className="w-full border border-gray-300 p-3 rounded-lg"
              />

              {file && (
                <p className="text-sm text-green-600 mt-2">
                  Selected: {file.name}
                </p>
              )}

              {error && (
                <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg mt-4">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className={`mt-5 w-full py-3 rounded-lg text-white font-semibold ${
                  submitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {submitting
                  ? "Submitting..."
                  : submission?.submitted
                  ? "Resubmit Assignment"
                  : "Submit Assignment"}
              </button>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
}

export default StudentAssignment;