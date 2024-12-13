import express from "express";
import dotenv from "dotenv";
import path from "path"; // Import path module
import connectDB from "./config/db.js"; // Import the DB connection
import userRoutes from "./routes/userRoutes.js"; // Include the .js extension for ES Modules

dotenv.config();

const app = express();

// Set EJS as the templating engine
app.set('view engine', 'ejs'); // Set EJS as the view engine
app.set('views', './views'); // Specify the views directory

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to the database
connectDB();

// Routes
app.use("/api", userRoutes); // Prefix for all routes

// Home Route for testing
app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

// Route to render a test view (e.g., a welcome page)
app.get("/welcome", (req, res) => {
  res.render("welcome", { message: "Welcome to the site!" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// Catch-all route for unknown paths
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
