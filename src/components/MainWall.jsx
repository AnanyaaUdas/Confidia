import React, { useEffect, useState } from "react";
import ComplimentCard from "./ComplimentCard";
import useAppStore from "../store/useAppStore";

const filters = [
  { label: "Everyone", emoji: "🌸", value: "everyone" },
  { label: "Friends", emoji: "❤️", value: "friends" },
  { label: "Teachers", emoji: "👩‍🏫", value: "teacher" },
  { label: "College", emoji: "🏫", value: "college" },
  { label: "Clubs", emoji: "🎓", value: "clubs" },
];

const MainWall = () => {
  const [activeFilter, setActiveFilter] = useState("everyone");
  const [openReply, setOpenReply] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [search, setSearch] = useState("");

  const compliments = useAppStore((state) => state.compliments);
  const reactionCounts = useAppStore((state) => state.reactionCounts);
  const userReactions = useAppStore((state) => state.userReactions);
  const handleReaction = useAppStore((state) => state.handleReaction);
  const loading = useAppStore((state) => state.loading);

  const [highlightInfo, setHighlightInfo] = useState(null);

  useEffect(() => {
    const readNavigation = () => {
      const raw = sessionStorage.getItem("notificationNavigation");
      if (!raw) return;
      try {
        const data = JSON.parse(raw);
        sessionStorage.removeItem("notificationNavigation");
        if (!data?.complimentId) return;
        setHighlightInfo(data);
        setActiveFilter("everyone");
        setSearch("");
      } catch (e) {
        console.error("notification navigation parse error:", e);
      }
    };

    readNavigation();
    window.addEventListener("notification-navigation", readNavigation);
    return () =>
      window.removeEventListener("notification-navigation", readNavigation);
  }, []);

  useEffect(() => {
    if (!highlightInfo?.complimentId) return;
    const el = document.getElementById(`compliment-${highlightInfo.complimentId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightInfo, compliments]);

  const filteredCompliments = compliments
    .filter((item) =>
      activeFilter === "everyone" ? true : item.category === activeFilter,
    )
    .filter((item) =>
      search.trim() === ""
        ? true
        : item.to.toLowerCase().includes(search.toLowerCase()) ||
          item.message.toLowerCase().includes(search.toLowerCase()),
    );

  return (
    <section className="wall-page">
      {/* HEADER */}

      <div className="wall-header">
        <h1>Recent compliments</h1>

        <p>Browse by who made your day.</p>
      </div>

      {/* SEARCH */}

      <div className="wall-search">
        <span>🔍</span>

        <input
          type="text"
          placeholder='Search "Computer Department"...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* FILTERS */}

      <div className="filter-row">
        {filters.map((filter) => (
          <button
            key={filter.value}

            className={activeFilter === filter.value ? "filter-btn active" : "filter-btn"}

            onClick={() => setActiveFilter(filter.value)}
          >
            <span>{filter.emoji}</span>

            {filter.label}
          </button>
        ))}
      </div>

      {/* COMPLIMENT CARDS */}

      <div className="compliment-grid">
        {loading && compliments.length === 0 && (
          <>
            <div className="skeleton-card" />
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </>
        )}

        {!loading && filteredCompliments.length === 0 && (
          <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
            <h3>No compliments yet</h3>
            <p>
              {search.trim()
                ? "Nothing matches that search. Try another keyword."
                : "Be the first to brighten someone’s day."}
            </p>
          </div>
        )}

        {filteredCompliments.map((item) => (
          <ComplimentCard
            key={item.id}
            item={item}
            openReply={openReply}
            setOpenReply={setOpenReply}
            replyText={replyText}
            setReplyText={setReplyText}
            reactionCounts={reactionCounts}
            userReactions={userReactions}
            handleReaction={handleReaction}
            highlighted={String(item.id) === String(highlightInfo?.complimentId)}
            highlightedReplyId={
              String(item.id) === String(highlightInfo?.complimentId)
                ? highlightInfo?.replyId
                : null
            }
            notificationType={
              String(item.id) === String(highlightInfo?.complimentId)
                ? highlightInfo?.type
                : null
            }
          />
        ))}
      </div>
    </section>
  );
};

export default MainWall;
