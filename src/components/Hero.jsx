import React from "react";
import { TypeAnimation } from "react-type-animation";

const Hero = () => {
  return (
    <section className="hero">

      {/* Left Side */}
      <div className="hero-left">

        <div className="hero-tag">
          🔒 100% Anonymous • 🌸 Positive Only
        </div>

        <h1>
          Sometimes
          <br />
          anonymous
          <br />
          kindness means
          <br />
          <span>the most.</span>
        </h1>

        <p>
          Your campus wall for compliments you were too shy to say out loud.
          No usernames, no profile pictures — just the kind words someone
          needed to hear today.
        </p>

      </div>

      {/* Right Side */}
     <div className="hero-right">

    <div className="kindness-card">

        <small>💌 KINDNESS SPOTLIGHT</small>

        <p className="kindness-text">
            "To whoever smiled at me today...
            thank you. You made my day."
        </p>

        <div className="card-footer">
            <span>⭐ Featured by Admin</span>
            <span>💙 Anonymous</span>
        </div>

    </div>

</div>

<button className="floating-btn">
    ➕ Share Kindness
</button>


    </section>
  );
};

export default Hero;