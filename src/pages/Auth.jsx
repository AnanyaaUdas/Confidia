import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../components/Login";
import Register from "../components/Register";
import "../style/Auth.css";

const Auth = () => {
    const [isRegister, setIsRegister] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="auth-page">

            <div className={`auth-container ${isRegister ? "register-mode" : ""}`}>

                {/* BACK BUTTON */}
                <button
                    type="button"
                    className="auth-back-btn on-light"
                    onClick={() => navigate("/")}
                >
                    ←
                </button>

                {/* FORM SIDE */}
                <div className="auth-form-side">
                    {isRegister ? (
                        <Register
                            switchToLogin={() => setIsRegister(false)}
                        />
                    ) : (
                        <Login
                            switchToRegister={() => setIsRegister(true)}
                        />
                    )}
                </div>

                {/* DIAGONAL PANEL */}
                <div className="auth-panel">

                    <div className="panel-content">

                        {isRegister ? (
                            <>
                                <div className="panel-icon">💗</div>

                                <h1>Welcome back</h1>

                                <p>
                                    Already part of the kindness
                                    community?
                                </p>

                                <button
                                    onClick={() => setIsRegister(false)}
                                >
                                    Login
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="panel-icon">🌸</div>

                                <h1>Create your account</h1>

                                <p>
                                    Join the kindness community
                                    and keep track of your kindness.
                                </p>

                                <button
                                    onClick={() => setIsRegister(true)}
                                >
                                    Register
                                </button>
                            </>
                        )}

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Auth;