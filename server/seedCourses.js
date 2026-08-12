require("dotenv").config();
const mongoose = require("mongoose");
const Course = require("./models/Course");

mongoose.connect(process.env.MONGO_URI);

const courses = [
  {
    title: "MERN Stack Development",
    description: "Learn MongoDB, Express, React and Node.js",
    duration: "12 Weeks",
    level: "Intermediate",
  },
  {
    title: "React JS Development",
    description: "Build modern frontend applications",
    duration: "8 Weeks",
    level: "Beginner",
  },
  {
    title: "Java Programming",
    description: "Core Java to Advanced Java",
    duration: "10 Weeks",
    level: "Beginner",
  },
  {
    title: "Python Programming",
    description: "Python from basics to advanced",
    duration: "10 Weeks",
    level: "Beginner",
  },
  {
    title: "Data Science",
    description: "Data Analysis and Machine Learning",
    duration: "14 Weeks",
    level: "Advanced",
  },
  {
    title: "UI/UX Design",
    description: "Design modern user interfaces",
    duration: "6 Weeks",
    level: "Beginner",
  },
  {
    title: "Cyber Security",
    description: "Network and Web Security",
    duration: "8 Weeks",
    level: "Intermediate",
  },
  {
    title: "Cloud Computing",
    description: "AWS and Cloud Fundamentals",
    duration: "8 Weeks",
    level: "Intermediate",
  },
  {
    title: "Artificial Intelligence",
    description: "AI concepts and real-world applications",
    duration: "12 Weeks",
    level: "Advanced",
  },
];

const seedData = async () => {
  try {
    await Course.deleteMany();
    await Course.insertMany(courses);

    console.log("Courses Added Successfully ✅");
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

seedData();