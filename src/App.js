import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import VRVideoPlayer from "./VRVideoPlayer";
import DigestiveSystem from "./DigestiveSystem"




function App() {
  return (
    <Router>
      <Routes>
        <Route path="/vr" element={<VRVideoPlayer/>} />
        <Route path="/ds" element={<DigestiveSystem/>} />
    
      </Routes>
    </Router>
  );
}

export default App;
