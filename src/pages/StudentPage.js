import React, { useState, useEffect } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import VoiceCall from "../components/VoiceCall";

import "../styles/StudentPage.css";
import backgroundImage from "../assets/2.jpg"; // Ensure correct path

const StudentPage = () => {
  
  const [whiteboardTexture, setWhiteboardTexture] = useState(new THREE.Texture());

  // Load 360° background texture
  const bgTexture = useLoader(THREE.TextureLoader, backgroundImage);

  // Fetch whiteboard image and update texture every 5 seconds
  useEffect(() => {
    const updateWhiteboard = async () => {
      const loader = new THREE.TextureLoader();
      const newTexture = await loader.loadAsync(`http://localhost:3001/uploads/whiteboard.png?t=${new Date().getTime()}`);
      setWhiteboardTexture(newTexture);
    };

    updateWhiteboard();
    const interval = setInterval(updateWhiteboard, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="student-container">
      {/* 🎥 360° VR Scene */}
      <Canvas className="vr-canvas" camera={{ position: [0, -1.5, 0.1] }}>
        <OrbitControls enableZoom={false} />

        {/* 🌎 360° Background */}
        <mesh>
          <sphereGeometry args={[5, 60, 40]} />
          <meshBasicMaterial map={bgTexture} side={THREE.BackSide} />
        </mesh>

        {/* 📖 Whiteboard Inside VR Scene */}
        <mesh position={[0, 1, -3]}>
          <planeGeometry args={[6, 3]} />
          <meshBasicMaterial map={whiteboardTexture} />
        </mesh>
      </Canvas>

      {/* 🎙️ Voice Call & Chat UI */}
      <div className="rounded-voicecall">
        <VoiceCall role="student" />

      </div>
    </div>
  );
};

export default StudentPage;
