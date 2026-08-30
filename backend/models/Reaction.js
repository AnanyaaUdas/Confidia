const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema(
  {
    complimentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Compliment",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["heart", "smile", "clap"],
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Reaction", reactionSchema);
