import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../style/AdminDashboard.css";
import logo from "../assets/Images/logo.png";
import useAppStore from "../store/useAppStore";

/* =====================================================
   STATIC MOCK DATA
   (lifetime platform totals + the weekly chart — the
   moderation data below comes from the real shared store)
===================================================== */

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

const navItems = [
  { label: "Dashboard", icon: "🏠" },
  { label: "Reported Posts", icon: "🚩", badge: true },
  { label: "All Compliments", icon: "💌" },
  { label: "Comments", icon: "💬" },
  { label: "Analytics", icon: "📊" },
  { label: "Settings", icon: "⚙️" },
];

/* =====================================================
   COMPONENT
===================================================== */

const AdminDashboard = () => {
  const compliments = useAppStore((state) => state.compliments);
  const reactionCounts = useAppStore((state) => state.reactionCounts);
  const moderationLog = useAppStore((state) => state.moderationLog);
  const approveReport = useAppStore((state) => state.approveReport);
  const deleteCompliment = useAppStore((state) => state.deleteCompliment);

  const [activeNav, setActiveNav] = useState("Dashboard");
  const [tab, setTab] = useState("pending");
  const [hovered, setHovered] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [bellOpen, setBellOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const pending = compliments.filter((c) => c.reported);

  const totalComments = useMemo(
    () => compliments.reduce((sum, c) => sum + (c.commentsCount || 0), 0),
    [compliments]
  );

  const mostLoved = useMemo(() => {
    const withTotals = compliments.map((c) => {
      const counts = reactionCounts[c.id] || c.counts || [0, 0, 0];
      const total = counts.reduce((a, b) => a + b, 0);
      return { ...c, total };
    });
    const max = Math.max(1, ...withTotals.map((c) => c.total));
    return withTotals
      .sort((a, b) => b.total - a.total)
      .slice(0, 3)
      .map((c) => ({ ...c, pct: Math.round((c.total / max) * 100) }));
  }, [compliments, reactionCounts]);

  const commentLeaderboard = useMemo(
    () =>
      [...compliments]
        .sort((a, b) => (b.commentsCount || 0) - (a.commentsCount || 0))
        .slice(0, 6),
    [compliments]
  );

  const matchesQuery = (c) =>
    query.trim() === "" ||
    c.to.toLowerCase().includes(query.toLowerCase()) ||
    c.message.toLowerCase().includes(query.toLowerCase());

  const showToast = (text) => {
    setToast(text);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 2600);
  };

  const handleApprove = (c) => {
    approveReport(c.id);
    showToast(`Approved — "${c.to}" stays live on the wall.`);
  };

  const handleDeleteConfirmed = () => {
    if (!confirmTarget) return;
    deleteCompliment(confirmTarget.id);
    showToast(`Deleted — the post to "${confirmTarget.to}" is gone for good.`);
    setConfirmTarget(null);
  };

  const goTo = (label) => {
    setActiveNav(label);
    setBellOpen(false);
  };

  /* ---------- chart geometry ---------- */
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
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartH - padY} L ${points[0].x} ${chartH - padY} Z`;
  const activePoint = hovered !== null ? points[hovered] : points[points.length - 2];

  /* =====================================================
     RENDER HELPERS — each nav item shows a distinct view
  ===================================================== */

  const ReportRow = ({ r, resolved }) => (
    <div className="report-row">
      <span className="report-emoji">{r.emoji}</span>

      <div className="report-body">
        <div className="report-to">TO: {r.to}</div>
        <p className="report-message">"{r.message}"</p>
        <div className="report-meta">
          {r.reportReason && <span className="report-reason">🚩 {r.reportReason}</span>}
          <span className="report-comments">
            💬 {r.commentsCount || 0} comment{r.commentsCount === 1 ? "" : "s"}
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
        <span className={`status-tag ${r.action === "approved" ? "tag-approved" : "tag-deleted"}`}>
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
            <div className="stat-label">Compliments <span className="up">▲</span></div>
            <strong>1,248</strong>
          </div>
          <div className="stat">
            <div className="stat-label">Reactions <span className="up">▲</span></div>
            <strong>9,340</strong>
          </div>
          <div className="stat">
            <div className="stat-label">Comments <span className="up">▲</span></div>
            <strong>{totalComments}</strong>
          </div>
          <div className="stat">
            <div className="stat-label">Reported {pending.length > 0 ? <span className="down">▼</span> : <span className="up">▲</span>}</div>
            <strong>{pending.length}</strong>
          </div>
        </div>

        <div className="card pulse-card">
          <div className="pulse-text">
            <small>COMMUNITY PULSE</small>
            <h3>92% <span>kind &amp; positive</span></h3>
            <p>Reactions this week were mostly ❤️ and 😊</p>
            <button className="pulse-btn" onClick={() => goTo("Analytics")}>
              View Full Report
            </button>
          </div>
          <div className="pulse-ring">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" className="ring-track" />
              <circle
                cx="60" cy="60" r="50" className="ring-value"
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

          <svg className="activity-chart" viewBox={`0 0 ${chartW} ${chartH}`} onMouseLeave={() => setHovered(null)}>
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
              <line key={f} x1={padX} x2={chartW - padX}
                y1={padY + f * (chartH - padY * 2)} y2={padY + f * (chartH - padY * 2)}
                className="grid-line" />
            ))}

            <path d={areaPath} fill="url(#areaFill)" stroke="none" />
            <path d={linePath} fill="none" stroke="url(#lineStroke)" strokeWidth="3" />

            {points.map((p, i) => (
              <circle key={p.day} cx={p.x} cy={p.y} r={hovered === i ? 7 : 5}
                className="chart-point" onMouseEnter={() => setHovered(i)} />
            ))}
          </svg>

          <div className="chart-x-labels">
            {points.map((p) => <span key={p.day}>{p.day}</span>)}
          </div>

          {activePoint && (
            <div className="chart-tooltip" style={{ left: `${(activePoint.x / chartW) * 100}%`, top: `${(activePoint.y / chartH) * 100}%` }}>
              <strong>{activePoint.value}</strong>
              <span>compliments</span>
            </div>
          )}
        </div>

        <div className="card top-card">
          <div className="card-head"><h2>Most Loved</h2></div>

          <ul className="top-list">
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
                : `${pending.length} post${pending.length === 1 ? "" : "s"} waiting for review.`}
            </span>
          </div>
          <button className="link-btn" onClick={() => goTo("Reported Posts")}>
            Review queue →
          </button>
        </div>

        {pending.length > 0 && (
          <div className="report-list">
            {pending.slice(0, 2).map((r) => <ReportRow r={r} key={r.id} />)}
          </div>
        )}
      </section>

      <section className="card categories-card">
        <div className="card-head">
          <h2>Categories</h2>
          <span className="subtle">Compliments by who they're for, this week.</span>
        </div>

        <div className="category-grid">
          {categories.map((c) => (
            <div className="category-pill" key={c.name}>
              <span className="category-emoji">{c.emoji}</span>
              <strong>{c.name}</strong>
              <span className={c.up ? "up" : "down"}>{c.change}</span>
            </div>
          ))}
          <div className="category-pill category-cta">
            <span>Full Stats</span>
            <button className="pulse-btn small" onClick={() => goTo("Analytics")}>View →</button>
          </div>
        </div>
      </section>
    </>
  );

  const ReportedPostsView = () => {
    const resolved = moderationLog;
    const list = tab === "pending" ? pending.filter(matchesQuery) : resolved.filter(matchesQuery);

    return (
      <section className="card moderation">
        <div className="card-head">
          <h2>Reported Posts</h2>
          <span className="subtle">
            Review flagged compliments — approve to keep the post live, or delete it permanently.
          </span>
        </div>

        <div className="tabs">
          <button className={tab === "pending" ? "active" : ""} onClick={() => setTab("pending")}>
            Pending ({pending.length})
          </button>
          <button className={tab === "resolved" ? "active" : ""} onClick={() => setTab("resolved")}>
            Resolved ({resolved.length})
          </button>
        </div>

        <div className="report-list">
          {list.length === 0 && (
            <div className="empty">
              {tab === "pending" ? "🌸 All caught up — nothing waiting for review." : "No resolved reports yet."}
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
    const list = compliments.filter(matchesQuery);
    return (
      <section className="card moderation">
        <div className="card-head">
          <h2>All Compliments</h2>
          <span className="subtle">{list.length} live on the wall right now. Admins can delete any of them.</span>
        </div>

        <div className="report-list">
          {list.length === 0 && <div className="empty">No compliments match that search.</div>}

          {list.map((c) => {
            const counts = reactionCounts[c.id] || c.counts || [0, 0, 0];
            const total = counts.reduce((a, b) => a + b, 0);
            return (
              <div className="report-row" key={c.id}>
                <span className="report-emoji">{c.emoji}</span>
                <div className="report-body">
                  <div className="report-to">
                    TO: {c.to} {c.reported && <span className="inline-flag">🚩 reported</span>}
                  </div>
                  <p className="report-message">"{c.message}"</p>
                  <div className="report-meta">
                    <span className="report-comments">❤️ {total} reactions</span>
                    <span className="report-comments">💬 {c.commentsCount || 0} comments</span>
                    <span className="report-time">{c.time}</span>
                  </div>
                </div>
                <div className="report-actions">
                  <button className="delete-btn" onClick={() => setConfirmTarget(c)}>🗑 Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const CommentsView = () => (
    <section className="card moderation">
      <div className="card-head">
        <h2>Comments</h2>
        <span className="subtle">{totalComments} total comments across the wall.</span>
      </div>

      <ul className="comment-leaderboard big">
        {commentLeaderboard.filter(matchesQuery).map((c) => (
          <li key={c.id}>
            <span className="comment-emoji">{c.emoji}</span>
            <span className="comment-to">{c.to}</span>
            <div className="comment-bar-track">
              <div
                className="comment-bar-fill"
                style={{ width: `${((c.commentsCount || 0) / Math.max(1, commentLeaderboard[0]?.commentsCount || 1)) * 100}%` }}
              />
            </div>
            <span className="comment-count">{c.commentsCount || 0}</span>
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
        <svg className="activity-chart" viewBox={`0 0 ${chartW} ${chartH}`} onMouseLeave={() => setHovered(null)}>
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
            <line key={f} x1={padX} x2={chartW - padX}
              y1={padY + f * (chartH - padY * 2)} y2={padY + f * (chartH - padY * 2)}
              className="grid-line" />
          ))}
          <path d={areaPath} fill="url(#areaFill2)" stroke="none" />
          <path d={linePath} fill="none" stroke="url(#lineStroke2)" strokeWidth="3" />
          {points.map((p, i) => (
            <circle key={p.day} cx={p.x} cy={p.y} r={hovered === i ? 7 : 5} className="chart-point" onMouseEnter={() => setHovered(i)} />
          ))}
        </svg>
        <div className="chart-x-labels">{points.map((p) => <span key={p.day}>{p.day}</span>)}</div>
      </section>

      <section className="row row-bottom">
        <div className="card pulse-card full-height">
          <div className="pulse-text">
            <small>COMMUNITY PULSE</small>
            <h3>92% <span>kind &amp; positive</span></h3>
            <p>Reactions this week were mostly ❤️ and 😊. Reported posts stayed under 1% of total volume.</p>
          </div>
          <div className="pulse-ring">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" className="ring-track" />
              <circle cx="60" cy="60" r="50" className="ring-value" style={{ strokeDasharray: `${2 * Math.PI * 50}`, strokeDashoffset: `${2 * Math.PI * 50 * (1 - 0.92)}` }} />
            </svg>
            <span className="ring-emoji">💌</span>
          </div>
        </div>

        <div className="card categories-card">
          <div className="card-head"><h2>Categories</h2></div>
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
        <span className="subtle">These are demo controls — wire them up to your backend when it's ready.</span>
      </div>

      <div className="settings-list">
        <label className="settings-row">
          <div>
            <strong>Require review before publishing</strong>
            <span>New compliments wait for admin approval before appearing on the wall.</span>
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

        <label className="settings-row">
          <div>
            <strong>Weekly digest email</strong>
            <span>Send a summary of activity and reports every Monday.</span>
          </div>
          <select defaultValue="weekly">
            <option value="off">Off</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </label>
      </div>

      <button className="pulse-btn" onClick={() => showToast("Settings saved.")}>
        Save Settings
      </button>
    </section>
  );

  const views = {
    "Dashboard": <DashboardView />,
    "Reported Posts": <ReportedPostsView />,
    "All Compliments": <AllComplimentsView />,
    "Comments": <CommentsView />,
    "Analytics": <AnalyticsView />,
    "Settings": <SettingsView />,
  };

  const subtitleFor = {
    "Dashboard": "A quick look at kindness across campus today.",
    "Reported Posts": "Keep the wall kind and safe.",
    "All Compliments": "Every compliment currently live on the wall.",
    "Comments": "See how much conversation each post is getting.",
    "Analytics": "Deeper look at engagement this week.",
    "Settings": "Configure how moderation behaves.",
  };

  return (
    <div className="admin-shell">
      {/* =========================================================
          SIDEBAR
      ========================================================= */}
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

      {/* =========================================================
          MAIN
      ========================================================= */}
      <main className="main">
        {toast && <div className="toast">{toast}</div>}

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
                placeholder="Search compliments..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onBlur={() => { if (!query) setSearchOpen(false); }}
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

            <button className="icon-btn" title="Settings" onClick={() => goTo("Settings")}>
              ⚙️
            </button>
          </div>
        </header>

        {views[activeNav]}
      </main>

      {/* =========================================================
          DELETE CONFIRMATION
      ========================================================= */}
      {confirmTarget && (
        <div className="confirm-overlay" onClick={() => setConfirmTarget(null)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">🗑️</div>
            <h3>Delete this compliment?</h3>
            <p>
              "{confirmTarget.message}" will be removed from the wall for
              everyone. This can't be undone.
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
    </div>
  );
};

export default AdminDashboard;
