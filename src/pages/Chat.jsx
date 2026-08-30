import React, { useEffect, useRef, useState } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import useAppStore from "../store/useAppStore";
import useChat from "../hooks/useChat";

function formatTime(value) {
  if (!value) return "";
  const d = new Date(value);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function initialsFor(u) {
  const a = (u.username || "?").charAt(0);
  const b = (u.username || "").charAt(1) || "";
  return `${a}${b}`.toUpperCase();
}

const Chat = () => {
  const isLoggedIn = useAppStore((s) => s.isLoggedIn);
  const [search, setSearch] = useState("");
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  const {
    connected,
    users,
    usersLoading,
    loadUsers,
    selectedUser,
    openConversation,
    closeConversation,
    messages,
    sendMessage,
    unreadByUser,
    currentUserId,
  } = useChat();

  useEffect(() => {
    if (isLoggedIn) loadUsers();
  }, [isLoggedIn, loadUsers]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(text);
    setText("");
  };

  const filteredUsers = users.filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (u.username || "").toLowerCase().includes(q);
  });

  if (!isLoggedIn) {
    return (
      <>
        <NavBar />
        <main style={{ maxWidth: 720, margin: "60px auto", padding: "0 16px" }}>
          <h1>Chat</h1>
          <p style={{ opacity: 0.75 }}>Log in to message other people.</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main
        style={{
          maxWidth: 960,
          margin: "40px auto",
          padding: "0 16px",
          minHeight: "60vh",
        }}
      >
        <h1 style={{ marginBottom: 4 }}>Chat 💬</h1>
        <p style={{ opacity: 0.7, marginBottom: 20, fontSize: 14 }}>
          {connected ? "Connected" : "Connecting…"} · pick someone to message.
        </p>

        <div
          style={{
            display: "flex",
            border: "1px solid #eee",
            borderRadius: 16,
            overflow: "hidden",
            minHeight: 520,
            background: "#fff",
          }}
        >
          {/* people list */}
          <div
            style={{
              width: 260,
              borderRight: "1px solid #eee",
              display: "flex",
              flexDirection: "column",
              background: "#fbf8ff",
            }}
          >
            <div style={{ padding: 12 }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search people…"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #e7e0f5",
                  fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 8px" }}>
              {usersLoading && (
                <p style={{ opacity: 0.6, fontSize: 13, padding: 8 }}>Loading…</p>
              )}
              {!usersLoading && filteredUsers.length === 0 && (
                <p style={{ opacity: 0.6, fontSize: 13, padding: 8 }}>
                  No one to chat with yet.
                </p>
              )}
              {filteredUsers.map((u) => {
                const active = selectedUser?.id === u.id;
                return (
                  <button
                    type="button"
                    key={u.id}
                    onClick={() => openConversation(u)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      padding: "9px 8px",
                      borderRadius: 12,
                      border: "none",
                      background: active ? "#f3e9ff" : "#fff",
                      cursor: "pointer",
                      textAlign: "left",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #FF6BAA, #8B5CF6)",
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: 700,
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      {initialsFor(u)}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: 13.5 }}>
                        @{u.username}
                      </strong>
                    </span>
                    {unreadByUser[u.id] > 0 && (
                      <span
                        style={{
                          background: "#e11d48",
                          color: "#fff",
                          fontSize: 11,
                          fontWeight: 700,
                          borderRadius: 999,
                          minWidth: 20,
                          height: 20,
                          display: "grid",
                          placeItems: "center",
                          padding: "0 5px",
                        }}
                      >
                        {unreadByUser[u.id] > 9 ? "9+" : unreadByUser[u.id]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* conversation */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {!selectedUser ? (
              <div
                style={{
                  flex: 1,
                  display: "grid",
                  placeItems: "center",
                  opacity: 0.6,
                  fontSize: 14,
                  padding: 20,
                  textAlign: "center",
                }}
              >
                Select someone on the left to start chatting.
              </div>
            ) : (
              <>
                <div
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #eee",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <strong>@{selectedUser.username}</strong>
                  <button
                    type="button"
                    onClick={closeConversation}
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      fontSize: 13,
                      opacity: 0.6,
                    }}
                  >
                    Close
                  </button>
                </div>

                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: 16,
                    background: "#fafafa",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {messages.length === 0 && (
                    <p style={{ opacity: 0.6, margin: "auto" }}>
                      No messages yet. Say something kind 🌸
                    </p>
                  )}
                  {messages.map((m) => {
                    const mine = m.senderId === currentUserId;
                    return (
                      <div
                        key={m.id}
                        style={{
                          alignSelf: mine ? "flex-end" : "flex-start",
                          maxWidth: "70%",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            opacity: 0.5,
                            marginBottom: 3,
                            textAlign: mine ? "right" : "left",
                          }}
                        >
                          {formatTime(m.time)}
                        </div>
                        <div
                          style={{
                            padding: "9px 13px",
                            borderRadius: 15,
                            fontSize: 13.5,
                            lineHeight: 1.4,
                            background: mine
                              ? "linear-gradient(135deg, #FF6BAA, #8B5CF6)"
                              : "#fff",
                            color: mine ? "#fff" : "#3b3550",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                          }}
                        >
                          {m.text}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                <form
                  onSubmit={send}
                  style={{
                    display: "flex",
                    gap: 8,
                    padding: 12,
                    borderTop: "1px solid #eee",
                  }}
                >
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
                    disabled={!text.trim()}
                    style={{
                      padding: "12px 20px",
                      borderRadius: 10,
                      border: "none",
                      background: "linear-gradient(135deg, #FF6BAA, #8B5CF6)",
                      color: "#fff",
                      fontWeight: 600,
                      cursor: text.trim() ? "pointer" : "not-allowed",
                      opacity: text.trim() ? 1 : 0.5,
                    }}
                  >
                    Send
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Chat;
