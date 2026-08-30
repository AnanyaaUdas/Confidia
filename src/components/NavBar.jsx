import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/Images/logo.png";
import NotificationBell from "./NotificationBell";
import useAppStore from "../store/useAppStore";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const isLoggedIn = useAppStore((s) => s.isLoggedIn);
  const User = useAppStore((s) => s.User);
  const logoutUser = useAppStore((s) => s.logoutUser);

  const handleLogout = () => {
    logoutUser();
    setIsOpen(false);
    setMobileOpen(false);
    navigate("/");
  };

  useEffect(() => {
    setMobileOpen(false);
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onDoc = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const initials = User
    ? `${(User.firstName || User.username || "?").charAt(0)}${(User.lastName || "").charAt(0)}`.toUpperCase()
    : "";

  const isActive = (path) =>
    location.pathname === path || (path !== "/" && location.pathname.startsWith(path));

  return (
    <header className="header">
      <div className="headerList">
        <div className="logo">
          <Link to="/">
            <img src={logo} alt="Confidia Logo" />
          </Link>
        </div>

        <button
          type="button"
          className="nav-burger"
          aria-label="Menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? "✕" : "☰"}
        </button>

        <ul className={`nav-links ${mobileOpen ? "open" : ""}`}>
          <li className={isActive("/") && location.pathname === "/" ? "active" : ""}>
            <Link to="/" onClick={() => setMobileOpen(false)}>
              Home
            </Link>
          </li>
          <li className={isActive("/wall") ? "active" : ""}>
            <Link to="/wall" onClick={() => setMobileOpen(false)}>
              Wall
            </Link>
          </li>
          <li className={isActive("/write") ? "active" : ""}>
            <Link to="/write" onClick={() => setMobileOpen(false)}>
              Write
            </Link>
          </li>
          <li className={isActive("/Profile") ? "active" : ""}>
            <Link to="/Profile" onClick={() => setMobileOpen(false)}>
              Badges
            </Link>
          </li>
        </ul>

        <div className="nav-actions">
          <NotificationBell />
          <div className="loginDropDown" ref={dropdownRef}>
            {isLoggedIn ? (
              <>
                <button
                  type="button"
                  className="login-btn account-btn"
                  onClick={() => setIsOpen(!isOpen)}
                  aria-expanded={isOpen}
                >
                  <span className="avatar-chip">{initials || "🙂"}</span>
                  <span className="account-name">{User?.username || "Account"}</span>
                  <span className="chev">▾</span>
                </button>
                {isOpen && (
                  <div className="dropdownMenu">
                    <div className="dropdown-user">
                      <strong>@{User?.username}</strong>
                      <span>
                        {User?.complimentsShared || 0} shared · {User?.dayStreak || 0} day
                        streak
                      </span>
                    </div>
                    <Link to="/Profile" onClick={() => setIsOpen(false)}>
                      My profile
                    </Link>
                    <Link to="/write" onClick={() => setIsOpen(false)}>
                      Write a compliment
                    </Link>
                    <button
                      type="button"
                      className="dropdown-logout"
                      onClick={handleLogout}
                    >
                      Log out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="login-btn"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  Login
                </button>
                {isOpen && (
                  <div className="dropdownMenu">
                    <Link to="/user-login" onClick={() => setIsOpen(false)}>
                      User Login
                    </Link>
                    <Link to="/user-register" onClick={() => setIsOpen(false)}>
                      Sign up
                    </Link>
                    <div className="dropdown-divider" />
                    <Link
                      to="/admin-login"
                      onClick={() => setIsOpen(false)}
                      className="dropdown-admin"
                    >
                      Admin Login
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
