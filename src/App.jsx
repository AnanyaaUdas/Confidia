import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./style/global.css";
import "./style/Wall.css"
import "./style/profile.css";
import "./style/MainWall.css";
import "./style/Notification.css"

import Home from "./pages/Home";
import Wall from "./pages/Wall";
import Write from "./pages/Write";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";


function App() {
  return (
    <>
   
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/wall" element={<Wall />} />
        <Route path="/write" element={<Write />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/admin-login" element={<AdminDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;