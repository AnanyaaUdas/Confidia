import React, { useState } from "react";
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

    const [showReportModal, setShowReportModal] =
        useState(false);

    const [reported, setReported] =
        useState(false);


    // =========================
    // REACTIONS
    // =========================

    const [reactions, setReactions] =
        useState({
            heart: item.reactions?.heart || 0,
            smile: item.reactions?.smile || 0,
            clap: item.reactions?.clap || 0,
        });


    const [selectedReaction, setSelectedReaction] =
        useState(null);

    const addReaction = useAppStore((state) => state.addReaction);


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

    // Only the FIRST reaction on a card counts toward the
    // user's own "reactions given" stat — switching your pick
    // on the same card shouldn't inflate the count.
    const isFirstReactionOnCard = selectedReaction === null;

    // Default/demo cards don't have MongoDB IDs
    if (!item._id || item._id.startsWith("default-")) {
        console.log("This is a default card, not stored in MongoDB.");
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
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to add reaction"
            );
        }

        // Update all three counts
        setReactions({
            heart: data.reactions.heart,
            smile: data.reactions.smile,
            clap: data.reactions.clap,
        });

        setSelectedReaction(reactionName);

        if (isFirstReactionOnCard) {
            // Update the user's own stats (Campus Hero badge,
            // Kindness Streak, celebration popup, etc.)
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
        (
            item.createdAt
                ? new Date(
                    item.createdAt
                ).toLocaleDateString()
                : ""
        );


    return (

        <article className="compliment-card">

            {/* =========================
                TOP
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
                TIME
            ========================= */}

            <div className="card-time">
                {displayTime}
            </div>


            {/* =========================
                REACTIONS
            ========================= */}

            <div className="reaction-row">

                {reactionList.map(
                    (reaction) => (

                        <ReactionButton

                            key={
                                reaction.name
                            }

                            emoji={
                                reaction.emoji
                            }

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


                {/* =========================
                    REPORT
                ========================= */}

                <button
                    className="report-btn"

                    onClick={() =>
                        setShowReportModal(
                            true
                        )
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
                REPLY
            ========================= */}

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


            {/* =========================
                REPLY BOX
            ========================= */}

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

                    <button
                        className="send-btn"
                    >
                        Send
                    </button>

                </div>

            )}


            {/* =========================
                REPORT MODAL
            ========================= */}

            {showReportModal && (

                <div
                    className="report-overlay"

                    onClick={() =>
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