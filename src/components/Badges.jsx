import React from "react";
import ProfilePage from "./ProfilePage";
import useAppStore from "../store/useAppStore";

const kindnessCloud = [
    { word: "Helpful", size: "lg", color: "pink" },
    { word: "Friendly", size: "sm", color: "gray" },
    { word: "Inspiring", size: "xl", color: "purple" },
    { word: "Creative", size: "sm", color: "gray" },
    { word: "Supportive", size: "md", color: "dark" },
    { word: "Patient", size: "md", color: "pink" },
    { word: "Generous", size: "sm", color: "gray" },
];

const Badges = () => {
    // =====================================================
    // LOGIN STATE
    // =====================================================

    const isLoggedIn = useAppStore(
        (state) => state.isLoggedIn
    );

    const toggleLogin = useAppStore(
        (state) => state.toggleLogin
    );

    // =====================================================
    // USER FROM ZUSTAND
    // =====================================================

    const User = useAppStore(
        (state) => state.User
    );

    return (
        <div className="profile-page">

            {/* =================================================
                DEV LOGIN TOGGLE
            ================================================= */}

            <button
                className="dev-toggle"
                onClick={toggleLogin}
            >
                Dev: {isLoggedIn ? "Log out" : "Log in"} preview
            </button>

            {/* =================================================
                WELCOME CARD
            ================================================= */}

            {isLoggedIn && (
                <div className="welcome-card">

                    <div className="welcome-avatar">
                        {User.username
                            ? User.username.charAt(0).toUpperCase()
                            : "U"}
                    </div>

                    <div className="welcome-info">

                        <h3>
                            {User.username || "User"}
                        </h3>

                        <span className="welcome-since">
                            Member since{" "}
                            {User.memberSince || "Recently"}
                        </span>

                        <div className="welcome-stats">

                            {/* COMPLIMENTS */}

                            <div className="welcome-stat">
                                <strong>
                                    {User.complimentsShared}
                                </strong>

                                <span>
                                    Compliments shared
                                </span>
                            </div>

                            {/* REACTIONS */}

                            <div className="welcome-stat">
                                <strong>
                                    {User.reactionsGiven}
                                </strong>

                                <span>
                                    Reactions given
                                </span>
                            </div>

                            {/* STREAK */}

                            <div className="welcome-stat">
                                <strong>
                                    {User.dayStreak}
                                </strong>

                                <span>
                                    Day streak
                                </span>
                            </div>

                        </div>
                    </div>

                    <button className="welcome-edit">
                        Edit profile
                    </button>

                </div>
            )}

            {/* =================================================
                PROFILE / BADGES
            ================================================= */}

            <ProfilePage />

            {/* =================================================
                KINDNESS CLOUD
            ================================================= */}

            <div className="kindness-cloud">

                <div className="cloud-label">
                    ☁ KINDNESS CLOUD
                </div>

                <div className="cloud-words">

                    {kindnessCloud.map(
                        (tag, index) => (
                            <span
                                key={index}
                                className={`cloud-word cloud-${tag.size} cloud-${tag.color}`}
                            >
                                {tag.word}
                            </span>
                        )
                    )}

                </div>

            </div>

        </div>
    );
};

export default Badges;