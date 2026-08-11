import React from "react";
import BadgeCard from "./BadgeCard";
import useAppStore from "../store/useAppStore";

const ProfilePage = () => {
  // Get user data and badges from Zustand
  const User = useAppStore((state) => state.User);
  const badges = useAppStore((state) => state.badges);

  // Calculate badge progress dynamically
  const calculatedBadges = badges.map((badge) => {
    // First Compliment
    if (badge.title === "First Compliment") {
      return {
        ...badge,
        progress: `${Math.min(User.complimentsShared, 1)}/1`,
        unlocked: User.complimentsShared >= 1,
      };
    }

    // Spread Happiness
    if (badge.title === "Spread Happiness") {
      return {
        ...badge,
        progress: `${Math.min(User.complimentsShared, 10)}/10`,
        unlocked: User.complimentsShared >= 10,
      };
    }

    // Campus Hero
    if (badge.title === "Campus Hero") {
      return {
        ...badge,
        progress: `${Math.min(User.reactionsGiven, 100)}/100`,
        unlocked: User.reactionsGiven >= 100,
      };
    }

    // Kindness Streak
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

      {/* PROFILE HEADING */}
      <div className="profile-heading">

        <div>
          <h2>Your kindness profile</h2>

          <p>
            No login needed — just your anonymous badges,
            right here.
          </p>
        </div>

      </div>

      {/* BADGES */}
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