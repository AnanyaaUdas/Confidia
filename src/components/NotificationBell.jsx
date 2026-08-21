import React, {
    useEffect,
    useState,
    useRef,
    useCallback,
} from "react";

import useAppStore from "../store/useAppStore";

const API_BASE =
    "http://localhost:5000/api/notifications";

const POLL_INTERVAL_MS = 30000;

// =====================================================
// FORMAT TIME
// =====================================================

const formatRelativeTime = (isoString) => {
    if (!isoString) return "";

    const diffMs =
        Date.now() -
        new Date(isoString).getTime();

    const diffSec = Math.floor(
        diffMs / 1000
    );

    if (diffSec < 60) {
        return "just now";
    }

    const diffMin = Math.floor(
        diffSec / 60
    );

    if (diffMin < 60) {
        return `${diffMin}m ago`;
    }

    const diffHr = Math.floor(
        diffMin / 60
    );

    if (diffHr < 24) {
        return `${diffHr}h ago`;
    }

    const diffDay = Math.floor(
        diffHr / 24
    );

    if (diffDay < 7) {
        return `${diffDay}d ago`;
    }

    return new Date(
        isoString
    ).toLocaleDateString();
};

// =====================================================
// NOTIFICATION EMOJI
// =====================================================

const emojiForType = (notification) => {
    if (notification.emoji) {
        return notification.emoji;
    }

    if (notification.type === "reply") {
        return "💬";
    }

    if (
        notification.type === "reaction"
    ) {
        return "❤️";
    }

    return "🔔";
};

// =====================================================
// NOTIFICATION BELL
// =====================================================

const NotificationBell = () => {
    const isLoggedIn = useAppStore(
        (state) => state.isLoggedIn
    );

    const User = useAppStore(
        (state) => state.User
    );

    const userId = User?._id;

    const [open, setOpen] =
        useState(false);

    const [notifications, setNotifications] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState(null);

    const dropdownRef =
        useRef(null);

    // =====================================================
    // FETCH NOTIFICATIONS
    // =====================================================

    const fetchNotifications =
        useCallback(async () => {
            if (
                !isLoggedIn ||
                !userId
            ) {
                setNotifications([]);
                setLoading(false);
                return;
            }

            try {
                const response =
                    await fetch(
                        `${API_BASE}/${userId}`
                    );

                if (!response.ok) {
                    throw new Error(
                        "Failed to load notifications"
                    );
                }

                const data =
                    await response.json();

                setNotifications(
                    Array.isArray(data)
                        ? data
                        : []
                );

                setError(null);
            } catch (err) {
                console.error(
                    "Notification fetch error:",
                    err
                );

                setError(
                    "Couldn't load notifications."
                );
            } finally {
                setLoading(false);
            }
        }, [
            isLoggedIn,
            userId,
        ]);

    // =====================================================
    // INITIAL FETCH + POLLING
    // =====================================================

    useEffect(() => {
        setLoading(true);

        fetchNotifications();

        if (
            !isLoggedIn ||
            !userId
        ) {
            return;
        }

        const interval =
            setInterval(
                fetchNotifications,
                POLL_INTERVAL_MS
            );

        return () =>
            clearInterval(interval);
    }, [
        isLoggedIn,
        userId,
        fetchNotifications,
    ]);

    // =====================================================
    // MARK ONE AS READ
    // =====================================================

    const markAsRead = async (
        notificationId
    ) => {
        setNotifications(
            (previous) =>
                previous.map(
                    (notification) =>
                        notification._id ===
                        notificationId
                            ? {
                                  ...notification,
                                  read: true,
                              }
                            : notification
                )
        );

        try {
            const response =
                await fetch(
                    `${API_BASE}/${notificationId}/read`,
                    {
                        method: "PATCH",
                    }
                );

            if (!response.ok) {
                throw new Error(
                    "Failed to mark as read"
                );
            }
        } catch (err) {
            console.error(
                "Mark-as-read error:",
                err
            );
        }
    };

    // =====================================================
    // HANDLE NOTIFICATION CLICK
    // =====================================================

    const handleNotificationClick =
        async (notification) => {
            console.log(
                "================================="
            );

            console.log(
                "NOTIFICATION CLICKED"
            );

            console.log(
                "Notification:",
                notification
            );

            console.log(
                "Compliment ID:",
                notification.complimentId
            );

            console.log(
                "Reply ID:",
                notification.replyId
            );

            console.log(
                "Type:",
                notification.type
            );

            console.log(
                "================================="
            );

            // -------------------------------------------------
            // Make sure there is a compliment to open
            // -------------------------------------------------

            if (
                !notification.complimentId
            ) {
                console.warn(
                    "This notification has no complimentId."
                );

                await markAsRead(
                    notification._id
                );

                setOpen(false);

                return;
            }

            // -------------------------------------------------
            // Save navigation information
            // -------------------------------------------------

            const navigationData = {
                complimentId:
                    notification.complimentId,

                replyId:
                    notification.replyId ||
                    null,

                type:
                    notification.type,

                timestamp:
                    Date.now(),
            };

            sessionStorage.setItem(
                "notificationNavigation",
                JSON.stringify(
                    navigationData
                )
            );

            console.log(
                "Saved navigation data:",
                navigationData
            );

            // -------------------------------------------------
            // Mark notification as read
            // -------------------------------------------------

            await markAsRead(
                notification._id
            );

            // -------------------------------------------------
            // Close dropdown
            // -------------------------------------------------

            setOpen(false);

            // -------------------------------------------------
            // Navigate to Wall
            //
            // CHANGE THIS ONLY IF YOUR WALL ROUTE
            // IS DIFFERENT.
            // -------------------------------------------------

            const currentPath =
                window.location.pathname;

            if (
                currentPath !== "/wall"
            ) {
                window.location.href =
                    "/wall";
                return;
            }

            // -------------------------------------------------
            // Already on Wall
            // Tell MainWall immediately
            // -------------------------------------------------

            window.dispatchEvent(
                new Event(
                    "notification-navigation"
                )
            );
        };

    // =====================================================
    // MARK ALL AS READ
    // =====================================================

    const markAllAsRead = async () => {
        if (!userId) return;

        const previous =
            notifications;

        setNotifications(
            (prev) =>
                prev.map(
                    (notification) => ({
                        ...notification,
                        read: true,
                    })
                )
        );

        try {
            const response =
                await fetch(
                    `${API_BASE}/user/${userId}/read-all`,
                    {
                        method: "PATCH",
                    }
                );

            if (!response.ok) {
                throw new Error(
                    "Failed to mark all as read"
                );
            }
        } catch (err) {
            console.error(
                "Mark-all-as-read error:",
                err
            );

            setNotifications(
                previous
            );
        }
    };

    // =====================================================
    // CLICK OUTSIDE
    // =====================================================

    useEffect(() => {
        const handleClickOutside =
            (event) => {
                if (
                    dropdownRef.current &&
                    !dropdownRef.current.contains(
                        event.target
                    )
                ) {
                    setOpen(false);
                }
            };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () =>
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
    }, []);

    // =====================================================
    // NOT LOGGED IN
    // =====================================================

    if (!isLoggedIn) {
        return null;
    }

    // =====================================================
    // UNREAD COUNT
    // =====================================================

    const unreadCount =
        notifications.filter(
            (notification) =>
                !notification.read
        ).length;

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div
            className="notif-wrapper"
            ref={dropdownRef}
        >
            {/* =================================================
                BELL
            ================================================= */}

            <button
                type="button"
                className="notif-bell"
                onClick={() =>
                    setOpen(
                        (previous) =>
                            !previous
                    )
                }
            >
                🔔

                {unreadCount > 0 && (
                    <span className="notif-badge">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* =================================================
                DROPDOWN
            ================================================= */}

            {open && (
                <div className="notif-dropdown">
                    {/* HEADER */}

                    <div className="notif-header">
                        <h4>
                            Notifications
                        </h4>

                        {unreadCount >
                            0 && (
                            <button
                                type="button"
                                className="notif-mark-all"
                                onClick={
                                    markAllAsRead
                                }
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* LIST */}

                    <div className="notif-list">
                        {/* LOADING */}

                        {loading && (
                            <div className="notif-empty">
                                Loading...
                            </div>
                        )}

                        {/* ERROR */}

                        {!loading &&
                            error && (
                                <div className="notif-empty">
                                    {error}
                                </div>
                            )}

                        {/* EMPTY */}

                        {!loading &&
                            !error &&
                            notifications.length ===
                                0 && (
                                <div className="notif-empty">
                                    You're all
                                    caught up
                                    🌸
                                </div>
                            )}

                        {/* NOTIFICATIONS */}

                        {!loading &&
                            !error &&
                            notifications.map(
                                (
                                    notification
                                ) => (
                                    <div
                                        key={
                                            notification._id
                                        }
                                        className={`notif-item ${
                                            notification.read
                                                ? ""
                                                : "unread"
                                        }`}
                                        onClick={() =>
                                            handleNotificationClick(
                                                notification
                                            )
                                        }
                                    >
                                        {/* ICON */}

                                        <span className="notif-icon">
                                            {emojiForType(
                                                notification
                                            )}
                                        </span>

                                        {/* TEXT */}

                                        <div className="notif-text">
                                            <p>
                                                {
                                                    notification.message
                                                }
                                            </p>

                                            <span className="notif-time">
                                                {formatRelativeTime(
                                                    notification.createdAt
                                                )}
                                            </span>
                                        </div>

                                        {/* UNREAD DOT */}

                                        {!notification.read && (
                                            <span className="notif-dot" />
                                        )}
                                    </div>
                                )
                            )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;