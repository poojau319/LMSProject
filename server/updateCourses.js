const mongoose = require("mongoose");
const Course = require("./models/Course");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
.then(async () => {

  const coursesData = [

    {
      title: "Python Programming",
      lectures: [
        {
          title: "Introduction to Python",
          videoUrl: "https://www.youtube.com/",
          duration: "20 Minutes"
        },
        {
          title: "Python Basics",
          videoUrl: "https://www.youtube.com/",
          duration: "30 Minutes"
        }
      ],
      assignments: [
        {
          title: "Python Practice Assignment",
          description: "Create basic Python programs",
          dueDate: "20 August 2026"
        }
      ],
      quizzes: [
        {
          question: "Python is which type of language?",
          options: [
            "Programming Language",
            "Database",
            "Browser"
          ],
          answer: "Programming Language"
        }
      ]
    },


    {
      title: "MERN Stack Development",
      lectures: [
        {
          title: "Introduction to MERN Stack",
          videoUrl: "https://www.youtube.com/",
          duration: "25 Minutes"
        },
        {
          title: "React and Node Development",
          videoUrl: "https://www.youtube.com/",
          duration: "40 Minutes"
        }
      ],
      assignments: [
        {
          title: "MERN Project Assignment",
          description: "Build a full stack application",
          dueDate: "25 August 2026"
        }
      ],
      quizzes: [
        {
          question: "MERN uses which database?",
          options: [
            "MongoDB",
            "MySQL"
          ],
          answer: "MongoDB"
        }
      ]
    },


    {
      title: "React JS Development",
      lectures: [
        {
          title: "React Components",
          videoUrl: "https://www.youtube.com/",
          duration: "30 Minutes"
        }
      ],
      assignments: [
        {
          title: "React Dashboard Task",
          description: "Create a React dashboard UI",
          dueDate: "28 August 2026"
        }
      ],
      quizzes: [
        {
          question: "React is a?",
          options: [
            "Library",
            "Database"
          ],
          answer: "Library"
        }
      ]
    },


    {
      title: "Java Programming",
      lectures: [
        {
          title: "Java Basics",
          videoUrl: "https://www.youtube.com/",
          duration: "30 Minutes"
        }
      ],
      assignments: [
        {
          title: "Java Coding Assignment",
          description: "Solve Java programming problems",
          dueDate: "30 August 2026"
        }
      ],
      quizzes: [
        {
          question: "Java is a?",
          options: [
            "Programming Language",
            "Browser"
          ],
          answer: "Programming Language"
        }
      ]
    },


    {
      title: "Artificial Intelligence",
      lectures: [
        {
          title: "Introduction to AI",
          videoUrl: "https://www.youtube.com/",
          duration: "35 Minutes"
        }
      ],
      assignments: [
        {
          title: "AI Mini Project",
          description: "Create an AI application idea",
          dueDate: "5 September 2026"
        }
      ],
      quizzes: [
        {
          question: "AI stands for?",
          options: [
            "Artificial Intelligence",
            "Automatic Internet"
          ],
          answer: "Artificial Intelligence"
        }
      ]
    },


    {
      title: "Cyber Security",
      lectures: [
        {
          title: "Cyber Security Basics",
          videoUrl: "https://www.youtube.com/",
          duration: "25 Minutes"
        },
        {
          title: "Network Security",
          videoUrl: "https://www.youtube.com/",
          duration: "35 Minutes"
        }
      ],
      assignments: [
        {
          title: "Security Analysis Task",
          description: "Analyze basic security threats",
          dueDate: "10 September 2026"
        }
      ],
      quizzes: [
        {
          question: "Cyber Security protects?",
          options: [
            "Data and Systems",
            "Games"
          ],
          answer: "Data and Systems"
        }
      ]
    },


    {
      title: "UI/UX Design",
      lectures: [
        {
          title: "UI Design Principles",
          videoUrl: "https://www.youtube.com/",
          duration: "20 Minutes"
        },
        {
          title: "Figma Basics",
          videoUrl: "https://www.youtube.com/",
          duration: "30 Minutes"
        }
      ],
      assignments: [
        {
          title: "UI Design Assignment",
          description: "Create a mobile app design",
          dueDate: "12 September 2026"
        }
      ],
      quizzes: [
        {
          question: "Which tool is used for UI design?",
          options: [
            "Figma",
            "MongoDB"
          ],
          answer: "Figma"
        }
      ]
    },


    {
      title: "Data Science",
      lectures: [
        {
          title: "Introduction to Data Science",
          videoUrl: "https://www.youtube.com/",
          duration: "30 Minutes"
        },
        {
          title: "Machine Learning Basics",
          videoUrl: "https://www.youtube.com/",
          duration: "40 Minutes"
        }
      ],
      assignments: [
        {
          title: "Data Analysis Project",
          description: "Analyze data using Python",
          dueDate: "15 September 2026"
        }
      ],
      quizzes: [
        {
          question: "Data Science commonly uses?",
          options: [
            "Python",
            "HTML"
          ],
          answer: "Python"
        }
      ]
    },


    {
      title: "Cloud Computing",
      lectures: [
        {
          title: "Cloud Fundamentals",
          videoUrl: "https://www.youtube.com/",
          duration: "25 Minutes"
        },
        {
          title: "AWS Introduction",
          videoUrl: "https://www.youtube.com/",
          duration: "35 Minutes"
        }
      ],
      assignments: [
        {
          title: "Cloud Deployment Task",
          description: "Deploy an application on cloud",
          dueDate: "20 September 2026"
        }
      ],
      quizzes: [
        {
          question: "AWS is a cloud platform?",
          options: [
            "Yes",
            "No"
          ],
          answer: "Yes"
        }
      ]
    }

  ];


  for (const courseData of coursesData) {

    await Course.updateOne(
      { title: courseData.title },
      {
        $set: {
          lectures: courseData.lectures,
          assignments: courseData.assignments,
          quizzes: courseData.quizzes
        }
      }
    );

  }


  console.log("All Courses Updated Successfully ✅");

  process.exit();

})
.catch((error)=>{

  console.log(error);

});