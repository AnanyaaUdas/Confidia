import React from "react";
import BadgeCard from "./BadgeCard";
import { Link } from "react-router-dom";


const badges = [
    {
        emoji: "💌",
        title: "First Compliment",
        description: "Break the ice.",
        progress: "0/1",
        unlocked: false,
    },
    {
        emoji: "🌸",
        title: "Spread Happiness",
        description: "10 compliments.",
        progress: "0/10",
        unlocked: false,
    },
    {
        emoji: "⭐",
        title: "Campus Hero",
        description: "100 reactions.",
        progress: "0/100",
        unlocked: false,
    },
    {
        emoji: "🔥",
        title: "Kindness Streak",
        description: "5 days in a row.",
        progress: "1/5",
        unlocked: false,
    },
];

const ProfilePage = () => {

    return (
        <section className="kindness-profile">

            <div className="profile-heading">

                <div>
                    <h2>Your kindness profile</h2>

                    <p>
                        No login needed — just your anonymous badges,
                        right here.
                    </p>
                </div>

                 <Link to="/profile" className="profile-btn">
                    View full profile →
                </Link>

            </div>


            <div className="badge-grid">

                {badges.map((badge, index) => (
                    <BadgeCard
                        key={index}
                        emoji={badge.emoji}
                        title={badge.title}
                        description={badge.description}
                        progress={badge.progress}
                        unlocked={badge.unlocked}
                    />
                ))}

            </div>

        </section>
    );
};

export default ProfilePage;