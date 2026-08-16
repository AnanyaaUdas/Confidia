import React from "react";
import useAppStore from "../store/useAppStore";

const BadgeCelebration = () => {

    const celebration = useAppStore((state) => state.celebration);
    const clearCelebration = useAppStore((state) => state.clearCelebration);

    if (!celebration) {
        return null;
    }

    return (

        <div
            className="celebration-overlay"
            onClick={clearCelebration}
        >

            <div
                className="celebration-modal"
                onClick={(e) => e.stopPropagation()}
            >

                <div className="celebration-confetti">
                    🎉 🌸 💗 ⭐ 🎉
                </div>

                <div className="celebration-icon">
                    {celebration.emoji}
                </div>

                <h3>Badge unlocked!</h3>

                <p className="celebration-title">
                    {celebration.title}
                </p>

                <p className="celebration-desc">
                    {celebration.description}
                </p>

                <button
                    type="button"
                    className="anonymous-button"
                    onClick={clearCelebration}
                >
                    Yay! 💗
                </button>

            </div>

        </div>

    );
};

export default BadgeCelebration;