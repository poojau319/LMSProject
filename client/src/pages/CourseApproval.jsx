import { useEffect, useState } from "react";
import axios from "axios";

function CourseApproval() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchCourses = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "https://lmsproject-ntug.onrender.com/api/admin/courses",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.log("Fetch courses error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, action) => {
    try {
      await axios.put(
        `https://lmsproject-ntug.onrender.com/api/admin/courses/${id}/${action}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        action === "approve"
          ? "Course Approved Successfully ✅"
          : "Course Rejected Successfully ❌"
      );

      fetchCourses();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Action Failed"
      );
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>

          <p className="text-gray-600 font-medium">
            Loading courses...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
            Administration
          </p>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-1">
            Course Approval
          </h1>

          <p className="text-gray-500 mt-2">
            Review instructor courses and manage their approval status.
          </p>
        </div>

        {/* EMPTY */}

        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="text-5xl mb-4">📚</div>

            <h2 className="text-xl font-bold text-gray-800">
              No Courses Found
            </h2>

            <p className="text-gray-500 mt-2">
              There are currently no courses available for review.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {courses.map((course) => {
              const status = course.status || "Pending";

              return (
                <div
                  key={course._id}
                  className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden"
                >

                  {/* COURSE CONTENT */}

                  <div className="p-6">

                    <div className="flex items-start justify-between gap-4">

                      <h2 className="text-xl font-bold text-gray-900">
                        {course.title}
                      </h2>

                      {/* STATUS */}

                      {status === "Approved" && (
                        <span className="shrink-0 bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-semibold">
                          ✓ Approved
                        </span>
                      )}

                      {status === "Rejected" && (
                        <span className="shrink-0 bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-semibold">
                          ✕ Rejected
                        </span>
                      )}

                      {status === "Pending" && (
                        <span className="shrink-0 bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full text-xs font-semibold">
                          ⏳ Pending
                        </span>
                      )}

                    </div>

                    <p className="mt-4 text-gray-600 text-sm leading-6 line-clamp-3">
                      {course.description || "No description available."}
                    </p>

                    <div className="mt-5 space-y-2 text-sm">

                      <p className="text-gray-600">
                        <span className="font-semibold text-gray-800">
                          Instructor:
                        </span>{" "}
                        {course.instructor?.name || "Unknown"}
                      </p>

                      <p className="text-gray-600">
                        <span className="font-semibold text-gray-800">
                          Price:
                        </span>{" "}
                        ₹{Number(course.price || 0).toLocaleString()}
                      </p>

                    </div>

                    {/* ACTIONS */}

                    {status === "Pending" && (
                      <div className="flex gap-3 mt-6">

                        <button
                          onClick={() =>
                            updateStatus(course._id, "approve")
                          }
                          className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition"
                        >
                          ✓ Approve
                        </button>

                        <button
                          onClick={() =>
                            updateStatus(course._id, "reject")
                          }
                          className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-red-700 transition"
                        >
                          ✕ Reject
                        </button>

                      </div>
                    )}

                    {/* APPROVED MESSAGE */}

                    {status === "Approved" && (
                      <div className="mt-6 bg-green-50 border border-green-100 rounded-lg px-4 py-3 text-sm text-green-700 font-medium">
                        This course has already been approved.
                      </div>
                    )}

                    {/* REJECTED MESSAGE */}

                    {status === "Rejected" && (
                      <div className="mt-6 bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-sm text-red-700 font-medium">
                        This course has been rejected.
                      </div>
                    )}

                  </div>
                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}

export default CourseApproval;