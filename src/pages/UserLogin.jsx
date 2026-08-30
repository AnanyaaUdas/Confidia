import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import useAppStore from "../store/useAppStore";
import logo from "../assets/Images/logo.png";

const UserLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loginUser = useAppStore((s) => s.loginUser);
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from || "/wall";

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginUser(form.username, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <main
        style={{
          minHeight: "70vh",
          display: "grid",
          placeItems: "center",
          padding: "40px 16px",
          background: "linear-gradient(180deg, #fbf8ff 0%, #fff 100%)",
        }}
      >
        <form
          onSubmit={onSubmit}
          style={{
            width: "100%",
            maxWidth: 400,
            background: "#fff",
            borderRadius: 20,
            padding: 32,
            boxShadow: "0 12px 40px rgba(120, 90, 180, 0.12)",
            border: "1px solid #f0eaf8",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <img src={logo} alt="Confidia" style={{ height: 40 }} />
            <h1 style={{ margin: "12px 0 4px", fontSize: 24, color: "#38345a" }}>
              User Login
            </h1>
            <p style={{ margin: 0, color: "#948aad", fontSize: 14 }}>
              Log in to write, react, and report on the wall
            </p>
          </div>

          <label
            style={{ display: "block", fontSize: 13, color: "#625b79", marginBottom: 6 }}
          >
            Username or email
          </label>
          <input
            required
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="username"
            style={inputStyle}
          />

          <label
            style={{ display: "block", fontSize: 13, color: "#625b79", marginBottom: 6 }}
          >
            Password
          </label>
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            style={inputStyle}
          />

          {error && (
            <p style={{ color: "#e11d48", fontSize: 13, margin: "0 0 12px" }}>{error}</p>
          )}

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? "Signing in…" : "Log in"}
          </button>

          <p
            style={{ textAlign: "center", marginTop: 16, fontSize: 14, color: "#625b79" }}
          >
            New here?{" "}
            <Link to="/user-register" style={{ color: "#8B5CF6", fontWeight: 600 }}>
              Create an account
            </Link>
          </p>
        </form>
      </main>
      <Footer />
    </>
  );
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #e8e2f3",
  marginBottom: 14,
  fontSize: 15,
  outline: "none",
};

const btnStyle = {
  width: "100%",
  padding: 14,
  borderRadius: 30,
  border: "none",
  background: "linear-gradient(135deg, #ff6fa5, #b06bff)",
  color: "#fff",
  fontWeight: 700,
  fontSize: 15,
  cursor: "pointer",
  marginTop: 4,
};

export default UserLogin;
