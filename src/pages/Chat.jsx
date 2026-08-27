import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const SOCKET_URL = "http://localhost:4000";

const Chat = () => {
  const [nickname, setNickname] = useState(
    () => localStorage.getItem("confidia_nick") || ""
  );
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!joined) return;

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.emit("chat:join", {
      room: "campus",
      nickname: nickname.trim() || "Anonymous",
    });

    socket.on("chat:history", (history) => setMessages(history));
    socket.on("chat:message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, [joined, nickname]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleJoin = (e) => {
    e.preventDefault();
    const nick = nickname.trim() || "Anonymous";
    setNickname(nick);
    localStorage.setItem("confidia_nick", nick);
    setJoined(true);
  };

  const send = (e) => {
    e.preventDefault();
    if (!text.trim() || !socketRef.current) return;
    socketRef.current.emit("chat:message", {
      text: text.trim(),
      room: "campus",
    });
    setText("");
  };

  return (
    <>
      <NavBar />
      <main
        style={{
          maxWidth: 720,
          margin: "40px auto",
          padding: "0 16px",
          minHeight: "60vh",
        }}
      >
        <h1 style={{ marginBottom: 8 }}>Anonymous Campus Chat 💬</h1>
        <p style={{ opacity: 0.8, marginBottom: 24 }}>
          No accounts. Pick any nickname (or stay Anonymous). Messages are not
          linked to your real identity.
        </p>

        {!joined ? (
          <form onSubmit={handleJoin} style={{ display: "flex", gap: 8 }}>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Nickname (optional)"
              maxLength={24}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 10,
                border: "1px solid #e5e5e5",
                fontSize: 15,
              }}
            />
            <button
              type="submit"
              style={{
                padding: "12px 20px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg, #FF6BAA, #8B5CF6)",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Join chat
            </button>
          </form>
        ) : (
          <>
            <div
              style={{
                height: 420,
                overflowY: "auto",
                border: "1px solid #eee",
                borderRadius: 14,
                padding: 16,
                background: "#fafafa",
                marginBottom: 12,
              }}
            >
              {messages.length === 0 && (
                <p style={{ opacity: 0.6 }}>
                  No messages yet. Say something kind 🌸
                </p>
              )}
              {messages.map((m) => (
                <div key={m.id} style={{ marginBottom: 14 }}>
                  <strong style={{ color: "#8B5CF6" }}>{m.nickname}</strong>
                  <span
                    style={{
                      fontSize: 12,
                      opacity: 0.5,
                      marginLeft: 8,
                    }}
                  >
                    {m.time ? new Date(m.time).toLocaleTimeString() : ""}
                  </span>
                  <p style={{ margin: "4px 0 0" }}>{m.text}</p>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={send} style={{ display: "flex", gap: 8 }}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                maxLength={500}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid #e5e5e5",
                  fontSize: 15,
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "12px 20px",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg, #FF6BAA, #8B5CF6)",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Send
              </button>
            </form>
            <p style={{ fontSize: 13, opacity: 0.6, marginTop: 10 }}>
              You appear as <strong>{nickname || "Anonymous"}</strong>
            </p>
          </>
        )}
      </main>
      <Footer />
    </>
  );
};

export default Chat;
