import React, { useState, useRef, useEffect } from "react";

// MOCK DATA — replace with a fetch() call once backend exists
const mockNotifications = [
    {
        id: 1,
        type: "reaction",
        emoji: "❤️",
        text: "Someone reacted to your compliment to COMPUTER SCIENCE DEPARTMENT",
        time: "2m ago",
        read: false,
    },
    {
        id: 2,
        type: "reply",
        emoji: "💬",
        text: "Someone replied to your compliment to LIBRARY STAFF",
        time: "1h ago",
        read: false,
    },
    {
        id: 3,
        type: "reaction",
        emoji: "👏",
        text: "Someone reacted to your compliment to DRAMA CLUB",
        time: "5h ago",
        read: false,
    },
    {
        id: 4,
        type: "reply",
        emoji: "💬",
        text: "Someone replied to your compliment to WHOEVER FOUND MY WALLET",
        time: "1d ago",
        read: true,
    },
];

const NotificationBell = () => {

    const [open, setOpen] = useState(false);

    const [notifications, setNotifications] =
        useState(mockNotifications);

    const dropdownRef = useRef(null);


    const unreadCount = notifications.filter(
        (n) => !n.read
    ).length;


    const markAsRead = (id) => {
        setNotifications((prev) =>
            prev.map((n) =>
                n.id === id
                    ? { ...n, read: true }
                    : n
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications((prev) =>
            prev.map((n) => ({ ...n, read: true }))
        );
    };


    // Close dropdown when clicking outside

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
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
    }, []);


    return (
        <div className="notif-wrapper" ref={dropdownRef}>

            <button
                className="notif-bell"
                onClick={() => setOpen((prev) => !prev)}
            >
                🔔
                {unreadCount > 0 && (
                    <span className="notif-badge">
                        {unreadCount}
                    </span>
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

                        {notifications.length === 0 && (
                            <div className="notif-empty">
                                You're all caught up 🌸
                            </div>
                        )}

                        {notifications.map((n) => (

                            <div
                                key={n.id}
                                className={`notif-item ${
                                    n.read ? "" : "unread"
                                }`}
                                onClick={() => markAsRead(n.id)}
                            >

                                <span className="notif-icon">
                                    {n.emoji}
                                </span>

                                <div className="notif-text">
                                    <p>{n.text}</p>
                                    <span className="notif-time">
                                        {n.time}
                                    </span>
                                </div>

                                {!n.read && (
                                    <span className="notif-dot"></span>
                                )}

                            </div>

                        ))}

                    </div>

                </div>

            )}

        </div>
    );
};

export default NotificationBell;