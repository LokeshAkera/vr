const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());

// Ensure "uploads" and "public" directories exist
const uploadDir = path.join(__dirname, "uploads");
const publicDir = path.join(__dirname, "public");

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

// Serve static files from "public" (for HTML, CSS, JS)
app.use(express.static("public"));

// Serve whiteboard images
app.use("/uploads", express.static(uploadDir));

// 🎨 Whiteboard Storage Configuration
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, "whiteboard.png"),
});
const upload = multer({ storage });

// Endpoint to Upload Whiteboard Image
app.post("/upload", upload.single("whiteboard"), (req, res) => {
  res.json({ message: "Whiteboard updated successfully!" });
});

// Endpoint to Retrieve Whiteboard Image
app.get("/whiteboard", (req, res) => {
  res.sendFile(path.join(uploadDir, "whiteboard.png"));
});

// Serve the homepage (index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start Server
app.listen(3001, () => console.log("📋 Whiteboard Server running on port 3001"));
