import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db.js";

import authRoutes from "./routes/authRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

dotenv.config();

const app = express();

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SureServe backend is running",
  });
});

// Database test route
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");

    res.json({
      success: true,
      message: "PostgreSQL Connected Successfully",
      time: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});