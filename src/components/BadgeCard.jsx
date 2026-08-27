import React from "react";

const BadgeCard = ({
    emoji,
    title,
    description,
    progress,
    unlocked,
}) => {

    return (
        <div
            className={`badge-card ${
                unlocked
                    ? "unlocked"
                    : ""
            }`}
        >

            <div className="badge-icon">
                {emoji}
            </div>

            <h3>
                {title}
            </h3>

            <p>
                {description}
            </p>

            <span className="badge-progress">
                {progress}
            </span>

        </div>
    );
};

export default BadgeCard;