import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function StudentQuiz() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          `https://lmsproject-ntug.onrender.com/api/quizzes/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setQuizzes(
          Array.isArray(res.data) ? res.data : []
        );
      } catch (error) {
        console.error("Quiz fetch error:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load quiz."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [courseId, token]);

  const handleAnswerChange = (
    question,
    answer
  ) => {
    setAnswers((previous) => ({
      ...previous,
      [question]: answer,
    }));
  };

  const submitQuiz = async () => {
    if (quizzes.length === 0) {
      setError("No quiz available.");
      return;
    }

    const unanswered = quizzes.filter(
      (quiz) => !answers[quiz.question]
    );

    if (unanswered.length > 0) {
      setError(
        `Please answer all questions. ${unanswered.length} remaining.`
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const formattedAnswers = quizzes.map(
  (quiz) => ({
    questionId: quiz._id,
    selectedAnswer: answers[quiz.question],
  })
);

      const res = await axios.post(
        `https://lmsproject-ntug.onrender.com/api/quizzes/${courseId}/submit`,
        {
          answers: formattedAnswers,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResult(res.data.result);
    } catch (error) {
      console.error("Quiz submission error:", error);

      setError(
        error.response?.data?.message ||
          "Quiz submission failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 text-center">
        Loading Quiz...
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">

          <div className="bg-white rounded-2xl shadow p-8 text-center">

            <h1 className="text-3xl font-bold mb-3">
              Quiz Result 🎉
            </h1>

            <p className="text-gray-500 mb-8">
              Your quiz has been submitted successfully.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">

              <div className="bg-blue-50 p-5 rounded-xl">
                <p className="text-gray-500">
                  Total Questions
                </p>

                <p className="text-3xl font-bold text-blue-600">
                  {result.totalQuestions}
                </p>
              </div>

              <div className="bg-green-50 p-5 rounded-xl">
                <p className="text-gray-500">
                  Correct Answers
                </p>

                <p className="text-3xl font-bold text-green-600">
                  {result.correctAnswers}
                </p>
              </div>

            </div>

            <div className="border rounded-xl p-6 mb-6">
              <p className="text-gray-500">
                Your Score
              </p>

              <p className="text-5xl font-bold text-blue-600">
                {result.percentage}%
              </p>
            </div>

            <div
              className={`p-4 rounded-xl font-bold ${
                result.status === "Passed"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {result.status === "Passed"
                ? "🎉 Congratulations! You Passed."
                : "❌ You Failed. Better luck next time."}
            </div>

            <button
              onClick={() =>
                navigate(
                  `/student/course/${courseId}`
                )
              }
              className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg"
            >
              Back to Course
            </button>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">

      <div className="max-w-3xl mx-auto">

        <h1 className="text-3xl font-bold">
          Course Quiz 📝
        </h1>

        <p className="text-gray-500 mt-2 mb-8">
          Answer all questions and submit your quiz.
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {quizzes.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <h2 className="text-xl font-semibold">
              No Quiz Available
            </h2>

            <p className="text-gray-500 mt-2">
              Your instructor has not added a quiz yet.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-6">

              {quizzes.map((quiz, index) => (
                <div
                  key={quiz._id || index}
                  className="bg-white p-6 rounded-xl shadow"
                >

                  <h2 className="font-bold text-lg">
                    {index + 1}. {quiz.question}
                  </h2>

                  <div className="mt-4 space-y-3">

                    {(quiz.options || []).map(
                      (option, optionIndex) => (
                        <label
                          key={optionIndex}
                          className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                            answers[quiz.question] === option
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200"
                          }`}
                        >

                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={option}
                            checked={
                              answers[
                                quiz.question
                              ] === option
                            }
                            onChange={() =>
                              handleAnswerChange(
                                quiz.question,
                                option
                              )
                            }
                            className="mr-3"
                          />

                          <span>{option}</span>

                        </label>
                      )
                    )}

                  </div>

                </div>
              ))}

            </div>

            <button
              onClick={submitQuiz}
              disabled={submitting}
              className="mt-8 w-full py-3 rounded-lg bg-blue-600 text-white font-semibold disabled:bg-gray-400"
            >
              {submitting
                ? "Submitting Quiz..."
                : "Submit Quiz"}
            </button>
          </>
        )}

      </div>
    </div>
  );
}

export default StudentQuiz;