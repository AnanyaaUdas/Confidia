import React, { useState } from "react";
import { Link } from "react-router-dom";

import logo from "../assets/Images/logo.png";
import NotificationBell from "./NotificationBell";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

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
            Login
          </button>

          {isOpen && (
            <div className="dropdownMenu">
              <Link to="/user-login">User Login</Link>
              <Link to="/admin-login">Admin Login</Link>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;