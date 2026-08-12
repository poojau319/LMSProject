import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // ================= FETCH COURSES =================

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");

      // Get approved courses
      const res = await axios.get(
        "http://localhost:5000/api/courses"
      );

      setCourses(
        Array.isArray(res.data) ? res.data : []
      );

      // Get student's enrolled courses
      if (token) {
        try {
          const myCourses = await axios.get(
            "http://localhost:5000/api/courses/my-courses",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setEnrolledCourses(
            Array.isArray(myCourses.data)
              ? myCourses.data
              : []
          );
        } catch (error) {
          console.log(
            "My courses fetch error:",
            error
          );
        }
      }
    } catch (error) {
      console.error(
        "Courses error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load courses."
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= PURCHASE COURSE =================

  const purchaseCourse = async (id) => {
    if (!token) {
      alert("Please login first.");
      return;
    }

    try {
      setPurchasing(id);

      await axios.post(
        `http://localhost:5000/api/purchases/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        "Course purchased successfully ✅"
      );

      // Refresh courses/enrollment status
      await fetchCourses();

    } catch (error) {
      console.error(
        "Purchase error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Purchase Failed"
      );
    } finally {
      setPurchasing(null);
    }
  };

  // ================= CHECK ENROLLMENT =================

  const isEnrolled = (id) => {
    return enrolledCourses.some(
      (course) => course._id === id
    );
  };

  // ================= LOAD DATA =================

  useEffect(() => {
    fetchCourses();
  }, []);

  // ================= UI =================

  return (
    <div className="min-h-screen bg-gray-50 p-8">

      <div className="max-w-7xl mx-auto">

        {/* Header */}

        <div className="flex justify-between items-center mb-8">

          <div>
            <h1 className="text-3xl font-bold">
              Explore Courses 📚
            </h1>

            <p className="text-gray-500 mt-2">
              Choose a course and start learning.
            </p>
          </div>

          <Link
            to="/student-dashboard"
            className="text-blue-600 font-semibold"
          >
            Dashboard →
          </Link>

        </div>


        {/* Error */}

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}


        {/* Loading */}

        {loading ? (

          <div className="bg-white p-8 rounded-xl shadow text-center">
            Loading courses...
          </div>

        ) : courses.length === 0 ? (

          <div className="bg-white p-8 rounded-xl shadow text-center">
            <p className="text-gray-500">
              No approved courses available.
            </p>
          </div>

        ) : (

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {courses.map((course) => (

              <div
                key={course._id}
                className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
              >

                {/* Course Title */}

                <h2 className="text-xl font-bold">
                  {course.title}
                </h2>


                {/* Description */}

                <p className="mt-2 text-gray-600 line-clamp-3">
                  {course.description}
                </p>


                {/* Course Details */}

                <div className="mt-4 space-y-1 text-sm">

                  <p>
                    <strong>Duration:</strong>{" "}
                    {course.duration || "N/A"}
                  </p>

                  <p>
                    <strong>Level:</strong>{" "}
                    {course.level || "N/A"}
                  </p>

                  <p>
                    <strong>Students:</strong>{" "}
                    {course.totalStudents || 0}
                  </p>

                </div>


                {/* Price */}

                <div className="mt-4">

                  {Number(course.price) > 0 ? (

                    <p className="text-2xl font-bold text-green-600">
                      ₹
                      {Number(
                        course.price
                      ).toLocaleString()}
                    </p>

                  ) : (

                    <p className="text-xl font-bold text-green-600">
                      Free
                    </p>

                  )}

                </div>


                {/* Action */}

                {isEnrolled(course._id) ? (

                  <Link
                    to={`/student/course/${course._id}`}
                    className="inline-block mt-5 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold transition"
                  >
                    Continue Learning →
                  </Link>

                ) : (

                  <button
                    onClick={() =>
                      purchaseCourse(course._id)
                    }
                    disabled={
                      purchasing === course._id
                    }
                    className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >

                    {purchasing === course._id

                      ? "Processing..."

                      : Number(course.price) > 0

                      ? `Buy Now ₹${Number(
                          course.price
                        ).toLocaleString()}`

                      : "Enroll Free"}

                  </button>

                )}

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default StudentCourses;