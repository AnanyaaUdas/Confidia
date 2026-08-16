import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./style/global.css";
import "./style/Wall.css"
import "./style/profile.css";
import "./style/MainWall.css";
import "./style/Notification.css"
import "./style/AdminLogin.css"
import "./style/Auth.css";

import Home from "./pages/Home";
import Wall from "./pages/Wall";
import Write from "./pages/Write";
import Profile from "./pages/Profile";
import AdminLogin from "./pages/AdminLogin";
import Auth from "./pages/Auth";
import BadgeCelebration from "./components/BadgeCelebration";


function App() {
  return (
    <>
   
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/wall" element={<Wall />} />
        <Route path="/write" element={<Write />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/AdminLogin" element={<AdminLogin />} />
        <Route path="/Auth" element={<Auth />} />
      </Routes>

      <BadgeCelebration />
    </BrowserRouter>
    </>
  );
}

export default App;