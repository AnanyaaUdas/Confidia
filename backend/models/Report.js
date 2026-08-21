const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
    {
        // =========================
        // REPORTED COMPLIMENT
        // =========================

        complimentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Compliment",
            required: true,
        },

        // =========================
        // PERSON WHO REPORTED
        // =========================

        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        // =========================
        // REASON
        // =========================

        reason: {
            type: String,
            default: "Reported by user",
        },

        // =========================
        // REPORT STATUS
        // =========================

        status: {
            type: String,
            enum: [
                "pending",
                "reviewed",
                "resolved",
                "dismissed",
            ],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "Report",
    reportSchema
);