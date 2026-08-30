import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import useAppStore from "../store/useAppStore";
import logo from "../assets/Images/logo.png";

const UserRegister = () => {
  const navigate = useNavigate();
  const registerUser = useAppStore((s) => s.registerUser);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerUser(form);
      navigate("/wall", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed");
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
            maxWidth: 420,
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
              Join Confidia
            </h1>
            <p style={{ margin: 0, color: "#948aad", fontSize: 14 }}>
              Create an account to share kindness
            </p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>First name</label>
              <input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Last name</label>
              <input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          <label style={labelStyle}>Username *</label>
          <input
            required
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            style={inputStyle}
          />

          <label style={labelStyle}>Email *</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={inputStyle}
          />

          <label style={labelStyle}>Password * (min 6)</label>
          <input
            required
            type="password"
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={inputStyle}
          />

          {error && (
            <p style={{ color: "#e11d48", fontSize: 13, margin: "0 0 12px" }}>{error}</p>
          )}

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? "Creating…" : "Create account"}
          </button>

          <p
            style={{ textAlign: "center", marginTop: 16, fontSize: 14, color: "#625b79" }}
          >
            Already have an account?{" "}
            <Link to="/user-login" style={{ color: "#8B5CF6", fontWeight: 600 }}>
              Log in
            </Link>
          </p>
        </form>
      </main>
      <Footer />
    </>
  );
};

const labelStyle = {
  display: "block",
  fontSize: 13,
  color: "#625b79",
  marginBottom: 6,
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

export default UserRegister;
