const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    complimentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Compliment",
      required: true,
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reason: {
      type: String,
      default: "Reported by user",
    },

    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "dismissed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Report", reportSchema);
