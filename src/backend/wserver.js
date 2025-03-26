const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.static("uploads")); // Serve whiteboard images

// 🎨 Whiteboard Storage Configuration
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => cb(null, "whiteboard.png"),
});
const upload = multer({ storage });

app.post("/upload", upload.single("whiteboard"), (req, res) => {
  res.json({ message: "Whiteboard updated successfully!" });
});

app.get("/whiteboard", (req, res) => {
  res.sendFile(path.join(__dirname, "uploads", "whiteboard.png"));
});

app.listen(3001, () => console.log("📋 Whiteboard Server running on port 3001"));
