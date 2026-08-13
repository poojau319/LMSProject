import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const storedUser = JSON.parse(
      localStorage.getItem("user") || "null"
    );

    setUser(storedUser);

    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          "https://lmsproject-ntug.onrender.com/api/courses/my-courses",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCourses(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Student dashboard error:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load your courses."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCourses();
    } else {
      setLoading(false);
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome {user?.name || "Student"} 🎓
        </h1>

        <p className="text-gray-600 mt-2">
          Continue your learning journey
        </p>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mb-10">

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-bold text-xl">
            My Courses 📚
          </h2>

          <p className="text-3xl font-bold text-blue-600 mt-3">
            {courses.length}
          </p>

          <Link
            to="/student-courses"
            className="inline-block mt-4 text-blue-600 font-semibold"
          >
            View My Courses →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-bold text-xl">
            Progress 📊
          </h2>

          <p className="text-gray-600 mt-3">
            Track your course progress
          </p>

          <Link
            to="/student-progress"
            className="inline-block mt-4 text-blue-600 font-semibold"
          >
            View Progress →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-bold text-xl">
            Feedback ⭐
          </h2>

          <p className="text-gray-600 mt-3">
            Share your learning experience
          </p>
        </div>

      </div>

      <div>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold">
            My Learning
          </h2>

          <Link
            to="/student-courses"
            className="text-blue-600 font-semibold"
          >
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="bg-white p-8 rounded-xl shadow text-center">
            Loading your courses...
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow text-center">
            <h3 className="text-xl font-semibold">
              No Enrolled Courses
            </h3>

            <p className="text-gray-500 mt-2">
              You have not enrolled in any course yet.
            </p>

            <Link
              to="/courses"
              className="inline-block mt-5 bg-blue-600 text-white px-5 py-2 rounded-lg"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white p-5 rounded-xl shadow"
              >
                <h3 className="text-xl font-bold">
                  {course.title}
                </h3>

                <p className="mt-2 text-gray-600 line-clamp-3">
                  {course.description}
                </p>

                <p className="text-sm text-gray-500 mt-3">
                  Duration: {course.duration || "N/A"}
                </p>

                <p className="text-sm text-gray-500">
                  Level: {course.level || "N/A"}
                </p>

                <Link
                  to={`/student/course/${course._id}`}
                  className="inline-block mt-5 bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Continue Learning →
                </Link>
              </div>
            ))}

          </div>
        )}
      </div>

    </div>
  );
}

export default StudentDashboard;