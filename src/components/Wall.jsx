import React, { useEffect, useState } from "react";
import ComplimentCard from "./ComplimentCard";

const Wall = () => {
    // =====================================================
    // REPLY
    // =====================================================

    const [openReply, setOpenReply] = useState(null);
    const [replyText, setReplyText] = useState("");

    // =====================================================
    // COMPLIMENTS
    // =====================================================

    const [compliments, setCompliments] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    // =====================================================
    // FETCH COMPLIMENTS
    // =====================================================

    useEffect(() => {
        const fetchCompliments = async () => {
            try {
                setLoading(true);

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
    // PAGE
    // =====================================================

    return (
        <div>

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <section className="wall-header">

                <h1>
                    Recent compliments
                </h1>

                <p>
                    A glimpse of kindness
                    happening right now.
                </p>

            </section>

            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (
                <p>
                    Loading compliments...
                </p>
            )}

            {/* =================================================
                COMPLIMENT GRID
            ================================================= */}

            {!loading && (
                <section className="compliment-grid">

                    {compliments.length === 0 ? (

                        <p className="no-compliments">
                            No compliments found.
                        </p>

                    ) : (

                        compliments.map(
                            (item, index) => (

                                <ComplimentCard
                                    key={
                                        item._id
                                    }

                                    item={item}

                                    index={
                                        index
                                    }

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

                </section>
            )}

            {/* =================================================
                WHOLE WALL
            ================================================= */}

            <div className="whole-wall">

                <button
                    type="button"
                    className="whole-wall-btn"
                >
                    See the whole wall →
                </button>

            </div>

        </div>
    );
};

export default Wall;