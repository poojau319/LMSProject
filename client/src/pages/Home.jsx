import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Home() {
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/courses");

        const courseData = Array.isArray(res.data)
          ? res.data
          : res.data.courses || [];

        setCourses(courseData.slice(0, 4));
      } catch (error) {
        console.error("Home courses error:", error);
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ================= HERO ================= */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">

        <div>
          <span className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-full font-semibold">
            🚀 Best Online Learning Platform
          </span>

          <h1 className="text-5xl lg:text-6xl font-bold text-gray-800 mt-6 leading-tight">
            Learn Smarter,
            <span className="text-blue-600"> Grow Faster</span>
          </h1>

          <p className="mt-6 text-lg text-gray-600 leading-8 max-w-xl">
            Upgrade your skills with industry-ready courses, expert mentors,
            practical learning and hands-on projects. Start your learning
            journey today.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">

            <Link
              to="/courses"
              className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-xl font-semibold shadow-lg transition"
            >
              Explore Courses
            </Link>

            <Link
              to="/register"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-7 py-3 rounded-xl font-semibold transition"
            >
              Get Started
            </Link>

          </div>
        </div>

        <div className="flex justify-center">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800"
            alt="Students learning"
            className="rounded-3xl shadow-2xl w-full max-w-lg"
          />
        </div>

      </section>


      {/* ================= FEATURED COURSES ================= */}
      <section className="max-w-7xl mx-auto px-6 py-16">

        <div className="text-center mb-10">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
            Explore & Learn
          </span>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2">
            Featured Courses
          </h2>

          <p className="mt-3 text-gray-600">
            Explore our latest industry-ready courses and start learning today.
          </p>
        </div>


        {/* Loading */}
        {loadingCourses && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="bg-white rounded-2xl border shadow-sm p-5 animate-pulse"
              >
                <div className="h-32 bg-gray-200 rounded-xl"></div>

                <div className="h-5 bg-gray-200 rounded mt-5 w-3/4"></div>

                <div className="h-4 bg-gray-200 rounded mt-3 w-full"></div>
                <div className="h-4 bg-gray-200 rounded mt-2 w-5/6"></div>

                <div className="h-10 bg-gray-200 rounded-lg mt-5"></div>
              </div>
            ))}

          </div>
        )}


        {/* Courses */}
        {!loadingCourses && courses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {courses.map((course) => (

              <div
                key={course._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 overflow-hidden flex flex-col"
              >

                {/* Course Header */}
                <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">

                  {course.image ? (
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-5xl">
                      📚
                    </div>
                  )}

                </div>


                {/* Course Content */}
                <div className="p-5 flex flex-col flex-1">

                  <h3 className="text-lg font-bold text-gray-800 line-clamp-1">
                    {course.title}
                  </h3>

                  <p className="text-sm text-gray-600 mt-2 line-clamp-3 min-h-[60px]">
                    {course.description || "Learn practical skills with this course."}
                  </p>


                  {/* Course Meta */}
                  <div className="flex flex-wrap gap-2 mt-4">

                    {course.duration && (
                      <span className="bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1 rounded-full">
                        ⏱ {course.duration}
                      </span>
                    )}

                    {course.level && (
                      <span className="bg-green-50 text-green-600 text-xs font-medium px-3 py-1 rounded-full">
                        {course.level}
                      </span>
                    )}

                  </div>


                  {/* Price */}
                  <div className="mt-4">

                    <span className="text-xl font-bold text-gray-900">
                      ₹{Number(course.price || 0).toLocaleString()}
                    </span>

                  </div>


                  {/* Button */}
                  <Link
                    to={`/course-details/${course._id}`}
                    className="mt-5 block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2.5 rounded-xl font-semibold transition"
                  >
                    View Course →
                  </Link>

                </div>

              </div>

            ))}

          </div>
        )}


        {/* Empty */}
        {!loadingCourses && courses.length === 0 && (
          <div className="bg-white border rounded-2xl p-10 text-center">

            <div className="text-5xl mb-4">
              📚
            </div>

            <h3 className="text-xl font-bold text-gray-800">
              No courses available yet
            </h3>

            <p className="text-gray-500 mt-2">
              New courses will appear here once they are published.
            </p>

            <Link
              to="/courses"
              className="inline-block mt-5 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
            >
              Browse Courses
            </Link>

          </div>
        )}


        {/* View All */}
        <div className="text-center mt-10">

          <Link
            to="/courses"
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl font-semibold transition"
          >
            View All Courses
            <span>→</span>
          </Link>

        </div>

      </section>


      {/* ================= WHY CHOOSE US ================= */}
      <section className="max-w-7xl mx-auto px-6 pb-20">

        <div className="text-center mb-10">

          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
            Why Learning Portal?
          </span>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2">
            Everything You Need to Learn
          </h2>

        </div>


        <div className="grid md:grid-cols-4 gap-6">

          <FeatureCard
            icon="👨‍🏫"
            title="Expert Mentors"
            text="Learn from experienced industry professionals."
          />

          <FeatureCard
            icon="📚"
            title="Quality Courses"
            text="Updated courses designed for practical career growth."
          />

          <FeatureCard
            icon="💻"
            title="Real Projects"
            text="Gain practical experience by working on real projects."
          />

          <FeatureCard
            icon="🚀"
            title="Career Support"
            text="Build the skills you need for better opportunities."
          />

        </div>

      </section>


      {/* ================= STATS ================= */}
      <section className="max-w-7xl mx-auto px-6 pb-20">

        <div className="bg-white rounded-3xl shadow-sm border p-8 md:p-10">

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

            <Stat
              icon="👨‍🎓"
              value="10K+"
              label="Students"
            />

            <Stat
              icon="📚"
              value="50+"
              label="Courses"
            />

            <Stat
              icon="🎓"
              value="5K+"
              label="Certificates"
            />

            <Stat
              icon="👨‍🏫"
              value="100+"
              label="Expert Mentors"
            />

          </div>

        </div>

      </section>


      {/* ================= FOOTER ================= */}
      <footer className="bg-gray-900 text-white mt-10">

        <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-10">

          {/* Brand */}
          <div>

            <h2 className="text-3xl font-bold text-blue-400">
              Learning Portal
            </h2>

            <p className="mt-4 text-gray-400 leading-7">
              Empowering learners with industry-ready skills,
              expert courses and practical learning experiences.
            </p>

            <div className="flex gap-3 mt-5">

              <span className="bg-gray-800 px-3 py-2 rounded-lg">
                📘
              </span>

              <span className="bg-gray-800 px-3 py-2 rounded-lg">
                💼
              </span>

              <span className="bg-gray-800 px-3 py-2 rounded-lg">
                ▶️
              </span>

            </div>

          </div>


          {/* Quick Links */}
          <div>

            <h3 className="text-xl font-semibold mb-5">
              Quick Links
            </h3>

            <div className="space-y-3">

              <Link
                to="/"
                className="block text-gray-400 hover:text-white transition"
              >
                Home
              </Link>

              <Link
                to="/courses"
                className="block text-gray-400 hover:text-white transition"
              >
                Courses
              </Link>

              <span className="block text-gray-400">
                About Us
              </span>

              <span className="block text-gray-400">
                Contact
              </span>

            </div>

          </div>


          {/* Popular Courses */}
          <div>

            <h3 className="text-xl font-semibold mb-5">
              Explore
            </h3>

            <Link
              to="/courses"
              className="block text-gray-400 hover:text-white mb-3 transition"
            >
              All Courses
            </Link>

            <Link
              to="/courses"
              className="block text-gray-400 hover:text-white mb-3 transition"
            >
              Latest Courses
            </Link>

            <Link
              to="/courses"
              className="block text-gray-400 hover:text-white mb-3 transition"
            >
              Browse Learning
            </Link>

          </div>


          {/* Contact */}
          <div>

            <h3 className="text-xl font-semibold mb-5">
              Contact Us
            </h3>

            <p className="text-gray-400 mb-3">
              📧 support@learningportal.com
            </p>

            <p className="text-gray-400 mb-3">
              📞 +91 9876543210
            </p>

            <p className="text-gray-400">
              📍 India
            </p>

          </div>

        </div>


        <div className="border-t border-gray-700 text-center py-5 text-gray-400">
          © 2026 Learning Portal | All Rights Reserved
        </div>

      </footer>

    </div>
  );
}


/* ================= FEATURE CARD ================= */

function FeatureCard({ icon, title, text }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-lg transition">

      <div className="text-4xl mb-4">
        {icon}
      </div>

      <h3 className="text-xl font-bold text-gray-800">
        {title}
      </h3>

      <p className="mt-3 text-gray-600 leading-6">
        {text}
      </p>

    </div>
  );
}


/* ================= STAT ================= */

function Stat({ icon, value, label }) {
  return (
    <div className="text-center">

      <div className="text-4xl mb-3">
        {icon}
      </div>

      <h3 className="text-3xl font-bold text-blue-600">
        {value}
      </h3>

      <p className="text-gray-600 mt-2">
        {label}
      </p>

    </div>
  );
}


export default Home;