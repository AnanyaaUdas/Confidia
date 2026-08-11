import React, { useState } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import "../style/Write.css";

const prompts = [
  "Thank someone who helped you this week.",
  "Compliment someone who made your day better.",
  "Thank a teacher who inspired you.",
  "Appreciate someone who always makes people smile.",
  "Write something kind to someone who deserves to hear it."
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!recipient.trim() || !message.trim()) {
      alert("Please enter a recipient and a compliment.");
      return;
    }

    const compliment = {
      recipient,
      message,
      category,
      mood,
      createdAt: new Date().toISOString()
    };

    const savedCompliments =
      JSON.parse(localStorage.getItem("confidiaCompliments")) || [];

    localStorage.setItem(
      "confidiaCompliments",
      JSON.stringify([...savedCompliments, compliment])
    );

    setSubmitted(true);
    setRecipient("");
    setMessage("");
    setCategory("Everyone");
    setMood("Grateful");

    setTimeout(() => {
      setSubmitted(false);
    }, 3000);
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