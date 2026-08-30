import React, { useState } from "react";
import ReactionBurst from "./ReactionBurst";

const ReactionButton = ({ emoji, count, selected, onClick }) => {
  const [showBurst, setShowBurst] = useState(false);

  const handleClick = () => {
    // Tell Wall.jsx to update the reaction count
    onClick();

    // Start floating emoji animation
    setShowBurst(true);

    // Remove animation after it finishes
    setTimeout(() => {
      setShowBurst(false);
    }, 1100);
  };

  return (
    <button
      className={`reaction-btn ${selected ? "reaction-selected" : ""}`}
      onClick={handleClick}
    >
      <span className="reaction-emoji">{emoji}</span>

      <span className="reaction-count">{count}</span>

      {showBurst && <ReactionBurst emoji={emoji} />}
    </button>
  );
};

export default ReactionButton;
