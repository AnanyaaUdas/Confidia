import React, { useState } from "react";
import ComplimentCard from "./ComplimentCard";
import useAppStore from "../store/useAppStore";

const compliments = [
  {
    featured: true,
    to: "COMPUTER SCIENCE DEPARTMENT",
    message:
      "Thank you for organizing amazing workshops.",
    time: "3h ago",
    reactions: ["❤️", "😊", "👏"],
    counts: [28, 16, 4],
    emoji: "🌞",
  },

  {
    to: "LIBRARY STAFF",
    message:
      "Shoutout to the library staff for always being kind, even five minutes before closing.",
    time: "9h ago",
    reactions: ["❤️", "😊", "👏"],
    counts: [19, 12, 1],
    emoji: "😊",
  },

  {
    to: "PROF. FROM SEM 3 MATHS",
    message:
      "You explained the same doubt four times without making me feel stupid. Thank you.",
    time: "20h ago",
    reactions: ["❤️", "😊", "👏"],
    counts: [63, 22, 9],
    emoji: "👏",
  },

  {
    to: "A STRANGER IN THE CORRIDOR",
    message:
      "To the person who helped me carry my books yesterday, thank you.",
    time: "6h ago",
    reactions: ["❤️", "😊", "👏"],
    counts: [54, 31, 2],
    emoji: "💙",
  },

  {
    to: "WHOEVER FOUND MY WALLET",
    message:
      "To whoever returned my lost wallet, you're amazing.",
    time: "12h ago",
    reactions: ["❤️", "😊", "👏"],
    counts: [87, 40, 6],
    emoji: "😊",
  },

  {
    to: "DRAMA CLUB",
    message:
      "Your last play made me cry in the best way. Please never stop.",
    time: "1d ago",
    reactions: ["❤️", "😊", "👏"],
    counts: [31, 18, 5],
    emoji: "🌞",
  },
];

const Wall = () => {
  const [openReply, setOpenReply] = useState(1);
  const [replyText, setReplyText] = useState("");

  // Zustand
  const reactionCounts = useAppStore(
    (state) => state.reactionCounts
  );

  const userReactions = useAppStore(
    (state) => state.userReactions
  );

  const handleReaction = useAppStore(
    (state) => state.handleReaction
  );

  const storedCompliments = useAppStore(
    (state) => state.compliments
  );

  // Combine default compliments + newly created compliments
  const allCompliments = [
    ...compliments,
    ...storedCompliments,
  ];

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
          COMPLIMENT GRID
      ========================= */}

      <section className="compliment-grid">

        {allCompliments.map((item, index) => (

          <ComplimentCard
            key={index}
            item={item}
            index={index}

            openReply={openReply}
            setOpenReply={setOpenReply}

            replyText={replyText}
            setReplyText={setReplyText}

            reactionCounts={reactionCounts}
            userReactions={userReactions}
            handleReaction={handleReaction}
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


      {/* =========================
          SHARE BUTTON
      ========================= */}

      <button className="wall-share-btn">
        ＋ Share Kindness
      </button>

    </div>
  );
};

export default Wall;