import React, { useState } from "react";
import { Link } from "react-router-dom";
import ComplimentCard from "./ComplimentCard";
import useAppStore from "../store/useAppStore";

const Wall = () => {
  const [openReply, setOpenReply] = useState(null);
  const [replyText, setReplyText] = useState("");

  const compliments = useAppStore((state) => state.compliments);
  const reactionCounts = useAppStore((state) => state.reactionCounts);
  const userReactions = useAppStore((state) => state.userReactions);
  const handleReaction = useAppStore((state) => state.handleReaction);

  // Just a preview on the home page — first 6 live compliments
  const preview = compliments.slice(0, 6);

  return (
    <div className="wall-page">
      {/* PAGE HEADER */}

      <section className="wall-header">
        <h1>Recent compliments</h1>

        <p>A glimpse of kindness happening right now.</p>
      </section>

      {/* COMPLIMENT GRID */}

      <section className="compliment-grid">
        {preview.map((item) => (
          <ComplimentCard
            key={item.id}
            item={item}
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

      {/* WHOLE WALL */}

      <div className="whole-wall">
        <Link to="/wall" className="whole-wall-btn">
          See the whole wall →
        </Link>
      </div>
    </div>
  );
};

export default Wall;
