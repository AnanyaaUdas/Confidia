import React, { useEffect, useState } from "react";
import ReactionButton from "./ReactionButton";
import useAppStore from "../store/useAppStore";

const ComplimentCard = ({
    item,
    index,
    openReply,
    setOpenReply,
    replyText,
    setReplyText,
}) => {
    // =========================
    // REPORT
    // =========================

    const [showReportModal, setShowReportModal] = useState(false);
    const [reported, setReported] = useState(false);

    // =========================
    // REACTIONS
    // =========================

    const [reactions, setReactions] = useState({
        heart: item.reactions?.heart || 0,
        smile: item.reactions?.smile || 0,
        clap: item.reactions?.clap || 0,
    });

    const [selectedReaction, setSelectedReaction] = useState(null);

    const addReaction = useAppStore((state) => state.addReaction);
    const User = useAppStore((state) => state.User);
    const isLoggedIn = useAppStore((state) => state.isLoggedIn);

    // =========================
    // REPLIES
    // =========================

    const [localReplies, setLocalReplies] = useState(
        item.replies || []
    );

    const [sendingReply, setSendingReply] = useState(false);
    const [replySent, setReplySent] = useState(false);
    const [replyError, setReplyError] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);

    // Keep local replies synchronized when compliments
    // are refreshed from the backend.
    useEffect(() => {
        setLocalReplies(item.replies || []);
    }, [item.replies]);

    // =========================
    // REACTION LIST
    // =========================

    const reactionList = [
        {
            emoji: "❤️",
            name: "heart",
        },
        {
            emoji: "😊",
            name: "smile",
        },
        {
            emoji: "👏",
            name: "clap",
        },
    ];

    // =========================
    // ADD REACTION
    // =========================

    const handleReaction = async (reactionName) => {
        if (selectedReaction === reactionName) {
            return;
        }

        const isFirstReactionOnCard =
            selectedReaction === null;

        // Default/demo cards don't have MongoDB IDs
        if (
            !item._id ||
            item._id.startsWith("default-")
        ) {
            console.log(
                "This is a default card, not stored in MongoDB."
            );
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/compliments/${item._id}/reaction`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        reaction: reactionName,
                        reactedBy: User?._id || null,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to add reaction"
                );
            }

            // Update reaction counts
            if (data.reactions) {
                setReactions({
                    heart:
                        data.reactions.heart || 0,
                    smile:
                        data.reactions.smile || 0,
                    clap:
                        data.reactions.clap || 0,
                });
            }

            setSelectedReaction(reactionName);

            // Only count first reaction toward user stats
            if (isFirstReactionOnCard) {
                addReaction();
            }
        } catch (error) {
            console.error(
                "Reaction error:",
                error
            );
        }
    };

    // =========================
    // SEND REPLY
    // =========================

    const sendReply = async () => {
        const trimmedText = replyText.trim();

        if (!trimmedText) {
            return;
        }

        if (!isLoggedIn) {
            alert("Please log in to reply.");
            return;
        }

        if (
            !item._id ||
            item._id.startsWith("default-")
        ) {
            console.log(
                "This is a default card, not stored in MongoDB."
            );
            return;
        }

        setSendingReply(true);
        setReplyError("");

        try {
            const response = await fetch(
                `http://localhost:5000/api/compliments/${item._id}/reply`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        text: trimmedText,

                        // Person sending the reply
                        repliedBy: User?._id || null,

                        // If replying to a specific person,
                        // use that person. Otherwise reply
                        // to the original compliment creator.
                        repliedTo:
                            replyingTo ||
                            item.createdBy ||
                            null,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to send reply"
                );
            }

            /*
             * Backend may return:
             *
             * data.reply
             * data.replies
             * data.compliment.replies
             *
             * We support all three.
             */

            let newReplies = null;

            if (
                data.compliment &&
                Array.isArray(
                    data.compliment.replies
                )
            ) {
                newReplies =
                    data.compliment.replies;
            } else if (
                Array.isArray(data.replies)
            ) {
                newReplies = data.replies;
            } else if (data.reply) {
                newReplies = [
                    ...localReplies,
                    data.reply,
                ];
            }

            /*
             * If backend doesn't return the complete
             * reply, create a temporary local version
             * so the reply appears immediately.
             */
            if (!newReplies) {
                const temporaryReply = {
                    _id: `temp-${Date.now()}`,
                    text: trimmedText,
                    repliedBy:
                        User?._id || null,
                    repliedTo:
                        replyingTo ||
                        item.createdBy ||
                        null,
                    createdAt:
                        new Date().toISOString(),
                };

                newReplies = [
                    ...localReplies,
                    temporaryReply,
                ];
            }

            setLocalReplies(newReplies);

            // Clear input
            setReplyText("");

            // Clear replying-to state
            setReplyingTo(null);

            // Show success message
            setReplySent(true);

            setTimeout(() => {
                setReplySent(false);
            }, 2500);

            // Close composer
            setOpenReply(null);
        } catch (error) {
            console.error(
                "Reply error:",
                error
            );

            setReplyError(
                error.message ||
                    "Could not send reply. Please try again."
            );
        } finally {
            setSendingReply(false);
        }
    };

    // =========================
    // REPORT
    // =========================

    const confirmReport = () => {
        setReported(true);
        setShowReportModal(false);
    };

    // =========================
    // TIME
    // =========================

    const displayTime =
        item.time ||
        (item.createdAt
            ? new Date(
                  item.createdAt
              ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
              })
            : "");

    // =========================
    // TOGGLE REPLY BOX
    // =========================

    const toggleReplyBox = () => {
        if (openReply === index) {
            setOpenReply(null);
            setReplyingTo(null);
            setReplyText("");
            setReplyError("");
        } else {
            setOpenReply(index);
            setReplyError("");
        }
    };

    // =========================
    // REPLY TO SPECIFIC PERSON
    // =========================

    const handleReplyToPerson = (reply) => {
        if (!reply.repliedBy) {
            return;
        }

        setReplyingTo(reply.repliedBy);
        setOpenReply(index);
        setReplyText("");
        setReplyError("");
    };

    // =========================
    // RENDER
    // =========================

    return (
        <article className="compliment-card">

            {/* =========================
                CARD HEADER
            ========================= */}

            <div className="card-top">
                <div>
                    {item.isFeatured && (
                        <div className="featured-label">
                            ⭐ FEATURED
                        </div>
                    )}

                    <div className="anonymous">
                        💙 <span>Anonymous</span>
                    </div>
                </div>

                <span className="card-emoji">
                    {item.emoji || "🌸"}
                </span>
            </div>

            {/* =========================
                TO
            ========================= */}

            <div className="card-to">
                TO: {item.to}
            </div>

            {/* =========================
                MESSAGE
            ========================= */}

            <p className="card-message">
                "{item.message}"
            </p>

            {/* =========================
                DATE
            ========================= */}

            <div className="card-time">
                {displayTime}
            </div>

            {/* =========================
                REACTIONS
            ========================= */}

            <div className="reaction-row">
                {reactionList.map((reaction) => (
                    <ReactionButton
                        key={reaction.name}
                        emoji={reaction.emoji}
                        count={
                            reactions[
                                reaction.name
                            ]
                        }
                        selected={
                            selectedReaction ===
                            reaction.name
                        }
                        onClick={() =>
                            handleReaction(
                                reaction.name
                            )
                        }
                    />
                ))}

                <button
                    type="button"
                    className="report-btn"
                    onClick={() =>
                        setShowReportModal(true)
                    }
                    disabled={reported}
                >
                    {reported
                        ? "Reported"
                        : "Report"}
                </button>
            </div>

            {/* =========================
                DIVIDER
            ========================= */}

            <div className="card-divider"></div>

            {/* =========================
                REPLIES
            ========================= */}

            {localReplies.length > 0 && (
                <div className="replies-section">

                    <div className="replies-title">
                        <span>💌</span>

                        <span>
                            Replies
                        </span>

                        <span className="reply-count">
                            {localReplies.length}
                        </span>
                    </div>

                    <div className="replies-list">

                        {localReplies.map(
                            (
                                reply,
                                replyIndex
                            ) => (
                                <div
                                    className="reply-item"
                                    key={
                                        reply._id ||
                                        replyIndex
                                    }
                                >

                                    {/* Reply header */}
                                    <div className="reply-header">

                                        <div className="reply-user">

                                            <span className="reply-avatar">
                                                💙
                                            </span>

                                            <span>
                                                Anonymous
                                            </span>

                                        </div>

                                        {reply.createdAt && (
                                            <span className="reply-time">
                                                {new Date(
                                                    reply.createdAt
                                                ).toLocaleDateString(
                                                    "en-US",
                                                    {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    }
                                                )}
                                            </span>
                                        )}

                                    </div>

                                    {/* Reply text */}
                                    <div className="reply-message">
                                        "{reply.text}"
                                    </div>

                                    {/* Reply to this person */}
                                    {reply.repliedBy && (
                                        <button
                                            type="button"
                                            className="reply-to-btn"
                                            onClick={() =>
                                                handleReplyToPerson(
                                                    reply
                                                )
                                            }
                                        >
                                            💬 Reply
                                        </button>
                                    )}

                                </div>
                            )
                        )}

                    </div>
                </div>
            )}

            {/* =========================
                REPLY TOGGLE
            ========================= */}

            <button
                type="button"
                className={`reply-toggle ${
                    openReply === index
                        ? "reply-toggle-open"
                        : ""
                }`}
                onClick={toggleReplyBox}
            >
                <span>💬</span>

                <span>
                    Reply anonymously
                </span>

                <span className="reply-arrow">
                    {openReply === index
                        ? "▲"
                        : "▼"}
                </span>
            </button>

            {/* =========================
                REPLY COMPOSER
            ========================= */}

            {openReply === index && (
                <div className="reply-box">

                    {/* Replying to someone */}
                    {replyingTo && (
                        <div className="replying-to">

                            <div className="replying-label">
                                <span>💬</span>

                                <span>
                                    Replying to this
                                    person
                                </span>
                            </div>

                            <button
                                type="button"
                                className="cancel-reply-btn"
                                onClick={() => {
                                    setReplyingTo(
                                        null
                                    );
                                    setReplyError(
                                        ""
                                    );
                                }}
                                aria-label="Cancel reply"
                            >
                                ×
                            </button>

                        </div>
                    )}

                    {/* Input + Send */}
                    <div className="reply-input-row">

                        <div className="reply-input-wrapper">

                            <span className="reply-input-icon">
                                💬
                            </span>

                            <input
                                type="text"
                                placeholder="Write an anonymous reply..."
                                value={
                                    replyText
                                }
                                maxLength={300}
                                onChange={(e) => {
                                    setReplyText(
                                        e.target
                                            .value
                                    );
                                    setReplyError(
                                        ""
                                    );
                                }}
                                onKeyDown={(e) => {
                                    if (
                                        e.key ===
                                        "Enter"
                                    ) {
                                        e.preventDefault();

                                        if (
                                            replyText.trim() &&
                                            !sendingReply
                                        ) {
                                            sendReply();
                                        }
                                    }
                                }}
                            />

                        </div>

                        <button
                            type="button"
                            className="send-btn"
                            disabled={
                                sendingReply ||
                                !replyText.trim()
                            }
                            onClick={sendReply}
                        >
                            {sendingReply ? (
                                "Sending..."
                            ) : (
                                <>
                                    <span>
                                        Send
                                    </span>

                                    <span>
                                        ➤
                                    </span>
                                </>
                            )}
                        </button>

                    </div>

                    {/* Footer */}
                    <div className="reply-footer">

                        <span>
                            🔒 Your reply stays
                            anonymous
                        </span>

                        <span>
                            {replyText.length}
                            /300
                        </span>

                    </div>

                    {/* Error */}
                    {replyError && (
                        <div className="reply-error">
                            ⚠️ {replyError}
                        </div>
                    )}

                    {/* Success */}
                    {replySent && (
                        <div className="reply-sent-note">
                            💌 Reply sent
                            successfully!
                        </div>
                    )}

                </div>
            )}

            {/* =========================
                REPORT MODAL
            ========================= */}

            {showReportModal && (
                <div
                    className="report-overlay"
                    onClick={() =>
                        setShowReportModal(false)
                    }
                >
                    <div
                        className="report-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="report-icon">
                            🚩
                        </div>

                        <h3>
                            Report this compliment?
                        </h3>

                        <p>
                            This will flag the post
                            for review. You're
                            helping keep the wall
                            kind and safe.
                        </p>

                        <div className="report-actions">

                            <button
                                type="button"
                                className="report-cancel"
                                onClick={() =>
                                    setShowReportModal(
                                        false
                                    )
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="report-confirm"
                                onClick={
                                    confirmReport
                                }
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