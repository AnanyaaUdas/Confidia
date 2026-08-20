import React, { useState, useRef, useEffect, useCallback } from "react";
import useAppStore from "../store/useAppStore";

const API_BASE = "http://localhost:5000/api/notifications";

const POLL_INTERVAL_MS = 30000;

const formatRelativeTime = (isoString) => {
    if (!isoString) return "";

    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 60) return "just now";

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;

    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;

    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;

    return new Date(isoString).toLocaleDateString();
};

const emojiForType = (n) => {
    if (n.emoji) return n.emoji;
    if (n.type === "reply") return "💬";
    return "❤️";
};

const NotificationBell = () => {

    const isLoggedIn = useAppStore((state) => state.isLoggedIn);
    const userId = useAppStore((state) => state.User._id);

    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const dropdownRef = useRef(null);

    const fetchNotifications = useCallback(async () => {

        if (!isLoggedIn || !userId) {
            setNotifications([]);
            setLoading(false);
            return;
        }

        try {

            const response = await fetch(`${API_BASE}/${userId}`);

            if (!response.ok) {
                throw new Error("Failed to load notifications");
            }

            const data = await response.json();

            setNotifications(Array.isArray(data) ? data : []);
            setError(null);

        } catch (err) {

            console.error("Notification fetch error:", err);
            setError("Couldn't load notifications.");

        } finally {

            setLoading(false);
        }

    }, [isLoggedIn, userId]);

    useEffect(() => {

        setLoading(true);
        fetchNotifications();

        if (!isLoggedIn || !userId) {
            return;
        }

        const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);

        return () => clearInterval(interval);

    }, [isLoggedIn, userId, fetchNotifications]);

    const markAsRead = async (id) => {

        setNotifications((prev) =>
            prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        );

        try {

            const response = await fetch(`${API_BASE}/${id}/read`, {
                method: "PATCH",
            });

            if (!response.ok) {
                throw new Error("Failed to mark as read");
            }

        } catch (err) {

            console.error("Mark-as-read error:", err);
        }
    };

    const markAllAsRead = async () => {

        if (!userId) return;

        const previous = notifications;

        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

        try {

            const response = await fetch(
                `${API_BASE}/user/${userId}/read-all`,
                { method: "PATCH" }
            );

            if (!response.ok) {
                throw new Error("Failed to mark all as read");
            }

        } catch (err) {

            console.error("Mark-all-as-read error:", err);
            setNotifications(previous);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!isLoggedIn) {
        return null;
    }

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <div className="notif-wrapper" ref={dropdownRef}>

            <button
                className="notif-bell"
                onClick={() => setOpen((prev) => !prev)}
            >
                🔔
                {unreadCount > 0 && (
                    <span className="notif-badge">{unreadCount}</span>
                )}
            </button>

            {open && (

                <div className="notif-dropdown">

                    <div className="notif-header">

                        <h4>Notifications</h4>

                        {unreadCount > 0 && (
                            <button
                                className="notif-mark-all"
                                onClick={markAllAsRead}
                            >
                                Mark all read
                            </button>
                        )}

                    </div>

                    <div className="notif-list">

                        {loading && (
                            <div className="notif-empty">Loading...</div>
                        )}

                        {!loading && error && (
                            <div className="notif-empty">{error}</div>
                        )}

                        {!loading && !error && notifications.length === 0 && (
                            <div className="notif-empty">
                                You're all caught up 🌸
                            </div>
                        )}

                        {!loading && !error && notifications.map((n) => (

                            <div
                                key={n._id}
                                className={`notif-item ${n.read ? "" : "unread"}`}
                                onClick={() => markAsRead(n._id)}
                            >

                                <span className="notif-icon">
                                    {emojiForType(n)}
                                </span>

                                <div className="notif-text">
                                    <p>{n.message}</p>
                                    <span className="notif-time">
                                        {formatRelativeTime(n.createdAt)}
                                    </span>
                                </div>

                                {!n.read && <span className="notif-dot"></span>}

                            </div>

                        ))}

                    </div>

                </div>

            )}

        </div>
    );
};

export default NotificationBell;