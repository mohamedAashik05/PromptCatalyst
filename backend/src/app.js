const express = require("express");
const cors = require("cors");

const app = express();

const promptRoutes = require("./routes/promptRoutes");

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://prompt-catalyst-eight.vercel.app",
    ],
  })
);

app.use(express.json());

// Health Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "PromptCatalyst Backend is Running 🚀",
  });
});

// API Routes
app.use("/api/prompt", promptRoutes);

module.exports = app;