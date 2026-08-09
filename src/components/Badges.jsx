import React, { useState } from "react";
import ProfilePage from "./ProfilePage";


// MOCK — replace with real auth/user data later
const mockUser = {
    name: "Priyanya",
    memberSince: "August 2026",
    complimentsShared: 3,
    reactionsGiven: 12,
    dayStreak: 1,
};

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

    // DEV-ONLY toggle to preview logged-in state — remove once real login exists
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    return (
        <div className="profile-page">

            <button
                className="dev-toggle"
                onClick={() => setIsLoggedIn((prev) => !prev)}
            >
                Dev: {isLoggedIn ? "Log out" : "Log in"} preview
            </button>


            {/* WELCOME CARD — only when logged in */}

            {isLoggedIn && (

                <div className="welcome-card">

                    <div className="welcome-avatar">
                        {mockUser.name.charAt(0)}
                    </div>

                    <div className="welcome-info">

                        <h3>{mockUser.name}</h3>

                        <span className="welcome-since">
                            Member since {mockUser.memberSince}
                        </span>

                        <div className="welcome-stats">

                            <div className="welcome-stat">
                                <strong>{mockUser.complimentsShared}</strong>
                                <span>Compliments shared</span>
                            </div>

                            <div className="welcome-stat">
                                <strong>{mockUser.reactionsGiven}</strong>
                                <span>Reactions given</span>
                            </div>

                            <div className="welcome-stat">
                                <strong>{mockUser.dayStreak}</strong>
                                <span>Day streak</span>
                            </div>

                        </div>

                    </div>

                    <button className="welcome-edit">
                        Edit profile
                    </button>

                </div>

            )}


            {/* REUSED AS-IS — heading, "View full profile" link, badge grid */}

            <ProfilePage />


            {/* KINDNESS CLOUD */}

            <div className="kindness-cloud">

                <div className="cloud-label">
                    ☁ KINDNESS CLOUD
                </div>

                <div className="cloud-words">

                    {kindnessCloud.map((tag, index) => (
                        <span
                            key={index}
                            className={`cloud-word cloud-${tag.size} cloud-${tag.color}`}
                        >
                            {tag.word}
                        </span>
                    ))}

                </div>

            </div>

        </div>
    );
};

export default Badges;