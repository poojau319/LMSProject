const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const instructorRoutes = require("./routes/instructorRoutes");
const adminRoutes = require("./routes/adminRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const quizRoutes = require("./routes/quizRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const progressRoutes = require("./routes/progressRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const certificateRoutes = require("./routes/certificateRoutes");


const app = express();


// Database Connection
connectDB();


// Middlewares
app.use(cors());
app.use(express.json());


// Routes

app.use("/api/auth", authRoutes);

app.use("/api/courses", courseRoutes);

app.use("/api/instructor", instructorRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/feedback", feedbackRoutes);

app.use("/api/quizzes", quizRoutes);

app.use("/api/assignments", assignmentRoutes);
app.use("/api/progress", progressRoutes);

app.use("/api/purchases", purchaseRoutes);
app.use(
  "/api/certificates",
  certificateRoutes
);
// Test Route

app.get("/", (req, res) => {

  res.send("LMS Backend Server Running 🚀");

});



// Server Start

const PORT = process.env.PORT || 5000;

app.use((err, req, res, next) => {
  console.error(
    "GLOBAL ERROR:",
    JSON.stringify(err, Object.getOwnPropertyNames(err), 2)
  );

  res.status(err.http_code || 500).json({
    message: err.message || "Something went wrong",
  });
});
app.listen(PORT, () => {

  console.log(`Server running on port ${PORT}`);

});