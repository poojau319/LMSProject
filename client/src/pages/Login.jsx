import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { login } from "../redux/authSlice";

function Login() {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetting, setResetting] = useState(false);


  // ================= LOGIN =================

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill all fields ❌");
      return;
    }

    try {

      const res = await axios.post(
        "https://lmsproject-ntug.onrender.com/api/auth/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));

      dispatch(
        login({
          token: res.data.token,
          user: res.data,
        })
      );

      alert("Login Successful ✅");

      if (res.data.role === "admin") {
        navigate("/admin-dashboard");
      } else if (res.data.role === "instructor") {
        navigate("/instructor-dashboard");
      } else {
        navigate("/student-dashboard");
      }

    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Login Failed"
      );

    }
  };


  // ================= RESET PASSWORD =================

  const handleResetPassword = async (e) => {

    e.preventDefault();

    if (!email || !newPassword || !confirmPassword) {
      alert("Please fill all fields ❌");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters ❌");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match ❌");
      return;
    }

    try {

      setResetting(true);

      const res = await axios.post(
       "https://lmsproject-ntug.onrender.com/api/auth/reset-password",
        {
          email,
          newPassword,
          confirmPassword,
        }
      );

      alert(
        res.data.message ||
        "Password reset successfully ✅"
      );

      // Clear reset fields
      setNewPassword("");
      setConfirmPassword("");

      // Go back to login
      setShowForgotPassword(false);

    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Password reset failed ❌"
      );

    } finally {

      setResetting(false);

    }
  };


  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-600 px-4">

      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">


        {/* ================= HEADER ================= */}

        <div className="text-center mb-5">

          <div className="text-4xl mb-2">
            {showForgotPassword ? "🔑" : "🔐"}
          </div>

          <h2 className="text-2xl font-bold text-gray-800">

            {showForgotPassword
              ? "Reset Password"
              : "Welcome Back"}

          </h2>

          <p className="text-sm text-gray-500 mt-1">

            {showForgotPassword
              ? "Create a new password for your account."
              : "Login to continue your learning journey."}

          </p>

        </div>


        {/* ================= FORGOT PASSWORD ================= */}

        {showForgotPassword ? (

          <form
            onSubmit={handleResetPassword}
            className="space-y-4"
          >

            {/* Email */}

            <input
              type="email"
              placeholder="Email Address"
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />


            {/* New Password */}

            <div className="relative">

              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                className="w-full border rounded-lg px-4 py-2.5 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-3 top-2.5"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>

            </div>


            {/* Confirm Password */}

            <input
              type="password"
              placeholder="Confirm New Password"
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
            />


            {/* Reset Button */}

            <button
              type="submit"
              disabled={resetting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2.5 rounded-lg font-semibold transition"
            >

              {resetting
                ? "Resetting..."
                : "Reset Password"}

            </button>


            {/* Back to Login */}

            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setNewPassword("");
                setConfirmPassword("");
              }}
              className="w-full text-blue-600 font-semibold hover:underline"
            >
              ← Back to Login
            </button>

          </form>

        ) : (

          /* ================= LOGIN FORM ================= */

          <form
            onSubmit={handleLogin}
            className="space-y-4"
          >

            {/* Email */}

            <input
              type="email"
              placeholder="Email Address"
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />


            {/* Password */}

            <div className="relative">

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full border rounded-lg px-4 py-2.5 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-3 top-2.5"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>

            </div>


            {/* Remember + Forgot */}

            <div className="flex justify-between text-sm text-gray-600">

              <label className="flex items-center gap-2">

                <input type="checkbox" />

                Remember Me

              </label>


              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-blue-600 hover:underline"
              >
                Forgot Password?
              </button>

            </div>


            {/* Login Button */}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold transition"
            >
              Login
            </button>

          </form>

        )}


        {/* ================= REGISTER ================= */}

        {!showForgotPassword && (

          <p className="text-center text-sm text-gray-600 mt-5">

            Don't have an account?{" "}

            <Link
              to="/register"
              className="text-blue-600 font-semibold hover:underline"
            >
              Register
            </Link>

          </p>

        )}

      </div>

    </div>
  );
}

export default Login;