import React, { useState } from "react";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";
import "../style/Write.css";
import useAppStore from "../store/useAppStore";

const prompts = [
    "Thank someone who helped you this week.",
    "Compliment someone who made your day better.",
    "Thank a teacher who inspired you.",
    "Appreciate someone who always makes people smile.",
    "Write something kind to someone who deserves to hear it.",
];

const categories = [
    {
        label: "Everyone",
        icon: "🌸",
        value: "everyone",
    },
    {
        label: "Friends",
        icon: "💗",
        value: "friends",
    },
    {
        label: "Teachers",
        icon: "🧑‍🏫",
        value: "teacher",
    },
    {
        label: "College",
        icon: "🏫",
        value: "college",
    },
    {
        label: "Clubs",
        icon: "🎓",
        value: "clubs",
    },
];

const moods = [
    {
        label: "Grateful",
        icon: "🥰",
    },
    {
        label: "Happy",
        icon: "😊",
    },
    {
        label: "Inspired",
        icon: "🌟",
    },
    {
        label: "Proud",
        icon: "👏",
    },
    {
        label: "Appreciative",
        icon: "💙",
    },
];

const Write = () => {

    // =========================
    // FORM STATES
    // =========================

    const [recipient, setRecipient] = useState("");
    const [message, setMessage] = useState("");

    // IMPORTANT:
    // Store the filter value, not the label
    const [category, setCategory] =
        useState("everyone");

    const [mood, setMood] =
        useState("Grateful");

    const [prompt, setPrompt] =
        useState(prompts[0]);

    const [submitted, setSubmitted] =
        useState(false);


    // =========================
    // ZUSTAND
    // =========================

    const addCompliment = useAppStore(
        (state) => state.addCompliment
    );


    // =========================
    // RANDOM PROMPT
    // =========================

    const spinWheel = () => {

        const randomIndex = Math.floor(
            Math.random() * prompts.length
        );

        setPrompt(
            prompts[randomIndex]
        );
    };


    // =========================
    // SUBMIT
    // =========================

    const handleSubmit = (e) => {

        e.preventDefault();

        // Check required fields
        if (
            !recipient.trim() ||
            !message.trim()
        ) {
            alert(
                "Please enter a recipient and a compliment."
            );

            return;
        }


        // =========================
        // CREATE COMPLIMENT
        // =========================

        const compliment = {

            to: recipient.trim(),

            message: message.trim(),

            // This will now be:
            // everyone / friends / teacher / college / clubs
            category: category,

            mood: mood,

            createdAt:
                new Date().toISOString(),

            time: "Just now",

            reactions: [
                "❤️",
                "😊",
                "👏",
            ],

            counts: [
                0,
                0,
                0,
            ],

            emoji: "💗",
        };


        // =========================
        // ADD TO ZUSTAND
        // =========================

        addCompliment(
            compliment
        );


        // =========================
        // LOCAL STORAGE
        // =========================

        const savedCompliments =
            JSON.parse(
                localStorage.getItem(
                    "confidiaCompliments"
                )
            ) || [];


        localStorage.setItem(
            "confidiaCompliments",
            JSON.stringify([
                ...savedCompliments,
                compliment,
            ])
        );


        // =========================
        // SUCCESS
        // =========================

        setSubmitted(true);


        // Clear form
        setRecipient("");

        setMessage("");

        setCategory(
            "everyone"
        );

        setMood(
            "Grateful"
        );


        // Hide success message
        setTimeout(() => {

            setSubmitted(false);

        }, 3000);
    };


    return (
        <>

            {/* =========================
                NAVBAR
            ========================= */}

            <NavBar />


            {/* =========================
                MAIN WRITE PAGE
            ========================= */}

            <main className="write-page">


                {/* =========================
                    INTRO
                ========================= */}

                <div className="write-intro">

                    <h1>
                        Write a compliment
                    </h1>

                    <p>
                        Nobody will ever see your name.
                        Only the messages pass moderation.
                    </p>

                </div>


                {/* =========================
                    WRITE LAYOUT
                ========================= */}

                <section className="write-layout">


                    {/* =========================
                        LEFT SIDE
                    ========================= */}

                    <div className="write-left">


                        {/* RANDOM PROMPT */}

                        <div className="kindness-prompt">

                            <p>
                                <b>
                                    🎯 RANDOM KINDNESS PROMPT
                                </b>
                            </p>

                            <h2>
                                {prompt}
                            </h2>

                            <button
                                type="button"
                                className="wheel-button"
                                onClick={spinWheel}
                            >
                                🎲 Spin the Kindness Wheel
                            </button>

                        </div>


                        {/* INFO CARDS */}

                        <div className="info-cards">


                            {/* SECRET REPLY */}

                            <div className="info-card">

                                <div className="info-icon">
                                    💌
                                </div>

                                <h3>
                                    Secret reply
                                </h3>

                                <p>
                                    Recipients can post an
                                    anonymous thank-you
                                    underneath.
                                </p>

                            </div>


                            {/* MODERATION */}

                            <div className="info-card">

                                <div className="info-icon">
                                    🚨
                                </div>

                                <h3>
                                    Gentle moderation
                                </h3>

                                <p>
                                    Report a post and an admin
                                    reviews it — kindness stays
                                    kind.
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* =========================
                        FORM
                    ======================== */}

                    <form
                        className="confession-form"
                        onSubmit={handleSubmit}
                    >


                        {/* =========================
                            RECIPIENT
                        ========================= */}

                        <div className="form-group">

                            <h4>
                                Recipient
                            </h4>

                            <span>
                                To:
                            </span>

                            <input
                                type="text"
                                value={recipient}
                                onChange={(e) =>
                                    setRecipient(
                                        e.target.value
                                    )
                                }
                                placeholder="A stranger in the corridor, Prof. Sharma, Drama Club..."
                            />

                        </div>


                        {/* =========================
                            CATEGORY
                        ========================= */}

                        <div className="form-group">

                            <h4>
                                Category
                            </h4>

                            <p className="form-category">
                                Where should this show up
                                on the wall?
                            </p>


                            <div className="option-list">

                                {categories.map(
                                    (item) => (

                                        <button
                                            type="button"
                                            key={item.value}
                                            className={`option-button ${
                                                category ===
                                                item.value
                                                    ? "selected"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setCategory(
                                                    item.value
                                                )
                                            }
                                        >

                                            <span>
                                                {item.icon}
                                            </span>

                                            {item.label}

                                        </button>

                                    )
                                )}

                            </div>

                        </div>


                        {/* =========================
                            MESSAGE
                        ========================= */}

                        <div className="form-group">

                            <h4>
                                Message
                            </h4>

                            <textarea
                                value={message}
                                onChange={(e) =>
                                    setMessage(
                                        e.target.value
                                    )
                                }
                                placeholder="To the person who helped me carry my books yesterday..."
                                maxLength={240}
                            />

                            <div className="character-count">
                                {message.length}/240
                            </div>

                        </div>


                        {/* =========================
                            MOOD
                        ========================= */}

                        <div className="form-group">

                            <h4>
                                Mood
                            </h4>

                            <div className="option-list">

                                {moods.map(
                                    (item) => (

                                        <button
                                            type="button"
                                            key={item.label}
                                            className={`option-button ${
                                                mood ===
                                                item.label
                                                    ? "selected"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setMood(
                                                    item.label
                                                )
                                            }
                                        >

                                            <span>
                                                {item.icon}
                                            </span>

                                            {item.label}

                                        </button>

                                    )
                                )}

                            </div>

                        </div>


                        {/*
                            SUBMIT
                         */}

                        <button
                            type="submit"
                            className="anonymous-button"
                        >
                            Post anonymously 💌
                        </button>


                        {/* PRIVACY */}

                        <p className="privacy-note">
                            Your post stays anonymous.
                            It's saved locally in your
                            browser for this demo.
                        </p>


                        {/* SUCCESS */}

                        {submitted && (

                            <div className="success-message">

                                💗 Your kindness has been
                                posted anonymously!

                            </div>

                        )}

                    </form>

                </section>

            </main>


            {/* =========================
                FOOTER
            ========================= */}

            <Footer />

        </>
    );
};

export default Write;