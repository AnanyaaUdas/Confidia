import React, { useState } from "react";
import ReactionButton from "./ReactionButton";
import useAppStore from "../store/useAppStore";

const ComplimentCard = ({
    item,
    openReply,
    setOpenReply,
    replyText,
    setReplyText,
    reactionCounts,
    userReactions,
    handleReaction
}) => {

    const [showReportModal, setShowReportModal] = useState(false);

    const reportCompliment = useAppStore((state) => state.reportCompliment);

    const isReported = item.reported;

    const confirmReport = () => {
        reportCompliment(item.id, "Reported by a user");
        setShowReportModal(false);
    };

    const counts = reactionCounts[item.id] || item.counts || [0, 0, 0];

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
                "{item.message}"
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
                            `${item.id}-${reactionIndex}`;

                        const isSelected =
                            userReactions[reactionKey];

                        return (
                            <ReactionButton
                                key={reactionIndex}
                                emoji={reaction}
                                count={counts[reactionIndex]}
                                selected={isSelected}
                                onClick={() =>
                                    handleReaction(
                                        item.id,
                                        reactionIndex
                                    )
                                }
                            />
                        );

                    }
                )}

                <button
                    className="report-btn"
                    onClick={() => setShowReportModal(true)}
                    disabled={isReported}
                >
                    {isReported ? "Reported" : "Report"}
                </button>

            </div>


            {/* DIVIDER */}

            <div className="card-divider"></div>


            {/* REPLY */}

            <button
                className="reply-toggle"
                onClick={() =>
                    setOpenReply(
                        openReply === item.id
                            ? null
                            : item.id
                    )
                }
            >

                💬 Reply anonymously{" "}

                {openReply === item.id
                    ? "▲"
                    : "▼"}

            </button>


            {/* REPLY BOX */}

            {openReply === item.id && (

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


            {/* REPORT MODAL */}

            {showReportModal && (

                <div
                    className="report-overlay"
                    onClick={() => setShowReportModal(false)}
                >

                    <div
                        className="report-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="report-icon">
                            🚩
                        </div>

                        <h3>
                            Report this compliment?
                        </h3>

                        <p>
                            This will flag the post for review.
                            You're helping keep the wall kind and safe.
                        </p>

                        <div className="report-actions">

                            <button
                                className="report-cancel"
                                onClick={() => setShowReportModal(false)}
                            >
                                Cancel
                            </button>

                            <button
                                className="report-confirm"
                                onClick={confirmReport}
                            >
                                Yes, Report
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </article>
    );
};

export default ComplimentCard;
