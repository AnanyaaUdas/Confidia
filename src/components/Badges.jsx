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

  // DEV-ONLY toggle to preview logged-in state
  const isLoggedIn = useAppStore((state) => state.isLoggedIn);
  const toggleLogin = useAppStore((state) => state.toggleLogin);

  // User from Zustand
  const User = useAppStore((state) => state.User);

  return (
    <div className="profile-page">

      <button
        className="dev-toggle"
        onClick={toggleLogin}
      >
        Dev: {isLoggedIn ? "Log out" : "Log in"} preview
      </button>

      {/* WELCOME CARD — only when logged in */}

      {isLoggedIn && (
        

        <div className="welcome-card">
           
          <div className="welcome-avatar">
            {User.username.charAt(0)}
          </div>

          <div className="welcome-info">

            <h3>{User.username}</h3>

            <span className="welcome-since">
              Member since {User.memberSince}
            </span>

            <div className="welcome-stats">

              <div className="welcome-stat">
                <strong>{User.complimentsShared}</strong>
                <span>Compliments shared</span>
              </div>

              <div className="welcome-stat">
                <strong>{User.reactionsGiven}</strong>
                <span>Reactions given</span>
              </div>

              <div className="welcome-stat">
                <strong>{User.dayStreak}</strong>
                <span>Day streak</span>
              </div>

            </div>

          </div>

          <button className="welcome-edit">
            Edit profile
          </button>

        </div>

      )}

      {/* PROFILE / BADGES */}

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