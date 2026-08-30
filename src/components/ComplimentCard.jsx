import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import ReactionButton from "./ReactionButton";
import useAppStore from "../store/useAppStore";

const ComplimentCard = ({
  item,
  openReply,
  setOpenReply,
  replyText,
  setReplyText,
  reactionCounts,
  userReactions,
  handleReaction,
  highlighted = false,
  highlightedReplyId = null,
  notificationType = null,
}) => {
  const navigate = useNavigate();
  const isLoggedIn = useAppStore((s) => s.isLoggedIn);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportError, setReportError] = useState("");

  const reportCompliment = useAppStore((state) => state.reportCompliment);
  const addReply = useAppStore((state) => state.addReply);
  const [sendingReply, setSendingReply] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

  const isReported = !!item.reported;
  const counts = reactionCounts[item.id] || item.counts || [0, 0, 0];
  const reactions = Array.isArray(item.reactions) ? item.reactions : ["❤️", "😊", "👏"];
  const replies = Array.isArray(item.replies) ? item.replies : [];

  const openReport = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isReported || reporting) return;
    if (!isLoggedIn) {
      navigate("/user-login", { state: { from: "/wall" } });
      return;
    }
    setReportError("");
    setShowReportModal(true);
  };

  const closeReport = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (reporting) return;
    setShowReportModal(false);
    setReportError("");
  };

  const confirmReport = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (reporting || isReported) return;

    setReporting(true);
    setReportError("");
    try {
      await reportCompliment(item.id, "Reported by a user");
      setShowReportModal(false);
    } catch (err) {
      console.error(err);
      setReportError(err?.message || "Could not report. Is the backend running?");
    } finally {
      setReporting(false);
    }
  };

  const reportModal =
    showReportModal &&
    createPortal(
      <div
        className="report-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
        onClick={closeReport}
        onKeyDown={(e) => {
          if (e.key === "Escape") closeReport(e);
        }}
      >
        <div className="report-modal" onClick={(e) => e.stopPropagation()}>
          <div className="report-icon">🚩</div>
          <h3 id="report-title">Report this compliment?</h3>
          <p>
            This will flag the post for review. You're helping keep the wall kind and
            safe.
          </p>
          {reportError && (
            <p className="report-error" style={{ color: "#e11d48", marginTop: -8 }}>
              {reportError}
            </p>
          )}
          <div className="report-actions">
            <button
              type="button"
              className="report-cancel"
              onClick={closeReport}
              disabled={reporting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="report-confirm"
              onClick={confirmReport}
              disabled={reporting}
            >
              {reporting ? "Reporting…" : "Yes, Report"}
            </button>
          </div>
        </div>
      </div>,
      document.body,
    );

  const toggleReplyBox = () => {
    if (openReply === item.id) {
      setOpenReply(null);
      setReplyingTo(null);
      setReplyText("");
    } else {
      setOpenReply(item.id);
    }
  };

  const handleReplyToPerson = (reply) => {
    if (!reply.repliedBy) return;
    setReplyingTo(reply.repliedBy);
    setOpenReply(item.id);
    setReplyText("");
  };

  const notificationCardStyle = highlighted
    ? {
        border: "3px solid #7c3aed",
        boxShadow:
          "0 0 0 5px rgba(124, 58, 237, 0.18), 0 12px 35px rgba(124, 58, 237, 0.3)",
        transform: "scale(1.015)",
        transition: "all 0.3s ease",
        position: "relative",
        zIndex: 10,
      }
    : {};

  return (
    <article
      id={`compliment-${item.id}`}
      className="compliment-card"
      style={notificationCardStyle}
    >
      {highlighted && (
        <div
          style={{
            position: "absolute",
            top: "-14px",
            left: "20px",
            background: "#7c3aed",
            color: "white",
            padding: "6px 14px",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: "700",
            zIndex: 20,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          {notificationType === "reply" ? "💌 Your notification" : "🔔 Your notification"}
        </div>
      )}

      <div className="card-top">
        <div>
          {item.featured && <div className="featured-label">⭐ FEATURED</div>}
          <div className="anonymous">
            💙 <span>Anonymous</span>
          </div>
        </div>
        <span className="card-emoji">{item.emoji || "💌"}</span>
      </div>

      <div className="card-to">TO: {item.to}</div>

      <p className="card-message">"{item.message}"</p>

      <div className="card-time">{item.time}</div>

      <div className="reaction-row">
        {reactions.map((reaction, reactionIndex) => {
          const reactionKey = `${item.id}-${reactionIndex}`;
          const isSelected = userReactions[reactionKey];
          return (
            <ReactionButton
              key={reactionIndex}
              emoji={reaction}
              count={counts[reactionIndex] || 0}
              selected={isSelected}
              onClick={async () => {
                if (!isLoggedIn) {
                  navigate("/user-login", { state: { from: "/wall" } });
                  return;
                }
                try {
                  await handleReaction(item.id, reactionIndex);
                } catch (err) {
                  if (
                    String(err.message || "")
                      .toLowerCase()
                      .includes("log in")
                  ) {
                    navigate("/user-login", { state: { from: "/wall" } });
                  } else {
                    alert(err.message || "Could not react");
                  }
                }
              }}
            />
          );
        })}

        <button
          type="button"
          className="report-btn"
          onClick={openReport}
          disabled={isReported || reporting}
        >
          {isReported ? "Reported" : "Report"}
        </button>
      </div>

      <div className="card-divider" />

      {replies.length > 0 && (
        <div className="replies-section">
          <div className="replies-title">
            <span>💌</span>
            <span>Replies</span>
            <span className="reply-count">{replies.length}</span>
          </div>

          <div className="replies-list">
            {replies.map((reply, replyIndex) => {
              const replyId = reply._id || reply.id;
              const isHighlightedReply =
                highlightedReplyId && String(replyId) === String(highlightedReplyId);
              return (
                <div
                  id={replyId ? `reply-${replyId}` : undefined}
                  className="reply-item"
                  style={
                    isHighlightedReply
                      ? {
                          border: "2px solid #ec4899",
                          background: "rgba(236, 72, 153, 0.1)",
                          boxShadow: "0 0 0 4px rgba(236, 72, 153, 0.12)",
                          transition: "all 0.3s ease",
                        }
                      : {}
                  }
                  key={replyId || replyIndex}
                >
                  <div className="reply-header">
                    <div className="reply-user">
                      <span className="reply-avatar">💙</span>
                      <span>Anonymous</span>
                    </div>
                    {reply.createdAt && (
                      <span className="reply-time">
                        {new Date(reply.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>

                  <div className="reply-message">"{reply.text}"</div>

                  {reply.repliedBy && (
                    <button
                      type="button"
                      className="reply-to-btn"
                      onClick={() => handleReplyToPerson(reply)}
                    >
                      💬 Reply
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button type="button" className="reply-toggle" onClick={toggleReplyBox}>
        💬 Reply anonymously {openReply === item.id ? "▲" : "▼"}
      </button>

      {openReply === item.id && (
        <div className="reply-box">
          {replyingTo && (
            <div className="replying-to">
              <div className="replying-label">
                <span>💬</span>
                <span>Replying to this person</span>
              </div>
              <button
                type="button"
                className="cancel-reply-btn"
                onClick={() => setReplyingTo(null)}
                aria-label="Cancel reply"
              >
                ×
              </button>
            </div>
          )}
          <div className="reply-input-row">
            <input
              type="text"
              placeholder="Write an anonymous reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <button
              type="button"
              className="send-btn"
              disabled={sendingReply || !replyText.trim()}
              onClick={async () => {
                if (!isLoggedIn) {
                  navigate("/user-login", { state: { from: "/wall" } });
                  return;
                }
                if (!replyText.trim() || sendingReply) return;
                setSendingReply(true);
                try {
                  await addReply(item.id, replyText, replyingTo);
                  setReplyText("");
                  setReplyingTo(null);
                  setOpenReply(null);
                } catch (err) {
                  alert(err.message || "Could not send reply");
                } finally {
                  setSendingReply(false);
                }
              }}
            >
              {sendingReply ? "Sending…" : "Send"}
            </button>
          </div>
        </div>
      )}

      {reportModal}
    </article>
  );
};

export default ComplimentCard;
