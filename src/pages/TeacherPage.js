import React, { useRef, useEffect, useState } from "react";
import VoiceCall from "../components/VoiceCall";
import "../styles/TeacherPage.css";

const TeacherPage = () => {
  const canvasRef = useRef(null);
  const [context, setContext] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [markerSize, setMarkerSize] = useState(2);
  const [markerColor, setMarkerColor] = useState("#000000");
  const [isErasing, setIsErasing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "white"; // White background
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = markerSize;
      ctx.strokeStyle = markerColor;
      setContext(ctx);
    }
  }, [markerSize, markerColor]);

  let isDrawing = false;

  const startDrawing = (e) => {
    isDrawing = true;
    context.beginPath();
    context.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    context.lineWidth = markerSize;
    context.strokeStyle = isErasing ? "white" : markerColor;
    context.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    context.stroke();
  };

  const stopDrawing = () => {
    isDrawing = false;
    context.closePath();
  };

  const saveWhiteboard = () => {
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      const formData = new FormData();
      formData.append("whiteboard", blob, "whiteboard.png");

      fetch("http://localhost:3001/upload", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => console.log(data))
        .catch((err) => console.error("Error:", err));
    });
  };

  // Auto-save every 5 seconds
  useEffect(() => {
    const interval = setInterval(saveWhiteboard, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="teacher-container">
      {/* Three-Bar Menu */}
      <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </div>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="menu-options">
          <label>
            Marker Type:
            <select onChange={(e) => setMarkerColor(e.target.value)}>
              <option value="#000000">Black</option>
              <option value="#ff0000">Red</option>
              <option value="#0000ff">Blue</option>
              <option value="#008000">Green</option>
            </select>
          </label>
          <label>
            Marker Size:
            <input
              type="range"
              min="1"
              max="10"
              value={markerSize}
              onChange={(e) => setMarkerSize(e.target.value)}
            />
          </label>
          <button onClick={() => setIsErasing(!isErasing)}>
            {isErasing ? "✏️ Use Marker" : "🧽 Erase"}
          </button>
          <button onClick={() => context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)}>
            🗑️ Clear Board
          </button>
        </div>
      )}

      <h2 className="title">🎙️ Teacher's Voice Call Page</h2>
      <VoiceCall role="teacher" />

      <h2>📖 Whiteboard</h2>
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="whiteboard"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      ></canvas>
      <button onClick={saveWhiteboard} className="save-btn">
        Save Whiteboard
      </button>
    </div>
  );
};

export default TeacherPage;
