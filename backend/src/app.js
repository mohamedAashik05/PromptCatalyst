const express = require("express");
const cors = require("cors");

const promptRoutes = require("./routes/promptRoutes");


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Temporary Route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "PromptCatalyst Backend is Running 🚀"
    });
});

app.use("/api/prompt", promptRoutes);

module.exports = app;