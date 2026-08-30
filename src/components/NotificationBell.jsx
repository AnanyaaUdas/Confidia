import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAppStore from "../store/useAppStore";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../api";

function relativeTime(date) {
  if (!date) return "";
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const NotificationBell = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const isLoggedIn = useAppStore((s) => s.isLoggedIn);
  const User = useAppStore((s) => s.User);

  const load = async () => {
    if (!isLoggedIn || !User?.id) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchNotifications(User.id);
      const list = Array.isArray(data) ? data : data.notifications || [];
      setItems(
        list.map((n) => ({
          id: (n._id || n.id || "").toString(),
          type: n.type,
          emoji:
            n.emoji || (n.type === "reply" ? "💬" : n.type === "reaction" ? "❤️" : "🔔"),
          text: n.message || n.text || "New notification",
          time: relativeTime(n.createdAt),
          read: !!(n.read || n.isRead),
          complimentId: n.complimentId
            ? (n.complimentId._id || n.complimentId).toString()
            : null,
          replyId: n.replyId ? n.replyId.toString() : null,
        })),
      );
    } catch (e) {
      console.error("notifications:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 25000);
    return () => clearInterval(t);
  }, [isLoggedIn, User?.id]);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const unread = items.filter((n) => !n.read).length;

  const onOpen = () => {
    setOpen((v) => !v);
    if (!open) load();
  };

  const onMarkOne = async (id) => {
    if (!id) return;
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await markNotificationRead(id);
    } catch (e) {
      console.error(e);
    }
  };

  const onNotificationClick = async (n) => {
    if (!n.complimentId) {
      await onMarkOne(n.id);
      setOpen(false);
      return;
    }

    sessionStorage.setItem(
      "notificationNavigation",
      JSON.stringify({
        complimentId: n.complimentId,
        replyId: n.replyId || null,
        type: n.type,
        timestamp: Date.now(),
      }),
    );

    await onMarkOne(n.id);
    setOpen(false);

    if (location.pathname !== "/wall") {
      navigate("/wall");
    } else {
      window.dispatchEvent(new Event("notification-navigation"));
    }
  };

  const onMarkAll = async () => {
    if (!User?.id) return;
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await markAllNotificationsRead(User.id);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="notif-wrapper" ref={ref}>
      <button
        type="button"
        className="notif-bell"
        onClick={onOpen}
        aria-label="Notifications"
        aria-expanded={open}
      >
        🔔
        {unread > 0 && <span className="notif-badge">{unread > 9 ? "9+" : unread}</span>}
      </button>

      {open && (
        <div className="notif-dropdown" role="dialog" aria-label="Notifications">
          <div className="notif-header">
            <h4>Notifications</h4>
            {isLoggedIn && unread > 0 && (
              <button type="button" className="notif-mark-all" onClick={onMarkAll}>
                Mark all read
              </button>
            )}
          </div>

          <div className="notif-list">
            {!isLoggedIn && (
              <div className="notif-empty">
                <p>Log in to see reactions & replies on your compliments.</p>
                <Link
                  to="/user-login"
                  className="notif-login-link"
                  onClick={() => setOpen(false)}
                >
                  User login →
                </Link>
              </div>
            )}

            {isLoggedIn && loading && items.length === 0 && (
              <div className="notif-empty">Loading…</div>
            )}

            {isLoggedIn && !loading && items.length === 0 && (
              <div className="notif-empty">🌸 No notifications yet</div>
            )}

            {items.map((n) => (
              <button
                type="button"
                key={n.id}
                className={`notif-item ${n.read ? "" : "unread"}`}
                onClick={() => onNotificationClick(n)}
              >
                <span className="notif-icon">{n.emoji}</span>
                <div className="notif-text">
                  <p>{n.text}</p>
                  <span className="notif-time">{n.time}</span>
                </div>
                {!n.read && <span className="notif-dot" aria-hidden="true" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
