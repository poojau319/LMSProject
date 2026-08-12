import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const token = localStorage.getItem("token");

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const role = user?.role?.toLowerCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    dispatch(logout());

    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* ================= LOGO ================= */}

        <Link
          to="/"
          className="text-3xl font-bold text-blue-600"
        >
          Learning Portal
        </Link>

        {/* ================= MENU ================= */}

        <div className="flex items-center gap-6">

          {/* ================= PUBLIC ================= */}

          {!token && (
            <>
              <Link
                to="/"
                className="hover:text-blue-600"
              >
                Home
              </Link>

              <Link
                to="/courses"
                className="hover:text-blue-600"
              >
                Courses
              </Link>

              <Link
                to="/about"
                className="hover:text-blue-600"
              >
                About
              </Link>

              <Link
                to="/contact"
                className="hover:text-blue-600"
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
                className="hover:text-blue-600"
              >
                Home
              </Link>

              <Link
                to="/courses"
                className="hover:text-blue-600"
              >
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

              <Link
                to="/about"
                className="hover:text-blue-600"
              >
                About
              </Link>

              <Link
                to="/contact"
                className="hover:text-blue-600"
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

          {/* ================= LOGOUT / AUTH ================= */}

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
      </div>
    </nav>
  );
}

export default Navbar;

