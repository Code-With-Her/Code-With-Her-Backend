import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js"; // Import the DB connection
import userRoutes from "./routes/userRoutes.js"; // Include the .js extension for ES Modules

dotenv.config();

const app = express();
app.use(express.json());

// Connect to the database
connectDB();

// Routes
app.use("/api", userRoutes); // Specify a more descriptive route prefix

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
