import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import "../style/AdminDashboard.css";
import logo from "../assets/Images/logo.png";
import {
  adminLogin,
  adminStats,
  adminPending,
  adminAllCompliments,
  adminUsers,
  adminModerationLog,
  adminApprove,
  adminDelete,
  adminSuspendUser,
  adminUnsuspendUser,
  adminRemoveUser,
} from "../api";

const SOCKET_URL = "http://localhost:4000";

const weeklyActivity = [
  { day: "Mon", value: 32 },
  { day: "Tue", value: 48 },
  { day: "Wed", value: 27 },
  { day: "Thu", value: 65 },
  { day: "Fri", value: 58 },
  { day: "Sat", value: 74 },
  { day: "Sun", value: 51 },
];

const categories = [
  { name: "Professors", emoji: "🎓", change: "+6%", up: true },
  { name: "Campus Staff", emoji: "🧑‍🔧", change: "+2%", up: true },
  { name: "Clubs", emoji: "🎭", change: "-3%", up: false },
  { name: "Strangers", emoji: "💙", change: "+9%", up: true },
];

const wallCategories = [
  { key: "everyone", label: "Everyone", emoji: "🌸" },
  { key: "friends", label: "Friends", emoji: "💗" },
  { key: "teacher", label: "Teachers", emoji: "🧑‍🏫" },
  { key: "college", label: "College", emoji: "🏫" },
  { key: "clubs", label: "Clubs", emoji: "🎓" },
];

const navItems = [
  { label: "Dashboard", icon: "🏠" },
  { label: "Reported Posts", icon: "🚩", badge: true },
  { label: "All Compliments", icon: "💌" },
  { label: "Users", icon: "👥" },
  { label: "Comments", icon: "💬" },
  { label: "Analytics", icon: "📊" },
  { label: "Settings", icon: "⚙️" },
];

const AdminDashboard = () => {
  const [token, setToken] = useState(
    () => localStorage.getItem("confidia_admin_token") || "",
  );
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [stats, setStats] = useState({
    compliments: 0,
    reactions: 0,
    comments: 0,
    reported: 0,
    users: 0,
  });
  const [pending, setPending] = useState([]);
  const [allCompliments, setAllCompliments] = useState([]);
  const [users, setUsers] = useState([]);
  const [moderationLog, setModerationLog] = useState([]);
  const [loading, setLoading] = useState(false);

  const [activeNav, setActiveNav] = useState("Dashboard");
  const [tab, setTab] = useState("pending");
  const [hovered, setHovered] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [bellOpen, setBellOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [confirmUserTarget, setConfirmUserTarget] = useState(null);

  const loadAdminData = async (t) => {
    setLoading(true);
    try {
      const [st, pend, comps, us, log] = await Promise.all([
        adminStats(t),
        adminPending(t),
        adminAllCompliments(t),
        adminUsers(t),
        adminModerationLog(t),
      ]);
      setStats(st);
      setPending(pend);
      setAllCompliments(comps);
      setUsers(us);
      setModerationLog(log);
    } catch (e) {
      console.error(e);
      setToken("");
      localStorage.removeItem("confidia_admin_token");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadAdminData(token);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const socket = io(SOCKET_URL);
    socket.on("compliment:commentsChanged", ({ complimentId, commentsCount, removed }) => {
      if (removed) {
        loadAdminData(token);
        return;
      }
      setAllCompliments((list) =>
        list.map((c) => (c.id === complimentId ? { ...c, commentsCount } : c)),
      );
      setStats((s) => ({ ...s, comments: (s.comments || 0) + 1 }));
    });
    socket.on("compliment:created", () => {
      loadAdminData(token);
    });
    return () => socket.disconnect();
  }, [token]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const { token: t } = await adminLogin(loginForm.username, loginForm.password);
      setToken(t);
      localStorage.setItem("confidia_admin_token", t);
    } catch {
      setLoginError("Wrong username or password");
    }
  };

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("confidia_admin_token");
    window.location.href = "/admin-login";
  };

  const mostLoved = useMemo(() => {
    const withTotals = allCompliments.map((c) => {
      const total = (c.counts || [0, 0, 0]).reduce((a, b) => a + b, 0);
      return { ...c, total };
    });
    const max = Math.max(1, ...withTotals.map((c) => c.total));
    return withTotals
      .sort((a, b) => b.total - a.total)
      .slice(0, 3)
      .map((c) => ({ ...c, pct: Math.round((c.total / max) * 100) }));
  }, [allCompliments]);

  const categoryBreakdown = useMemo(() => {
    const counts = {};
    for (const c of allCompliments) {
      const key = (c.category || "everyone").toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    }
    return wallCategories
      .map((cat) => ({ ...cat, count: counts[cat.key] || 0 }))
      .sort((a, b) => b.count - a.count);
  }, [allCompliments]);

  const matchesQuery = (c) =>
    query.trim() === "" ||
    (c.to || "").toLowerCase().includes(query.toLowerCase()) ||
    (c.message || "").toLowerCase().includes(query.toLowerCase()) ||
    (c.username || "").toLowerCase().includes(query.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(query.toLowerCase());

  const showToast = (text) => {
    setToast(text);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 2600);
  };

  const handleApprove = async (c) => {
    try {
      await adminApprove(token, c.id);
      setPending((p) => p.filter((x) => x.id !== c.id));
      setAllCompliments((list) =>
        list.map((x) =>
          x.id === c.id ? { ...x, reported: false, reportReason: null } : x,
        ),
      );
      setStats((s) => ({ ...s, reported: Math.max(0, s.reported - 1) }));
      showToast(`Approved — "${c.to}" stays live on the wall.`);
      const log = await adminModerationLog(token);
      setModerationLog(log);
    } catch {
      showToast("Approve failed");
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmTarget) return;
    try {
      await adminDelete(token, confirmTarget.id);
      setPending((p) => p.filter((x) => x.id !== confirmTarget.id));
      setAllCompliments((list) => list.filter((x) => x.id !== confirmTarget.id));
      setStats((s) => ({
        ...s,
        compliments: Math.max(0, s.compliments - 1),
        reported: confirmTarget.reported ? Math.max(0, s.reported - 1) : s.reported,
      }));
      showToast(`Deleted — the post to "${confirmTarget.to}" is gone.`);
      const log = await adminModerationLog(token);
      setModerationLog(log);
    } catch {
      showToast("Delete failed");
    }
    setConfirmTarget(null);
  };

  const handleSuspend = async (u) => {
    try {
      await adminSuspendUser(token, u.id, "Suspended by admin");
      setUsers((list) =>
        list.map((x) => (x.id === u.id ? { ...x, suspended: true } : x)),
      );
      showToast(`@${u.username} has been suspended.`);
    } catch {
      showToast("Suspend failed");
    }
  };

  const handleUnsuspend = async (u) => {
    try {
      await adminUnsuspendUser(token, u.id);
      setUsers((list) =>
        list.map((x) => (x.id === u.id ? { ...x, suspended: false } : x)),
      );
      showToast(`@${u.username} has been unsuspended.`);
    } catch {
      showToast("Unsuspend failed");
    }
  };

  const handleRemoveUserConfirmed = async () => {
    if (!confirmUserTarget) return;
    try {
      await adminRemoveUser(token, confirmUserTarget.id);
      setUsers((list) => list.filter((x) => x.id !== confirmUserTarget.id));
      setStats((s) => ({ ...s, users: Math.max(0, s.users - 1) }));
      showToast(`@${confirmUserTarget.username} was removed.`);
    } catch {
      showToast("Remove failed");
    }
    setConfirmUserTarget(null);
  };

  const goTo = (label) => {
    setActiveNav(label);
    setBellOpen(false);
  };

  const chartW = 640;
  const chartH = 220;
  const padX = 24;
  const padY = 24;
  const max = Math.max(...weeklyActivity.map((d) => d.value));
  const stepX = (chartW - padX * 2) / (weeklyActivity.length - 1);

  const points = weeklyActivity.map((d, i) => {
    const x = padX + stepX * i;
    const y = padY + (1 - d.value / max) * (chartH - padY * 2);
    return { ...d, x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${
    chartH - padY
  } L ${points[0].x} ${chartH - padY} Z`;
  const activePoint = hovered !== null ? points[hovered] : points[points.length - 2];

  // Login is on /admin-login — if token missing, bounce there
  if (!token) {
    window.location.href = "/admin-login";
    return null;
  }

  const ReportRow = ({ r, resolved }) => (
    <div className="report-row">
      <span className="report-emoji">{r.emoji}</span>
      <div className="report-body">
        <div className="report-to">TO: {r.to}</div>
        <p className="report-message">"{r.message}"</p>
        <div className="report-meta">
          {r.reportReason && <span className="report-reason">🚩 {r.reportReason}</span>}
          <span className="report-comments">
            💬 {r.commentsCount || 0} comment
            {r.commentsCount === 1 ? "" : "s"}
          </span>
          <span className="report-time">{r.time}</span>
        </div>
      </div>
      {!resolved ? (
        <div className="report-actions">
          <button className="approve-btn" onClick={() => handleApprove(r)}>
            ✓ Approve
          </button>
          <button className="delete-btn" onClick={() => setConfirmTarget(r)}>
            🗑 Delete
          </button>
        </div>
      ) : (
        <span
          className={`status-tag ${
            r.action === "approved" ? "tag-approved" : "tag-deleted"
          }`}
        >
          {r.action === "approved" ? "Kept live" : "Post deleted"}
        </span>
      )}
    </div>
  );

  const DashboardView = () => (
    <>
      <section className="row row-top">
        <div className="card stats-card">
          <div className="stat">
            <div className="stat-label">
              Compliments <span className="up">▲</span>
            </div>
            <strong>{stats.compliments}</strong>
          </div>
          <div className="stat">
            <div className="stat-label">
              Reactions <span className="up">▲</span>
            </div>
            <strong>{stats.reactions}</strong>
          </div>
          <div className="stat">
            <div className="stat-label">
              Comments <span className="up">▲</span>
            </div>
            <strong>{stats.comments}</strong>
          </div>
          <div className="stat">
            <div className="stat-label">
              Users <span className="up">▲</span>
            </div>
            <strong>{stats.users}</strong>
          </div>
          <div className="stat">
            <div className="stat-label">
              Reported{" "}
              {pending.length > 0 ? (
                <span className="down">▼</span>
              ) : (
                <span className="up">▲</span>
              )}
            </div>
            <strong>{stats.reported}</strong>
          </div>
        </div>

        <div className="card pulse-card">
          <div className="pulse-text">
            <small>COMMUNITY PULSE</small>
            <h3>
              92% <span>kind &amp; positive</span>
            </h3>
            <p>Reactions this week were mostly ❤️ and 😊</p>
            <button className="pulse-btn" onClick={() => goTo("Analytics")}>
              View Full Report
            </button>
          </div>
          <div className="pulse-ring">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" className="ring-track" />
              <circle
                cx="60"
                cy="60"
                r="50"
                className="ring-value"
                style={{
                  strokeDasharray: `${2 * Math.PI * 50}`,
                  strokeDashoffset: `${2 * Math.PI * 50 * (1 - 0.92)}`,
                }}
              />
            </svg>
            <span className="ring-emoji">💌</span>
          </div>
        </div>
      </section>

      <section className="row row-mid">
        <div className="card activity-card">
          <div className="card-head">
            <h2>Activity</h2>
            <span className="subtle">Compliments posted per day</span>
            <select className="range" defaultValue="week">
              <option value="week">This week</option>
              <option value="month">This month</option>
            </select>
          </div>
          <svg
            className="activity-chart"
            viewBox={`0 0 ${chartW} ${chartH}`}
            onMouseLeave={() => setHovered(null)}
          >
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FF6BAA" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75, 1].map((f) => (
              <line
                key={f}
                x1={padX}
                x2={chartW - padX}
                y1={padY + f * (chartH - padY * 2)}
                y2={padY + f * (chartH - padY * 2)}
                className="grid-line"
              />
            ))}
            <path d={areaPath} fill="url(#areaFill)" stroke="none" />
            <path d={linePath} fill="none" stroke="url(#lineStroke)" strokeWidth="3" />
            {points.map((p, i) => (
              <circle
                key={p.day}
                cx={p.x}
                cy={p.y}
                r={hovered === i ? 7 : 5}
                className="chart-point"
                onMouseEnter={() => setHovered(i)}
              />
            ))}
          </svg>
          <div className="chart-x-labels">
            {points.map((p) => (
              <span key={p.day}>{p.day}</span>
            ))}
          </div>
          {activePoint && (
            <div
              className="chart-tooltip"
              style={{
                left: `${(activePoint.x / chartW) * 100}%`,
                top: `${(activePoint.y / chartH) * 100}%`,
              }}
            >
              <strong>{activePoint.value}</strong>
              <span>compliments</span>
            </div>
          )}
        </div>

        <div className="card top-card">
          <div className="card-head">
            <h2>Most Loved</h2>
          </div>
          <ul className="top-list">
            {mostLoved.length === 0 && (
              <li style={{ opacity: 0.6 }}>No compliments yet</li>
            )}
            {mostLoved.map((item, i) => (
              <li key={item.id}>
                <span className="rank">{i + 1}</span>
                <span className="avatar-emoji">{item.emoji}</span>
                <div className="top-item-text">
                  <strong>{item.to}</strong>
                  <span>{item.total} reactions</span>
                </div>
                <span className="pct">{item.pct}%</span>
              </li>
            ))}
          </ul>
          <button className="link-btn" onClick={() => goTo("All Compliments")}>
            View More →
          </button>
        </div>
      </section>

      <section className="card mini-reports">
        <div className="card-head-row">
          <div>
            <h2>Reported Posts</h2>
            <span className="subtle">
              {pending.length === 0
                ? "Nothing waiting for review right now."
                : `${pending.length} post${
                    pending.length === 1 ? "" : "s"
                  } waiting for review.`}
            </span>
          </div>
          <button className="link-btn" onClick={() => goTo("Reported Posts")}>
            Review queue →
          </button>
        </div>
        {pending.length > 0 && (
          <div className="report-list">
            {pending.slice(0, 2).map((r) => (
              <ReportRow r={r} key={r.id} />
            ))}
          </div>
        )}
      </section>
    </>
  );

  const ReportedPostsView = () => {
    const list =
      tab === "pending"
        ? pending.filter(matchesQuery)
        : moderationLog.filter(matchesQuery);
    return (
      <section className="card moderation">
        <div className="card-head">
          <h2>Reported Posts</h2>
          <span className="subtle">
            Review flagged compliments — approve to keep live, or delete permanently.
          </span>
        </div>
        <div className="tabs">
          <button
            className={tab === "pending" ? "active" : ""}
            onClick={() => setTab("pending")}
          >
            Pending ({pending.length})
          </button>
          <button
            className={tab === "resolved" ? "active" : ""}
            onClick={() => setTab("resolved")}
          >
            Resolved ({moderationLog.length})
          </button>
        </div>
        <div className="report-list">
          {list.length === 0 && (
            <div className="empty">
              {tab === "pending"
                ? "🌸 All caught up — nothing waiting for review."
                : "No resolved reports yet."}
            </div>
          )}
          {tab === "pending"
            ? list.map((r) => <ReportRow r={r} key={r.id} />)
            : list.map((r, i) => <ReportRow r={r} key={`${r.id}-${i}`} resolved />)}
        </div>
      </section>
    );
  };

  const AllComplimentsView = () => {
    const list = allCompliments.filter(matchesQuery);
    return (
      <section className="card moderation">
        <div className="card-head">
          <h2>All Compliments</h2>
          <span className="subtle">
            {list.length} from database. Admins can delete any of them.
          </span>
        </div>
        <div className="report-list">
          {list.length === 0 && (
            <div className="empty">No compliments match that search.</div>
          )}
          {list.map((c) => {
            const total = (c.counts || [0, 0, 0]).reduce((a, b) => a + b, 0);
            return (
              <div className="report-row" key={c.id}>
                <span className="report-emoji">{c.emoji}</span>
                <div className="report-body">
                  <div className="report-to">
                    TO: {c.to}{" "}
                    {c.reported && <span className="inline-flag">🚩 reported</span>}
                  </div>
                  <p className="report-message">"{c.message}"</p>
                  <div className="report-meta">
                    <span className="report-comments">❤️ {total} reactions</span>
                    <span className="report-comments">
                      💬 {c.commentsCount || 0} comments
                    </span>
                    <span className="report-time">{c.time}</span>
                  </div>
                </div>
                <div className="report-actions">
                  <button className="delete-btn" onClick={() => setConfirmTarget(c)}>
                    🗑 Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const UsersView = () => {
    const list = users.filter(matchesQuery);
    return (
      <section className="card moderation">
        <div className="card-head">
          <h2>Users</h2>
          <span className="subtle">{list.length} registered users from MongoDB.</span>
        </div>
        <div className="report-list">
          {list.length === 0 && <div className="empty">No users found.</div>}
          {list.map((u) => (
            <div className="report-row" key={u.id}>
              <span className="report-emoji">👤</span>
              <div className="report-body">
                <div className="report-to">
                  {u.firstName} {u.lastName}{" "}
                  <span style={{ opacity: 0.6 }}>@{u.username}</span>
                  {u.suspended && (
                    <span className="status-tag tag-deleted" style={{ marginLeft: 8 }}>
                      Suspended
                    </span>
                  )}
                </div>
                <p className="report-message">{u.email}</p>
                <div className="report-meta">
                  <span className="report-comments">💌 {u.complimentsShared} shared</span>
                  <span className="report-comments">❤️ {u.reactionsGiven} reactions</span>
                  <span className="report-comments">🔥 {u.dayStreak} day streak</span>
                </div>
              </div>
              <div className="report-actions">
                {u.suspended ? (
                  <button className="approve-btn" onClick={() => handleUnsuspend(u)}>
                    ✓ Unsuspend
                  </button>
                ) : (
                  <button className="delete-btn" onClick={() => handleSuspend(u)}>
                    ⏸ Suspend
                  </button>
                )}
                <button
                  className="delete-btn"
                  onClick={() => setConfirmUserTarget(u)}
                >
                  🗑 Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const CommentsView = () => (
    <section className="card moderation">
      <div className="card-head">
        <h2>Comments</h2>
        <span className="subtle">
          {allCompliments.length} compliments across {wallCategories.length} categories.
        </span>
      </div>
      <ul className="comment-leaderboard big">
        {categoryBreakdown.map((c) => (
          <li key={c.key}>
            <span className="comment-emoji">{c.emoji}</span>
            <span className="comment-to">{c.label}</span>
            <div className="comment-bar-track">
              <div
                className="comment-bar-fill"
                style={{
                  width: `${
                    (c.count / Math.max(1, categoryBreakdown[0]?.count || 1)) * 100
                  }%`,
                }}
              />
            </div>
            <span className="comment-count">{c.count}</span>
          </li>
        ))}
      </ul>
    </section>
  );

  const AnalyticsView = () => (
    <>
      <section className="card activity-card full">
        <div className="card-head">
          <h2>Activity</h2>
          <span className="subtle">Compliments posted per day</span>
        </div>
        <svg
          className="activity-chart"
          viewBox={`0 0 ${chartW} ${chartH}`}
          onMouseLeave={() => setHovered(null)}
        >
          <defs>
            <linearGradient id="areaFill2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineStroke2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FF6BAA" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <line
              key={f}
              x1={padX}
              x2={chartW - padX}
              y1={padY + f * (chartH - padY * 2)}
              y2={padY + f * (chartH - padY * 2)}
              className="grid-line"
            />
          ))}
          <path d={areaPath} fill="url(#areaFill2)" stroke="none" />
          <path d={linePath} fill="none" stroke="url(#lineStroke2)" strokeWidth="3" />
          {points.map((p, i) => (
            <circle
              key={p.day}
              cx={p.x}
              cy={p.y}
              r={hovered === i ? 7 : 5}
              className="chart-point"
              onMouseEnter={() => setHovered(i)}
            />
          ))}
        </svg>
        <div className="chart-x-labels">
          {points.map((p) => (
            <span key={p.day}>{p.day}</span>
          ))}
        </div>
      </section>
      <section className="row row-bottom">
        <div className="card pulse-card full-height">
          <div className="pulse-text">
            <small>FROM DATABASE</small>
            <h3>
              {stats.compliments} <span>compliments · {stats.users} users</span>
            </h3>
            <p>
              {stats.reactions} reactions · {stats.comments} comments · {stats.reported}{" "}
              reported
            </p>
          </div>
        </div>
        <div className="card categories-card">
          <div className="card-head">
            <h2>Categories</h2>
          </div>
          <div className="category-grid">
            {categories.map((c) => (
              <div className="category-pill" key={c.name}>
                <span className="category-emoji">{c.emoji}</span>
                <strong>{c.name}</strong>
                <span className={c.up ? "up" : "down"}>{c.change}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );

  const SettingsView = () => (
    <section className="card settings-card">
      <div className="card-head">
        <h2>Settings</h2>
        <span className="subtle">
          Demo controls — change admin password in backend env.
        </span>
      </div>
      <div className="settings-list">
        <label className="settings-row">
          <div>
            <strong>Require review before publishing</strong>
            <span>
              New compliments wait for admin approval before appearing on the wall.
            </span>
          </div>
          <input type="checkbox" />
        </label>
        <label className="settings-row">
          <div>
            <strong>Auto-flag after 3 reports</strong>
            <span>Automatically move a post into the queue once 3 people report it.</span>
          </div>
          <input type="checkbox" defaultChecked />
        </label>
      </div>
      <button className="pulse-btn" onClick={() => showToast("Settings saved.")}>
        Save Settings
      </button>
      <button className="delete-btn" style={{ marginLeft: 12 }} onClick={handleLogout}>
        Log out
      </button>
    </section>
  );

  const views = {
    Dashboard: <DashboardView />,
    "Reported Posts": <ReportedPostsView />,
    "All Compliments": <AllComplimentsView />,
    Users: <UsersView />,
    Comments: <CommentsView />,
    Analytics: <AnalyticsView />,
    Settings: <SettingsView />,
  };

  const subtitleFor = {
    Dashboard: "Live numbers from your MongoDB confidia database.",
    "Reported Posts": "Keep the wall kind and safe.",
    "All Compliments": "Every compliment currently in the database.",
    Users: "Registered users from confidia.users collection.",
    Comments: "See how much conversation each post is getting.",
    Analytics: "Deeper look at engagement.",
    Settings: "Configure how moderation behaves.",
  };

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <Link to="/" className="logo">
          <img src={logo} alt="Confidia" />
          <span>Confidia</span>
        </Link>
        <nav className="nav">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`nav-item ${activeNav === item.label ? "active" : ""}`}
              onClick={() => goTo(item.label)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.badge && pending.length > 0 && (
                <span className="nav-count">{pending.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="profile">
          <div className="avatar">A</div>
          <div>
            <strong>Admin</strong>
            <span>Moderator · Confidia</span>
          </div>
        </div>
      </aside>

      <main className="main">
        {toast && <div className="toast">{toast}</div>}
        {loading && (
          <div className="toast" style={{ background: "#8B5CF6" }}>
            Loading from database…
          </div>
        )}
        <header className="topbar">
          <div>
            <h1>{activeNav}</h1>
            <p>{subtitleFor[activeNav]}</p>
          </div>
          <div className="top-actions">
            {searchOpen && (
              <input
                autoFocus
                className="topbar-search"
                placeholder="Search…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onBlur={() => {
                  if (!query) setSearchOpen(false);
                }}
              />
            )}
            <button
              className="icon-btn"
              title="Search"
              onClick={() => setSearchOpen((v) => !v)}
            >
              🔍
            </button>
            <div className="bell-wrapper">
              <button
                className="icon-btn"
                title="Notifications"
                onClick={() => setBellOpen((v) => !v)}
              >
                🔔
                {pending.length > 0 && <span className="icon-dot" />}
              </button>
              {bellOpen && (
                <div className="bell-dropdown">
                  <div className="bell-head">Notifications</div>
                  {pending.length === 0 ? (
                    <div className="bell-empty">🌸 Nothing needs your attention.</div>
                  ) : (
                    <>
                      {pending.slice(0, 3).map((r) => (
                        <div className="bell-item" key={r.id}>
                          <span>{r.emoji}</span>
                          <div>
                            <p>New report on a compliment to {r.to}</p>
                            <span>{r.time}</span>
                          </div>
                        </div>
                      ))}
                      <button className="bell-cta" onClick={() => goTo("Reported Posts")}>
                        Review now →
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
            <button
              className="icon-btn"
              title="Settings"
              onClick={() => goTo("Settings")}
            >
              ⚙️
            </button>
          </div>
        </header>
        {views[activeNav]}
      </main>

      {confirmTarget && (
        <div className="confirm-overlay" onClick={() => setConfirmTarget(null)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">🗑️</div>
            <h3>Delete this compliment?</h3>
            <p>
              "{confirmTarget.message}" will be removed from the wall for everyone. This
              can't be undone.
            </p>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={() => setConfirmTarget(null)}>
                Cancel
              </button>
              <button className="confirm-delete" onClick={handleDeleteConfirmed}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmUserTarget && (
        <div className="confirm-overlay" onClick={() => setConfirmUserTarget(null)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">🗑️</div>
            <h3>Remove this user?</h3>
            <p>
              @{confirmUserTarget.username}'s account and their posts will be
              permanently deleted. This can't be undone.
            </p>
            <div className="confirm-actions">
              <button
                className="confirm-cancel"
                onClick={() => setConfirmUserTarget(null)}
              >
                Cancel
              </button>
              <button className="confirm-delete" onClick={handleRemoveUserConfirmed}>
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
