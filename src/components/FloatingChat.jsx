import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAppStore from "../store/useAppStore";
import useChat from "../hooks/useChat";
import "../style/FloatingChat.css";

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

const FloatingChat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = useAppStore((s) => s.isLoggedIn);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [text, setText] = useState("");

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
    totalUnread,
    currentUserId,
  } = useChat();

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const bubbleRef = useRef(null);

  useEffect(() => {
    if (!isLoggedIn) {
      setOpen(false);
      closeConversation();
    }
  }, [isLoggedIn, closeConversation]);

  useEffect(() => {
    if (open && !selectedUser) loadUsers();
  }, [open, selectedUser, loadUsers]);

  useEffect(() => {
    if (open && selectedUser) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [messages, open, selectedUser]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClickOutside = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        bubbleRef.current &&
        !bubbleRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  const toggleOpen = () => {
    if (!isLoggedIn) {
      navigate("/user-login", { state: { from: location.pathname } });
      return;
    }
    setOpen((v) => !v);
  };

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(text);
    setText("");
    inputRef.current?.focus();
  };

  const filteredUsers = users.filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (u.username || "").toLowerCase().includes(q);
  });

  return (
    <div className="fchat-root">
      {open && (
        <div className="fchat-panel" ref={panelRef} role="dialog" aria-label="Chat">
          <div className="fchat-head">
            <div>
              {selectedUser ? (
                <div className="fchat-head-title">
                  <button
                    type="button"
                    className="fchat-back"
                    onClick={closeConversation}
                    aria-label="Back to people list"
                  >
                    ‹
                  </button>
                  @{selectedUser.username}
                </div>
              ) : (
                <div className="fchat-head-title">💬 Chat</div>
              )}
              <div className="fchat-status">
                <span className={`fchat-dot ${connected ? "" : "offline"}`} />
                {connected ? (selectedUser ? "Online" : "Connected") : "Connecting…"}
              </div>
            </div>
            <button
              type="button"
              className="fchat-close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {!selectedUser ? (
            <div className="fchat-userlist">
              <input
                className="fchat-input fchat-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search people…"
              />
              <div className="fchat-users">
                {usersLoading && <p className="fchat-empty">Loading people…</p>}
                {!usersLoading && filteredUsers.length === 0 && (
                  <p className="fchat-empty">No one to chat with yet.</p>
                )}
                {filteredUsers.map((u) => (
                  <button
                    type="button"
                    key={u.id}
                    className="fchat-user-row"
                    onClick={() => openConversation(u)}
                  >
                    <span className="avatar-chip">{initialsFor(u)}</span>
                    <span className="fchat-user-meta">
                      <strong>@{u.username}</strong>
                    </span>
                    {unreadByUser[u.id] > 0 && (
                      <span className="fchat-badge fchat-badge-inline">
                        {unreadByUser[u.id] > 9 ? "9+" : unreadByUser[u.id]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="fchat-messages">
                {messages.length === 0 && (
                  <p className="fchat-empty">
                    No messages yet. Say something kind 🌸
                  </p>
                )}
                {messages.map((m) => {
                  const mine = m.senderId === currentUserId;
                  return (
                    <div key={m.id} className={`fchat-msg ${mine ? "mine" : "theirs"}`}>
                      <span className="fchat-msg-meta">{formatTime(m.time)}</span>
                      <span className="fchat-bubble-text">{m.text}</span>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={send} className="fchat-composer">
                <input
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a kind message…"
                  maxLength={500}
                />
                <button type="submit" className="fchat-send" disabled={!text.trim()}>
                  ➤
                </button>
              </form>
            </>
          )}
        </div>
      )}

      <button
        type="button"
        className="fchat-bubble"
        onClick={toggleOpen}
        aria-label="Toggle chat"
        ref={bubbleRef}
      >
        {open ? "✕" : "💬"}
        {!open && totalUnread > 0 && (
          <span className="fchat-badge">{totalUnread > 9 ? "9+" : totalUnread}</span>
        )}
      </button>
    </div>
  );
};

export default FloatingChat;
