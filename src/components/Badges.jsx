import React from "react";
import ProfilePage from "./ProfilePage";
import useAppStore from "../store/useAppStore";
import { Link } from "react-router-dom";

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
  const isLoggedIn = useAppStore((state) => state.isLoggedIn);
  const User = useAppStore((state) => state.User);

  const displayName =
    User?.username ||
    [User?.firstName, User?.lastName].filter(Boolean).join(" ") ||
    "Friend";

  const initial = (displayName || "C").charAt(0).toUpperCase();

  return (
    <div className="profile-page">
      {isLoggedIn && User ? (
        <div className="welcome-card">
          <div className="welcome-avatar">{initial}</div>

          <div className="welcome-info">
            <h3>{displayName}</h3>
            <span className="welcome-since">
              Member since{" "}
              {User.memberSince
                ? new Date(User.memberSince).toLocaleDateString(undefined, {
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </span>

            <div className="welcome-stats">
              <div className="welcome-stat">
                <strong>{User.complimentsShared ?? 0}</strong>
                <span>Compliments shared</span>
              </div>
              <div className="welcome-stat">
                <strong>{User.reactionsGiven ?? 0}</strong>
                <span>Reactions given</span>
              </div>
              <div className="welcome-stat">
                <strong>{User.dayStreak ?? 0}</strong>
                <span>Day streak</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="welcome-card" style={{ justifyContent: "center" }}>
          <div className="welcome-info">
            <h3>Your kindness profile</h3>
            <p style={{ color: "#948aad", marginBottom: 12 }}>
              Log in to track compliments, reactions, and badges.
            </p>
            <Link to="/user-login" className="profile-btn">
              Log in →
            </Link>
          </div>
        </div>
      )}

      <ProfilePage />

      <div className="kindness-cloud">
        <div className="cloud-label">☁ KINDNESS CLOUD</div>
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
