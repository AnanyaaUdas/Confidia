import React, {
    useEffect,
    useState,
    useRef,
} from "react";

import { useSearchParams } from "react-router-dom";

import ComplimentCard from "./ComplimentCard";

const API_BASE = "http://localhost:5000/api/compliments";

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
    // =====================================================
    // URL PARAMETERS
    // =====================================================

    const [searchParams, setSearchParams] =
        useSearchParams();

    const notificationComplimentId =
        searchParams.get("complimentId");

    const notificationReplyId =
        searchParams.get("replyId");

    const notificationType =
        searchParams.get("type");

    // =====================================================
    // REPLY
    // =====================================================

    const [openReply, setOpenReply] =
        useState(null);

    const [replyText, setReplyText] =
        useState("");

    // =====================================================
    // COMPLIMENTS
    // =====================================================

    const [compliments, setCompliments] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [searchKeyword, setSearchKeyword] =
        useState("");

    // =====================================================
    // FILTER
    // =====================================================

    const [activeFilter, setActiveFilter] =
        useState("everyone");

    // =====================================================
    // NOTIFICATION HIGHLIGHT
    // =====================================================

    const [highlightedComplimentId, setHighlightedComplimentId] =
        useState(null);

    const [highlightedReplyId, setHighlightedReplyId] =
        useState(null);

    // Prevent notification from being processed
    // multiple times.
    const notificationHandledRef =
        useRef(false);

    // =====================================================
    // GET ALL COMPLIMENTS
    // =====================================================

    useEffect(() => {
        const fetchCompliments = async () => {
            try {
                setLoading(true);

                const response = await fetch(
                    API_BASE
                );

                if (!response.ok) {
                    throw new Error(
                        "Failed to fetch compliments"
                    );
                }

                const data =
                    await response.json();

                setCompliments(
                    Array.isArray(data)
                        ? data
                        : []
                );
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

    // =====================================================
    // SEARCH
    // =====================================================

    const handleSearch = async (
        keyword
    ) => {
        setSearchKeyword(keyword);

        try {
            const trimmedKeyword =
                keyword.trim();

            const url =
                trimmedKeyword === ""
                    ? API_BASE
                    : `${API_BASE}/search?keyword=${encodeURIComponent(
                          trimmedKeyword
                      )}`;

            const response =
                await fetch(url);

            if (!response.ok) {
                throw new Error(
                    "Failed to search compliments"
                );
            }

            const data =
                await response.json();

            setCompliments(
                Array.isArray(data)
                    ? data
                    : []
            );
        } catch (error) {
            console.error(
                "Search failed:",
                error
            );
        }
    };

    // =====================================================
    // FILTERED COMPLIMENTS
    // =====================================================

    const filteredCompliments =
        activeFilter === "everyone"
            ? compliments
            : compliments.filter(
                  (item) =>
                      item.category
                          ?.toLowerCase() ===
                      activeFilter.toLowerCase()
              );

    // =====================================================
    // HANDLE NOTIFICATION TARGET
    // =====================================================
    //
    // First we find the card.
    // Then we switch to Everyone.
    // Then we set the highlight.
    //
    // The actual scrolling happens in the
    // next useEffect AFTER the card is rendered.
    //
    // =====================================================

    useEffect(() => {
        if (
            loading ||
            !notificationComplimentId ||
            compliments.length === 0
        ) {
            return;
        }

        // Prevent processing the same notification
        // repeatedly.
        if (
            notificationHandledRef.current
        ) {
            return;
        }

        const targetCompliment =
            compliments.find(
                (item) =>
                    String(item._id) ===
                    String(
                        notificationComplimentId
                    )
            );

        if (!targetCompliment) {
            console.warn(
                "❌ Notification compliment not found:",
                notificationComplimentId
            );

            console.log(
                "Available compliment IDs:",
                compliments.map(
                    (item) => item._id
                )
            );

            return;
        }

        console.log(
            "✅ Notification compliment found:",
            targetCompliment
        );

        notificationHandledRef.current =
            true;

        // -------------------------------------------------
        // ALWAYS SHOW THE CARD
        // -------------------------------------------------

        setActiveFilter("everyone");

        // -------------------------------------------------
        // HIGHLIGHT CARD
        // -------------------------------------------------

        setHighlightedComplimentId(
            String(
                targetCompliment._id
            )
        );

        // -------------------------------------------------
        // HIGHLIGHT REPLY IF THERE IS ONE
        // -------------------------------------------------

        if (notificationReplyId) {
            setHighlightedReplyId(
                String(
                    notificationReplyId
                )
            );
        } else {
            setHighlightedReplyId(null);
        }

        // -------------------------------------------------
        // FIND CARD INDEX AFTER FILTERING
        // -------------------------------------------------

        const targetIndex =
            compliments.findIndex(
                (item) =>
                    String(item._id) ===
                    String(
                        notificationComplimentId
                    )
            );

        if (targetIndex !== -1) {
            setOpenReply(targetIndex);
        }

        // -------------------------------------------------
        // CLEAR URL
        // -------------------------------------------------

        setTimeout(() => {
            setSearchParams({});
        }, 1200);

        // -------------------------------------------------
        // REMOVE HIGHLIGHT AFTER 5 SECONDS
        // -------------------------------------------------

        const highlightTimer =
            setTimeout(() => {
                setHighlightedComplimentId(
                    null
                );

                setHighlightedReplyId(
                    null
                );
            }, 5000);

        return () => {
            clearTimeout(
                highlightTimer
            );
        };
    }, [
        loading,
        compliments,
        notificationComplimentId,
        notificationReplyId,
        setSearchParams,
    ]);

    // =====================================================
    // SCROLL TO HIGHLIGHTED CARD
    // =====================================================
    //
    // THIS IS THE IMPORTANT PART.
    //
    // We wait until React has actually rendered
    // ComplimentCard before trying to find it.
    //
    // =====================================================

    useEffect(() => {
        if (
            !highlightedComplimentId
        ) {
            return;
        }

        const scrollToCard = () => {
            const cardElement =
                document.getElementById(
                    `compliment-${highlightedComplimentId}`
                );

            if (!cardElement) {
                console.log(
                    "Card not rendered yet. Trying again..."
                );

                return false;
            }

            console.log(
                "✅ Scrolling to highlighted card:",
                highlightedComplimentId
            );

            cardElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });

            return true;
        };

        // Give React time to render.
        const timer1 =
            setTimeout(() => {
                scrollToCard();
            }, 100);

        const timer2 =
            setTimeout(() => {
                scrollToCard();
            }, 400);

        const timer3 =
            setTimeout(() => {
                scrollToCard();
            }, 800);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [
        highlightedComplimentId,
        filteredCompliments.length,
    ]);

    // =====================================================
    // LOADING
    // =====================================================

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

    // =====================================================
    // PAGE
    // =====================================================

    return (
        <section className="wall-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="wall-header">
                <h1>
                    Recent compliments
                </h1>

                <p>
                    Browse by who made your day.
                </p>
            </div>

            {/* =================================================
                SEARCH
            ================================================= */}

            <div className="wall-search">
                <span>🔍</span>

                <input
                    type="text"
                    placeholder='Search "Computer Department"...'
                    value={searchKeyword}
                    onChange={(e) =>
                        handleSearch(
                            e.target.value
                        )
                    }
                />
            </div>

            {/* =================================================
                FILTERS
            ================================================= */}

            <div className="filter-row">
                {filters.map(
                    (filter) => (
                        <button
                            key={
                                filter.value
                            }
                            type="button"
                            className={
                                activeFilter ===
                                filter.value
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
                                {
                                    filter.emoji
                                }
                            </span>

                            {
                                filter.label
                            }
                        </button>
                    )
                )}
            </div>

            {/* =================================================
                COMPLIMENT CARDS
            ================================================= */}

            <div className="compliment-grid">

                {filteredCompliments.length ===
                0 ? (
                    <p className="no-compliments">
                        No compliments found.
                    </p>
                ) : (
                    filteredCompliments.map(
                        (
                            item,
                            index
                        ) => (
                            <ComplimentCard
                                key={
                                    item._id
                                }

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

                                highlighted={
                                    String(
                                        highlightedComplimentId
                                    ) ===
                                    String(
                                        item._id
                                    )
                                }

                                highlightedReplyId={
                                    String(
                                        highlightedComplimentId
                                    ) ===
                                    String(
                                        item._id
                                    )
                                        ? highlightedReplyId
                                        : null
                                }

                                notificationType={
                                    String(
                                        highlightedComplimentId
                                    ) ===
                                    String(
                                        item._id
                                    )
                                        ? notificationType
                                        : null
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