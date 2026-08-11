import React, { useState } from "react";
import ComplimentCard from "./ComplimentCard";
import useAppStore from "../store/useAppStore";

const filters = [
    { label: "Everyone", emoji: "🌸", value: "everyone" },
    { label: "Friends", emoji: "❤️", value: "friends" },
    { label: "Teachers", emoji: "👩‍🏫", value: "teacher" },
    { label: "College", emoji: "🏫", value: "college" },
    { label: "Clubs", emoji: "🎓", value: "clubs" },
];

const MainWall = () => {

    const [activeFilter, setActiveFilter] = useState("everyone");
    const [openReply, setOpenReply] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [search, setSearch] = useState("");

    const compliments = useAppStore((state) => state.compliments);
    const reactionCounts = useAppStore((state) => state.reactionCounts);
    const userReactions = useAppStore((state) => state.userReactions);
    const handleReaction = useAppStore((state) => state.handleReaction);

    // FILTER COMPLIMENTS

    const filteredCompliments = compliments
        .filter((item) =>
            activeFilter === "everyone" ? true : item.category === activeFilter
        )
        .filter((item) =>
            search.trim() === ""
                ? true
                : item.to.toLowerCase().includes(search.toLowerCase()) ||
                  item.message.toLowerCase().includes(search.toLowerCase())
        );

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
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
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

                {filteredCompliments.length === 0 && (
                    <p style={{ color: "#9993ad", padding: "20px 4px" }}>
                        No compliments match that search yet.
                    </p>
                )}

                {filteredCompliments.map((item) => (

                    <ComplimentCard
                        key={item.id}

                        item={item}

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

                ))}

            </div>

        </section>
    );
};

export default MainWall;
