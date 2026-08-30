import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAppStore from "../store/useAppStore";

const Register = ({ switchToLogin }) => {

    const [firstName, setFirstName] =
        useState("");

    const [lastName, setLastName] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [message, setMessage] =
        useState("");

    const [messageType, setMessageType] =
        useState("");


    const setUser =
        useAppStore(
            (state) => state.setUser
        );

    const navigate = useNavigate();


    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage("");


        try {

            const response =
                await fetch(
                    "http://localhost:5000/api/auth/register",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({

                            firstName,

                            lastName,

                            email,

                            password,

                        }),
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                setMessage(
                    data.message ||
                    "Registration failed."
                );

                setMessageType("error");

                return;
            }


            // Save newly registered user
            localStorage.setItem(
                "confidiaUser",
                JSON.stringify(data.user)
            );

            localStorage.setItem(
                "isLoggedIn",
                "true"
            );

            setUser(data.user);


            setMessage(
                `Account created! You are ${data.user.username} 💗`
            );

            setMessageType("success");

            setTimeout(() => {
                navigate("/");
            }, 1200);


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );

            setMessage(
                "Unable to connect to server."
            );

            setMessageType("error");

        }

    };


    return (

        <div className="auth-form">

            <h2>
                Create your account 🌸
            </h2>


            <p className="auth-subtitle">
                Join the kindness community.
            </p>


            <form
                onSubmit={handleSubmit}
            >

                <label>
                    First name
                </label>


                <input
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) =>
                        setFirstName(e.target.value)
                    }
                    required
                />


                <label>
                    Last name
                </label>


                <input
                    type="text"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) =>
                        setLastName(e.target.value)
                    }
                    required
                />


                <label>
                    Email
                </label>


                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                    required
                />


                <label>
                    Password
                </label>


                <input
                    type="password"
                    placeholder="Create a password"
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
                    Register
                </button>


                {message && (

                    <p
                        className={`auth-message ${messageType}`}
                    >
                        {message}
                    </p>

                )}

            </form>


            <p className="auth-switch">

                Already have an account?

                <button
                    type="button"
                    onClick={switchToLogin}
                >
                    Login
                </button>

            </p>

        </div>

    );

};


export default Register;