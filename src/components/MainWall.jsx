import React, { useEffect, useState } from "react";
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

const MainWall = () => {

    // =========================
    // FILTER
    // =========================

    const [activeFilter, setActiveFilter] =
        useState("everyone");


    // =========================
    // REPLY
    // =========================

    const [openReply, setOpenReply] =
        useState(null);

    const [replyText, setReplyText] =
        useState("");


    // =========================
    // COMPLIMENTS
    // =========================

    const [compliments, setCompliments] =
        useState([]);

    const [loading, setLoading] =
        useState(true);
    const [searchKeyword,setSearchKeyword] = useState("");


    // =========================
    // GET COMPLIMENTS
    // FROM BACKEND
    // =========================

    useEffect(() => {

        const fetchCompliments = async () => {

            try {

                const response = await fetch(
                    "http://localhost:5000/api/compliments"
                );

                if (!response.ok) {
                    throw new Error(
                        "Failed to fetch compliments"
                    );
                }

                const data =
                    await response.json();

                setCompliments(data);

            } catch (error) {

                console.error(
                    "Failed to fetch compliments:",
                    error
                );

            } finally {

                setLoading(false);

            }
        };

        fetchCompliments();

    }, []);
    const handleSearch = async(keyword) => {
        setSearchKeyword(keyword);
        try{
            const response = await fetch(
                `http://localhost:5000/api/compliments/search?keyword=${encodeURIComponent(keyword)}`
            );
            if (!response.ok) {
                throw new Error("Failed to search compliments");
            }
            const data = await response.json();
            setCompliments(data);
        } catch (error){
            console.error("search failed",error);
        }
    }


    // =========================
    // FILTER COMPLIMENTS
    // =========================

    const filteredCompliments =
        activeFilter === "everyone"
            ? compliments
            : compliments.filter(
                (item) =>
                    item.category?.toLowerCase() ===
                    activeFilter
            );


    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (
            <section className="wall-page">

                <div className="wall-header">

                    <h1>
                        Recent compliments
                    </h1>

                    <p>
                        Loading compliments...
                    </p>

                </div>

            </section>
        );
    }


    // =========================
    // PAGE
    // =========================

    return (

        <section className="wall-page">

            {/* =========================
                HEADER
            ========================= */}

            <div className="wall-header">

                <h1>
                    Recent compliments
                </h1>

                <p>
                    Browse by who made your day.
                </p>

            </div>


            {/* =========================
                SEARCH
            ========================= */}

            <div className="wall-search">

                <span>
                    🔍
                </span>

                <input
                    type="text"
                    placeholder='Search "Computer Department"...'
                    value={searchKeyword}
                    onChange={(e)=> handleSearch(e.target.value)}
                />

            </div>


            {/* =========================
                FILTERS
            ========================= */}

            <div className="filter-row">

                {filters.map((filter) => (

                    <button
                        key={filter.value}
                        type="button"

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


            {/* =========================
                COMPLIMENT CARDS
            ========================= */}

            <div className="compliment-grid">

                {filteredCompliments.length === 0 ? (

                    <p className="no-compliments">
                        No compliments found.
                    </p>

                ) : (

                    filteredCompliments.map(
                        (item, index) => (

                            <ComplimentCard
                                key={item._id}
                                item={item}
                                index={index}

                                openReply={
                                    openReply
                                }

                                setOpenReply={
                                    setOpenReply
                                }

                                replyText={
                                    replyText
                                }

                                setReplyText={
                                    setReplyText
                                }
                            />

                        )
                    )

                )}

            </div>

        </section>
    );
};

export default MainWall;