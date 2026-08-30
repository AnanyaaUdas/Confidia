import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminLogin } from "../api";
import logo from "../assets/Images/logo.png";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already has valid-looking token, still force login screen unless they go to dashboard
  // Clear stale token option is intentional: always show login on this route
  useEffect(() => {
    // do not auto-redirect — user asked for a login page
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token } = await adminLogin(form.username, form.password);
      localStorage.setItem("confidia_admin_token", token);
      navigate("/admin-dashboard", { replace: true });
    } catch {
      setError("Wrong username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f6f4fb",
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          padding: 36,
          minWidth: 340,
          maxWidth: 400,
          width: "90%",
          borderRadius: 16,
          background: "#fff",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <img src={logo} alt="Confidia" style={{ height: 40 }} />
          <h2 style={{ margin: "12px 0 4px" }}>Admin Login</h2>
          <p style={{ opacity: 0.65, fontSize: 14, margin: 0 }}>
            Sign in to moderate Confidia
          </p>
        </div>
        <input
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
          style={field}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          style={field}
        />
        {error && (
          <p style={{ color: "#e11d48", fontSize: 13, marginBottom: 8 }}>{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg, #ff6fa5, #8B5CF6)",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {loading ? "Signing in…" : "Log in"}
        </button>
        <p style={{ textAlign: "center", marginTop: 14 }}>
          <Link to="/" style={{ fontSize: 13 }}>
            ← Back to site
          </Link>
        </p>
      </form>
    </div>
  );
};

const field = {
  display: "block",
  width: "100%",
  marginBottom: 12,
  padding: 12,
  borderRadius: 10,
  border: "1px solid #e0e0e0",
  boxSizing: "border-box",
};

export default AdminLogin;
