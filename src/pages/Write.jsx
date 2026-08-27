import React, { useState } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import "../style/Write.css";
import useAppStore from "../store/useAppStore";

const prompts = [
  "Thank someone who helped you this week. 💛",
  "Compliment someone who made your day better. 😊",
  "Appreciate someone who always supports you. 🫶",
  "Thank someone who always has your back. 🤝",
  "Compliment someone who deserves to hear it. ✨",
  "Appreciate someone who brings positivity into your life. 🌟",
  "Thank someone who made you smile recently. 😄",
  "Tell someone what you admire about them. 💫",
  "Appreciate someone who always makes people feel welcome. 🫂",
  "Thank someone who believed in you. 🙏",
  "Compliment someone on their personality. 🌷",
  "Appreciate someone who makes your days brighter. ☀️",
  "Thank someone for a memory you cherish. 💖",
  "Tell someone why you’re glad to know them. 🌸",
  "Compliment someone you’ve been meaning to praise. 💌",
  "Appreciate someone who makes ordinary moments special. ✨",
  "Thank someone who is always there for you. 🤍",
  "Tell someone what makes them special. 💎",
  "Appreciate someone who brings great energy. ⚡",
  "Compliment someone who always makes you laugh. 😂",
  "Thank someone who helped you when you needed it. 🙌",
  "Encourage someone who may need a little motivation. 🌱",
  "Appreciate someone who makes everyone feel included. 🫶",
  "Tell someone they made you smile today. 😊",
  "Give someone the recognition they deserve. 🏆",
  "Tell someone one quality you truly admire. 💫",
  "Thank someone who makes your day brighter. 🌞",
  "Appreciate someone for simply being there. 💛",
  "Compliment someone you don’t usually talk to. 💬",
  "Tell someone why you enjoy their company. 🌷",
  "Appreciate someone who makes difficult days easier. 🤍",
  "Thank someone who has positively influenced you. 🌟",
  "Give a shoutout to someone you’re grateful for. 🙌",
  "Tell someone what they bring to your friendship. ✨",
  "Appreciate someone you can always count on. 🤝",
  "Thank someone who always makes you laugh. 😂",
  "Tell someone something kind they deserve to hear. 💌",
  "Appreciate someone who motivates you. 🚀",
  "Tell someone who makes you feel comfortable being yourself. 🫶",
  "Thank someone for making a moment memorable. 💖",
  "Tell someone what you value most about them. 💎",
  "Appreciate someone whose kindness goes unnoticed. 🌼",
  "Thank someone who makes simple moments more fun. 🎉",
  "Give someone a genuine confidence boost. 💪",
  "Tell someone they’re more appreciated than they realize. 💛",
  "Appreciate someone who has made a difference in your life. 🌈",
  "Thank someone who never gave up on you. 🙏",
  "Give a shoutout to someone who deserves appreciation. 🌟",
  "Tell someone one thing you’ll always appreciate about them. 💖",
  "Write something kind to someone who deserves to hear it. 💌"
];

const categories = [
  { label: "Everyone", icon: "🌸" },
  { label: "Friends", icon: "💗" },
  { label: "Teachers", icon: "🧑‍🏫" },
  { label: "College", icon: "🏫" },
  { label: "Clubs", icon: "🎓" }
];

const moods = [
  { label: "Grateful", icon: "🥰" },
  { label: "Happy", icon: "😊" },
  { label: "Inspired", icon: "🌟" },
  { label: "Proud", icon: "👏" },
  { label: "Appreciative", icon: "💙" }
];

const Write = () => {
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("Everyone");
  const [mood, setMood] = useState("Grateful");
  const [prompt, setPrompt] = useState(prompts[0]);
  const [submitted, setSubmitted] = useState(false);

  const spinWheel = () => {
    const randomIndex = Math.floor(Math.random() * prompts.length);
    setPrompt(prompts[randomIndex]);
  };

  const addCompliment = useAppStore((s) => s.addCompliment);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!recipient.trim() || !message.trim()) {
      alert("Please enter a recipient and a compliment.");
      return;
    }

    try {
      await addCompliment({
        to: recipient,
        message,
        category: category.toLowerCase(),
        emoji: "💌",
      });
      setSubmitted(true);
      setRecipient("");
      setMessage("");
      setCategory("Everyone");
      setMood("Grateful");
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      alert("Could not post. Is the backend running on port 4000?");
    }
  };

  return (
    <>
      <NavBar />

      <main className="write-page">
        <div className="write-intro">
          <h1>Write a compliment</h1>

          <p>
            Nobody will ever see your name. Only the messages pass moderation.
          </p>
        </div>

        <section className="write-layout">
          <div className="write-left">

            <div className="kindness-prompt">
              <p>
                <b>🎯 RANDOM KINDNESS PROMPT</b>
              </p>

              <h2>{prompt}</h2>

              <button
                type="button"
                className="wheel-button"
                onClick={spinWheel}
              >
                🎲 Spin the Kindness Wheel
              </button>
            </div>

            <div className="info-cards">

              <div className="info-card">
                <div className="info-icon">💌</div>

                <h3>Secret reply</h3>

                <p>
                  Recipients can post an anonymous thank-you underneath.
                </p>
              </div>

              <div className="info-card">
                <div className="info-icon">🚨</div>

                <h3>Gentle moderation</h3>

                <p>
                  Report a post and an admin reviews it — kindness stays kind.
                </p>
              </div>

            </div>
          </div>

          <form className="confession-form" onSubmit={handleSubmit}>

            <div className="form-group">
              <h4>Recipient</h4>

              <span>To:</span>

              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="A stranger in the corridor, Prof. Sharma, Drama Club..."
              />
            </div>

            <div className="form-group">
              <h4>Category</h4>

              <p className="form-category">
                Where should this show up on the wall?
              </p>

              <div className="option-list">
                {categories.map((item) => (
                  <button
                    type="button"
                    key={item.label}
                    className={`option-button ${
                      category === item.label ? "selected" : ""
                    }`}
                    onClick={() => setCategory(item.label)}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <h4>Message</h4>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="To the person who helped me carry my books yesterday..."
                maxLength={240}
              />

              <div className="character-count">
                {message.length}/240
              </div>
            </div>

            <div className="form-group">
              <h4>Mood</h4>

              <div className="option-list">
                {moods.map((item) => (
                  <button
                    type="button"
                    key={item.label}
                    className={`option-button ${
                      mood === item.label ? "selected" : ""
                    }`}
                    onClick={() => setMood(item.label)}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="anonymous-button">
              Post anonymously 💌
            </button>

            <p className="privacy-note">
              Your post stays anonymous. It's saved locally in your browser
              for this demo.
            </p>

            {submitted && (
              <div className="success-message">
                💗 Your kindness has been posted anonymously!
              </div>
            )}

          </form>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Write;