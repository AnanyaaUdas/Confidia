import React from "react";
import BadgeCard from "./BadgeCard";
import { Link } from "react-router-dom";
import useAppStore from "../store/useAppStore";



const ProfilePage = () => {
    const badges = useAppStore((state) => state.badges)

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