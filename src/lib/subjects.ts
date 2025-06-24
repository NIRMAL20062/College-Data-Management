
export type Semester = {
  semester: number;
  name: string;
  subjects: string[];
};

export const semesters: Semester[] = [
  {
    semester: 1,
    name: "Semester 1",
    subjects: [
      "Linear Algebra",
      "Introduction to Communication and Ethics",
      "Books, Club and Social Emotional Intelligence 1",
      "Programming Methodology in Python",
      "Introduction to Computers",
      "CS 106 Python Project Course",
    ],
  },
  {
    semester: 2,
    name: "Semester 2",
    subjects: [
      "Calculus",
      "Mathematical Foundations of Computing",
      "Communication and Ethics",
      "Books, Club and Social Emotional Intelligence 2",
      "Data Handling in Python",
      "Data Structures and Algorithms",
    ],
  },
  {
    semester: 3,
    name: "Semester 3",
    subjects: [
      "Probability for Computer Science",
      "Communication and Book Club",
      "Object Oriented Programming",
      "Advanced Data Structures and Algorithms",
      "Database Management Systems",
      "Artificial Intelligence",
    ],
  },
  {
    semester: 4,
    name: "Semester 4",
    subjects: [
      "Advanced Object Oriented Programming",
      "Search Engines and Information Retrieval",
      "Mining Massive Datasets",
      "Computer Organization and Systems",
      "Machine Learning",
      "Design and Analysis of Algorithms",
      "CoCo Summer",
    ],
  },
  {
    semester: 5,
    name: "Semester 5",
    subjects: [
      "Web Applications Development",
      "Creative Problem Solving",
      "Operating Systems Principles",
      "Deep Learning",
      "Software Engineering Project, Including Technical Writing",
      "Compiler Design",
      "Internship",
    ],
  },
  {
    semester: 6,
    name: "Semester 6",
    subjects: [
      "Economics for Computer Science",
      "Human Computer Interaction",
      "Computer Networks",
      "Applications of Deep Learning",
      "Machine Learning Project",
      "Cryptography and Network Security",
    ],
  },
  {
    semester: 7,
    name: "Common Electives",
    subjects: [
        "Cloud Computing",
        "Big Data Analytics",
        "Cybersecurity",
        "Mobile Application Development",
        "Game Development",
        "Natural Language Processing",
        "Robotics"
    ]
  }
];

    