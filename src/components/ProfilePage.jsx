import React from "react";
import BadgeCard from "./BadgeCard";
import { Link } from "react-router-dom";
import useAppStore from "../store/useAppStore";

const ProfilePage = () => {
  const User = useAppStore((state) => state.User);
  const badges = useAppStore((state) => state.badges);

  const calculatedBadges = badges.map((badge) => {
    if (badge.title === "First Compliment") {
      return {
        ...badge,
        progress: `${Math.min(User.complimentsShared, 1)}/1`,
        unlocked: User.complimentsShared >= 1,
      };
    }

    if (badge.title === "Spread Happiness") {
      return {
        ...badge,
        progress: `${Math.min(User.complimentsShared, 10)}/10`,
        unlocked: User.complimentsShared >= 10,
      };
    }

    if (badge.title === "Campus Hero") {
      return {
        ...badge,
        progress: `${Math.min(User.reactionsGiven, 100)}/100`,
        unlocked: User.reactionsGiven >= 100,
      };
    }

    if (badge.title === "Kindness Streak") {
      return {
        ...badge,
        progress: `${Math.min(User.dayStreak, 5)}/5`,
        unlocked: User.dayStreak >= 5,
      };
    }

    return badge;
  });

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

        {calculatedBadges.map((badge, index) => (
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