import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API = "https://lmsproject-ntug.onrender.com/api/quizzes";

const EMPTY_QUIZ = {
  question: "",
  options: ["", "", "", ""],
  answer: "",
};

const MAX_QUESTION_LENGTH = 500;
const MAX_OPTION_LENGTH = 200;

function QuizManagement() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [quizzes, setQuizzes] = useState([]);

  const [quiz, setQuiz] = useState(EMPTY_QUIZ);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);

  const [loadingQuizzes, setLoadingQuizzes] =
    useState(true);

  const [deletingId, setDeletingId] =
    useState(null);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // =====================================================
  // AUTH CONFIG
  // =====================================================

  const authConfig = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token]
  );

  // =====================================================
  // FETCH QUIZZES
  // =====================================================

  const fetchQuizzes = async () => {
    if (!id || !token) {
      setLoadingQuizzes(false);
      return;
    }

    try {
      setLoadingQuizzes(true);
      setError("");

      const response = await axios.get(
        `${API}/${id}`,
        authConfig
      );

      setQuizzes(response.data || []);
    } catch (error) {
      console.error(
        "Get quizzes error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load quiz questions."
      );
    } finally {
      setLoadingQuizzes(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [id]);

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setQuiz({
      question: "",
      options: ["", "", "", ""],
      answer: "",
    });

    setEditingId(null);
  };

  // =====================================================
  // HANDLE QUESTION
  // =====================================================

  const handleQuestionChange = (value) => {
    setQuiz((previous) => ({
      ...previous,
      question: value,
    }));
  };

  // =====================================================
  // HANDLE OPTION
  // =====================================================

  const handleOptionChange = (
    index,
    value
  ) => {
    setQuiz((previous) => {
      const updatedOptions = [
        ...previous.options,
      ];

      updatedOptions[index] = value;

      return {
        ...previous,
        options: updatedOptions,

        // If selected answer was changed,
        // keep it only if it still exists.
        answer:
          previous.answer ===
            previous.options[index]
            ? ""
            : previous.answer,
      };
    });
  };

  // =====================================================
  // SELECT ANSWER
  // =====================================================

  const handleAnswerChange = (value) => {
    setQuiz((previous) => ({
      ...previous,
      answer: value,
    }));
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const validateQuiz = () => {
    const question =
      quiz.question.trim();

    if (!question) {
      return "Question is required.";
    }

    if (question.length < 5) {
      return "Question must contain at least 5 characters.";
    }

    if (
      question.length >
      MAX_QUESTION_LENGTH
    ) {
      return `Question cannot exceed ${MAX_QUESTION_LENGTH} characters.`;
    }

    const options = quiz.options.map(
      (option) => option.trim()
    );

    if (options.length !== 4) {
      return "Exactly 4 options are required.";
    }

    if (options.some((option) => !option)) {
      return "All 4 options are required.";
    }

    if (
      options.some(
        (option) =>
          option.length >
          MAX_OPTION_LENGTH
      )
    ) {
      return `Each option cannot exceed ${MAX_OPTION_LENGTH} characters.`;
    }

    const normalizedOptions =
      options.map((option) =>
        option.toLowerCase()
      );

    if (
      new Set(normalizedOptions).size !==
      normalizedOptions.length
    ) {
      return "All options must be unique.";
    }

    if (!quiz.answer.trim()) {
      return "Please select the correct answer.";
    }

    if (
      !options.some(
        (option) =>
          option.toLowerCase() ===
          quiz.answer.trim().toLowerCase()
      )
    ) {
      return "Correct answer must match one of the options.";
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
      setError(
        "Your session has expired. Please login again."
      );
      return;
    }

    if (!id) {
      setError("Course ID is missing.");
      return;
    }

    const validationError =
      validateQuiz();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        question: quiz.question.trim(),

        options: quiz.options.map(
          (option) => option.trim()
        ),

        answer: quiz.answer.trim(),
      };

      if (editingId) {
        await axios.put(
          `${API}/${id}/${editingId}`,
          payload,
          authConfig
        );

        setSuccess(
          "Quiz question updated successfully."
        );
      } else {
        await axios.post(
          `${API}/${id}/add`,
          payload,
          authConfig
        );

        setSuccess(
          "Quiz question created successfully."
        );
      }

      resetForm();

      await fetchQuizzes();
    } catch (error) {
      console.error(
        "Save quiz error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to save quiz question."
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

    setQuiz({
      question: item.question || "",

      options:
        item.options?.length === 4
          ? item.options
          : [
              ...(item.options || []),
              "",
              "",
              "",
            ].slice(0, 4),

      answer: item.answer || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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
  // DELETE
  // =====================================================

  const deleteQuiz = async (
    quizId
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this quiz question?"
      );

    if (!confirmed) return;

    try {
      setDeletingId(quizId);

      setError("");
      setSuccess("");

      await axios.delete(
        `${API}/${id}/${quizId}`,
        authConfig
      );

      setSuccess(
        "Quiz question deleted successfully."
      );

      if (editingId === quizId) {
        resetForm();
      }

      await fetchQuizzes();
    } catch (error) {
      console.error(
        "Delete quiz error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to delete quiz question."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // ANSWER OPTIONS
  // =====================================================

  const answerOptions =
    quiz.options.filter(
      (option) => option.trim()
    );

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>
            <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide">
              Instructor Panel
            </p>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-1">
              Quiz Management 🧠
            </h1>

            <p className="text-gray-500 mt-2">
              Create, edit, validate and manage
              course quiz questions.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/instructor/my-courses"
              )
            }
            className="bg-gray-800 text-white px-5 py-2.5 rounded-lg hover:bg-gray-900 transition"
          >
            ← Back to Courses
          </button>
        </div>

        {/* =================================================
            MESSAGES
        ================================================= */}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            <div className="flex gap-3">
              <span>⚠️</span>

              <div>
                <p className="font-semibold">
                  Something went wrong
                </p>

                <p className="text-sm mt-1">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
            <div className="flex gap-3">
              <span>✅</span>

              <div>
                <p className="font-semibold">
                  Success
                </p>

                <p className="text-sm mt-1">
                  {success}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            CREATE / EDIT FORM
        ================================================= */}

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 md:p-8 mb-10">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId
                  ? "Edit Quiz Question"
                  : "Create Quiz Question"}
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Add a question with exactly
                four unique options.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-gray-600 hover:text-gray-900 font-semibold"
              >
                Cancel Editing
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* QUESTION */}

            <div>
              <div className="flex justify-between items-center mb-2">

                <label className="font-semibold text-gray-700">
                  Question *
                </label>

                <span className="text-xs text-gray-400">
                  {quiz.question.length}/
                  {MAX_QUESTION_LENGTH}
                </span>
              </div>

              <textarea
                rows={4}
                maxLength={
                  MAX_QUESTION_LENGTH
                }
                value={quiz.question}
                onChange={(e) =>
                  handleQuestionChange(
                    e.target.value
                  )
                }
                placeholder="Example: Which hook is used to manage state in a React functional component?"
                className="w-full border border-gray-300 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* OPTIONS */}

            <div>
              <label className="block font-semibold text-gray-700 mb-3">
                Answer Options *
              </label>

              <div className="grid md:grid-cols-2 gap-4">

                {quiz.options.map(
                  (option, index) => (
                    <div
                      key={index}
                      className="relative"
                    >
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-orange-100 text-orange-700 font-bold text-sm">
                        {String.fromCharCode(
                          65 + index
                        )}
                      </span>

                      <input
                        type="text"
                        maxLength={
                          MAX_OPTION_LENGTH
                        }
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(
                            index,
                            e.target.value
                          )
                        }
                        placeholder={`Option ${index + 1}`}
                        className="w-full border border-gray-300 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  )
                )}

              </div>

              <p className="text-xs text-gray-500 mt-2">
                Exactly 4 unique options are
                required.
              </p>
            </div>

            {/* CORRECT ANSWER */}

            <div>
              <label className="block font-semibold text-gray-700 mb-2">
                Correct Answer *
              </label>

              <select
                value={quiz.answer}
                onChange={(e) =>
                  handleAnswerChange(
                    e.target.value
                  )
                }
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">
                  Select Correct Answer
                </option>

                {answerOptions.map(
                  (option, index) => (
                    <option
                      key={index}
                      value={option}
                    >
                      {String.fromCharCode(
                        65 + index
                      )}{" "}
                      - {option}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl text-white font-semibold transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              {loading
                ? editingId
                  ? "Updating Question..."
                  : "Creating Question..."
                : editingId
                ? "Update Quiz Question"
                : "Create Quiz Question"}
            </button>
          </form>
        </div>

        {/* =================================================
            QUIZ LIST HEADER
        ================================================= */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">

          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Existing Quiz Questions
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {quizzes.length} question
              {quizzes.length !== 1
                ? "s"
                : ""}{" "}
              available
            </p>
          </div>

          <button
            type="button"
            onClick={fetchQuizzes}
            disabled={loadingQuizzes}
            className="text-orange-600 font-semibold hover:text-orange-700 disabled:text-gray-400"
          >
            {loadingQuizzes
              ? "Refreshing..."
              : "↻ Refresh"}
          </button>
        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loadingQuizzes ? (
          <div className="bg-white rounded-2xl shadow p-10 text-center">
            <div className="animate-pulse text-gray-500">
              Loading quiz questions...
            </div>
          </div>
        ) : quizzes.length === 0 ? (
          /* =================================================
             EMPTY
          ================================================= */

          <div className="bg-white rounded-2xl shadow p-10 text-center">
            <div className="text-6xl mb-4">
              🧠
            </div>

            <h3 className="text-xl font-bold text-gray-800">
              No Quiz Questions Yet
            </h3>

            <p className="text-gray-500 mt-2">
              Create your first quiz question
              using the form above.
            </p>
          </div>
        ) : (
          /* =================================================
             LIST
          ================================================= */

          <div className="space-y-5">

            {quizzes.map(
              (item, index) => (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
                >

                  {/* TOP */}

                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">

                    <div className="flex-1">

                      <div className="flex items-center gap-3 mb-3">
                        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                          Question{" "}
                          {index + 1}
                        </span>

                        <span className="text-xs text-gray-400">
                          ID:{" "}
                          {item._id}
                        </span>
                      </div>

                      <h3 className="text-lg md:text-xl font-bold text-gray-900">
                        {item.question}
                      </h3>

                      {/* OPTIONS */}

                      <div className="grid md:grid-cols-2 gap-3 mt-5">

                        {item.options?.map(
                          (
                            option,
                            optionIndex
                          ) => {
                            const isCorrect =
                              option ===
                              item.answer;

                            return (
                              <div
                                key={
                                  optionIndex
                                }
                                className={`flex items-center gap-3 border rounded-xl px-4 py-3 ${
                                  isCorrect
                                    ? "border-green-300 bg-green-50"
                                    : "border-gray-200 bg-gray-50"
                                }`}
                              >

                                <span
                                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                    isCorrect
                                      ? "bg-green-600 text-white"
                                      : "bg-gray-200 text-gray-700"
                                  }`}
                                >
                                  {String.fromCharCode(
                                    65 +
                                      optionIndex
                                  )}
                                </span>

                                <span
                                  className={`flex-1 ${
                                    isCorrect
                                      ? "text-green-700 font-semibold"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {option}
                                </span>

                                {isCorrect && (
                                  <span className="text-green-600 font-bold text-sm">
                                    ✓ Correct
                                  </span>
                                )}
                              </div>
                            );
                          }
                        )}

                      </div>
                    </div>

                    {/* ACTIONS */}

                    <div className="flex md:flex-col gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(item)
                        }
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition font-semibold"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={
                          deletingId ===
                          item._id
                        }
                        onClick={() =>
                          deleteQuiz(
                            item._id
                          )
                        }
                        className={`px-5 py-2.5 rounded-lg text-white font-semibold transition ${
                          deletingId ===
                          item._id
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                      >
                        {deletingId ===
                        item._id
                          ? "Deleting..."
                          : "Delete"}
                      </button>

                    </div>
                  </div>

                  {/* ANSWER */}

                  <div className="mt-5 pt-4 border-t border-gray-100">

                    <p className="text-sm text-gray-500">
                      Correct Answer
                    </p>

                    <p className="text-green-700 font-semibold mt-1">
                      ✓ {item.answer}
                    </p>

                  </div>

                </div>
              )
            )}

          </div>
        )}
      </div>
    </div>
  );
}

export default QuizManagement;