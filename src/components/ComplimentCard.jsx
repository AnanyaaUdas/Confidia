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

    // =====================================================
    // NOTIFICATION PROPS
    // =====================================================

    highlighted = false,
    highlightedReplyId = null,
    notificationType = null,
}) => {
    // =====================================================
    // REPORT
    // =====================================================

    const [showReportModal, setShowReportModal] = useState(false);
    const [reported, setReported] = useState(false);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportSuccess, setReportSuccess] = useState(false);
    const [reportError, setReportError] = useState("");

    // =====================================================
    // REACTIONS
    // =====================================================

    const [reactions, setReactions] = useState({
        heart: item.reactions?.heart || 0,
        smile: item.reactions?.smile || 0,
        clap: item.reactions?.clap || 0,
    });

    const [selectedReaction, setSelectedReaction] = useState(null);

    const addReaction = useAppStore(
        (state) => state.addReaction
    );

    const User = useAppStore(
        (state) => state.User
    );

    const isLoggedIn = useAppStore(
        (state) => state.isLoggedIn
    );

    // =====================================================
    // REPLIES
    // =====================================================

    const [localReplies, setLocalReplies] = useState(
        item.replies || []
    );

    const [sendingReply, setSendingReply] = useState(false);
    const [replySent, setReplySent] = useState(false);
    const [replyError, setReplyError] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);

    // =====================================================
    // SYNC REPLIES
    // =====================================================

    useEffect(() => {
        setLocalReplies(item.replies || []);
    }, [item.replies]);

    // =====================================================
    // SYNC REACTIONS
    // =====================================================

    useEffect(() => {
        setReactions({
            heart: item.reactions?.heart || 0,
            smile: item.reactions?.smile || 0,
            clap: item.reactions?.clap || 0,
        });
    }, [item.reactions]);

    // =====================================================
    // NOTIFICATION HIGHLIGHT
    // =====================================================

    useEffect(() => {
        if (highlighted) {
            console.log(
                "🌟 HIGHLIGHTING CARD:",
                item._id
            );
        }

        if (highlightedReplyId) {
            console.log(
                "💌 HIGHLIGHTING REPLY:",
                highlightedReplyId
            );
        }
    }, [
        highlighted,
        highlightedReplyId,
        item._id,
    ]);

    // =====================================================
    // REACTION LIST
    // =====================================================

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

    // =====================================================
    // ADD REACTION
    // =====================================================

    const handleReaction = async (reactionName) => {
        if (selectedReaction === reactionName) {
            return;
        }

        const isFirstReactionOnCard =
            selectedReaction === null;

        if (
            !item._id ||
            String(item._id).startsWith("default-")
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
                        "Content-Type":
                            "application/json",
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

    // =====================================================
    // SEND REPLY
    // =====================================================

    const sendReply = async () => {
        const trimmedText = replyText.trim();

        if (!trimmedText) {
            return;
        }

        if (!isLoggedIn) {
            setReplyError(
                "Please log in to reply."
            );
            return;
        }

        if (
            !item._id ||
            String(item._id).startsWith("default-")
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
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        text: trimmedText,
                        repliedBy:
                            User?._id || null,
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
            setReplyText("");
            setReplyingTo(null);
            setReplySent(true);

            setTimeout(() => {
                setReplySent(false);
            }, 2500);

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

    // =====================================================
    // OPEN REPORT MODAL
    // =====================================================

    const openReportModal = () => {
        if (reported) {
            return;
        }

        setReportError("");
        setShowReportModal(true);
    };

    // =====================================================
    // CONFIRM REPORT
    // =====================================================

    const confirmReport = async () => {
        if (!item?._id) {
            setReportError(
                "Cannot report this compliment because it has no ID."
            );
            return;
        }

        if (
            String(item._id).startsWith("default-")
        ) {
            setReportError(
                "This compliment cannot be reported because it is not stored in the database."
            );
            return;
        }

        setReportLoading(true);
        setReportError("");

        try {
            const response = await fetch(
                "http://localhost:5000/api/reports",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        complimentId: item._id,
                        reportedBy:
                            User?._id || null,
                        reason:
                            "Reported by user",
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to report compliment"
                );
            }

            // Report successfully saved
            setReported(true);

            // Close confirmation modal
            setShowReportModal(false);

            // Open success popup
            setReportSuccess(true);

            // Automatically close success popup
            setTimeout(() => {
                setReportSuccess(false);
            }, 3000);
        } catch (error) {
            console.error(
                "Report error:",
                error
            );

            setReportError(
                error.message ||
                    "Could not report compliment. Please try again."
            );
        } finally {
            setReportLoading(false);
        }
    };

    // =====================================================
    // TIME
    // =====================================================

    const displayTime =
        item.time ||
        (item.createdAt
            ? new Date(
                  item.createdAt
              ).toLocaleDateString(
                  "en-US",
                  {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                  }
              )
            : "");

    // =====================================================
    // TOGGLE REPLY BOX
    // =====================================================

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

    // =====================================================
    // REPLY TO PERSON
    // =====================================================

    const handleReplyToPerson = (reply) => {
        if (!reply.repliedBy) {
            return;
        }

        setReplyingTo(reply.repliedBy);
        setOpenReply(index);
        setReplyText("");
        setReplyError("");
    };

    // =====================================================
    // CARD STYLE
    // =====================================================

    const notificationCardStyle = highlighted
        ? {
              border:
                  "3px solid #7c3aed",
              boxShadow:
                  "0 0 0 5px rgba(124, 58, 237, 0.18), 0 12px 35px rgba(124, 58, 237, 0.30)",
              transform:
                  "scale(1.015)",
              transition:
                  "all 0.3s ease",
              position:
                  "relative",
              zIndex: 10,
          }
        : {};

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <article
            id={`compliment-${item._id}`}
            className={`compliment-card ${
                highlighted
                    ? "notification-highlight"
                    : ""
            }`}
            style={notificationCardStyle}
        >
            {/* =================================================
                NOTIFICATION LABEL
            ================================================= */}

            {highlighted && (
                <div
                    style={{
                        position: "absolute",
                        top: "-14px",
                        left: "20px",
                        background: "#7c3aed",
                        color: "white",
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: "700",
                        zIndex: 20,
                        boxShadow:
                            "0 4px 12px rgba(0,0,0,0.2)",
                    }}
                >
                    {notificationType ===
                    "reply"
                        ? "💌 Your notification"
                        : "🔔 Your notification"}
                </div>
            )}

            {/* =================================================
                CARD HEADER
            ================================================= */}

            <div className="card-top">
                <div>
                    {item.isFeatured && (
                        <div className="featured-label">
                            ⭐ FEATURED
                        </div>
                    )}

                    <div className="anonymous">
                        💙{" "}
                        <span>
                            Anonymous
                        </span>
                    </div>
                </div>

                <span className="card-emoji">
                    {item.emoji || "🌸"}
                </span>
            </div>

            {/* =================================================
                TO
            ================================================= */}

            <div className="card-to">
                TO: {item.to}
            </div>

            {/* =================================================
                MESSAGE
            ================================================= */}

            <p className="card-message">
                "{item.message}"
            </p>

            {/* =================================================
                DATE
            ================================================= */}

            <div className="card-time">
                {displayTime}
            </div>

            {/* =================================================
                REACTIONS
            ================================================= */}

            <div className="reaction-row">
                {reactionList.map(
                    (reaction) => (
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
                    )
                )}

                {/* REPORT BUTTON */}

                <button
                    type="button"
                    className="report-btn"
                    onClick={openReportModal}
                    disabled={reported}
                >
                    {reported
                        ? "Reported"
                        : "Report"}
                </button>
            </div>

            <div className="card-divider" />

            {/* =================================================
                REPLIES
            ================================================= */}

            {localReplies.length > 0 && (
                <div className="replies-section">
                    <div className="replies-title">
                        <span>💌</span>

                        <span>
                            Replies
                        </span>

                        <span className="reply-count">
                            {
                                localReplies.length
                            }
                        </span>
                    </div>

                    <div className="replies-list">
                        {localReplies.map(
                            (
                                reply,
                                replyIndex
                            ) => {
                                const isHighlightedReply =
                                    highlightedReplyId &&
                                    String(
                                        reply._id
                                    ) ===
                                        String(
                                            highlightedReplyId
                                        );

                                return (
                                    <div
                                        id={
                                            reply._id
                                                ? `reply-${reply._id}`
                                                : undefined
                                        }
                                        className={`reply-item ${
                                            isHighlightedReply
                                                ? "notification-reply-highlight"
                                                : ""
                                        }`}
                                        style={
                                            isHighlightedReply
                                                ? {
                                                      border:
                                                          "2px solid #ec4899",
                                                      background:
                                                          "rgba(236, 72, 153, 0.10)",
                                                      boxShadow:
                                                          "0 0 0 4px rgba(236, 72, 153, 0.12)",
                                                      transition:
                                                          "all 0.3s ease",
                                                  }
                                                : {}
                                        }
                                        key={
                                            reply._id ||
                                            replyIndex
                                        }
                                    >
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

                                        <div className="reply-message">
                                            "{reply.text}"
                                        </div>

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
                                );
                            }
                        )}
                    </div>
                </div>
            )}

            {/* =================================================
                REPLY TOGGLE
            ================================================= */}

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

            {/* =================================================
                REPLY BOX
            ================================================= */}

            {openReply === index && (
                <div className="reply-box">
                    {replyingTo && (
                        <div className="replying-to">
                            <div className="replying-label">
                                <span>💬</span>

                                <span>
                                    Replying
                                    to this
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
                                        e.target.value
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
                            onClick={
                                sendReply
                            }
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

                    <div className="reply-footer">
                        <span>
                            🔒 Your reply
                            stays
                            anonymous
                        </span>

                        <span>
                            {
                                replyText.length
                            }
                            /300
                        </span>
                    </div>

                    {replyError && (
                        <div className="reply-error">
                            ⚠️{" "}
                            {replyError}
                        </div>
                    )}

                    {replySent && (
                        <div className="reply-sent-note">
                            💌 Reply sent
                            successfully!
                        </div>
                    )}
                </div>
            )}

            {/* =================================================
                REPORT CONFIRMATION MODAL
            ================================================= */}

            {showReportModal && (
                <div
                    className="report-overlay"
                    onClick={() =>
                        !reportLoading &&
                        setShowReportModal(
                            false
                        )
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
                            Report this
                            compliment?
                        </h3>

                        <p>
                            This will flag
                            the post for
                            review. You're
                            helping keep
                            the wall kind
                            and safe.
                        </p>

                        {reportError && (
                            <div
                                style={{
                                    color: "#dc2626",
                                    background:
                                        "#fee2e2",
                                    padding:
                                        "10px 12px",
                                    borderRadius:
                                        "8px",
                                    marginBottom:
                                        "15px",
                                    fontSize:
                                        "14px",
                                }}
                            >
                                ⚠️{" "}
                                {reportError}
                            </div>
                        )}

                        <div className="report-actions">
                            <button
                                type="button"
                                className="report-cancel"
                                disabled={
                                    reportLoading
                                }
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
                                disabled={
                                    reportLoading
                                }
                                onClick={
                                    confirmReport
                                }
                            >
                                {reportLoading
                                    ? "Reporting..."
                                    : "Yes, Report"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =================================================
                REPORT SUCCESS POPUP
            ================================================= */}

            {reportSuccess && (
                <div
                    className="report-overlay"
                    onClick={() =>
                        setReportSuccess(
                            false
                        )
                    }
                >
                    <div
                        className="report-success-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >
                        <div className="success-icon">
                            ✓
                        </div>

                        <h3>
                            Report submitted
                        </h3>

                        <p>
                            Thank you for
                            helping keep
                            Confidia kind
                            and safe. The
                            compliment has
                            been sent to
                            the admin for
                            review.
                        </p>

                        <button
                            type="button"
                            className="success-close-btn"
                            onClick={() =>
                                setReportSuccess(
                                    false
                                )
                            }
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </article>
    );
};

export default ComplimentCard;