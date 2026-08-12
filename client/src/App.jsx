import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// ================= BASIC =================

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Courses from "./pages/Courses";
import About from "./pages/About";
import Contact from "./pages/Contact";
import CourseDetails from "./pages/CourseDetails";

// ================= INSTRUCTOR =================

import InstructorDashboard from "./pages/InstructorDashboard";
import InstructorMyCourses from "./pages/InstructorMyCourses";
import UploadLecture from "./pages/UploadLecture";
import AssignmentManagement from "./pages/AssignmentManagement";
import StudentPerformance from "./pages/StudentPerformance";
import QuizManagement from "./pages/QuizManagement";
import InstructorCourseManager from "./pages/InstructorCourseManager";

// ================= ADMIN =================

import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import CourseApproval from "./pages/CourseApproval";
import AdminAnalytics from "./pages/AdminAnalytics";
import FeedbackManagement from "./pages/FeedbackManagement";
import AdminRevenue from "./pages/AdminRevenue";
import AdminCertificates from "./pages/AdminCertificates";

// ================= STUDENT =================

import StudentDashboard from "./pages/StudentDashboard";
import StudentCourses from "./pages/StudentCourses";
import StudentCourseDetails from "./pages/StudentCourseDetails";
import StudentFeedback from "./pages/StudentFeedback";
import StudentProgress from "./pages/StudentProgress";
import StudentQuiz from "./pages/StudentQuiz";
import MyCertificates from "./pages/MyCertificates";
import StudentAssignment from "./pages/StudentAssignment";

function App() {
  return (
    <>
      {/* ================= NAVBAR ================= */}

      <Navbar />

      {/* ================= ROUTES ================= */}

      <Routes>

        {/* ================= BASIC ================= */}

        <Route path="/" element={<Home />} />

        <Route path="/courses" element={<Courses />} />

        <Route path="/about" element={<About />} />

        <Route path="/contact" element={<Contact />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        
        <Route
          path="/course-details/:id"
          element={<CourseDetails />}
        />

        {/* ================= INSTRUCTOR ================= */}

        <Route
          path="/instructor-dashboard"
          element={
            <ProtectedRoute>
              <InstructorDashboard />
            </ProtectedRoute>
          }
        />
<Route
  path="/instructor/create-course"
  element={
    <ProtectedRoute>
      <InstructorCourseManager />
    </ProtectedRoute>
  }
/>
        <Route
          path="/instructor/my-courses"
          element={
            <ProtectedRoute>
              <InstructorMyCourses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload-lecture/:id"
          element={
            <ProtectedRoute>
              <UploadLecture />
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor/manage-lectures"
          element={
            <ProtectedRoute>
              <InstructorMyCourses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assignment/:id"
          element={
            <ProtectedRoute>
              <AssignmentManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor/assignments"
          element={
            <ProtectedRoute>
              <InstructorMyCourses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student-performance"
          element={
            <ProtectedRoute>
              <StudentPerformance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor/student-performance"
          element={
            <ProtectedRoute>
              <StudentPerformance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor/quiz/:id"
          element={
            <ProtectedRoute>
              <QuizManagement />
            </ProtectedRoute>
          }
        />

        {/* ================= ADMIN ================= */}

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute>
              <CourseApproval />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute>
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/feedback"
          element={
            <ProtectedRoute>
              <FeedbackManagement />
            </ProtectedRoute>
          }
        />

        <Route
  path="/admin/revenue"
  element={
    <ProtectedRoute>
      <AdminRevenue />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/certificates"
  element={
    <ProtectedRoute>
      <AdminCertificates />
    </ProtectedRoute>
  }
/>

        {/* ================= STUDENT ================= */}

        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student-courses"
          element={
            <ProtectedRoute>
              <StudentCourses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/course/:id"
          element={
            <ProtectedRoute>
              <StudentCourseDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/feedback/:courseId"
          element={
            <ProtectedRoute>
              <StudentFeedback />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student-progress"
          element={
            <ProtectedRoute>
              <StudentProgress />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/quiz/:courseId"
          element={
            <ProtectedRoute>
              <StudentQuiz />
            </ProtectedRoute>
          }
        />
        <Route
  path="/student/assignment/:id"
  element={
    <ProtectedRoute>
      <StudentAssignment />
    </ProtectedRoute>
  }
/>
        <Route
  path="/student/certificates"
  element={
    <ProtectedRoute>
      <MyCertificates />
    </ProtectedRoute>
  }
/>

      </Routes>
    </>
  );
}

export default App;