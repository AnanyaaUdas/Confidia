import React, { useEffect, useState } from "react";
import ComplimentCard from "./ComplimentCard";

const Wall = () => {
    const [openReply, setOpenReply] = useState(1);
    const [replyText, setReplyText] = useState("");

    const [compliments, setCompliments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCompliments = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/compliments"
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch compliments");
                }

                const data = await response.json();

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

    return (
        <div>

            {/* =========================
                PAGE HEADER
            ========================= */}

            <section className="wall-header">
                <h1>Recent compliments</h1>

                <p>
                    A glimpse of kindness happening right now.
                </p>
            </section>


            {/* =========================
                LOADING
            ========================= */}

            {loading && (
                <p>Loading compliments...</p>
            )}


            {/* =========================
                COMPLIMENT GRID
            ========================= */}

            <section className="compliment-grid">

                {compliments.map((item, index) => (
                    <ComplimentCard
                        key={item._id}
                        item={item}
                        index={index}

                        openReply={openReply}
                        setOpenReply={setOpenReply}

                        replyText={replyText}
                        setReplyText={setReplyText}
                    />
                ))}

            </section>


            {/* =========================
                WHOLE WALL
            ========================= */}

            <div className="whole-wall">

                <button className="whole-wall-btn">
                    See the whole wall →
                </button>

            </div>

        </div>
    );
};

export default Wall;