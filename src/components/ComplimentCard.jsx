import React from "react";
import ReactionButton from "./ReactionButton";

const ComplimentCard = ({
    item,
    index,
    openReply,
    setOpenReply,
    replyText,
    setReplyText,
    reactionCounts,
    userReactions,
    handleReaction
}) => {

    return (
        <article className="compliment-card">

            {/* TOP */}

            <div className="card-top">

                <div>

                    {item.featured && (
                        <div className="featured-label">
                            ⭐ FEATURED
                        </div>
                    )}

                    <div className="anonymous">
                        💙 <span>Anonymous</span>
                    </div>

                </div>

                <span className="card-emoji">
                    {item.emoji}
                </span>

            </div>


            {/* TO */}

            <div className="card-to">
                TO: {item.to}
            </div>


            {/* MESSAGE */}

            <p className="card-message">
                “{item.message}”
            </p>


            {/* TIME */}

            <div className="card-time">
                {item.time}
            </div>


            {/* REACTIONS */}

            <div className="reaction-row">

                {item.reactions.map(
                    (reaction, reactionIndex) => {

                        const reactionKey =
                            `${index}-${reactionIndex}`;

                        const isSelected =
                            userReactions[reactionKey];

                        return (
                            <ReactionButton
                                key={reactionIndex}

                                reaction={reaction}

                                count={
                                    reactionCounts[index][
                                        reactionIndex
                                    ]
                                }

                                selected={isSelected}

                                onReact={() =>
                                    handleReaction(
                                        index,
                                        reactionIndex
                                    )
                                }
                            />
                        );

                    }
                )}

                <button className="report-btn">
                    Report
                </button>

            </div>


            {/* DIVIDER */}

            <div className="card-divider"></div>


            {/* REPLY */}

            <button
                className="reply-toggle"
                onClick={() =>
                    setOpenReply(
                        openReply === index
                            ? null
                            : index
                    )
                }
            >

                💬 Reply anonymously{" "}

                {openReply === index
                    ? "▲"
                    : "▼"}

            </button>


            {/* REPLY BOX */}

            {openReply === index && (

                <div className="reply-box">

                    <input
                        type="text"
                        placeholder="Write an anonymous reply..."
                        value={replyText}

                        onChange={(e) =>
                            setReplyText(
                                e.target.value
                            )
                        }
                    />

                    <button className="send-btn">
                        Send
                    </button>

                </div>

            )}

        </article>
    );
};

export default ComplimentCard;