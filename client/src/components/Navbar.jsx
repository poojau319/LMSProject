import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import { useState } from "react";

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [menuOpen, setMenuOpen] = useState(false);

  const token = localStorage.getItem("token");

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const role = user?.role?.toLowerCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    dispatch(logout());

    setMenuOpen(false);

    navigate("/login");
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">

        {/* ================= TOP BAR ================= */}

        <div className="flex items-center justify-between">

          {/* ================= LOGO ================= */}

          <Link
            to="/"
            onClick={closeMenu}
            className="text-2xl sm:text-3xl font-bold text-blue-600"
          >
            Learning Portal
          </Link>

          {/* ================= DESKTOP MENU ================= */}

          <div className="hidden md:flex items-center gap-6">

            {/* ================= PUBLIC ================= */}

            {!token && (
              <>
                <Link to="/" className="hover:text-blue-600">
                  Home
                </Link>

                <Link to="/courses" className="hover:text-blue-600">
                  Courses
                </Link>

                <Link to="/about" className="hover:text-blue-600">
                  About
                </Link>

                <Link to="/contact" className="hover:text-blue-600">
                  Contact
                </Link>
              </>
            )}

            {/* ================= STUDENT ================= */}

            {token && role === "student" && (
              <>
                <Link to="/" className="hover:text-blue-600">
                  Home
                </Link>

                <Link to="/courses" className="hover:text-blue-600">
                  Courses
                </Link>

                <Link
                  to="/student-dashboard"
                  className="hover:text-blue-600"
                >
                  Dashboard
                </Link>

                <Link
                  to="/student-progress"
                  className="hover:text-blue-600"
                >
                  Progress
                </Link>

                <Link
                  to="/student/certificates"
                  className="hover:text-blue-600"
                >
                  Certificates
                </Link>

                <Link to="/about" className="hover:text-blue-600">
                  About
                </Link>

                <Link to="/contact" className="hover:text-blue-600">
                  Contact
                </Link>
              </>
            )}

            {/* ================= INSTRUCTOR ================= */}

            {token && role === "instructor" && (
              <>
                <Link
                  to="/instructor-dashboard"
                  className="hover:text-blue-600"
                >
                  Dashboard
                </Link>

                <Link
                  to="/instructor/my-courses"
                  className="hover:text-blue-600"
                >
                  My Courses
                </Link>

                <Link
                  to="/instructor/student-performance"
                  className="hover:text-blue-600"
                >
                  Performance
                </Link>
              </>
            )}

            {/* ================= ADMIN ================= */}

            {token && role === "admin" && (
              <>
                <Link
                  to="/admin-dashboard"
                  className="hover:text-blue-600"
                >
                  Dashboard
                </Link>

                <Link
                  to="/admin/users"
                  className="hover:text-blue-600"
                >
                  Users
                </Link>

                <Link
                  to="/admin/courses"
                  className="hover:text-blue-600"
                >
                  Courses
                </Link>

                <Link
                  to="/admin/revenue"
                  className="hover:text-blue-600"
                >
                  Revenue
                </Link>

                <Link
                  to="/admin/analytics"
                  className="hover:text-blue-600"
                >
                  Analytics
                </Link>

                <Link
                  to="/admin/feedback"
                  className="hover:text-blue-600"
                >
                  Feedback
                </Link>

                <Link
                  to="/admin/certificates"
                  className="hover:text-blue-600"
                >
                  Certificates
                </Link>
              </>
            )}

            {/* ================= DESKTOP AUTH ================= */}

            {token ? (
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hover:text-blue-600"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            )}

          </div>

          {/* ================= MOBILE MENU BUTTON ================= */}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-3xl text-gray-700 focus:outline-none"
            aria-label="Toggle menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>

        </div>

        {/* ================= MOBILE MENU ================= */}

        {menuOpen && (
          <div className="md:hidden mt-4 border-t pt-4">

            <div className="flex flex-col gap-3">

              {/* ================= PUBLIC ================= */}

              {!token && (
                <>
                  <Link
                    to="/"
                    onClick={closeMenu}
                    className="py-2 hover:text-blue-600"
                  >
                    Home
                  </Link>

                  <Link
                    to="/courses"
                    onClick={closeMenu}
                    className="py-2 hover:text-blue-600"
                  >
                    Courses
                  </Link>

                  <Link
                    to="/about"
                    onClick={closeMenu}
                    className="py-2 hover:text-blue-600"
                  >
                    About
                  </Link>

                  <Link
                    to="/contact"
                    onClick={closeMenu}
                    className="py-2 hover:text-blue-600"
                  >
                    Contact
                  </Link>
                </>
              )}

              {/* ================= STUDENT ================= */}

              {token && role === "student" && (
                <>
                  <Link
                    to="/"
                    onClick={closeMenu}
                    className="py-2 hover:text-blue-600"
                  >
                    Home
                  </Link>

                  <Link
                    to="/courses"
                    onClick={closeMenu}
                    className="py-2 hover:text-blue-600"
                  >
                    Courses
                  </Link>

                  <Link
                    to="/student-dashboard"
                    onClick={closeMenu}
                    className="py-2 hover:text-blue-600"
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/student-progress"
                    onClick={closeMenu}
                    className="py-2 hover:text-blue-600"
                  >
                    Progress
                  </Link>

                  <Link
                    to="/student/certificates"
                    onClick={closeMenu}
                    className="py-2 hover:text-blue-600"
                  >
                    Certificates
                  </Link>

                  <Link
                    to="/about"
                    onClick={closeMenu}
                    className="py-2 hover:text-blue-600"
                  >
                    About
                  </Link>

                  <Link
                    to="/contact"
                    onClick={closeMenu}
                    className="py-2 hover:text-blue-600"
                  >
                    Contact
                  </Link>
                </>
              )}

              {/* ================= INSTRUCTOR ================= */}

              {token && role === "instructor" && (
                <>
                  <Link
                    to="/instructor-dashboard"
                    onClick={closeMenu}
                    className="py-2 hover:text-blue-600"
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/instructor/my-courses"
                    onClick={closeMenu}
                    className="py-2 hover:text-blue-600"
                  >
                    My Courses
                  </Link>

                  <Link
                    to="/instructor/student-performance"
                    onClick={closeMenu}
                    className="py-2 hover:text-blue-600"
                  >
                    Performance
                  </Link>
                </>
              )}

              {/* ================= ADMIN ================= */}

              {token && role === "admin" && (
                <>
                  <Link
                    to="/admin-dashboard"
                    onClick={closeMenu}
                    className="py-2 hover:text-blue-600"
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/admin/users"
                    onClick={closeMenu}
                    className="py-2 hover:text-blue-600"
                  >
                    Users
                  </Link>

                  <Link
                    to="/admin/courses"
                    onClick={closeMenu}
                    className="py-2 hover:text-blue-600"
                  >
                    Courses
                  </Link>

                  <Link
                    to="/admin/revenue"
                    onClick={closeMenu}
                    className="py-2 hover:text-blue-600"
                  >
                    Revenue
                  </Link>

                  <Link
                    to="/admin/analytics"
                    onClick={closeMenu}
                    className="py-2 hover:text-blue-600"
                  >
                    Analytics
                  </Link>

                  <Link
                    to="/admin/feedback"
                    onClick={closeMenu}
                    className="py-2 hover:text-blue-600"
                  >
                    Feedback
                  </Link>

                  <Link
                    to="/admin/certificates"
                    onClick={closeMenu}
                    className="py-2 hover:text-blue-600"
                  >
                    Certificates
                  </Link>
                </>
              )}

              {/* ================= MOBILE AUTH ================= */}

              {token ? (
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 mt-2"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="py-2 hover:text-blue-600"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    onClick={closeMenu}
                    className="bg-blue-600 text-white text-center px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Register
                  </Link>
                </>
              )}

            </div>
          </div>
        )}

      </div>
    </nav>
  );
}

export default Navbar;