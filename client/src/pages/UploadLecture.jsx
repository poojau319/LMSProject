import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API =
  "https://lmsproject-ntug.onrender.com/api/instructor";

const EMPTY_FORM = {
  title: "",
  description: "",
  duration: "",
  youtubeUrl: "",
  contentType: "youtube",
};

function UploadLecture() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token =
    localStorage.getItem("token");

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [video, setVideo] =
    useState(null);

  const [pdf, setPdf] =
    useState(null);

  const [lectures, setLectures] =
    useState([]);

  const [editingId, setEditingId] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [fetching, setFetching] =
    useState(true);

  const [deletingId, setDeletingId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // =====================================================
  // AUTH
  // =====================================================

  const authConfig = {
    headers: {
      Authorization:
        `Bearer ${token}`,
    },
  };

  // =====================================================
  // FETCH LECTURES
  // =====================================================

  const fetchLectures = async () => {
    if (!id || !token) {
      setFetching(false);
      return;
    }

    try {
      setFetching(true);
      setError("");

      const response =
        await axios.get(
          `${API}/${id}/lectures`,
          authConfig
        );

      setLectures(
        response.data?.lectures || []
      );
    } catch (error) {
      console.error(
        "Get lectures error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load lectures."
      );
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchLectures();
  }, [id]);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // CONTENT TYPE
  // =====================================================

  const changeContentType = (
    contentType
  ) => {
    setForm((previous) => ({
      ...previous,
      contentType,
      youtubeUrl:
        contentType === "youtube"
          ? previous.youtubeUrl
          : "",
    }));

    if (
      contentType !== "video"
    ) {
      setVideo(null);

      const input =
        document.getElementById(
          "videoInput"
        );

      if (input) {
        input.value = "";
      }
    }

    if (
      contentType !== "pdf"
    ) {
      setPdf(null);

      const input =
        document.getElementById(
          "pdfInput"
        );

      if (input) {
        input.value = "";
      }
    }
  };

  // =====================================================
  // RESET
  // =====================================================

  const resetForm = () => {
    setForm(EMPTY_FORM);

    setVideo(null);
    setPdf(null);

    setEditingId(null);

    const videoInput =
      document.getElementById(
        "videoInput"
      );

    const pdfInput =
      document.getElementById(
        "pdfInput"
      );

    if (videoInput) {
      videoInput.value = "";
    }

    if (pdfInput) {
      pdfInput.value = "";
    }
  };

  // =====================================================
  // VALIDATE
  // =====================================================

  const validateForm = () => {
    if (!form.title.trim()) {
      return "Lecture title is required.";
    }

    if (!form.duration.trim()) {
      return "Lecture duration is required.";
    }

    // YouTube
    if (
      form.contentType ===
      "youtube"
    ) {
      if (!form.youtubeUrl.trim()) {
        return "YouTube URL is required.";
      }

      const validYoutube =
        /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(
          form.youtubeUrl.trim()
        );

      if (!validYoutube) {
        return "Please enter a valid YouTube URL.";
      }
    }

    // Video
    if (
      form.contentType ===
        "video" &&
      !video &&
      !editingId
    ) {
      return "Please select a video file.";
    }

    // PDF
    if (
      form.contentType ===
        "pdf" &&
      !pdf &&
      !editingId
    ) {
      return "Please select a PDF file.";
    }

    return "";
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError(
        "Please login first."
      );
      return;
    }

    if (!id) {
      setError(
        "Course ID is missing."
      );
      return;
    }

    const validationError =
      validateForm();

    if (validationError) {
      setError(
        validationError
      );
      return;
    }

    try {
      setLoading(true);

      const formData =
        new FormData();

      formData.append(
        "title",
        form.title.trim()
      );

      formData.append(
        "description",
        form.description.trim()
      );

      formData.append(
        "duration",
        form.duration.trim()
      );

      formData.append(
        "contentType",
        form.contentType
      );

      // YouTube
      if (
        form.contentType ===
        "youtube"
      ) {
        formData.append(
          "youtubeUrl",
          form.youtubeUrl.trim()
        );
      }

      // Video
      if (
        form.contentType ===
          "video" &&
        video
      ) {
        formData.append(
          "video",
          video
        );
      }

      // PDF
      if (pdf) {
        formData.append(
          "pdf",
          pdf
        );
      }

      if (editingId) {
        await axios.put(
          `${API}/${id}/lectures/${editingId}`,
          formData,
          authConfig
        );

        setSuccess(
          "Lecture updated successfully ✅"
        );
      } else {
        await axios.post(
          `${API}/${id}/add-lecture`,
          formData,
          authConfig
        );

        setSuccess(
          "Lecture added successfully ✅"
        );
      }

      resetForm();

      await fetchLectures();
    } catch (error) {
      console.error(
        "Save lecture error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to save lecture."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = (
    lecture
  ) => {
    setError("");
    setSuccess("");

    setEditingId(
      lecture._id
    );

    let contentType =
      "youtube";

    if (
      lecture.videoUrl
    ) {
      contentType =
        "video";
    }

    if (
      !lecture.youtubeUrl &&
      !lecture.videoUrl &&
      lecture.pdfUrl
    ) {
      contentType =
        "pdf";
    }

    setForm({
      title:
        lecture.title || "",

      description:
        lecture.description || "",

      duration:
        lecture.duration || "",

      youtubeUrl:
        lecture.youtubeUrl || "",

      contentType,
    });

    setVideo(null);
    setPdf(null);

    const videoInput =
      document.getElementById(
        "videoInput"
      );

    const pdfInput =
      document.getElementById(
        "pdfInput"
      );

    if (videoInput) {
      videoInput.value = "";
    }

    if (pdfInput) {
      pdfInput.value = "";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // CANCEL
  // =====================================================

  const cancelEdit = () => {
    resetForm();
    setError("");
    setSuccess("");
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (
    lectureId
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this lecture?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        lectureId
      );

      setError("");
      setSuccess("");

      await axios.delete(
        `${API}/${id}/lectures/${lectureId}`,
        authConfig
      );

      setLectures(
        (previous) =>
          previous.filter(
            (lecture) =>
              lecture._id !==
              lectureId
          )
      );

      if (
        editingId ===
        lectureId
      ) {
        resetForm();
      }

      setSuccess(
        "Lecture deleted successfully ✅"
      );
    } catch (error) {
      console.error(
        "Delete lecture error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to delete lecture."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // EXISTING LECTURE
  // =====================================================

  const editingLecture =
    lectures.find(
      (lecture) =>
        lecture._id ===
        editingId
    );

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Manage Lectures 🎥
            </h1>

            <p className="text-gray-500 mt-2">
              Create, edit and delete
              course lectures.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/instructor/my-courses"
              )
            }
            className="bg-gray-700 text-white px-5 py-2.5 rounded-lg hover:bg-gray-800"
          >
            ← Back
          </button>

        </div>

        {/* ERROR */}

        {error && (
          <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">

          {/* =================================================
              FORM
          ================================================= */}

          <div className="bg-white rounded-xl shadow-md p-6">

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-2xl font-bold text-gray-800">
                {editingId
                  ? "Edit Lecture"
                  : "Add New Lecture"}
              </h2>

              {editingId && (
                <button
                  type="button"
                  onClick={
                    cancelEdit
                  }
                  className="text-gray-600 font-semibold hover:text-gray-900"
                >
                  Cancel
                </button>
              )}

            </div>

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-5"
            >

              {/* TITLE */}

              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Lecture Title *
                </label>

                <input
                  type="text"
                  name="title"
                  value={
                    form.title
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Introduction to React"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Description
                </label>

                <textarea
                  name="description"
                  rows="4"
                  value={
                    form.description
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="What will students learn?"
                  className="w-full border border-gray-300 p-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* DURATION */}

              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Duration *
                </label>

                <input
                  type="text"
                  name="duration"
                  value={
                    form.duration
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="45 minutes"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* CONTENT TYPE */}

              <div>

                <label className="block font-semibold text-gray-700 mb-3">
                  Lecture Content
                </label>

                <div className="grid grid-cols-3 gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      changeContentType(
                        "youtube"
                      )
                    }
                    className={`py-3 rounded-lg font-semibold ${
                      form.contentType ===
                      "youtube"
                        ? "bg-red-600 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    YouTube
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      changeContentType(
                        "video"
                      )
                    }
                    className={`py-3 rounded-lg font-semibold ${
                      form.contentType ===
                      "video"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Video
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      changeContentType(
                        "pdf"
                      )
                    }
                    className={`py-3 rounded-lg font-semibold ${
                      form.contentType ===
                      "pdf"
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    PDF
                  </button>

                </div>
              </div>

              {/* YOUTUBE */}

              {form.contentType ===
                "youtube" && (
                <div>

                  <label className="block font-semibold text-gray-700 mb-2">
                    YouTube URL *
                  </label>

                  <input
                    type="url"
                    name="youtubeUrl"
                    value={
                      form.youtubeUrl
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full border border-gray-300 p-3 rounded-lg"
                  />

                </div>
              )}

              {/* VIDEO */}

              {form.contentType ===
                "video" && (
                <div>

                  <label className="block font-semibold text-gray-700 mb-2">
                    Upload Video *
                  </label>

                  <input
                    id="videoInput"
                    type="file"
                    accept="video/*"
                    onChange={(e) =>
                      setVideo(
                        e.target.files?.[0] ||
                          null
                      )
                    }
                    className="w-full border border-gray-300 p-3 rounded-lg"
                  />

                  {video && (
                    <p className="text-sm text-green-600 mt-2">
                      Selected:{" "}
                      {video.name}
                    </p>
                  )}

                  {editingId && (
                    <p className="text-xs text-gray-500 mt-2">
                      Select a file only if
                      you want to replace
                      the existing video.
                    </p>
                  )}

                </div>
              )}

              {/* PDF */}

              {form.contentType ===
                "pdf" && (
                <div>

                  <label className="block font-semibold text-gray-700 mb-2">
                    Upload PDF *
                  </label>

                  <input
                    id="pdfInput"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) =>
                      setPdf(
                        e.target.files?.[0] ||
                          null
                      )
                    }
                    className="w-full border border-gray-300 p-3 rounded-lg"
                  />

                  {pdf && (
                    <p className="text-sm text-green-600 mt-2">
                      Selected:{" "}
                      {pdf.name}
                    </p>
                  )}

                </div>
              )}

              {/* EXISTING CONTENT */}

              {editingId &&
                editingLecture && (
                  <div className="bg-gray-50 border rounded-xl p-4">

                    <p className="font-semibold text-gray-800 mb-3">
                      Existing Content
                    </p>

                    {editingLecture.youtubeUrl && (
                      <a
                        href={
                          editingLecture.youtubeUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="block text-red-600 font-semibold mb-2 hover:underline"
                      >
                        ▶ Open Existing
                        YouTube
                      </a>
                    )}

                    {editingLecture.videoUrl && (
                      <a
                        href={
                          editingLecture.videoUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="block text-blue-600 font-semibold mb-2 hover:underline"
                      >
                        🎥 Open Existing
                        Video
                      </a>
                    )}

                    {editingLecture.pdfUrl && (
                      <a
                        href={
                          editingLecture.pdfUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="block text-green-600 font-semibold hover:underline"
                      >
                        📄 Open Existing
                        PDF
                      </a>
                    )}

                  </div>
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
                    ? "Updating Lecture..."
                    : "Adding Lecture..."
                  : editingId
                  ? "Update Lecture"
                  : "Add Lecture"}
              </button>

            </form>

          </div>

          {/* =================================================
              LECTURE LIST
          ================================================= */}

          <div>

            <div className="flex justify-between items-center mb-5">

              <h2 className="text-2xl font-bold text-gray-800">
                Course Lectures
              </h2>

              <button
                type="button"
                onClick={
                  fetchLectures
                }
                className="text-blue-600 font-semibold hover:underline"
              >
                Refresh
              </button>

            </div>

            {fetching ? (
              <div className="bg-white rounded-xl shadow p-8 text-center">
                <p className="text-gray-500">
                  Loading lectures...
                </p>
              </div>
            ) : lectures.length ===
              0 ? (
              <div className="bg-white rounded-xl shadow p-8 text-center">

                <div className="text-5xl mb-4">
                  🎥
                </div>

                <h3 className="text-xl font-semibold text-gray-700">
                  No Lectures Yet
                </h3>

                <p className="text-gray-500 mt-2">
                  Add your first
                  lecture.
                </p>

              </div>
            ) : (
              <div className="space-y-4">

                {lectures.map(
                  (
                    lecture,
                    index
                  ) => (
                    <div
                      key={
                        lecture._id
                      }
                      className="bg-white rounded-xl shadow-md p-5"
                    >

                      <div className="flex justify-between gap-4">

                        <div>
                          <p className="text-sm text-blue-600 font-semibold">
                            Lecture{" "}
                            {index + 1}
                          </p>

                          <h3 className="text-xl font-bold text-gray-800 mt-1">
                            {
                              lecture.title
                            }
                          </h3>
                        </div>

                        <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full h-fit">
                          {
                            lecture.duration
                          }
                        </span>

                      </div>

                      {lecture.description && (
                        <p className="text-gray-600 mt-3 whitespace-pre-line">
                          {
                            lecture.description
                          }
                        </p>
                      )}

                      {/* CONTENT BUTTONS */}

                      <div className="flex flex-wrap gap-2 mt-4">

                        {lecture.youtubeUrl && (
                          <a
                            href={
                              lecture.youtubeUrl
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                          >
                            YouTube ▶
                          </a>
                        )}

                        {lecture.videoUrl && (
                          <a
                            href={
                              lecture.videoUrl
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                          >
                            Watch Video 🎥
                          </a>
                        )}

                        {lecture.pdfUrl && (
                          <a
                            href={
                              lecture.pdfUrl
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                          >
                            Open PDF 📄
                          </a>
                        )}

                      </div>

                      {/* ACTIONS */}

                      <div className="grid grid-cols-2 gap-2 mt-5">

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(
                              lecture
                            )
                          }
                          className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={
                            deletingId ===
                            lecture._id
                          }
                          onClick={() =>
                            handleDelete(
                              lecture._id
                            )
                          }
                          className={`py-2 rounded-lg font-semibold text-white ${
                            deletingId ===
                            lecture._id
                              ? "bg-gray-400"
                              : "bg-red-600 hover:bg-red-700"
                          }`}
                        >
                          {deletingId ===
                          lecture._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}

export default UploadLecture;