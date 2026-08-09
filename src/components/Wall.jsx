import React, { useState } from "react";
import ComplimentCard from "./ComplimentCard";
import Profile from "./ProfilePage";

const compliments = [
  {
    featured: true,
    to: "COMPUTER SCIENCE DEPARTMENT",
    message: "Thank you for organizing amazing workshops.",
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
      "To the person who helped me carry my books yesterday, thank you. You probably don't know how much that meant.",
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

  // Which reactions the current user clicked
  const [userReactions, setUserReactions] = useState({});

  // Reaction counts for every card
  const [reactionCounts, setReactionCounts] = useState(
    compliments.map((item) => [...item.counts])
  );

  const handleReaction = (cardIndex, reactionIndex) => {
    const reactionKey = `${cardIndex}-${reactionIndex}`;

    const alreadyReacted =
      userReactions[reactionKey] === true;

    // Toggle selected state
    setUserReactions((previous) => ({
      ...previous,
      [reactionKey]: !alreadyReacted,
    }));

    // Update count
    setReactionCounts((previous) =>
      previous.map((cardCounts, index) => {
        if (index !== cardIndex) {
          return cardCounts;
        }

        return cardCounts.map((count, rIndex) => {
          if (rIndex !== reactionIndex) {
            return count;
          }

          return alreadyReacted
            ? count - 1
            : count + 1;
        });
      })
    );
  };

  return (
    <div className="wall-page">

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
          (now using the shared ComplimentCard component)
      ========================= */}

      <section className="compliment-grid">

        {compliments.map((item, index) => (
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
          KINDNESS PROFILE
      ========================= */}

     

      {/* =========================
          FIXED SHARE BUTTON
      ========================= */}

      <button className="wall-share-btn">
        ＋ Share Kindness
      </button>

    </div>
  );
};

export default Wall;