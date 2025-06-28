
// src/lib/attendance-sheets.ts

/**
 * @fileOverview Configuration for Google Sheet attendance links.
 * 
 * IMPORTANT: To use the Attendance feature, you must publish your Google Sheets
 * as CSV files and paste the links here. The system expects a specific format.
 *
 * Expected Format:
 * - Row 1 & 2: Can be anything (e.g., Teacher Name, Hours). They are ignored.
 * - Row 3 (Date Header): The first few columns can be metadata. The system expects dates to start from the 6th column (Column F) onwards.
 * - Row 4 onwards (Student Data):
 *   - Column A (Roll Number): This MUST match the roll number in the user's AcademIQ profile for the data to be found.
 *   - Column F onwards (Attendance Status): The status for each corresponding date. The system recognizes 'P'/'Present' for present and 'A'/'Absent' for absent. Other values are ignored.
 * 
 * How to get your public CSV link:
 * 1. Open your Google Sheet.
 * 2. Go to `File` -> `Share` -> `Publish to the web`.
 * 3. In the dialog, under the `Link` tab, select the specific sheet (e.g., Sheet1) you want to publish.
 * 4. In the dropdown next to it, select `Comma-separated values (.csv)`.
 * 5. Click `Publish`.
 * 6. Copy the generated URL.
 * 7. Paste the URL here, replacing the placeholder for the corresponding subject.
 */

export const attendanceSheetLinks: Record<string, string> = {
  // Semester 1
  "Linear Algebra": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Introduction to Communication and Ethics": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Books, Club and Social Emotional Intelligence 1": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Programming Methodology in Python": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Introduction to Computers": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "CS 106 Python Project Course": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  
  // Semester 2
  "Calculus": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Mathematical Foundations of Computing": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Communication and Ethics": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Books, Club and Social Emotional Intelligence 2": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Data Handling in Python": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Data Structures and Algorithms": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",

  // Semester 3
  "Probability for Computer Science": "https://docs.google.com/spreadsheets/d/e/2PACX-1vSYGkqZ-J8_lsdFiy5dz4OFxLk08nCLdX7huM88rreRR9qjbck4tZwWeB7n9BolPwbmLft9U5JdRrz8/pub?gid=0&single=true&output=csv",
  "Communication and Book Club": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Object Oriented Programming": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Advanced Data Structures and Algorithms": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Database Management Systems": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Artificial Intelligence": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "CoCo Summer": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",

  // Semester 4
  "Advanced Object Oriented Programming": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Search Engines and Information Retrieval": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Mining Massive Datasets": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Computer Organization and Systems": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Machine Learning": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Design and Analysis of Algorithms": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",

  // Semester 5
  "Web Applications Development": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Creative Problem Solving": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Operating Systems Principles": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Deep Learning": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Software Engineering Project, Including Technical Writing": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Compiler Design": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Internship": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",

  // Semester 6
  "Economics for Computer Science": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Human Computer Interaction": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Computer Networks": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Applications of Deep Learning": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Machine Learning Project": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Cryptography and Network Security": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",

  // Semester 7
  "Cloud Computing": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Big Data Analytics": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Cybersecurity": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Mobile Application Development": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Game Development": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Natural Language Processing": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
  "Robotics": "YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE",
};
