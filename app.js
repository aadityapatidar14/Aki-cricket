// ============================================================================
// Aki-Cricket: IPL Cricket-themed AI Akinator - Core Logic & AI Integration
// ============================================================================

// WARNING: Hardcoding your API key directly in code is fine for local offline play.
// However, if you push this file to a PUBLIC GitHub Repository, GitHub's automated secret scanner
// will detect the key and immediately revoke/disable it.
// RECOMMENDATION FOR PUBLIC GITHUB: Leave this variable as an empty string (""), and let players
// paste their keys using the UI Configuration Panel (key icon in the top right), which saves it in localStorage!
const API_KEY = "AIzaSyAkdOe8TQTn4EjfVGpKOFRKNzN4zA7GIZ4";

import { GoogleGenerativeAI } from "@google/generative-ai";

// ==========================================
// --- STATIC IPL DATABASE (Option B Local) ---
// ==========================================
const IPL_DATABASE = [
  // Teams
  { name: "Chennai Super Kings", is_team: true, is_active: true, trophies: 5, color: "yellow", is_indian: true },
  { name: "Mumbai Indians", is_team: true, is_active: true, trophies: 5, color: "blue", is_indian: true },
  { name: "Kolkata Knight Riders", is_team: true, is_active: true, trophies: 3, color: "purple", is_indian: true },
  { name: "Royal Challengers Bengaluru", is_team: true, is_active: true, trophies: 1, color: "red", is_indian: true },
  { name: "Delhi Capitals", is_team: true, is_active: true, trophies: 0, color: "blue", is_indian: true },
  { name: "Rajasthan Royals", is_team: true, is_active: true, trophies: 1, color: "pink", is_indian: true },
  { name: "Sunrisers Hyderabad", is_team: true, is_active: true, trophies: 1, color: "orange", is_indian: true },
  { name: "Punjab Kings", is_team: true, is_active: true, trophies: 0, color: "red", is_indian: true },
  { name: "Gujarat Titans", is_team: true, is_active: true, trophies: 1, color: "blue", is_indian: true },
  { name: "Lucknow Super Giants", is_team: true, is_active: true, trophies: 0, color: "blue", is_indian: true },

  // Players
  { name: "Virat Kohli", is_team: false, is_active: true, role: "batsman", is_indian: true, won_orange: true, won_purple: false, trophies: 1, jersey: "red", captain: true },
  { name: "MS Dhoni", is_team: false, is_active: true, role: "wicketkeeper", is_indian: true, won_orange: false, won_purple: false, trophies: 5, jersey: "yellow", captain: true },
  { name: "Rohit Sharma", is_team: false, is_active: true, role: "batsman", is_indian: true, won_orange: false, won_purple: false, trophies: 6, jersey: "blue", captain: true },
  { name: "Jasprit Bumrah", is_team: false, is_active: true, role: "bowler", is_indian: true, won_orange: false, won_purple: false, trophies: 5, jersey: "blue", captain: true },
  { name: "Hardik Pandya", is_team: false, is_active: true, role: "allrounder", is_indian: true, won_orange: false, won_purple: false, trophies: 5, jersey: "blue", captain: true },
  { name: "Ravindra Jadeja", is_team: false, is_active: true, role: "allrounder", is_indian: true, won_orange: false, won_purple: false, trophies: 4, jersey: "yellow", captain: true },
  { name: "Shubman Gill", is_team: false, is_active: true, role: "batsman", is_indian: true, won_orange: true, won_purple: false, trophies: 1, jersey: "blue", captain: true },
  { name: "Rishabh Pant", is_team: false, is_active: true, role: "wicketkeeper", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "blue", captain: true },
  { name: "KL Rahul", is_team: false, is_active: true, role: "wicketkeeper", is_indian: true, won_orange: true, won_purple: false, trophies: 0, jersey: "blue", captain: true },
  { name: "Shreyas Iyer", is_team: false, is_active: true, role: "batsman", is_indian: true, won_orange: false, won_purple: false, trophies: 1, jersey: "purple", captain: true },
  { name: "Sanju Samson", is_team: false, is_active: true, role: "wicketkeeper", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "pink", captain: true },
  { name: "Suryakumar Yadav", is_team: false, is_active: true, role: "batsman", is_indian: true, won_orange: false, won_purple: false, trophies: 3, jersey: "blue", captain: true },
  { name: "Rinku Singh", is_team: false, is_active: true, role: "batsman", is_indian: true, won_orange: false, won_purple: false, trophies: 1, jersey: "purple", captain: false },
  { name: "Yuzvendra Chahal", is_team: false, is_active: true, role: "bowler", is_indian: true, won_orange: false, won_purple: true, trophies: 0, jersey: "pink", captain: false },
  { name: "Rashid Khan", is_team: false, is_active: true, role: "bowler", is_indian: false, won_orange: false, won_purple: false, trophies: 1, jersey: "blue", captain: true },
  { name: "Andre Russell", is_team: false, is_active: true, role: "allrounder", is_indian: false, won_orange: false, won_purple: false, trophies: 2, jersey: "purple", captain: false },
  { name: "Sunil Narine", is_team: false, is_active: true, role: "allrounder", is_indian: false, won_orange: false, won_purple: false, trophies: 3, jersey: "purple", captain: false },
  { name: "Travis Head", is_team: false, is_active: true, role: "batsman", is_indian: false, won_orange: false, won_purple: false, trophies: 1, jersey: "orange", captain: false },
  { name: "Heinrich Klaasen", is_team: false, is_active: true, role: "wicketkeeper", is_indian: false, won_orange: false, won_purple: false, trophies: 0, jersey: "orange", captain: false },
  { name: "Pat Cummins", is_team: false, is_active: true, role: "bowler", is_indian: false, won_orange: false, won_purple: false, trophies: 1, jersey: "orange", captain: true },
  { name: "Mitchell Starc", is_team: false, is_active: true, role: "bowler", is_indian: false, won_orange: false, won_purple: false, trophies: 1, jersey: "purple", captain: false },
  { name: "Yashasvi Jaiswal", is_team: false, is_active: true, role: "batsman", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "pink", captain: false },
  { name: "Jos Buttler", is_team: false, is_active: true, role: "wicketkeeper", is_indian: false, won_orange: true, won_purple: false, trophies: 0, jersey: "pink", captain: false },
  { name: "David Warner", is_team: false, is_active: true, role: "batsman", is_indian: false, won_orange: true, won_purple: false, trophies: 1, jersey: "blue", captain: true },
  { name: "Ruturaj Gaikwad", is_team: false, is_active: true, role: "batsman", is_indian: true, won_orange: true, won_purple: false, trophies: 2, jersey: "yellow", captain: true },
  { name: "Shivam Dube", is_team: false, is_active: true, role: "allrounder", is_indian: true, won_orange: false, won_purple: false, trophies: 2, jersey: "yellow", captain: false },
  { name: "Kuldeep Yadav", is_team: false, is_active: true, role: "bowler", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "blue", captain: false },
  { name: "Mohammed Shami", is_team: false, is_active: true, role: "bowler", is_indian: true, won_orange: false, won_purple: true, trophies: 1, jersey: "blue", captain: false },
  { name: "Axar Patel", is_team: false, is_active: true, role: "allrounder", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "blue", captain: true },
  { name: "Ravichandran Ashwin", is_team: false, is_active: true, role: "allrounder", is_indian: true, won_orange: false, won_purple: false, trophies: 2, jersey: "pink", captain: true },
  { name: "Trent Boult", is_team: false, is_active: true, role: "bowler", is_indian: false, won_orange: false, won_purple: false, trophies: 2, jersey: "pink", captain: false },
  { name: "Dinesh Karthik", is_team: false, is_active: false, role: "wicketkeeper", is_indian: true, won_orange: false, won_purple: false, trophies: 1, jersey: "red", captain: true },
  { name: "Nicholas Pooran", is_team: false, is_active: true, role: "wicketkeeper", is_indian: false, won_orange: false, won_purple: false, trophies: 0, jersey: "blue", captain: true },
  { name: "Quinton de Kock", is_team: false, is_active: true, role: "wicketkeeper", is_indian: false, won_orange: false, won_purple: false, trophies: 2, jersey: "blue", captain: false },
  { name: "Marcus Stoinis", is_team: false, is_active: true, role: "allrounder", is_indian: false, won_orange: false, won_purple: false, trophies: 0, jersey: "blue", captain: false },
  { name: "Ishan Kishan", is_team: false, is_active: true, role: "wicketkeeper", is_indian: true, won_orange: false, won_purple: false, trophies: 2, jersey: "blue", captain: false },
  { name: "Shikhar Dhawan", is_team: false, is_active: true, role: "batsman", is_indian: true, won_orange: false, won_purple: false, trophies: 1, jersey: "red", captain: true },
  { name: "Venkatesh Iyer", is_team: false, is_active: true, role: "allrounder", is_indian: true, won_orange: false, won_purple: false, trophies: 1, jersey: "purple", captain: false },
  { name: "Sai Sudharsan", is_team: false, is_active: true, role: "batsman", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "blue", captain: false },
  { name: "Tilak Varma", is_team: false, is_active: true, role: "batsman", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "blue", captain: false },
  { name: "Sandeep Sharma", is_team: false, is_active: true, role: "bowler", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "pink", captain: false },
  { name: "Bhuvneshwar Kumar", is_team: false, is_active: true, role: "bowler", is_indian: true, won_orange: false, won_purple: true, trophies: 1, jersey: "orange", captain: true },
  { name: "Sachin Tendulkar", is_team: false, is_active: false, role: "batsman", is_indian: true, won_orange: true, won_purple: false, trophies: 1, jersey: "blue", captain: true },
  { name: "AB de Villiers", is_team: false, is_active: false, role: "batsman", is_indian: false, won_orange: false, won_purple: false, trophies: 0, jersey: "red", captain: true },
  { name: "Chris Gayle", is_team: false, is_active: false, role: "batsman", is_indian: false, won_orange: true, won_purple: false, trophies: 0, jersey: "red", captain: true },
  { name: "Lasith Malinga", is_team: false, is_active: false, role: "bowler", is_indian: false, won_orange: false, won_purple: true, trophies: 4, jersey: "blue", captain: false },
  { name: "Suresh Raina", is_team: false, is_active: false, role: "batsman", is_indian: true, won_orange: false, won_purple: false, trophies: 4, jersey: "yellow", captain: true },
  { name: "Shane Watson", is_team: false, is_active: false, role: "allrounder", is_indian: false, won_orange: false, won_purple: false, trophies: 2, jersey: "yellow", captain: true },
  { name: "Gautam Gambhir", is_team: false, is_active: false, role: "batsman", is_indian: true, won_orange: false, won_purple: false, trophies: 2, jersey: "purple", captain: true },
  { name: "Kieron Pollard", is_team: false, is_active: false, role: "allrounder", is_indian: false, won_orange: false, won_purple: false, trophies: 5, jersey: "blue", captain: true },
  { name: "Amit Mishra", is_team: false, is_active: true, role: "bowler", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "blue", captain: false },
  { name: "Piyush Chawla", is_team: false, is_active: true, role: "bowler", is_indian: true, won_orange: false, won_purple: false, trophies: 1, jersey: "blue", captain: false },
  { name: "Harbhajan Singh", is_team: false, is_active: false, role: "bowler", is_indian: true, won_orange: false, won_purple: false, trophies: 4, jersey: "blue", captain: true },
  { name: "Zaheer Khan", is_team: false, is_active: false, role: "bowler", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "blue", captain: true },
  { name: "Virender Sehwag", is_team: false, is_active: false, role: "batsman", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "blue", captain: true },
  { name: "Yuvraj Singh", is_team: false, is_active: false, role: "allrounder", is_indian: true, won_orange: false, won_purple: false, trophies: 2, jersey: "orange", captain: true },
  { name: "Robin Uthappa", is_team: false, is_active: false, role: "batsman", is_indian: true, won_orange: true, won_purple: false, trophies: 2, jersey: "yellow", captain: false },
  { name: "Yusuf Pathan", is_team: false, is_active: false, role: "allrounder", is_indian: true, won_orange: false, won_purple: false, trophies: 3, jersey: "purple", captain: false },
  { name: "Dwayne Bravo", is_team: false, is_active: false, role: "allrounder", is_indian: false, won_orange: false, won_purple: true, trophies: 3, jersey: "yellow", captain: false },
  { name: "Brendon McCullum", is_team: false, is_active: false, role: "batsman", is_indian: false, won_orange: false, won_purple: false, trophies: 0, jersey: "purple", captain: true },
  { name: "Shaun Marsh", is_team: false, is_active: false, role: "batsman", is_indian: false, won_orange: true, won_purple: false, trophies: 0, jersey: "red", captain: false },
  { name: "Glenn Maxwell", is_team: false, is_active: true, role: "allrounder", is_indian: false, won_orange: false, won_purple: false, trophies: 1, jersey: "red", captain: true },
  { name: "Faf du Plessis", is_team: false, is_active: true, role: "batsman", is_indian: false, won_orange: false, won_purple: false, trophies: 2, jersey: "red", captain: true },
  { name: "David Miller", is_team: false, is_active: true, role: "batsman", is_indian: false, won_orange: false, won_purple: false, trophies: 1, jersey: "blue", captain: true },
  { name: "Kane Williamson", is_team: false, is_active: true, role: "batsman", is_indian: false, won_orange: true, won_purple: false, trophies: 0, jersey: "blue", captain: true },
  { name: "Kagiso Rabada", is_team: false, is_active: true, role: "bowler", is_indian: false, won_orange: false, won_purple: true, trophies: 0, jersey: "red", captain: false },
  { name: "Anrich Nortje", is_team: false, is_active: true, role: "bowler", is_indian: false, won_orange: false, won_purple: false, trophies: 0, jersey: "blue", captain: false },
  { name: "Sam Curran", is_team: false, is_active: true, role: "allrounder", is_indian: false, won_orange: false, won_purple: false, trophies: 1, jersey: "red", captain: true },
  { name: "Liam Livingstone", is_team: false, is_active: true, role: "allrounder", is_indian: false, won_orange: false, won_purple: false, trophies: 0, jersey: "red", captain: false },
  { name: "Jonny Bairstow", is_team: false, is_active: true, role: "wicketkeeper", is_indian: false, won_orange: false, won_purple: false, trophies: 0, jersey: "red", captain: false },
  { name: "Jofra Archer", is_team: false, is_active: true, role: "bowler", is_indian: false, won_orange: false, won_purple: false, trophies: 0, jersey: "blue", captain: false },
  { name: "Moeen Ali", is_team: false, is_active: true, role: "allrounder", is_indian: false, won_orange: false, won_purple: false, trophies: 2, jersey: "yellow", captain: false },
  { name: "Matheesha Pathirana", is_team: false, is_active: true, role: "bowler", is_indian: false, won_orange: false, won_purple: false, trophies: 1, jersey: "yellow", captain: false },
  { name: "Maheesh Theekshana", is_team: false, is_active: true, role: "bowler", is_indian: false, won_orange: false, won_purple: false, trophies: 1, jersey: "yellow", captain: false },
  { name: "Devon Conway", is_team: false, is_active: true, role: "batsman", is_indian: false, won_orange: false, won_purple: false, trophies: 1, jersey: "yellow", captain: false },
  { name: "Ajinkya Rahane", is_team: false, is_active: true, role: "batsman", is_indian: true, won_orange: false, won_purple: false, trophies: 1, jersey: "yellow", captain: true },
  { name: "Mitchell Santner", is_team: false, is_active: true, role: "allrounder", is_indian: false, won_orange: false, won_purple: false, trophies: 2, jersey: "yellow", captain: false },
  { name: "Shardul Thakur", is_team: false, is_active: true, role: "bowler", is_indian: true, won_orange: false, won_purple: false, trophies: 3, jersey: "yellow", captain: false },
  { name: "Deepak Chahar", is_team: false, is_active: true, role: "bowler", is_indian: true, won_orange: false, won_purple: false, trophies: 2, jersey: "yellow", captain: false },
  { name: "Tushar Deshpande", is_team: false, is_active: true, role: "bowler", is_indian: true, won_orange: false, won_purple: false, trophies: 1, jersey: "yellow", captain: false },
  { name: "Rajat Patidar", is_team: false, is_active: true, role: "batsman", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "red", captain: false },
  { name: "Mohammed Siraj", is_team: false, is_active: true, role: "bowler", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "red", captain: false },
  { name: "Cameron Green", is_team: false, is_active: true, role: "allrounder", is_indian: false, won_orange: false, won_purple: false, trophies: 0, jersey: "red", captain: false },
  { name: "Will Jacks", is_team: false, is_active: true, role: "allrounder", is_indian: false, won_orange: false, won_purple: false, trophies: 0, jersey: "red", captain: false },
  { name: "Lockie Ferguson", is_team: false, is_active: true, role: "bowler", is_indian: false, won_orange: false, won_purple: false, trophies: 1, jersey: "red", captain: false },
  { name: "Yash Dayal", is_team: false, is_active: true, role: "bowler", is_indian: true, won_orange: false, won_purple: false, trophies: 1, jersey: "red", captain: false },
  { name: "Harshal Patel", is_team: false, is_active: true, role: "bowler", is_indian: true, won_orange: false, won_purple: true, trophies: 0, jersey: "red", captain: false },
  { name: "Arshdeep Singh", is_team: false, is_active: true, role: "bowler", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "red", captain: false },
  { name: "Jitesh Sharma", is_team: false, is_active: true, role: "wicketkeeper", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "red", captain: false },
  { name: "Ashutosh Sharma", is_team: false, is_active: true, role: "batsman", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "red", captain: false },
  { name: "Shashank Singh", is_team: false, is_active: true, role: "batsman", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "red", captain: false },
  { name: "Prabhsimran Singh", is_team: false, is_active: true, role: "wicketkeeper", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "red", captain: false },
  { name: "Rahul Chahar", is_team: false, is_active: true, role: "bowler", is_indian: true, won_orange: false, won_purple: false, trophies: 2, jersey: "red", captain: false },
  { name: "Tim David", is_team: false, is_active: true, role: "batsman", is_indian: false, won_orange: false, won_purple: false, trophies: 0, jersey: "blue", captain: false },
  { name: "Romario Shepherd", is_team: false, is_active: true, role: "allrounder", is_indian: false, won_orange: false, won_purple: false, trophies: 0, jersey: "blue", captain: false },
  { name: "Gerald Coetzee", is_team: false, is_active: true, role: "bowler", is_indian: false, won_orange: false, won_purple: false, trophies: 0, jersey: "blue", captain: false },
  { name: "Nuwan Thushara", is_team: false, is_active: true, role: "bowler", is_indian: false, won_orange: false, won_purple: false, trophies: 0, jersey: "blue", captain: false },
  { name: "Nehal Wadhera", is_team: false, is_active: true, role: "batsman", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "blue", captain: false },
  { name: "Akash Madhwal", is_team: false, is_active: true, role: "bowler", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "blue", captain: false },
  { name: "Nitish Rana", is_team: false, is_active: true, role: "batsman", is_indian: true, won_orange: false, won_purple: false, trophies: 1, jersey: "purple", captain: true },
  { name: "Phil Salt", is_team: false, is_active: true, role: "wicketkeeper", is_indian: false, won_orange: false, won_purple: false, trophies: 1, jersey: "purple", captain: false },
  { name: "Ramandeep Singh", is_team: false, is_active: true, role: "allrounder", is_indian: true, won_orange: false, won_purple: false, trophies: 1, jersey: "purple", captain: false },
  { name: "Varun Chakaravarthy", is_team: false, is_active: true, role: "bowler", is_indian: true, won_orange: false, won_purple: false, trophies: 1, jersey: "purple", captain: false },
  { name: "Harshit Rana", is_team: false, is_active: true, role: "bowler", is_indian: true, won_orange: false, won_purple: false, trophies: 1, jersey: "purple", captain: false },
  { name: "Suyash Sharma", is_team: false, is_active: true, role: "bowler", is_indian: true, won_orange: false, won_purple: false, trophies: 1, jersey: "purple", captain: false },
  { name: "Vaibhav Arora", is_team: false, is_active: true, role: "bowler", is_indian: true, won_orange: false, won_purple: false, trophies: 1, jersey: "purple", captain: false },
  { name: "Manish Pandey", is_team: false, is_active: true, role: "batsman", is_indian: true, won_orange: false, won_purple: false, trophies: 2, jersey: "purple", captain: false },
  { name: "Riyan Parag", is_team: false, is_active: true, role: "allrounder", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "pink", captain: false },
  { name: "Dhruv Jurel", is_team: false, is_active: true, role: "wicketkeeper", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "pink", captain: false },
  { name: "Shimron Hetmyer", is_team: false, is_active: true, role: "batsman", is_indian: false, won_orange: false, won_purple: false, trophies: 0, jersey: "pink", captain: false },
  { name: "Avesh Khan", is_team: false, is_active: true, role: "bowler", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "pink", captain: false },
  { name: "Nandre Burger", is_team: false, is_active: true, role: "bowler", is_indian: false, won_orange: false, won_purple: false, trophies: 0, jersey: "pink", captain: false },
  { name: "Rovman Powell", is_team: false, is_active: true, role: "batsman", is_indian: false, won_orange: false, won_purple: false, trophies: 0, jersey: "pink", captain: false },
  { name: "Abhishek Sharma", is_team: false, is_active: true, role: "allrounder", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "orange", captain: false },
  { name: "Nitish Kumar Reddy", is_team: false, is_active: true, role: "allrounder", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "orange", captain: false },
  { name: "Shahbaz Ahmed", is_team: false, is_active: true, role: "allrounder", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "orange", captain: false },
  { name: "T. Natarajan", is_team: false, is_active: true, role: "bowler", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "orange", captain: false },
  { name: "Mayank Markande", is_team: false, is_active: true, role: "bowler", is_indian: true, won_orange: false, won_purple: false, trophies: 1, jersey: "orange", captain: false },
  { name: "Glenn Phillips", is_team: false, is_active: true, role: "batsman", is_indian: false, won_orange: false, won_purple: false, trophies: 0, jersey: "orange", captain: false },
  { name: "Rahul Tripathi", is_team: false, is_active: true, role: "batsman", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "orange", captain: false },
  { name: "Prithvi Shaw", is_team: false, is_active: true, role: "batsman", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "blue", captain: false },
  { name: "Jake Fraser-McGurk", is_team: false, is_active: true, role: "batsman", is_indian: false, won_orange: false, won_purple: false, trophies: 0, jersey: "blue", captain: false },
  { name: "Abhishek Porel", is_team: false, is_active: true, role: "wicketkeeper", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "blue", captain: false },
  { name: "Khaleel Ahmed", is_team: false, is_active: true, role: "bowler", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "blue", captain: false },
  { name: "Mukesh Kumar", is_team: false, is_active: true, role: "bowler", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "blue", captain: false },
  { name: "Ishant Sharma", is_team: false, is_active: true, role: "bowler", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "blue", captain: false },
  { name: "Shai Hope", is_team: false, is_active: true, role: "wicketkeeper", is_indian: false, won_orange: false, won_purple: false, trophies: 0, jersey: "blue", captain: false },
  { name: "Ayush Badoni", is_team: false, is_active: true, role: "batsman", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "blue", captain: false },
  { name: "Krunal Pandya", is_team: false, is_active: true, role: "allrounder", is_indian: true, won_orange: false, won_purple: false, trophies: 3, jersey: "blue", captain: true },
  { name: "Ravi Bishnoi", is_team: false, is_active: true, role: "bowler", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "blue", captain: false },
  { name: "Mohsin Khan", is_team: false, is_active: true, role: "bowler", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "blue", captain: false },
  { name: "Devdutt Padikkal", is_team: false, is_active: true, role: "batsman", is_indian: true, won_orange: false, won_purple: false, trophies: 0, jersey: "blue", captain: false }
];


// =====================================
// --- DECISION TREE QUESTION LOGIC ---
// =====================================
const LOCAL_QUESTIONS = [
  { id: "is_team", text: "Are you thinking of an IPL Team Franchise?", evaluator: (item) => item.is_team },
  { id: "is_active", text: "Is this entity active in the current IPL season?", evaluator: (item) => item.is_active },
  { id: "is_indian", text: "Is this player or team franchise Indian?", evaluator: (item) => item.is_indian },
  { id: "is_batsman", text: "Is their primary role a pure batsman?", evaluator: (item) => !item.is_team && item.role === "batsman" },
  { id: "is_bowler", text: "Is their primary role a pure bowler?", evaluator: (item) => !item.is_team && item.role === "bowler" },
  { id: "is_allrounder", text: "Are they known as an all-rounder?", evaluator: (item) => !item.is_team && item.role === "allrounder" },
  { id: "is_wicketkeeper", text: "Are they a designated wicket-keeper?", evaluator: (item) => !item.is_team && item.role === "wicketkeeper" },
  { id: "won_orange", text: "Has this player won the prestigious Orange Cap in their career?", evaluator: (item) => !item.is_team && item.won_orange },
  { id: "won_purple", text: "Has this player won the Purple Cap in their career?", evaluator: (item) => !item.is_team && item.won_purple },
  { id: "has_captained", text: "Has this player captained an IPL team?", evaluator: (item) => !item.is_team && item.captain },
  { id: "won_trophies_many", text: "Has this player or team won 3 or more IPL trophies?", evaluator: (item) => item.trophies >= 3 },
  { id: "won_trophies_none", text: "Has this entity NEVER won an IPL title?", evaluator: (item) => item.trophies === 0 },
  { id: "won_trophies_one", text: "Has this player or team won exactly 1 IPL title?", evaluator: (item) => item.trophies === 1 },
  { id: "jersey_yellow", text: "Is their primary jersey color yellow (like CSK)?", evaluator: (item) => item.jersey === "yellow" || item.color === "yellow" },
  { id: "jersey_blue", text: "Is their primary jersey color blue (like MI, GT, LSG, DC)?", evaluator: (item) => item.jersey === "blue" || item.color === "blue" },
  { id: "jersey_red", text: "Is their primary jersey color red/black (like RCB, PBKS)?", evaluator: (item) => item.jersey === "red" || item.color === "red" },
  { id: "jersey_purple", text: "Is their primary jersey color purple/gold (like KKR)?", evaluator: (item) => item.jersey === "purple" || item.color === "purple" },
  { id: "jersey_pink", text: "Is their primary jersey color pink (like RR)?", evaluator: (item) => item.jersey === "pink" || item.color === "pink" },
  { id: "jersey_orange", text: "Is their primary jersey color orange (like SRH)?", evaluator: (item) => item.jersey === "orange" || item.color === "orange" }
];

// --- Dynamic Commentary Pools for Local Umpire Mode ---
const LOCAL_MIDGAME_COMMENTARY = [
  "Aki is starting to spin a web here. The batsman is taking a very cautious stride forward.",
  "Beautiful line and length! Aki is giving absolutely nothing away. Single runs are hard to come by.",
  "An appeal from the bowler! The fielders are moving in. The batsman is looking slightly sweaty.",
  "Oh, that was a close delivery! Beat the outside edge of your thoughts. Aki is in his element.",
  "The crowd is roaring! Aki has adjusted the slip cordon. Let's see if you survive the next ball."
];

const LOCAL_CLIMAX_COMMENTARY = [
  "We have a stumping appeal! Aki has whipped off the bails and is running towards the third umpire!",
  "A huge shout! The bowler is pleading, the captain is signaling for a DRS review! This is extremely close.",
  "Clean bowling distance! The batsman is looking behind at his stumps. The next ball could be the match-winner."
];

// --- Game State Variables ---
let gameHistory = [];
let currentQuestion = "";
let turnCount = 1;
const MAX_TURNS = 15;
let isGameOver = false;
let apiKeyInUse = "";

// Option B Hybrid States
let isDrsModeActive = false;
let localCandidates = [];
let localUnaskedQuestions = [];
let localCurrentQuestionObject = null;
let gameTargetType = ""; // "player" or "team"

// Dynamic Loader Sarcastic Messages
const LOADING_MESSAGES = [
  "Aki is checking the DRS ball tracking...",
  "Consulting the third umpire and reviewing front-foot no-balls...",
  "Polishing the leather ball for some extra swing in the questions...",
  "Field settings adjusted. Aki is coming in from the Pavilion End...",
  "Analyzing previous IPL seasons to match your brainwaves...",
  "Checking with stats gurus in the commentary box...",
  "Applying the Duckworth-Lewis-Stern method to your answers..."
];
let loaderInterval = null;

// --- DOM Elements ---
const screens = {
  start: document.getElementById("start-screen"),
  loading: document.getElementById("loading-screen"),
  game: document.getElementById("game-screen"),
  guess: document.getElementById("guess-screen"),
  end: document.getElementById("end-screen")
};

const el = {
  playPlayerBtn: document.getElementById("play-player-btn"),
  playTeamBtn: document.getElementById("play-team-btn"),
  loadingTitle: document.querySelector(".loading-title"),
  loadingCommentary: document.getElementById("loading-commentary-text"),
  turnCounter: document.getElementById("turn-counter"),
  activeQuestion: document.getElementById("active-question-text"),
  choiceButtons: document.querySelectorAll(".btn-choice"),
  liveCommentary: document.getElementById("live-commentary-text"),
  suspectedEntity: document.getElementById("suspected-entity-name"),
  suspectedEntityType: document.getElementById("suspected-entity-type"),
  guessCommentary: document.getElementById("guess-commentary-text"),
  guessYesBtn: document.getElementById("guess-yes-btn"),
  guessNoBtn: document.getElementById("guess-no-btn"),
  endEmoji: document.getElementById("end-emoji"),
  endHeader: document.getElementById("end-header"),
  endDescription: document.getElementById("end-description"),
  endTargetEntity: document.getElementById("end-target-entity"),
  endTotalTurns: document.getElementById("end-total-turns"),
  endCommentary: document.getElementById("end-commentary-text"),
  toggleHistoryBtn: document.getElementById("toggle-history-btn"),
  historyList: document.getElementById("history-list"),
  restartBtn: document.getElementById("restart-game-btn"),
  
  // Mode slide toggles
  drsToggle: document.getElementById("drs-toggle"),
  labelLocal: document.getElementById("label-local"),
  labelAi: document.getElementById("label-ai"),
  mainGlassCard: document.getElementById("main-glass-card"),

  // API Key config elements
  toggleKeyBtn: document.getElementById("toggle-key-btn"),
  keyModal: document.getElementById("key-modal"),
  apiKeyInput: document.getElementById("api-key-input"),
  saveKeyBtn: document.getElementById("save-key-btn"),
  closeKeyBtn: document.getElementById("close-key-btn")
};

// --- Initialization & UI Binding ---
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  loadSavedAPIKey();
  initializeModeState();
});

if (document.readyState === "complete" || document.readyState === "interactive") {
  setupEventListeners();
  loadSavedAPIKey();
  initializeModeState();
}

function setupEventListeners() {
  const newPlayerBtn = el.playPlayerBtn.cloneNode(true);
  el.playPlayerBtn.parentNode.replaceChild(newPlayerBtn, el.playPlayerBtn);
  el.playPlayerBtn = newPlayerBtn;
  el.playPlayerBtn.addEventListener("click", () => handleStartGame("player"));

  const newTeamBtn = el.playTeamBtn.cloneNode(true);
  el.playTeamBtn.parentNode.replaceChild(newTeamBtn, el.playTeamBtn);
  el.playTeamBtn = newTeamBtn;
  el.playTeamBtn.addEventListener("click", () => handleStartGame("team"));

  el.choiceButtons.forEach(button => {
    const newBtn = button.cloneNode(true);
    button.parentNode.replaceChild(newBtn, button);
  });
  el.choiceButtons = document.querySelectorAll(".btn-choice");
  el.choiceButtons.forEach(button => {
    button.addEventListener("click", () => {
      const answer = button.getAttribute("data-answer");
      handleUserAnswer(answer);
    });
  });

  const newYes = el.guessYesBtn.cloneNode(true);
  el.guessYesBtn.parentNode.replaceChild(newYes, el.guessYesBtn);
  el.guessYesBtn = newYes;
  el.guessYesBtn.addEventListener("click", () => handleFinalDecision(true));

  const newNo = el.guessNoBtn.cloneNode(true);
  el.guessNoBtn.parentNode.replaceChild(newNo, el.guessNoBtn);
  el.guessNoBtn = newNo;
  el.guessNoBtn.addEventListener("click", () => handleFinalDecision(false));

  const newRestart = el.restartBtn.cloneNode(true);
  el.restartBtn.parentNode.replaceChild(newRestart, el.restartBtn);
  el.restartBtn = newRestart;
  el.restartBtn.addEventListener("click", resetToStart);

  const newToggle = el.toggleHistoryBtn.cloneNode(true);
  el.toggleHistoryBtn.parentNode.replaceChild(newToggle, el.toggleHistoryBtn);
  el.toggleHistoryBtn = newToggle;
  el.toggleHistoryBtn.addEventListener("click", toggleHistoryView);

  const newToggleKey = el.toggleKeyBtn.cloneNode(true);
  el.toggleKeyBtn.parentNode.replaceChild(newToggleKey, el.toggleKeyBtn);
  el.toggleKeyBtn = newToggleKey;
  el.toggleKeyBtn.addEventListener("click", () => el.keyModal.classList.toggle("hidden"));

  const newCloseKey = el.closeKeyBtn.cloneNode(true);
  el.closeKeyBtn.parentNode.replaceChild(newCloseKey, el.closeKeyBtn);
  el.closeKeyBtn = newCloseKey;
  el.closeKeyBtn.addEventListener("click", () => el.keyModal.classList.add("hidden"));

  const newSaveKey = el.saveKeyBtn.cloneNode(true);
  el.saveKeyBtn.parentNode.replaceChild(newSaveKey, el.saveKeyBtn);
  el.saveKeyBtn = newSaveKey;
  el.saveKeyBtn.addEventListener("click", saveCustomAPIKey);

  el.drsToggle.addEventListener("change", handleModeToggleChange);
}

// --- Mode Management ---
function initializeModeState() {
  if (el.drsToggle.checked) {
    enableAiVisuals();
  } else {
    enableLocalVisuals();
  }
}

function handleModeToggleChange() {
  if (el.drsToggle.checked) {
    if (!apiKeyInUse) {
      el.drsToggle.checked = false;
      el.keyModal.classList.remove("hidden");
      alert("Captain, DRS Review AI Mode requires a Gemini API Key! Enter one by clicking the key icon at the top right.");
    } else {
      enableAiVisuals();
    }
  } else {
    enableLocalVisuals();
  }
}

function enableAiVisuals() {
  isDrsModeActive = true;
  el.labelAi.classList.add("active-label");
  el.labelLocal.classList.remove("inactive-label");
  el.labelLocal.style.color = "var(--color-text-gray)";
  el.labelLocal.style.textShadow = "none";
  el.labelAi.style.color = "var(--color-gold)";
  el.labelAi.style.textShadow = "0 0 8px var(--color-gold-glow)";
  el.mainGlassCard.classList.add("drs-active-glow");
  document.getElementById("game-mode-badge").textContent = "DRS AI Mode";
  document.getElementById("game-mode-badge").className = "badge-gold";
}

function enableLocalVisuals() {
  isDrsModeActive = false;
  el.labelLocal.classList.add("inactive-label");
  el.labelAi.classList.remove("active-label");
  el.labelAi.style.color = "var(--color-text-gray)";
  el.labelAi.style.textShadow = "none";
  el.labelLocal.style.color = "var(--color-turquoise)";
  el.labelLocal.style.textShadow = "0 0 8px var(--color-turquoise-glow)";
  el.mainGlassCard.classList.remove("drs-active-glow");
  document.getElementById("game-mode-badge").textContent = "Local Umpire";
  document.getElementById("game-mode-badge").className = "badge-turquoise";
}

// --- Screen State Transitions ---
function showScreen(screenKey) {
  Object.keys(screens).forEach(key => {
    if (key === screenKey) {
      screens[key].classList.remove("hidden");
    } else {
      screens[key].classList.add("hidden");
    }
  });
}

// --- API Key Management ---
function loadSavedAPIKey() {
  const localKey = localStorage.getItem("AKI_CRICKET_API_KEY");
  if (API_KEY && API_KEY !== "PASTE_YOUR_GEMINI_API_KEY_HERE" && API_KEY !== "") {
    apiKeyInUse = API_KEY;
    el.apiKeyInput.value = API_KEY;
  } else if (localKey) {
    apiKeyInUse = localKey;
    el.apiKeyInput.value = localKey;
  }
}

function saveCustomAPIKey() {
  const enteredKey = el.apiKeyInput.value.trim();
  if (enteredKey) {
    localStorage.setItem("AKI_CRICKET_API_KEY", enteredKey);
    apiKeyInUse = enteredKey;
    el.keyModal.classList.add("hidden");
    el.drsToggle.checked = true;
    enableAiVisuals();
    alert("Gemini API Key saved successfully! DRS AI Mode is now active!");
  } else {
    alert("Please enter a valid Gemini API Key.");
  }
}

// --- Dynamic Loader Commentary ---
function startLoaderCommentary() {
  let index = 0;
  el.loadingCommentary.textContent = `"${LOADING_MESSAGES[index]}"`;
  
  loaderInterval = setInterval(() => {
    index = (index + 1) % LOADING_MESSAGES.length;
    el.loadingCommentary.textContent = `"${LOADING_MESSAGES[index]}"`;
  }, 3000);
}

function stopLoaderCommentary() {
  if (loaderInterval) {
    clearInterval(loaderInterval);
    loaderInterval = null;
  }
}

// --- Game Logic Flow ---
async function handleStartGame(targetType) {
  gameTargetType = targetType;

  // Update game mode badge in the UI
  if (gameTargetType === "player") {
    document.getElementById("game-mode-badge").textContent = isDrsModeActive ? "DRS AI: Player" : "Local: Player";
  } else {
    document.getElementById("game-mode-badge").textContent = isDrsModeActive ? "DRS AI: Team" : "Local: Team";
  }

  gameHistory = [];
  turnCount = 1;
  isGameOver = false;
  el.historyList.classList.add("hidden");
  el.toggleHistoryBtn.textContent = "Show Match Statistics (DRS Review)";

  showScreen("loading");
  startLoaderCommentary();

  if (isDrsModeActive) {
    // AI DRS MODE
    await getAkiResponseFromAI();
  } else {
    // LOCAL MODE
    initializeLocalEngine();
    playLocalTurn();
  }
}

async function handleUserAnswer(answer) {
  gameHistory.push({
    question: currentQuestion,
    answer: answer
  });

  turnCount++;

  showScreen("loading");
  startLoaderCommentary();

  if (isDrsModeActive) {
    // AI DRS MODE
    await getAkiResponseFromAI();
  } else {
    // LOCAL MODE
    playLocalTurn();
  }
}

// =============================================
// --- MACHINE LEARNING DYNAMIC LOCAL ENGINE ---
// =============================================
function initializeLocalEngine() {
  if (gameTargetType === "player") {
    localCandidates = IPL_DATABASE.filter(item => item.is_team === false);
    localUnaskedQuestions = LOCAL_QUESTIONS.filter(q => q.id !== "is_team");
  } else {
    localCandidates = IPL_DATABASE.filter(item => item.is_team === true);
    const playerSpecific = ["is_batsman", "is_bowler", "is_allrounder", "is_wicketkeeper", "won_orange", "won_purple", "has_captained"];
    localUnaskedQuestions = LOCAL_QUESTIONS.filter(q => !playerSpecific.includes(q.id) && q.id !== "is_team");
  }
  localCurrentQuestionObject = null;
}

function calculateScores() {
  const candidates = gameTargetType === "player"
    ? IPL_DATABASE.filter(item => item.is_team === false)
    : IPL_DATABASE.filter(item => item.is_team === true);

  return candidates.map(c => {
    let score = 0;
    let maxPossibleScore = 0;

    gameHistory.forEach(item => {
      const qObj = LOCAL_QUESTIONS.find(q => q.text === item.question);
      if (!qObj) return;

      const evalVal = qObj.evaluator(c);
      maxPossibleScore += 1;

      if (item.answer === "Yes") {
        if (evalVal === true) {
          score += 1;
        } else {
          score -= 1;
        }
      } else if (item.answer === "No") {
        if (evalVal === false) {
          score += 1;
        } else {
          score -= 1;
        }
      }
    });

    let percentage = 50;
    if (maxPossibleScore > 0) {
      percentage = Math.round(((score + maxPossibleScore) / (2 * maxPossibleScore)) * 100);
    }

    return {
      entity: c,
      score: score,
      percentage: percentage
    };
  });
}

function getTopCandidates() {
  if (gameHistory.length === 0) {
    return gameTargetType === "player"
      ? IPL_DATABASE.filter(item => !item.is_team)
      : IPL_DATABASE.filter(item => item.is_team);
  }

  const scored = calculateScores();
  let maxScore = -999;
  scored.forEach(s => {
    if (s.score > maxScore) maxScore = s.score;
  });

  const threshold = maxScore - 2;
  return scored.filter(s => s.score >= threshold).map(s => s.entity);
}

function playLocalTurn() {
  setTimeout(() => {
    stopLoaderCommentary();

    const maxTurns = gameTargetType === "player" ? 15 : Math.min(15, localUnaskedQuestions.length + gameHistory.length);

    // Check if we reached the maximum questions or ran out of questions
    if (turnCount > maxTurns || localUnaskedQuestions.length === 0) {
      const sorted = calculateScores().sort((a, b) => b.score - a.score);
      if (sorted.length === 0) {
        currentQuestion = "Uncertainty";
        el.suspectedEntity.textContent = "Obscure Player / Team";
        el.suspectedEntityType.textContent = "Unknown Entity";
        el.guessCommentary.textContent = `Aki Umpire Decision: "DRS error! The ball has hit outside the line of off stump. You successfully stumped my local database!"`;
        showScreen("guess");
        return;
      }

      const winnerObj = sorted[0];
      const winner = winnerObj.entity;
      currentQuestion = `AI Guess: ${winner.name}`;
      el.suspectedEntity.textContent = winner.name;
      el.suspectedEntityType.textContent = winner.is_team ? "IPL Franchise Team" : `${winner.role.toUpperCase()} / IPL Player`;
      
      const runnerUps = sorted.slice(1, 4)
        .map(r => `${r.entity.name} (${r.percentage}% match)`)
        .join(", ");
        
      el.guessCommentary.textContent = `Aki Umpire Decision: "After bowl-by-bowl analysis of all ${turnCount - 1} deliveries, I am ${winnerObj.percentage}% confident you are thinking of ${winner.name}! (Runner-ups: ${runnerUps})"`;
      showScreen("guess");
      return;
    }

    // Information Gain split calculations based on current top matching candidates
    const activeCandidates = getTopCandidates();
    let bestQuestion = null;
    let lowestEntropyOffset = 1.0;
    let bestQuestionIndex = -1;

    localUnaskedQuestions.forEach((q, idx) => {
      let yesCount = 0;
      activeCandidates.forEach(c => {
        if (q.evaluator(c) === true) yesCount++;
      });

      const yesRatio = yesCount / activeCandidates.length;
      const offset = Math.abs(yesRatio - 0.5);

      if (yesCount > 0 && yesCount < activeCandidates.length) {
        if (offset < lowestEntropyOffset) {
          lowestEntropyOffset = offset;
          bestQuestion = q;
          bestQuestionIndex = idx;
        }
      }
    });

    // Fallback if no questions perfectly split the remaining pool
    if (!bestQuestion) {
      bestQuestion = localUnaskedQuestions[0];
      bestQuestionIndex = 0;
    }

    // Remove the selected question from pool so it's not repeated
    localUnaskedQuestions.splice(bestQuestionIndex, 1);
    localCurrentQuestionObject = bestQuestion;

    // Set UI values
    currentQuestion = bestQuestion.text;
    el.activeQuestion.textContent = currentQuestion;
    
    const totalExpectedTurns = gameTargetType === "player" ? 15 : Math.min(15, localUnaskedQuestions.length + gameHistory.length + 1);
    el.turnCounter.textContent = `Question ${turnCount} / ${totalExpectedTurns}`;

    // Select matching dynamic commentary based on turn count
    let commentaryMsg = "Aki is loading the next ball. The batsman is taking guard...";
    if (turnCount > 8) {
      const cIdx = Math.floor(Math.random() * LOCAL_CLIMAX_COMMENTARY.length);
      commentaryMsg = LOCAL_CLIMAX_COMMENTARY[cIdx];
    } else {
      const cIdx = Math.floor(Math.random() * LOCAL_MIDGAME_COMMENTARY.length);
      commentaryMsg = LOCAL_MIDGAME_COMMENTARY[cIdx];
    }

    el.liveCommentary.textContent = `"${commentaryMsg}"`;
    showScreen("game");
  }, 1000);
}

// =============================================
// --- GOOGLE GEMINI 1.5 FLASH CLOUD ENGINE ---
// =============================================
async function getAkiResponseFromAI() {
  try {
    const genAI = new GoogleGenerativeAI(apiKeyInUse);
    
    const targetText = gameTargetType === "player" ? "IPL cricket player (past or present)" : "IPL team franchise";
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
      systemInstruction: `You are a genius, incredibly witty, and slightly sarcastic IPL cricket commentator acting as Akinator.
The user is thinking of an ${targetText}. You MUST only ask questions and guess items of this category.
Your goal is to guess the specific ${gameTargetType} they are thinking of in 15 questions or fewer.

You MUST strictly output a JSON object matching this exact layout:
{
  "is_ready_to_guess": boolean,
  "guess": "String ${gameTargetType} name or null",
  "next_question": "String Yes/No question or null",
  "commentary": "String witty, sarcastic commentator commentary"
}

Rules:
1. "is_ready_to_guess" must be set to true ONLY when you are highly confident you can guess the ${gameTargetType} name (typically after 8-15 questions, or earlier if you are absolutely certain).
2. If "is_ready_to_guess" is true, "guess" must contain the specific ${gameTargetType} name (e.g. "Virat Kohli" if player, "Chennai Super Kings" if team) and "next_question" must be null.
3. If "is_ready_to_guess" is false, "next_question" must contain a brilliant Yes/No question to narrow down the candidates, and "guess" must be null.
4. "commentary" must be a witty, sarcastic, and colorful cricket commentary sentence reflecting on the current progress, the user's answers, or your level of confidence. Use rich IPL/cricket jargon.
5. Do NOT repeat any questions you have already asked. Review the match history carefully to formulate your next smart delivery.
6. Systematically divide the search space.`
    });

    let prompt = `Analyze the user's answers and proceed with your game strategy.
Here is the official DRS Match History of this match so far:
`;

    if (gameHistory.length === 0) {
      prompt += `[No questions have been asked yet. This is the first delivery of the match! Ask a smart, broad opening question to get off the mark.]`;
    } else {
      gameHistory.forEach((item, index) => {
        prompt += `Delivery ${index + 1}: Question: "${item.question}" -> User answered: "${item.answer}"\n`;
      });
    }

    if (turnCount >= MAX_TURNS) {
      prompt += `\nCRITICAL: This is turn ${turnCount} of ${MAX_TURNS}. You have reached the limit! You MUST make a guess now. Set "is_ready_to_guess" to true and provide your absolute best guess in the "guess" field.`;
    } else {
      prompt += `\nThis is turn ${turnCount} out of ${MAX_TURNS}. Decide whether to ask a new question or make your final guess.`;
    }

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const data = JSON.parse(responseText);
    
    stopLoaderCommentary();
    handleAkiResult(data);
  } catch (error) {
    console.error("DRS Error in getting Akinator response:", error);
    stopLoaderCommentary();
    
    showScreen("game");
    el.activeQuestion.innerHTML = `<span style="color: var(--color-danger)">🚨 System Bowled Out!</span>`;
    el.liveCommentary.textContent = `Aki got hit for a massive six and lost the ball! Error: ${error.message || "Invalid API Key or connection issue"}. Double check your API Key configuration, captain!`;
  }
}

function handleAkiResult(data) {
  if (data.is_ready_to_guess && data.guess) {
    currentQuestion = `AI Guess: ${data.guess}`;
    el.suspectedEntity.textContent = data.guess;
    el.suspectedEntityType.textContent = "IPL Entity (DRS Cloud Checked)";
    el.guessCommentary.textContent = data.commentary || "Aki is looking absolutely confident about this. No DRS required!";
    showScreen("guess");
  } else {
    currentQuestion = data.next_question || "Is it an active IPL player?";
    el.activeQuestion.textContent = currentQuestion;
    el.turnCounter.textContent = `Question ${turnCount} / ${MAX_TURNS}`;
    el.liveCommentary.textContent = data.commentary || "Aki is loading the next ball. The batsman is taking guard...";
    showScreen("game");
  }
}

// --- Guess Screen Confirmation ---
function handleFinalDecision(isAkiCorrect) {
  isGameOver = true;
  showScreen("end");

  const guessedEntity = el.suspectedEntity.textContent;
  el.endTargetEntity.textContent = guessedEntity;
  el.endTotalTurns.textContent = turnCount - 1;

  if (isAkiCorrect) {
    el.endEmoji.textContent = "🏆";
    el.endHeader.textContent = "Victory for the Commentator!";
    el.endHeader.style.color = "var(--color-gold)";
    el.endDescription.innerHTML = `Aki successfully guessed <strong class="accent-gold">${guessedEntity}</strong> in <span class="accent-turquoise">${turnCount - 1}</span> deliveries!`;
    el.endCommentary.textContent = `Aki's post-match analysis: "An absolute masterclass from the bowler! Sliced right through your defense. You played well, but my scouting team was simply ten steps ahead. Better luck next tournament!"`;
  } else {
    el.endEmoji.textContent = "🔥";
    el.endHeader.textContent = "You Defeated Aki!";
    el.endHeader.style.color = "var(--color-turquoise)";
    el.endDescription.innerHTML = `Aki failed to guess your target entity after <span class="accent-turquoise">${turnCount - 1}</span> questions! The correct answer remains in your vaults.`;
    el.endCommentary.textContent = `Aki's post-match analysis: "Ah, edge and gone! A massive upset here at the stadium. I tried the googly, the carrom ball, even the slower delivery, but you played it with an absolute straight bat. A brilliant innings from you, captain!"`;
  }

  populateHistoryList();
}

// --- History & Accordion Management ---
function populateHistoryList() {
  el.historyList.innerHTML = "";
  
  if (gameHistory.length === 0) {
    el.historyList.innerHTML = `<div class="history-row" style="justify-content: center; color: var(--color-text-gray)">No deliveries played in this match.</div>`;
    return;
  }

  const tableHeader = `
    <div class="history-row" style="border-bottom: 2px solid rgba(255,255,255,0.1); font-weight: bold; color: var(--color-gold)">
      <span>DELIVERY</span>
      <span>USER RULING</span>
    </div>
  `;
  el.historyList.insertAdjacentHTML("beforeend", tableHeader);

  gameHistory.forEach((item, index) => {
    let answerClass = "dont know";
    if (item.answer.toLowerCase() === "yes") answerClass = "yes";
    if (item.answer.toLowerCase() === "no") answerClass = "no";

    const rowHTML = `
      <div class="history-row">
        <div class="history-q"><strong>Ball ${index + 1}:</strong> ${item.question}</div>
        <div class="history-a ${answerClass}">${item.answer}</div>
      </div>
    `;
    el.historyList.insertAdjacentHTML("beforeend", rowHTML);
  });
}

function toggleHistoryView() {
  const isHidden = el.historyList.classList.contains("hidden");
  if (isHidden) {
    el.historyList.classList.remove("hidden");
    el.toggleHistoryBtn.textContent = "Hide Match Statistics (DRS Review)";
  } else {
    el.historyList.classList.add("hidden");
    el.toggleHistoryBtn.textContent = "Show Match Statistics (DRS Review)";
  }
}

// --- Reset to Play Again ---
function resetToStart() {
  gameHistory = [];
  turnCount = 1;
  isGameOver = false;
  currentQuestion = "";
  showScreen("start");
}

// Mark application initialization completed
window.AkiCricketInitialized = true;
