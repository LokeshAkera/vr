import React, { useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const VRVideoPlayer = ({ videoSrc, videoRef }) => {
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.src = videoSrc;
      video.crossOrigin = "anonymous";
      video.loop = true;
      video.muted = true; // 🔹 Mute for autoplay support
      video.playsInline = true;
      video.autoplay = true;
      video.load();
      video.play().catch((err) => console.warn("Autoplay blocked:", err));
    }
  }, [videoSrc, videoRef]);

  return (
    <Canvas>
      <OrbitControls enableZoom={false} />
      <PanoramicVideo videoRef={videoRef} />
    </Canvas>
  );
};

const PanoramicVideo = ({ videoRef }) => {
  const { scene } = useThree();
  const textureRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      textureRef.current = new THREE.VideoTexture(videoRef.current);
      textureRef.current.mapping = THREE.EquirectangularReflectionMapping;
      textureRef.current.minFilter = THREE.LinearFilter;
      textureRef.current.magFilter = THREE.LinearFilter;
      textureRef.current.format = THREE.RGBFormat;

      const geometry = new THREE.SphereGeometry(500, 60, 40); // 🔹 Large sphere for full panoramic view
      geometry.scale(-1, 1, 1); // 🔹 Invert for inside viewing

      const material = new THREE.MeshBasicMaterial({ map: textureRef.current });

      const sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);

      return () => {
        scene.remove(sphere);
        textureRef.current?.dispose();
      };
    }
  }, [scene, videoRef]);

  return null;
};

const VideoControls = ({ videoRef }) => {
  const playVideo = () => videoRef.current?.play();
  const pauseVideo = () => videoRef.current?.pause();
  const stopVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1 }}>
      <button onClick={playVideo}>Play</button>
      <button onClick={pauseVideo}>Pause</button>
      <button onClick={stopVideo}>Stop</button>
    </div>
  );
};

const App = () => {
  const videoRef = useRef(null);
  const videoSrc = "/ok.mp4"; // 🔹 Ensure this file is inside `public/videos/`

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <video ref={videoRef} style={{ display: "none" }} />
      <VRVideoPlayer videoSrc={videoSrc} videoRef={videoRef} />
      <VideoControls videoRef={videoRef} />
    </div>
  );
};

export default App;
