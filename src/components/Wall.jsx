import React, { useState } from "react";
 
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
    replyOpen: true,
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
    message: "To whoever returned my lost wallet, you're amazing.",
    time: "12h ago",
    reactions: ["❤️", "😊", "👏"],
    counts: [87, 40, 6],
    emoji: "😊",
  },
  {
    to: "DRAMA CLUB",
    message: "Your last play made me cry in the best way. Please never stop.",
    time: "1d ago",
    reactions: ["❤️", "😊", "👏"],
    counts: [31, 18, 5],
    emoji: "🌞",
  },
];

const Wall = () => {
  const [openReply, setOpenReply] = useState(1);
  const [replyText, setReplyText] = useState("");

  return (
  <>

    <div className="wall-page">

      {/* PAGE HEADER */}
      <section className="wall-header">
        <h1>Recent compliments</h1>
        <p>A glimpse of kindness happening right now.</p>
      </section>

      {/* COMPLIMENT GRID */}
      <section className="compliment-grid">

        {compliments.map((item, index) => (
          <article className="compliment-card" key={index}>

            {/* TOP */}
            <div className="card-top">

              <div>
                {item.featured && (
                  <div className="featured-label">
                    ⭐ FEATURED
                  </div>
                )}

                <div className="anonymous">
                  💙 <span>Anonymous</span>
                </div>
              </div>

              <span className="card-emoji">
                {item.emoji}
              </span>

            </div>

            {/* TO */}
            <div className="card-to">
              TO: {item.to}
            </div>

            {/* MESSAGE */}
            <p className="card-message">
              “{item.message}”
            </p>

            {/* TIME */}
            <div className="card-time">
              {item.time}
            </div>

            {/* REACTIONS */}
            <div className="reaction-row">

              {item.reactions.map((reaction, reactionIndex) => (
                <button
                className="reaction-btn"
                key={reactionIndex}
                >
                  <span>{reaction}</span>
                  <span>{item.counts[reactionIndex]}</span>
                </button>
              ))}

              <button className="report-btn">
                Report
              </button>

            </div>

            {/* DIVIDER */}
            <div className="card-divider"></div>

            {/* REPLY */}
            <button
              className="reply-toggle"
              onClick={() =>
                setOpenReply(
                  openReply === index ? null : index
                )
              }
            >
              💬 Reply anonymously{" "}
              {openReply === index ? "▲" : "▼"}
            </button>

            {/* REPLY BOX */}
            {openReply === index && (
              <div className="reply-box">

                <input
                  type="text"
                  placeholder="Write an anonymous reply..."
                  value={replyText}
                  onChange={(e) =>
                    setReplyText(e.target.value)
                  }
                />

                <button className="send-btn">
                  Send
                </button>

              </div>
            )}

          </article>
        ))}

      </section>

      {/* SEE WHOLE WALL */}
      <div className="whole-wall">
        <button className="whole-wall-btn">
          See the whole wall →
        </button>
      </div>

      

      {/* FIXED SHARE BUTTON */}
      <button className="wall-share-btn">
        ＋ Share Kindness
      </button>

    </div>
        </>
  );
};

export default Wall;