import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import TeacherPage from "./pages/TeacherPage";
import StudentPage from "./pages/StudentPage";

function App() {
  return (
    <Router>
      <div className="App">

        
    
        <Routes>
          <Route path="/teacher" element={<TeacherPage />} />
          <Route path="/student" element={<StudentPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
