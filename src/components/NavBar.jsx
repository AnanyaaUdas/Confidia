import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import logo from "../assets/Images/logo.png";
import NotificationBell from "./NotificationBell";
import useAppStore from "../store/useAppStore";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isLoggedIn = useAppStore((state) => state.isLoggedIn);
  const User = useAppStore((state) => state.User);
  const logout = useAppStore((state) => state.logout)
  const navigate = useNavigate();

  const handleLogout = () => {

    // Remove logged-in user
    localStorage.removeItem("confidiaUser");

    // Remove login status
    localStorage.removeItem("isLoggedIn");

    // Clear the logged-in user's data from the app state
    // (compliments count, badges progress, etc.)
    logout();

    // Close the dropdown if it was open
    setIsOpen(false);

    // Go back to Home
    navigate("/");
};
  return (
    <div className="header">
      <div className="headerList">
        <div className="logo">
          <img src={logo} alt="Confidia Logo" />        </div>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>

          <li>
            <Link to="/wall">Wall</Link>
          </li>

          <li>
            <Link to="/write">Write</Link>
          </li>

          <li>
            <Link to="/Profile">Badges</Link>
          </li>
        </ul>
         <div className="nav-actions">

        <NotificationBell />

        <div className="loginDropDown">
          <button
            className="login-btn"
            onClick={() => setIsOpen(!isOpen)}
            >
            {isLoggedIn ? (User.firstName || User.username || "Account") : "Login"}
          </button>

          {isOpen && (
            <div className="dropdownMenu">
              {isLoggedIn ? (
                <button type="button" onClick={handleLogout}>
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/Auth" onClick={() => setIsOpen(false)}>User Login</Link>
                  <Link to="/AdminLogin" onClick={() => setIsOpen(false)}>Admin Login</Link>
                </>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;