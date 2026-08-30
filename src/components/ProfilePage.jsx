import React from "react";
import BadgeCard from "./BadgeCard";
import { Link } from "react-router-dom";
import useAppStore from "../store/useAppStore";

const ProfilePage = () => {
  const User = useAppStore((state) => state.User);
  const badges = useAppStore((state) => state.badges);

  // Safe defaults when logged out (User is null)
  const shared = User?.complimentsShared ?? 0;
  const reactions = User?.reactionsGiven ?? 0;
  const streak = User?.dayStreak ?? 0;

  const calculatedBadges = badges.map((badge) => {
    if (badge.title === "First Compliment") {
      return {
        ...badge,
        progress: `${Math.min(shared, 1)}/1`,
        unlocked: shared >= 1,
      };
    }

    if (badge.title === "Spread Happiness") {
      return {
        ...badge,
        progress: `${Math.min(shared, 10)}/10`,
        unlocked: shared >= 10,
      };
    }

    if (badge.title === "Campus Hero") {
      return {
        ...badge,
        progress: `${Math.min(reactions, 100)}/100`,
        unlocked: reactions >= 100,
      };
    }

    if (badge.title === "Kindness Streak") {
      return {
        ...badge,
        progress: `${Math.min(streak, 5)}/5`,
        unlocked: streak >= 5,
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
            {User
              ? `Signed in as @${User.username}`
              : "Log in to track badges — or just browse the wall."}
          </p>
        </div>

        <Link to={User ? "/Profile" : "/user-login"} className="profile-btn">
          {User ? "View full profile →" : "Log in →"}
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
