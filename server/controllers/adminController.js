const User = require("../models/User");
const Course = require("../models/Course");
const Purchase = require("../models/Purchase");
const Feedback = require("../models/Feedback");

// ======================================================
// ADMIN DASHBOARD
// ======================================================

const getDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalInstructors,
      totalCourses,
      pendingCourses,
      approvedCourses,
      rejectedCourses,
      feedbackCount,
      totalEnrollments,
      revenueResult,
      recentCourses,
    ] = await Promise.all([
      User.countDocuments(),

      User.countDocuments({
        role: "student",
      }),

      User.countDocuments({
        role: "instructor",
      }),

      Course.countDocuments(),

      Course.countDocuments({
        status: "Pending",
      }),

      Course.countDocuments({
        status: "Approved",
      }),

      Course.countDocuments({
        status: "Rejected",
      }),

      Feedback.countDocuments(),

      Purchase.countDocuments({
        status: "Paid",
      }),

      Purchase.aggregate([
        {
          $match: {
            status: "Paid",
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$amount",
            },
          },
        },
      ]),

      Course.find()
        .select(
          "title price students totalStudents rating status instructor createdAt"
        )
        .populate("instructor", "name email")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const totalRevenue =
      revenueResult.length > 0
        ? revenueResult[0].total
        : 0;

    res.json({
      totalUsers,
      totalStudents,
      totalInstructors,

      totalCourses,

      pendingCourses,
      approvedCourses,
      rejectedCourses,

      totalEnrollments,

      totalRevenue,

      feedbackCount,

      recentCourses,
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================================
// USER MANAGEMENT
// ======================================================

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        message:
          "You cannot delete your own admin account.",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        message:
          "Admin accounts cannot be deleted from this panel.",
      });
    }

    await user.deleteOne();

    res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================================
// COURSE MANAGEMENT
// ======================================================

const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("instructor", "name email")
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================================
// APPROVE COURSE
// ======================================================

const approveCourse = async (req, res) => {
  try {
    const course = await Course.findById(
      req.params.id
    );

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (course.status === "Approved") {
      return res.status(400).json({
        message:
          "This course has already been approved.",
      });
    }

    course.status = "Approved";

    await course.save();

    res.json({
      message: "Course approved successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================================
// REJECT COURSE
// ======================================================

const rejectCourse = async (req, res) => {
  try {
    const course = await Course.findById(
      req.params.id
    );

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (course.status === "Rejected") {
      return res.status(400).json({
        message:
          "This course has already been rejected.",
      });
    }

    course.status = "Rejected";

    await course.save();

    res.json({
      message: "Course rejected successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================================
// REVENUE DASHBOARD
// ======================================================

const getRevenue = async (req, res) => {
  try {
    const purchases = await Purchase.find({
      status: "Paid",
    })
      .populate(
        "student",
        "name email"
      )
      .populate(
        "course",
        "title price instructor"
      )
      .populate({
        path: "course",
        populate: {
          path: "instructor",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });

    let totalRevenue = 0;

    purchases.forEach((purchase) => {
      totalRevenue +=
        Number(purchase.amount) || 0;
    });

    // Course-wise revenue
    const revenueMap = {};

    purchases.forEach((purchase) => {
      if (!purchase.course) return;

      const courseId =
        purchase.course._id.toString();

      if (!revenueMap[courseId]) {
        revenueMap[courseId] = {
          _id: purchase.course._id,
          title: purchase.course.title,
          price:
            Number(purchase.course.price) || 0,
          enrollments: 0,
          revenue: 0,
          instructor:
            purchase.course.instructor || null,
        };
      }

      revenueMap[courseId].enrollments += 1;

      revenueMap[courseId].revenue +=
        Number(purchase.amount) || 0;
    });

    const revenueByCourse =
      Object.values(revenueMap).sort(
        (a, b) =>
          b.revenue - a.revenue
      );

    res.json({
      totalRevenue,

      totalEnrollments:
        purchases.length,

      totalCourses:
        revenueByCourse.length,

      revenueByCourse,

      recentPurchases: purchases
        .slice(0, 20)
        .map((purchase) => ({
          _id: purchase._id,

          amount: purchase.amount,

          status: purchase.status,

          paymentMethod:
            purchase.paymentMethod,

          transactionId:
            purchase.transactionId,

          createdAt:
            purchase.createdAt,

          student:
            purchase.student,

          course:
            purchase.course,
        })),
    });
  } catch (error) {
    console.error(
      "Revenue Error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================================
// ANALYTICS
// ======================================================

const getAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalInstructors,
      totalAdmins,
      totalCourses,
      pendingCourses,
      approvedCourses,
      rejectedCourses,
      totalEnrollments,
      revenueResult,
      feedback,
      courses,
    ] = await Promise.all([
      User.countDocuments(),

      User.countDocuments({
        role: "student",
      }),

      User.countDocuments({
        role: "instructor",
      }),

      User.countDocuments({
        role: "admin",
      }),

      Course.countDocuments(),

      Course.countDocuments({
        status: "Pending",
      }),

      Course.countDocuments({
        status: "Approved",
      }),

      Course.countDocuments({
        status: "Rejected",
      }),

      Purchase.countDocuments({
        status: "Paid",
      }),

      Purchase.aggregate([
        {
          $match: {
            status: "Paid",
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$amount",
            },
          },
        },
      ]),

      // ⭐ GET ACTUAL FEEDBACK
      Feedback.find()
        .select("rating course")
        .lean(),

      Course.find()
        .select(
          "title price students rating status instructor"
        )
        .populate(
          "instructor",
          "name email"
        )
        .lean(),
    ]);

    // ======================================================
    // REVENUE
    // ======================================================

    const totalRevenue =
      revenueResult.length > 0
        ? Number(revenueResult[0].total) || 0
        : 0;

    // ======================================================
    // OVERALL AVERAGE RATING
    // ======================================================

    const validRatings = feedback
      .map((item) => Number(item.rating))
      .filter(
        (rating) =>
          Number.isFinite(rating) &&
          rating >= 1 &&
          rating <= 5
      );

    const averageRating =
      validRatings.length > 0
        ? Number(
            (
              validRatings.reduce(
                (sum, rating) =>
                  sum + rating,
                0
              ) / validRatings.length
            ).toFixed(2)
          )
        : 0;

    // ======================================================
    // COURSE-WISE RATINGS
    // ======================================================

    const courseRatingMap = {};

    feedback.forEach((item) => {
      if (!item.course) return;

      const courseId =
        item.course.toString();

      if (!courseRatingMap[courseId]) {
        courseRatingMap[courseId] = {
          total: 0,
          count: 0,
        };
      }

      const rating = Number(item.rating);

      if (
        Number.isFinite(rating) &&
        rating >= 1 &&
        rating <= 5
      ) {
        courseRatingMap[courseId].total +=
          rating;

        courseRatingMap[courseId].count +=
          1;
      }
    });

    // ======================================================
    // TOP COURSES
    // ======================================================

    const topCourses = courses
      .map((course) => {
        const courseId =
          course._id.toString();

        const ratingData =
          courseRatingMap[courseId];

        const courseRating =
          ratingData &&
          ratingData.count > 0
            ? Number(
                (
                  ratingData.total /
                  ratingData.count
                ).toFixed(2)
              )
            : 0;

        return {
          _id: course._id,

          title: course.title,

          instructor:
            course.instructor,

          enrollments:
            Array.isArray(course.students)
              ? course.students.length
              : 0,

          // ⭐ NOW FROM FEEDBACK
          rating: courseRating,

          price:
            Number(course.price) || 0,

          status:
            course.status,
        };
      })
      .sort(
        (a, b) =>
          b.enrollments -
          a.enrollments
      )
      .slice(0, 5);

    // ======================================================
    // RESPONSE
    // ======================================================

    res.json({
      users: {
        total: totalUsers,
        students: totalStudents,
        instructors: totalInstructors,
        admins: totalAdmins,
      },

      courses: {
        total: totalCourses,
        pending: pendingCourses,
        approved: approvedCourses,
        rejected: rejectedCourses,
      },

      enrollments: {
        total: totalEnrollments,
      },

      revenue: {
        total: totalRevenue,
      },

      feedback: {
        total: feedback.length,

        // ⭐ THIS WILL SHOW 5 IF ONE 5-STAR REVIEW EXISTS
        averageRating,
      },

      topCourses,
    });
  } catch (error) {
    console.error(
      "Analytics Error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================================
// FEEDBACK MANAGEMENT
// ======================================================

const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate(
        "student",
        "name email"
      )
      .populate(
        "course",
        "title"
      )
      .sort({ createdAt: -1 });

    res.json(feedback);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteFeedback = async (req, res) => {
  try {
    const feedback =
      await Feedback.findById(
        req.params.id
      );

    if (!feedback) {
      return res.status(404).json({
        message: "Feedback not found",
      });
    }

    await feedback.deleteOne();

    res.json({
      message:
        "Feedback deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  getDashboard,

  getAllUsers,
  deleteUser,

  getAllCourses,
  approveCourse,
  rejectCourse,

  getRevenue,

  getAnalytics,

  getAllFeedback,
  deleteFeedback,
};