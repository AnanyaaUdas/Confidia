import React, { useState } from "react";
import ComplimentCard from "./ComplimentCard";

const filters = [
    {
        label: "Everyone",
        emoji: "🌸",
        value: "everyone",
    },
    {
        label: "Friends",
        emoji: "❤️",
        value: "friends",
    },
    {
        label: "Teachers",
        emoji: "👩‍🏫",
        value: "teacher",
    },
    {
        label: "College",
        emoji: "🏫",
        value: "college",
    },
    {
        label: "Clubs",
        emoji: "🎓",
        value: "clubs",
    },
];


// TEMPORARY DATA
// Later this will come from your backend

const compliments = [
    {
        featured: true,
        emoji: "🌟",
        to: "COMPUTER SCIENCE DEPARTMENT",
        message: "Thank you for organizing amazing workshops.",
        time: "1d ago",
        category: "college",

        reactions: [
            "❤️",
            "😊",
            "👏",
        ],

        counts: [28, 16, 4],
    },

    {
        featured: false,
        emoji: "😊",
        to: "WHOEVER FOUND MY WALLET",
        message: "To whoever returned my lost wallet, you're amazing.",
        time: "1d ago",
        category: "friends",

        reactions: [
            "❤️",
            "😊",
            "👏",
        ],

        counts: [87, 40, 6],
    },

    {
        featured: false,
        emoji: "💙",
        to: "THE LAB ASSISTANT",
        message: "You stayed back so we could finish our project. Quiet kindness counts the most.",
        time: "2d ago",
        category: "college",

        reactions: [
            "❤️",
            "😊",
            "👏",
        ],

        counts: [22, 9, 2],
    },

    {
        featured: false,
        emoji: "🌸",
        to: "MY BEST FRIEND",
        message: "Thank you for always listening when I need someone.",
        time: "3d ago",
        category: "friends",

        reactions: [
            "❤️",
            "😊",
            "👏",
        ],

        counts: [45, 20, 3],
    },

    {
        featured: false,
        emoji: "🎓",
        to: "DRAMA CLUB",
        message: "Your last performance was amazing. Please never stop creating.",
        time: "4d ago",
        category: "clubs",

        reactions: [
            "❤️",
            "😊",
            "👏",
        ],

        counts: [31, 18, 5],
    },

    {
        featured: false,
        emoji: "👩‍🏫",
        to: "PROF. FROM SEM 3 MATHS",
        message: "Thank you for explaining the same doubt without making me feel stupid.",
        time: "5d ago",
        category: "teacher",

        reactions: [
            "❤️",
            "😊",
            "👏",
        ],

        counts: [63, 22, 9],
    },
];


const MainWall = () => {

    const [activeFilter, setActiveFilter] =
        useState("everyone");

    const [openReply, setOpenReply] =
        useState(null);

    const [replyText, setReplyText] =
        useState("");

    const [reactionCounts, setReactionCounts] =
        useState(
            compliments.map((item) => [...item.counts])
        );

    const [userReactions, setUserReactions] =
        useState({});


    // FILTER COMPLIMENTS

    const filteredCompliments =
        activeFilter === "everyone"
            ? compliments
            : compliments.filter(
                (item) =>
                    item.category === activeFilter
            );


    // REACTION HANDLER

    const handleReaction = (
        index,
        reactionIndex
    ) => {

        const key =
            `${index}-${reactionIndex}`;

        setUserReactions((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));

        setReactionCounts((prev) => {

            const updated = [...prev];

            updated[index] = [
                ...updated[index],
            ];

            if (userReactions[key]) {
                updated[index][reactionIndex] -= 1;
            } else {
                updated[index][reactionIndex] += 1;
            }

            return updated;
        });
    };


    return (

        <section className="wall-page">

            {/* HEADER */}

            <div className="wall-header">

                <h1>
                    Recent compliments
                </h1>

                <p>
                    Browse by who made your day.
                </p>

            </div>


            {/* SEARCH */}

            <div className="wall-search">

                <span>
                    🔍
                </span>

                <input
                    type="text"
                    placeholder='Search "Computer Department"...'
                />

            </div>


            {/* FILTERS */}

            <div className="filter-row">

                {filters.map((filter) => (

                    <button
                        key={filter.value}

                        className={
                            activeFilter === filter.value
                                ? "filter-btn active"
                                : "filter-btn"
                        }

                        onClick={() =>
                            setActiveFilter(
                                filter.value
                            )
                        }
                    >

                        <span>
                            {filter.emoji}
                        </span>

                        {filter.label}

                    </button>

                ))}

            </div>


            {/* COMPLIMENT CARDS */}

            <div className="compliment-grid">

                {filteredCompliments.map(
                    (item, index) => (

                        <ComplimentCard
                            key={index}

                            item={item}

                            index={index}

                            openReply={openReply}

                            setOpenReply={setOpenReply}

                            replyText={replyText}

                            setReplyText={setReplyText}

                            reactionCounts={
                                reactionCounts
                            }

                            userReactions={
                                userReactions
                            }

                            handleReaction={
                                handleReaction
                            }
                        />

                    )
                )}

            </div>

        </section>
    );
};

export default MainWall;