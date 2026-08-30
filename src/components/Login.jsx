import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAppStore from "../store/useAppStore";

const Login = ({ switchToRegister }) => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();
    const setUser = useAppStore((state) => state.setUser);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            const data = await response.json();

            // Login failed
            if (!response.ok) {
                alert(data.message);
                return;
            }

            // Save logged-in user
            localStorage.setItem(
                "confidiaUser",
                JSON.stringify(data.user)
            );

            // Save login status
            localStorage.setItem(
                "isLoggedIn",
                "true"
            );

            // Update global app state so the rest of the app
            // (NavBar, Write page, etc.) knows we're logged in
            setUser(data.user);

            console.log("Login successful:", data.user);

            // GO TO HOME
            navigate("/");

        } catch (error) {

            console.error("Login error:", error);

            alert(
                "Unable to connect to the server. Please try again."
            );
        }
    };

    return (
        <div className="auth-form">

            <h2>Welcome back!</h2>

            <p className="auth-subtitle">
                Login to continue spreading kindness.
            </p>

            <form onSubmit={handleSubmit}>

                <label>Email</label>

                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                    required
                />

                <label>Password</label>

                <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                    required
                />

                <button
                    type="submit"
                    className="auth-submit"
                >
                    Login
                </button>

            </form>

            <p className="auth-switch">

                Don't have an account?

                <button
                    type="button"
                    onClick={switchToRegister}
                >
                    Register
                </button>

            </p>

        </div>
    );
};

export default Login;