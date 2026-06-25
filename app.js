require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();

app.use(express.json());

const MONGODB_SECRET_URL = process.env.MONGODB_SECRET_URL;
const PORT = process.env.PORT || process.env.PORT_MAIN || 3000;

mongoose
  .connect(MONGODB_SECRET_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Connection error:", err));

// Routes
app.get("/health", (req, res) => res.status(200).send("OK"));
app.use("/", require("./routes/auth"));
app.use("/api/v1/posts", require("./routes/posts"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.log("ERROR:", err.name, err.message);
  if (err.name === "ValidationError" && err.errors) {
    return res.status(400).json({
      error: "Validation failed",
      details: Object.values(err.errors).map((e) => e.message),
    });
  }
  if (err.code === 11000 && err.keyValue) {
    return res.status(409).json({
      error: `${Object.keys(err.keyValue)[0]} already exists`,
    });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ error: "Invalid ID format" });
  }
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Invalid token" });
  }
  res.status(err.status || 500).json({
    error: err.message || "Something went wrong",
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
