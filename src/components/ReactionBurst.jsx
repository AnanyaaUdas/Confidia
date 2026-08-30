import React from "react";

const ReactionBurst = ({ emoji }) => {
  const particles = [
    { left: "10%", delay: "0s", duration: "0.9s", distance: "75px", rotate: "-15deg" },
    { left: "25%", delay: "0.05s", duration: "1s", distance: "95px", rotate: "12deg" },
    { left: "40%", delay: "0.1s", duration: "0.85s", distance: "85px", rotate: "-8deg" },
    {
      left: "55%",
      delay: "0.03s",
      duration: "1.05s",
      distance: "110px",
      rotate: "15deg",
    },
    {
      left: "70%",
      delay: "0.08s",
      duration: "0.95s",
      distance: "90px",
      rotate: "-12deg",
    },
    { left: "85%", delay: "0.12s", duration: "1.1s", distance: "105px", rotate: "8deg" },
  ];

  return (
    <div className="reaction-burst">
      {particles.map((particle, index) => (
        <span
          key={index}
          className="burst-particle"
          style={{
            "--particle-left": particle.left,
            "--particle-delay": particle.delay,
            "--particle-duration": particle.duration,
            "--particle-distance": particle.distance,
            "--particle-rotate": particle.rotate,
          }}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
};

export default ReactionBurst;
