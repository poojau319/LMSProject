import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api/instructor";

const emptyCourse = {
  title: "",
  description: "",
  duration: "",
  level: "",
  image: "",
  price: 0,
};

function InstructorCourseManager() {
  const [courses, setCourses] = useState([]);
  const [course, setCourse] = useState(emptyCourse);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // =====================================================
  // FETCH MY COURSES
  // =====================================================

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API}/my-courses`,
        authConfig
      );

      setCourses(response.data || []);
    } catch (err) {
      console.error("Fetch courses error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your courses."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setError("Please login as an instructor.");
      setLoading(false);
      return;
    }

    fetchCourses();
  }, []);

  // =====================================================
  // INPUT HANDLER
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setCourse((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const validateCourse = () => {
    if (!course.title.trim()) {
      return "Course title is required.";
    }

    if (!course.description.trim()) {
      return "Course description is required.";
    }

    if (!course.duration.trim()) {
      return "Course duration is required.";
    }

    if (!course.level.trim()) {
      return "Course level is required.";
    }

    return "";
  };

  // =====================================================
  // CREATE / UPDATE COURSE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateCourse();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      const payload = {
  title: course.title.trim(),
  description: course.description.trim(),
  duration: course.duration.trim(),
  level: course.level.trim(),
  image: course.image.trim(),
  price: Number(course.price),
};

      if (editingId) {
        await axios.put(
          `${API}/update-course/${editingId}`,
          payload,
          authConfig
        );

        setSuccess("Course updated successfully ✅");
      } else {
        await axios.post(
          `${API}/create-course`,
          payload,
          authConfig
        );

        setSuccess("Course created successfully ✅");
      }

      setCourse(emptyCourse);
      setEditingId(null);

      await fetchCourses();
    } catch (err) {
      console.error("Save course error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save course."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // EDIT COURSE
  // =====================================================

  const handleEdit = (selectedCourse) => {
    setError("");
    setSuccess("");

    setEditingId(selectedCourse._id);

    setCourse({
  title: selectedCourse.title || "",
  description: selectedCourse.description || "",
  duration: selectedCourse.duration || "",
  level: selectedCourse.level || "",
  image: selectedCourse.image || "",
  price: selectedCourse.price ?? 0,
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
    setEditingId(null);
    setCourse(emptyCourse);
    setError("");
    setSuccess("");
  };

  // =====================================================
  // DELETE COURSE
  // =====================================================

  const handleDelete = async (courseId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this course? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(courseId);
      setError("");
      setSuccess("");

      await axios.delete(
        `${API}/delete-course/${courseId}`,
        authConfig
      );

      setCourses((previous) =>
        previous.filter((item) => item._id !== courseId)
      );

      if (editingId === courseId) {
        cancelEdit();
      }

      setSuccess("Course deleted successfully ✅");
    } catch (err) {
      console.error("Delete course error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete course."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // COURSE STATUS
  // =====================================================

  const getStatusClass = (status) => {
    if (status === "Approved") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Rejected") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-7xl mx-auto">

        {/* ================= HEADER ================= */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Create & Manage Courses
          </h1>

          <p className="text-gray-500 mt-2">
            Create courses and manage your existing course
            information.
          </p>
        </div>

        {/* ================= ERROR ================= */}

        {error && (
          <div className="mb-6 bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* ================= SUCCESS ================= */}

        {success && (
          <div className="mb-6 bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* ================= COURSE FORM ================= */}

        <div className="bg-white rounded-xl shadow p-6 mb-10">

          <div className="flex justify-between items-center mb-6">

            <h2 className="text-2xl font-bold text-gray-800">
              {editingId
                ? "Edit Course"
                : "Create New Course"}
            </h2>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Cancel Edit
              </button>
            )}

          </div>

          <form
            onSubmit={handleSubmit}
            className="grid md:grid-cols-2 gap-5"
          >

            {/* TITLE */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Course Title *
              </label>

              <input
                type="text"
                name="title"
                value={course.title}
                onChange={handleChange}
                placeholder="e.g. Full Stack Web Development"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* DURATION */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duration *
              </label>

              <input
                type="text"
                name="duration"
                value={course.duration}
                onChange={handleChange}
                placeholder="e.g. 12 Weeks"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* LEVEL */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Level *
              </label>

              <select
                name="level"
                value={course.level}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">
                  Select Level
                </option>

                <option value="Beginner">
                  Beginner
                </option>

                <option value="Intermediate">
                  Intermediate
                </option>

                <option value="Advanced">
                  Advanced
                </option>
              </select>
            </div>

            {/* IMAGE */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Course Image URL
              </label>

              <input
                type="url"
                name="image"
                value={course.image}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* PRICE */}

<div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Course Price (₹)
  </label>

  <input
    type="number"
    name="price"
    value={course.price}
    onChange={handleChange}
    min="0"
    placeholder="e.g. 999"
    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>

            {/* DESCRIPTION */}

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Course Description *
              </label>

              <textarea
                name="description"
                value={course.description}
                onChange={handleChange}
                rows="5"
                placeholder="Describe what students will learn in this course..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* BUTTON */}

            <div className="md:col-span-2">

              <button
                type="submit"
                disabled={saving}
                className={`w-full py-3 rounded-lg text-white font-semibold transition ${
                  saving
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {saving
                  ? editingId
                    ? "Updating Course..."
                    : "Creating Course..."
                  : editingId
                  ? "Update Course"
                  : "Create Course"}
              </button>

            </div>

          </form>
        </div>

        {/* ================= MY COURSES ================= */}

        <div>

          <div className="flex justify-between items-center mb-5">

            <h2 className="text-2xl font-bold text-gray-800">
              My Courses
            </h2>

            <button
              onClick={fetchCourses}
              className="text-blue-600 font-semibold hover:underline"
            >
              Refresh
            </button>

          </div>

          {loading ? (
            <div className="bg-white rounded-xl shadow p-10 text-center">
              <p className="text-gray-500">
                Loading your courses...
              </p>
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-10 text-center">
              <h3 className="text-xl font-semibold text-gray-700">
                No Courses Found
              </h3>

              <p className="text-gray-500 mt-2">
                Create your first course using the form above.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

              {courses.map((item) => (

                <div
                  key={item._id}
                  className="bg-white rounded-xl shadow overflow-hidden"
                >

                  {/* IMAGE */}

                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-44 object-cover"
                    />
                  ) : (
                    <div className="w-full h-44 bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">
                        No Course Image
                      </span>
                    </div>
                  )}

                  <div className="p-5">

                    {/* TITLE */}

                    <div className="flex justify-between items-start gap-3">

                      <h3 className="text-xl font-bold text-gray-800">
                        {item.title}
                      </h3>

                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${getStatusClass(
                          item.status
                        )}`}
                      >
                        {item.status || "Pending"}
                      </span>

                    </div>

                    {/* DESCRIPTION */}

                    <p className="text-gray-600 text-sm mt-3 line-clamp-3">
                      {item.description}
                    </p>

                    {/* DETAILS */}

                    <div className="mt-4 space-y-2 text-sm text-gray-600">

                      <p>
                        <strong>Duration:</strong>{" "}
                        {item.duration}
                      </p>

                      <p>
                        <strong>Level:</strong>{" "}
                        {item.level}
                      </p>

                      <p>
                        <strong>Students:</strong>{" "}
                        {item.students?.length ||
                          item.totalStudents ||
                          0}
                      </p>

                      <p>
                        <strong>Lectures:</strong>{" "}
                        {item.lectures?.length || 0}
                      </p>

                      <p>
                        <strong>Quiz Questions:</strong>{" "}
                        {item.quizzes?.length || 0}
                      </p>

                    </div>

                    {/* ACTIONS */}

                    <div className="grid grid-cols-2 gap-2 mt-5">

                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(item._id)
                        }
                        disabled={
                          deletingId === item._id
                        }
                        className={`py-2 rounded-lg font-medium text-white ${
                          deletingId === item._id
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                      >
                        {deletingId === item._id
                          ? "Deleting..."
                          : "Delete"}
                      </button>

                    </div>

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

export default InstructorCourseManager;