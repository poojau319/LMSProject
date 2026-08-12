const Course = require("../models/Course");
const Progress = require("../models/Progress");

// =====================================================
// CREATE COURSE
// =====================================================

const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      duration,
      level,
      image,
      price,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Course title is required",
      });
    }

    const course = await Course.create({
      title: title.trim(),
      description: description?.trim() || "",
      duration: duration?.trim() || "",
      level: level?.trim() || "",
      image: image || "",
      price: Number(price) || 0,
      instructor: req.user.id,
    });

    res.status(201).json({
      message: "Course Created Successfully",
      course,
    });
  } catch (error) {
    console.error("Create course error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// GET MY COURSES
// =====================================================

const getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      instructor: req.user.id,
    }).sort({
      createdAt: -1,
    });

    res.json(courses);
  } catch (error) {
    console.error(
      "Get instructor courses error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// UPDATE COURSE
// =====================================================

const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(
      req.params.id
    );

    if (!course) {
      return res.status(404).json({
        message: "Course Not Found",
      });
    }

    if (
      course.instructor.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message: "Access Denied",
      });
    }

    if (req.body.title !== undefined) {
      if (!req.body.title.trim()) {
        return res.status(400).json({
          message: "Course title is required",
        });
      }

      course.title = req.body.title.trim();
    }

    if (req.body.description !== undefined) {
      course.description =
        req.body.description.trim();
    }

    if (req.body.duration !== undefined) {
      course.duration =
        req.body.duration.trim();
    }

    if (req.body.level !== undefined) {
      course.level =
        req.body.level.trim();
    }

    if (req.body.image !== undefined) {
      course.image = req.body.image;
    }

    if (req.body.price !== undefined) {
      course.price =
        Number(req.body.price) || 0;
    }

    await course.save();

    res.json({
      message: "Course Updated Successfully",
      course,
    });
  } catch (error) {
    console.error(
      "Update course error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// DELETE COURSE
// =====================================================

const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(
      req.params.id
    );

    if (!course) {
      return res.status(404).json({
        message: "Course Not Found",
      });
    }

    if (
      course.instructor.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message: "Access Denied",
      });
    }

    await course.deleteOne();

    // Delete associated progress records
    await Progress.deleteMany({
      course: course._id,
    });

    res.json({
      message: "Course Deleted Successfully",
    });
  } catch (error) {
    console.error(
      "Delete course error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// YOUTUBE VALIDATION
// =====================================================

const isValidYoutubeUrl = (url) => {
  if (!url) {
    return false;
  }

  return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(
    url
  );
};

// =====================================================
// ADD LECTURE
// =====================================================

const addLecture = async (req, res) => {
  try {
    const {
      title,
      description,
      duration,
      youtubeUrl,
    } = req.body;

    // -------------------------------------------------
    // BASIC VALIDATION
    // -------------------------------------------------

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Lecture title is required",
      });
    }

    if (!duration || !duration.trim()) {
      return res.status(400).json({
        message: "Lecture duration is required",
      });
    }

    // -------------------------------------------------
    // COURSE
    // -------------------------------------------------

    const course = await Course.findById(
      req.params.id
    );

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // -------------------------------------------------
    // INSTRUCTOR CHECK
    // -------------------------------------------------

    if (
      course.instructor.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message: "Access Denied",
      });
    }

    // -------------------------------------------------
    // FILES
    // -------------------------------------------------

    const videoFile =
      req.files?.video?.[0];

    const pdfFile =
      req.files?.pdf?.[0];

    const videoUrl =
      videoFile?.path || "";

    const pdfUrl =
      pdfFile?.path || "";

    const cleanYoutubeUrl =
      typeof youtubeUrl === "string"
        ? youtubeUrl.trim()
        : "";

    // -------------------------------------------------
    // YOUTUBE + VIDEO
    // -------------------------------------------------

    if (
      cleanYoutubeUrl &&
      videoUrl
    ) {
      return res.status(400).json({
        message:
          "Use either YouTube URL or uploaded video, not both.",
      });
    }

    // -------------------------------------------------
    // CONTENT REQUIRED
    // -------------------------------------------------

    if (
      !cleanYoutubeUrl &&
      !videoUrl &&
      !pdfUrl
    ) {
      return res.status(400).json({
        message:
          "Please provide a YouTube URL, upload a video, or upload a PDF.",
      });
    }

    // -------------------------------------------------
    // YOUTUBE VALIDATION
    // -------------------------------------------------

    if (
      cleanYoutubeUrl &&
      !isValidYoutubeUrl(
        cleanYoutubeUrl
      )
    ) {
      return res.status(400).json({
        message:
          "Please enter a valid YouTube URL.",
      });
    }

    // -------------------------------------------------
    // CREATE LECTURE
    // -------------------------------------------------

    course.lectures.push({
      title: title.trim(),

      description:
        description?.trim() || "",

      duration: duration.trim(),

      youtubeUrl:
        cleanYoutubeUrl,

      videoUrl,

      pdfUrl,
    });

    await course.save();

    const lecture =
      course.lectures[
        course.lectures.length - 1
      ];

    res.status(201).json({
      message:
        "Lecture added successfully ✅",
      lecture,
    });
  } catch (error) {
    console.error(
      "Add lecture error:",
      error
    );

    res.status(500).json({
      message:
        error.message ||
        "Unable to add lecture.",
    });
  }
};

// =====================================================
// GET COURSE LECTURES - INSTRUCTOR
// =====================================================

const getLectures = async (req, res) => {
  try {
    const course = await Course.findById(
      req.params.id
    );

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (
      course.instructor.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message: "Access Denied",
      });
    }

    res.json({
      courseId: course._id,
      courseTitle: course.title,
      lectures:
        course.lectures || [],
    });
  } catch (error) {
    console.error(
      "Get lectures error:",
      error
    );

    res.status(500).json({
      message:
        error.message ||
        "Unable to load lectures.",
    });
  }
};

// =====================================================
// UPDATE LECTURE
// =====================================================

const updateLecture = async (req, res) => {
  try {
    const {
      title,
      description,
      duration,
      youtubeUrl,
      contentType,
    } = req.body;

    // -------------------------------------------------
    // COURSE
    // -------------------------------------------------

    const course = await Course.findById(
      req.params.id
    );

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // -------------------------------------------------
    // INSTRUCTOR
    // -------------------------------------------------

    if (
      course.instructor.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message: "Access Denied",
      });
    }

    // -------------------------------------------------
    // LECTURE
    // -------------------------------------------------

    const lecture =
      course.lectures.id(
        req.params.lectureId
      );

    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found",
      });
    }

    // -------------------------------------------------
    // BASIC VALIDATION
    // -------------------------------------------------

    if (!title || !title.trim()) {
      return res.status(400).json({
        message:
          "Lecture title is required",
      });
    }

    if (!duration || !duration.trim()) {
      return res.status(400).json({
        message:
          "Lecture duration is required",
      });
    }

    // -------------------------------------------------
    // FILES
    // -------------------------------------------------

    const newVideo =
      req.files?.video?.[0];

    const newPdf =
      req.files?.pdf?.[0];

    const newVideoUrl =
      newVideo?.path || "";

    const newPdfUrl =
      newPdf?.path || "";

    const cleanYoutubeUrl =
      typeof youtubeUrl === "string"
        ? youtubeUrl.trim()
        : "";

    // -------------------------------------------------
    // UPDATE BASIC INFO
    // -------------------------------------------------

    lecture.title =
      title.trim();

    lecture.description =
      description?.trim() || "";

    lecture.duration =
      duration.trim();

    // -------------------------------------------------
    // CONTENT TYPE
    // -------------------------------------------------

    if (contentType === "youtube") {
      if (!cleanYoutubeUrl) {
        return res.status(400).json({
          message:
            "YouTube URL is required.",
        });
      }

      if (
        !isValidYoutubeUrl(
          cleanYoutubeUrl
        )
      ) {
        return res.status(400).json({
          message:
            "Please enter a valid YouTube URL.",
        });
      }

      lecture.youtubeUrl =
        cleanYoutubeUrl;

      lecture.videoUrl = "";
    }

    // -------------------------------------------------
    // UPLOADED VIDEO
    // -------------------------------------------------

    else if (
      contentType === "video"
    ) {
      if (newVideoUrl) {
        lecture.videoUrl =
          newVideoUrl;

        lecture.youtubeUrl = "";
      } else if (
        !lecture.videoUrl
      ) {
        return res.status(400).json({
          message:
            "Please select a video file.",
        });
      }
    }

    // -------------------------------------------------
    // PDF ONLY
    // -------------------------------------------------

    else if (
      contentType === "pdf"
    ) {
      if (newPdfUrl) {
        lecture.pdfUrl =
          newPdfUrl;
      } else if (
        !lecture.pdfUrl
      ) {
        return res.status(400).json({
          message:
            "Please select a PDF file.",
        });
      }
    }

    // -------------------------------------------------
    // PDF REPLACEMENT
    // -------------------------------------------------

    if (newPdfUrl) {
      lecture.pdfUrl =
        newPdfUrl;
    }

    // -------------------------------------------------
    // MAKE SURE CONTENT EXISTS
    // -------------------------------------------------

    if (
      !lecture.youtubeUrl &&
      !lecture.videoUrl &&
      !lecture.pdfUrl
    ) {
      return res.status(400).json({
        message:
          "Lecture must contain a YouTube URL, uploaded video, or PDF.",
      });
    }

    // -------------------------------------------------
    // SAVE
    // -------------------------------------------------

    await course.save();

    res.json({
      message:
        "Lecture updated successfully ✅",
      lecture,
    });
  } catch (error) {
    console.error(
      "Update lecture error:",
      error
    );

    res.status(500).json({
      message:
        error.message ||
        "Unable to update lecture.",
    });
  }
};

// =====================================================
// DELETE LECTURE
// =====================================================

const deleteLecture = async (
  req,
  res
) => {
  try {
    const course =
      await Course.findById(
        req.params.id
      );

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (
      course.instructor.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message: "Access Denied",
      });
    }

    const lecture =
      course.lectures.id(
        req.params.lectureId
      );

    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found",
      });
    }

    lecture.deleteOne();

    await course.save();

    res.json({
      message:
        "Lecture deleted successfully ✅",
    });
  } catch (error) {
    console.error(
      "Delete lecture error:",
      error
    );

    res.status(500).json({
      message:
        error.message ||
        "Unable to delete lecture.",
    });
  }
};

// =====================================================
// STUDENT PERFORMANCE
// =====================================================

const getStudentPerformance = async (
  req,
  res
) => {
  try {
    const courses =
      await Course.find({
        instructor: req.user.id,
      });

    const courseIds =
      courses.map(
        (course) => course._id
      );

    const progress =
      await Progress.find({
        course: {
          $in: courseIds,
        },
      })
        .populate(
          "student",
          "name email"
        )
        .populate(
          "course",
          "title"
        );

    res.json(progress);
  } catch (error) {
    console.error(
      "Student performance error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createCourse,
  getInstructorCourses,
  updateCourse,
  deleteCourse,

  addLecture,
  getLectures,
  updateLecture,
  deleteLecture,

  getStudentPerformance,
};