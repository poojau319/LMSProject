import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function InstructorMyCourses() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // ================= GET MY COURSES =================

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "https://lmsproject-ntug.onrender.com/api/instructor/my-courses",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCourses(response.data || []);
    } catch (error) {
      console.error("Error fetching instructor courses:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load your courses."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  // ================= DELETE COURSE =================

  const handleDelete = async (courseId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this course?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `https://lmsproject-ntug.onrender.com/api/instructor/delete-course/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Course deleted successfully! ✅");

      fetchMyCourses();
    } catch (error) {
      console.error("Delete error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to delete course."
      );
    }
  };

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">
          Loading your courses...
        </div>
      </div>
    );
  }

  // ================= PAGE =================

  return (
    <div className="min-h-screen bg-gray-50 p-8">

      <div className="max-w-7xl mx-auto">

        {/* ================= HEADER ================= */}

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              My Courses 📚
            </h1>

            <p className="text-gray-500 mt-1">
              Manage your courses, lectures, assignments and quizzes.
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/instructor-dashboard")
            }
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>

        </div>

        {/* ================= ERROR ================= */}

        {error && (
          <div className="bg-red-100 text-red-700 px-5 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* ================= NO COURSES ================= */}

        {!error && courses.length === 0 && (
          <div className="bg-white rounded-xl shadow p-10 text-center">

            <h2 className="text-2xl font-semibold text-gray-700">
              No Courses Found
            </h2>

            <p className="text-gray-500 mt-2">
              You have not created any courses yet.
            </p>

            <button
              onClick={() =>
                navigate("/instructor-dashboard")
              }
              className="mt-5 bg-blue-600 text-white px-5 py-2 rounded-lg"
            >
              Create Course
            </button>

          </div>
        )}

        {/* ================= COURSES ================= */}

        {courses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {courses.map((course) => (

              <div
                key={course._id}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >

                {/* ================= IMAGE ================= */}

                {course.image ? (
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">
                      No Image
                    </span>
                  </div>
                )}

                {/* ================= CONTENT ================= */}

                <div className="p-5">

                  <h2 className="text-xl font-bold text-gray-800">
                    {course.title}
                  </h2>

                  <p className="text-gray-600 mt-2 line-clamp-3">
                    {course.description}
                  </p>

                  {/* ================= COURSE INFO ================= */}

                  <div className="flex flex-wrap gap-2 mt-4">

                    {course.duration && (
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                        {course.duration}
                      </span>
                    )}

                    {course.level && (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                        {course.level}
                      </span>
                    )}

                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                      {course.lectures?.length || 0} Lectures
                    </span>

                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                      {course.quizzes?.length || 0} Quiz
                    </span>

                  </div>

                  {/* ================= MANAGEMENT BUTTONS ================= */}

                  <div className="grid grid-cols-2 gap-2 mt-5">

                    {/* Lectures */}

                    <button
                      onClick={() =>
                        navigate(
                          `/upload-lecture/${course._id}`
                        )
                      }
                      className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700"
                    >
                      🎥 Lectures
                    </button>

                    {/* Assignments */}

                    <button
                      onClick={() =>
                        navigate(
                          `/assignment/${course._id}`
                        )
                      }
                      className="bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600"
                    >
                      📝 Assignments
                    </button>

                    {/* Quiz */}

                    <button
                      onClick={() =>
                        navigate(
                          `/instructor/quiz/${course._id}`
                        )
                      }
                      className="bg-pink-600 text-white px-3 py-2 rounded-lg hover:bg-pink-700"
                    >
                      🧠 Quiz
                    </button>

                    {/* Performance */}

                    <button
                      onClick={() =>
                        navigate(
                          "/instructor/student-performance"
                        )
                      }
                      className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700"
                    >
                      📊 Performance
                    </button>

                  </div>

                  {/* ================= DELETE ================= */}

                  <button
                    onClick={() =>
                      handleDelete(course._id)
                    }
                    className="w-full mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    🗑️ Delete Course
                  </button>

                </div>

              </div>

            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default InstructorMyCourses;