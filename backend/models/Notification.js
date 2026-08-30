const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["reaction", "reply", "features", "badge"],
      required: true,
    },

    emoji: {
      type: String,
      default: "🔔",
    },

    message: {
      type: String,
      required: true,
    },

    // This tells the frontend which compliment card should be opened.
    complimentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Compliment",
    },

    // This tells the frontend which exact reply should be opened/highlighted.
    // For reaction notifications this can be null.
    // For reply notifications this contains the newly-created reply's _id.
    replyId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Notification", notificationSchema);
