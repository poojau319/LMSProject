import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000/api/assignments";

const emptyForm = {
  title: "",
  description: "",
  dueDate: "",
  totalMarks: 100,
};

function AssignmentManagement() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const [submissions, setSubmissions] = useState({});
  const [grading, setGrading] = useState({});

  const [loading, setLoading] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState({});
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // =====================================================
  // FETCH ASSIGNMENTS
  // =====================================================

  const fetchAssignments = async () => {
    if (!id || !token) {
      setLoadingAssignments(false);
      return;
    }

    try {
      setLoadingAssignments(true);
      setError("");

      const response = await axios.get(
        `${API}/course/${id}`,
        authConfig
      );

      setAssignments(response.data || []);
    } catch (error) {
      console.error("Get assignments error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load assignments."
      );
    } finally {
      setLoadingAssignments(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [id]);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setForm(emptyForm);
    setFile(null);
    setEditingId(null);

    const input = document.getElementById("assignmentFile");

    if (input) {
      input.value = "";
    }
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const validateForm = () => {
    if (!form.title.trim()) {
      return "Assignment title is required.";
    }

    if (!form.description.trim()) {
      return "Assignment description is required.";
    }

    if (!form.dueDate) {
      return "Due date is required.";
    }

    if (!form.totalMarks || Number(form.totalMarks) <= 0) {
      return "Total marks must be greater than 0.";
    }

    return "";
  };

  // =====================================================
  // CREATE / UPDATE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError("Please login first.");
      return;
    }

    if (!id) {
      setError("Course ID is missing.");
      return;
    }

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      // Course is needed only while creating
      if (!editingId) {
        formData.append("course", id);
      }

      formData.append("title", form.title.trim());
      formData.append("description", form.description.trim());
      formData.append("dueDate", form.dueDate);
      formData.append("totalMarks", Number(form.totalMarks));

      if (file) {
        formData.append("file", file);
      }

      if (editingId) {
        await axios.put(
          `${API}/${editingId}`,
          formData,
          authConfig
        );

        setSuccess("Assignment updated successfully ✅");
      } else {
        await axios.post(
          `${API}/create`,
          formData,
          authConfig
        );

        setSuccess("Assignment created successfully ✅");
      }

      resetForm();
      await fetchAssignments();
    } catch (error) {
      console.error("Save assignment error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to save assignment."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = (item) => {
    setError("");
    setSuccess("");

    setEditingId(item._id);

    setForm({
      title: item.title || "",
      description: item.description || "",
      dueDate: item.dueDate
        ? new Date(item.dueDate).toISOString().split("T")[0]
        : "",
      totalMarks: item.totalMarks || 100,
    });

    setFile(null);

    const input = document.getElementById("assignmentFile");

    if (input) {
      input.value = "";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // DELETE
  // =====================================================

  const deleteAssignment = async (assignmentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this assignment? All submissions will also be removed."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(assignmentId);
      setError("");
      setSuccess("");

      await axios.delete(
        `${API}/${assignmentId}`,
        authConfig
      );

      setAssignments((previous) =>
        previous.filter(
          (item) => item._id !== assignmentId
        )
      );

      setSubmissions((previous) => {
        const updated = { ...previous };
        delete updated[assignmentId];
        return updated;
      });

      if (expandedId === assignmentId) {
        setExpandedId(null);
      }

      if (editingId === assignmentId) {
        resetForm();
      }

      setSuccess("Assignment deleted successfully ✅");
    } catch (error) {
      console.error("Delete assignment error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to delete assignment."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // LOAD SUBMISSIONS
  // =====================================================

  const loadSubmissions = async (assignmentId) => {
    try {
      setLoadingSubmissions((previous) => ({
        ...previous,
        [assignmentId]: true,
      }));

      setError("");

      const response = await axios.get(
        `${API}/${assignmentId}/submissions`,
        authConfig
      );

      setSubmissions((previous) => ({
        ...previous,
        [assignmentId]:
          response.data?.submissions || [],
      }));
    } catch (error) {
      console.error("Get submissions error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load submissions."
      );
    } finally {
      setLoadingSubmissions((previous) => ({
        ...previous,
        [assignmentId]: false,
      }));
    }
  };

  // =====================================================
  // TOGGLE SUBMISSIONS
  // =====================================================

  const toggleSubmissions = async (assignmentId) => {
    if (expandedId === assignmentId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(assignmentId);

    await loadSubmissions(assignmentId);
  };

  // =====================================================
  // GRADE SUBMISSION
  // =====================================================

  const gradeSubmission = async (
    assignmentId,
    studentId,
    marks,
    feedback
  ) => {
    if (
      marks === "" ||
      marks === null ||
      marks === undefined
    ) {
      setError("Please enter marks.");
      return;
    }

    const numericMarks = Number(marks);

    const assignment = assignments.find(
      (item) => item._id === assignmentId
    );

    if (!assignment) {
      setError("Assignment not found.");
      return;
    }

    if (
      Number.isNaN(numericMarks) ||
      numericMarks < 0 ||
      numericMarks > Number(assignment.totalMarks)
    ) {
      setError(
        `Marks must be between 0 and ${assignment.totalMarks}.`
      );
      return;
    }

    try {
      const key = `${assignmentId}-${studentId}`;

      setGrading((previous) => ({
        ...previous,
        [key]: true,
      }));

      setError("");
      setSuccess("");

      await axios.put(
        `${API}/${assignmentId}/grade`,
        {
          studentId,
          marks: numericMarks,
          feedback,
        },
        authConfig
      );

      setSuccess("Submission graded successfully ✅");

      await loadSubmissions(assignmentId);
    } catch (error) {
      console.error("Grade submission error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to grade submission."
      );
    } finally {
      const key = `${assignmentId}-${studentId}`;

      setGrading((previous) => ({
        ...previous,
        [key]: false,
      }));
    }
  };

  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const cancelEdit = () => {
    resetForm();
    setError("");
    setSuccess("");
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Assignment Management 📝
            </h1>

            <p className="text-gray-500 mt-2">
              Create, edit, delete, review and grade
              student assignments.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/instructor/my-courses")
            }
            className="bg-gray-700 text-white px-5 py-2.5 rounded-lg hover:bg-gray-800"
          >
            Back
          </button>
        </div>

        {/* MESSAGES */}

        {error && (
          <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* CREATE / EDIT */}

        <div className="bg-white rounded-xl shadow-md p-6 mb-10">

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {editingId
                ? "Edit Assignment"
                : "Create New Assignment"}
            </h2>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-gray-600 font-semibold hover:text-gray-900"
              >
                Cancel
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* TITLE */}

            <div>
              <label className="block font-semibold text-gray-700 mb-2">
                Assignment Title *
              </label>

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Example: React Components Assignment"
                className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* DESCRIPTION */}

            <div>
              <label className="block font-semibold text-gray-700 mb-2">
                Description / Instructions *
              </label>

              <textarea
                name="description"
                rows="5"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter assignment instructions..."
                className="border border-gray-300 p-3 w-full rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* DUE DATE */}

            <div>
              <label className="block font-semibold text-gray-700 mb-2">
                Due Date *
              </label>

              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* MARKS */}

            <div>
              <label className="block font-semibold text-gray-700 mb-2">
                Total Marks *
              </label>

              <input
                type="number"
                min="1"
                name="totalMarks"
                value={form.totalMarks}
                onChange={handleChange}
                className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* FILE */}

            <div>
              <label className="block font-semibold text-gray-700 mb-2">
                Assignment File / PDF
              </label>

              <input
                id="assignmentFile"
                type="file"
                accept=".pdf,.doc,.docx,.txt,application/pdf"
                onChange={(e) =>
                  setFile(
                    e.target.files?.[0] || null
                  )
                }
                className="border border-gray-300 p-3 w-full rounded-lg"
              />

              {file && (
                <p className="text-sm text-green-600 mt-2">
                  Selected: {file.name}
                </p>
              )}

              {editingId && (
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to keep the existing
                  assignment file.
                </p>
              )}
            </div>

            {/* EXISTING FILE */}

            {editingId &&
              assignments.find(
                (item) => item._id === editingId
              )?.fileUrl && (
                <a
                  href={
                    assignments.find(
                      (item) => item._id === editingId
                    ).fileUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block text-blue-600 font-semibold hover:underline"
                >
                  Open Existing Assignment File 📄
                </a>
              )}

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-semibold ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading
                ? editingId
                  ? "Updating Assignment..."
                  : "Creating Assignment..."
                : editingId
                ? "Update Assignment"
                : "Create Assignment"}
            </button>
          </form>
        </div>

        {/* ASSIGNMENTS */}

        <div>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-bold text-gray-800">
              Existing Assignments
            </h2>

            <button
              type="button"
              onClick={fetchAssignments}
              className="text-blue-600 font-semibold hover:underline"
            >
              Refresh
            </button>
          </div>

          {loadingAssignments ? (
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <p className="text-gray-500">
                Loading assignments...
              </p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <div className="text-5xl mb-4">📝</div>

              <h3 className="text-xl font-semibold text-gray-700">
                No Assignments Yet
              </h3>

              <p className="text-gray-500 mt-2">
                Create your first assignment above.
              </p>
            </div>
          ) : (
            <div className="space-y-5">

              {assignments.map((item, index) => (
                <div
                  key={item._id}
                  className="bg-white rounded-xl shadow-md p-6"
                >

                  {/* TOP */}

                  <div className="flex justify-between items-start gap-5">

                    <div>
                      <p className="text-sm text-blue-600 font-semibold">
                        Assignment {index + 1}
                      </p>

                      <h3 className="text-xl font-bold text-gray-800 mt-1">
                        {item.title}
                      </h3>

                      <p className="text-gray-600 mt-2 whitespace-pre-line">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex gap-2 shrink-0">

                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={
                          deletingId === item._id
                        }
                        onClick={() =>
                          deleteAssignment(item._id)
                        }
                        className={`px-4 py-2 rounded-lg text-white ${
                          deletingId === item._id
                            ? "bg-gray-400"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                      >
                        {deletingId === item._id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>

                  {/* DETAILS */}

                  <div className="flex flex-wrap gap-3 mt-5">

                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      Due:{" "}
                      {item.dueDate
                        ? new Date(
                            item.dueDate
                          ).toLocaleDateString()
                        : "N/A"}
                    </span>

                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                      Marks: {item.totalMarks}
                    </span>

                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                      Submissions:{" "}
                      {item.submissions?.length || 0}
                    </span>
                  </div>

                  {/* ASSIGNMENT FILE */}

                  {item.fileUrl && (
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-4 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                    >
                      Open Assignment File 📄
                    </a>
                  )}

                  {/* SUBMISSIONS */}

                  <div className="mt-5 border-t pt-5">

                    <button
                      type="button"
                      onClick={() =>
                        toggleSubmissions(item._id)
                      }
                      className="bg-purple-600 text-white px-5 py-2.5 rounded-lg hover:bg-purple-700 font-semibold"
                    >
                      {expandedId === item._id
                        ? "Hide Submissions"
                        : "View Submissions"}
                    </button>

                    {expandedId === item._id && (
                      <div className="mt-5">

                        {loadingSubmissions[item._id] ? (
                          <div className="bg-gray-50 p-6 rounded-lg text-center">
                            Loading submissions...
                          </div>
                        ) : !submissions[item._id]
                            ?.length ? (
                          <div className="bg-gray-50 p-6 rounded-lg text-center">
                            <p className="text-gray-600">
                              No students have submitted
                              this assignment yet.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">

                            {submissions[item._id].map(
                              (submission) => {
                                const student =
                                  submission.student;

                                const gradeKey = `${item._id}-${student?._id}`;

                                return (
                                  <SubmissionCard
                                    key={submission._id}
                                    submission={submission}
                                    student={student}
                                    totalMarks={
                                      item.totalMarks
                                    }
                                    loading={
                                      grading[gradeKey]
                                    }
                                    onGrade={(
                                      marks,
                                      feedback
                                    ) =>
                                      gradeSubmission(
                                        item._id,
                                        student?._id,
                                        marks,
                                        feedback
                                      )
                                    }
                                  />
                                );
                              }
                            )}
                          </div>
                        )}
                      </div>
                    )}
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

// =====================================================
// SUBMISSION CARD
// =====================================================

function SubmissionCard({
  submission,
  student,
  totalMarks,
  loading,
  onGrade,
}) {
  const [marks, setMarks] = useState(
    submission.marks ?? ""
  );

  const [feedback, setFeedback] = useState(
    submission.feedback || ""
  );

  const handleGrade = () => {
    onGrade(marks, feedback);
  };

  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-gray-50">

      <div className="flex justify-between items-start gap-5">

        <div>
          <h4 className="text-lg font-bold text-gray-800">
            {student?.name || "Student"}
          </h4>

          {student?.email && (
            <p className="text-sm text-gray-500">
              {student.email}
            </p>
          )}

          <p className="text-sm text-gray-500 mt-2">
            Submitted:{" "}
            {submission.submittedAt
              ? new Date(
                  submission.submittedAt
                ).toLocaleString()
              : "N/A"}
          </p>

          {submission.gradedAt && (
            <p className="text-sm text-green-600 mt-1">
              Graded:{" "}
              {new Date(
                submission.gradedAt
              ).toLocaleString()}
            </p>
          )}
        </div>

        {submission.fileUrl && (
          <a
            href={submission.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Open Submission 📄
          </a>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-5">

        <div>
          <label className="block font-semibold text-gray-700 mb-2">
            Marks / {totalMarks}
          </label>

          <input
            type="number"
            min="0"
            max={totalMarks}
            value={marks}
            onChange={(e) =>
              setMarks(e.target.value)
            }
            placeholder={`0 - ${totalMarks}`}
            className="w-full border border-gray-300 p-3 rounded-lg"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-2">
            Feedback
          </label>

          <input
            type="text"
            value={feedback}
            onChange={(e) =>
              setFeedback(e.target.value)
            }
            placeholder="Enter feedback for student"
            className="w-full border border-gray-300 p-3 rounded-lg"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleGrade}
        disabled={loading}
        className={`mt-4 w-full py-3 rounded-lg text-white font-semibold ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading
          ? "Saving Grade..."
          : submission.marks !== null &&
            submission.marks !== undefined
          ? "Update Grade"
          : "Grade Submission"}
      </button>
    </div>
  );
}

export default AssignmentManagement;