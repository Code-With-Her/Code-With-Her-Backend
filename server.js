import express from "express";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import reviewRoutes from "./routes/reviewRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

// Load environment variables
dotenv.config();

// Initialize the Express app
const app = express();

// Middleware: Parse JSON bodies
app.use(express.json());

// Middleware: Parse cookies
app.use(cookieParser());

// Middleware: Handle CORS
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "https://code-with-her-frontend-production.up.railway.app",
  "https://codewither.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);


// Set up the database connection
connectDB();

// Set EJS as the templating engine
app.set("view engine", "ejs");
app.set("views", path.resolve("views")); // Use path.resolve for cross-platform compatibility

// Define routes
app.use("/api", userRoutes); // Group user-related routes under /users
app.use("/api/sellers", sellerRoutes); // Group seller-related routes under /sellers
app.use("/api/cart", cartRoutes); // Cart-related routes
app.use("/api/products", productRoutes); // Product-related routes
app.use("/api/reviews",reviewRoutes);
app.use("/api/payment", paymentRoutes);
// Root route for testing
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

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
