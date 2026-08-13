import React, { useState, useEffect } from "react";
import ComplimentCard from "./ComplimentCard";

const compliments = [
  {
    _id: "default-1",
    isFeatured: true,
    to: "COMPUTER SCIENCE DEPARTMENT",
    message: "Thank you for organizing amazing workshops.",
    time: "3h ago",
    reactions: {
      heart: 28,
      smile: 16,
      clap: 4,
    },
    emoji: "🌞",
  },

  {
    _id: "default-2",
    to: "LIBRARY STAFF",
    message:
      "Shoutout to the library staff for always being kind, even five minutes before closing.",
    time: "9h ago",
    reactions: {
      heart: 19,
      smile: 12,
      clap: 1,
    },
    emoji: "😊",
  },

  {
    _id: "default-3",
    to: "PROF. FROM SEM 3 MATHS",
    message:
      "You explained the same doubt four times without making me feel stupid. Thank you.",
    time: "20h ago",
    reactions: {
      heart: 63,
      smile: 22,
      clap: 9,
    },
    emoji: "👏",
  },

  {
    _id: "default-4",
    to: "A STRANGER IN THE CORRIDOR",
    message:
      "To the person who helped me carry my books yesterday, thank you.",
    time: "6h ago",
    reactions: {
      heart: 54,
      smile: 31,
      clap: 2,
    },
    emoji: "💙",
  },

  {
    _id: "default-5",
    to: "WHOEVER FOUND MY WALLET",
    message:
      "To whoever returned my lost wallet, you're amazing.",
    time: "12h ago",
    reactions: {
      heart: 87,
      smile: 40,
      clap: 6,
    },
    emoji: "😊",
  },

  {
    _id: "default-6",
    to: "DRAMA CLUB",
    message:
      "Your last play made me cry in the best way. Please never stop.",
    time: "1d ago",
    reactions: {
      heart: 31,
      smile: 18,
      clap: 5,
    },
    emoji: "🌞",
  },
];

const Wall = () => {

  const [openReply, setOpenReply] = useState(1);
  const [replyText, setReplyText] = useState("");

  const [backendCompliments, setBackendCompliments] =
    useState([]);

  const [loading, setLoading] = useState(true);

  // =========================
  // GET COMPLIMENTS FROM BACKEND
  // =========================

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

        setBackendCompliments(data);

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

  // =========================
  // COMBINE BACKEND + DEFAULT
  // =========================

  const allCompliments = [
    ...backendCompliments,
    ...compliments,
  ];

  return (
    <div>

      {/* =========================
          PAGE HEADER
      ========================= */}

      <section className="wall-header">

        <h1>
          Recent compliments
        </h1>

        <p>
          A glimpse of kindness happening right now.
        </p>

      </section>


      {/* =========================
          LOADING
      ========================= */}

      {loading && (
        <p>
          Loading compliments...
        </p>
      )}


      {/* =========================
          COMPLIMENT GRID
      ========================= */}

      <section className="compliment-grid">

        {allCompliments.map((item, index) => (

          <ComplimentCard

            key={item._id || index}

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