const Notification = require("../models/Notification");

/**
 * Creates a notification for the person who originally posted a
 * compliment. Call this from wherever reactions and replies are
 * handled — see INTEGRATION.md for the two call sites.
 *
 * Silently does nothing (rather than throwing) when there's no
 * one to notify, so a missing/anonymous author can never break
 * the reaction/reply request it's attached to.
 *
 * @param {Object} params
 * @param {string} params.recipientId - _id of the user to notify
 * @param {string} params.actorId - _id of the user who triggered
 *   this (reacted/replied) — used only to avoid self-notifying
 * @param {"reaction"|"reply"} params.type
 * @param {string} params.complimentId
 * @param {string} params.complimentTo - the "TO:" field, for the
 *   message text (e.g. "LIBRARY STAFF")
 * @param {string} [params.emoji]
 */
async function createNotification({
  recipientId,
  actorId,
  type,
  complimentId,
  complimentTo,
  emoji,
}) {
  // No recorded author (older/anonymous compliments, or the
  // frontend didn't send postedBy) — nobody to notify.
  if (!recipientId) {
    return null;
  }

  // Don't notify people about their own reactions/replies.
  if (actorId && String(actorId) === String(recipientId)) {
    return null;
  }

  const verb = type === "reply" ? "replied to" : "reacted to";
  const defaultEmoji = type === "reply" ? "💬" : "❤️";

  const message = `Someone ${verb} your compliment to ${(
    complimentTo || "someone"
  ).toUpperCase()}`;

  try {
    return await Notification.create({
      recipient: recipientId,
      type,
      complimentId: complimentId,
      message,
      emoji: emoji || defaultEmoji,
    });
  } catch (error) {
    // A failed notification should never fail the reaction reply request it's attached to — log and move on.
    console.error("createNotification failed:", error);
    return null;
  }
}

module.exports = createNotification;
