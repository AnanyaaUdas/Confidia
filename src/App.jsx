import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./style/global.css";
import "./style/Wall.css";
import "./style/profile.css";
import "./style/MainWall.css";
import "./style/Notification.css";

import Home from "./pages/Home";
import Wall from "./pages/Wall";
import Write from "./pages/Write";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import UserLogin from "./pages/UserLogin";
import UserRegister from "./pages/UserRegister";
import Chat from "./pages/Chat";
import BadgeCelebration from "./components/BadgeCelebration";
import FloatingChat from "./components/FloatingChat";
import useAppStore from "./store/useAppStore";

function RequireUser({ children }) {
  const isLoggedIn = useAppStore((s) => s.isLoggedIn);
  const location = useLocation();
  if (!isLoggedIn) {
    return <Navigate to="/user-login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

function RequireAdmin({ children }) {
  const token = localStorage.getItem("confidia_admin_token");
  if (!token) {
    return <Navigate to="/admin-login" replace />;
  }
  return children;
}

// The floating chat bubble is a user-side-only feature — it must never
// appear on admin pages (login or dashboard).
function UserSideFloatingChat() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  if (isAdminRoute) return null;
  return <FloatingChat />;
}

function App() {
  const loadCompliments = useAppStore((s) => s.loadCompliments);
  const restoreSession = useAppStore((s) => s.restoreSession);
  const loadProfile = useAppStore((s) => s.loadProfile);

  useEffect(() => {
    (async () => {
      await restoreSession();
      loadCompliments();
      if (localStorage.getItem("confidia_user_token")) {
        loadProfile();
      }
    })();
  }, [loadCompliments, restoreSession, loadProfile]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/wall" element={<Wall />} />
        <Route
          path="/write"
          element={
            <RequireUser>
              <Write />
            </RequireUser>
          }
        />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/user-register" element={<UserRegister />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route
          path="/admin-dashboard"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />
        {/* old path still works: login page only */}
        <Route path="/admin" element={<Navigate to="/admin-login" replace />} />
      </Routes>
      <BadgeCelebration />
      <UserSideFloatingChat />
    </BrowserRouter>
  );
}

export default App;
