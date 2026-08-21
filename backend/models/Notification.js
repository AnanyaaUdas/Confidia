const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        // =====================================================
        // PERSON RECEIVING THE NOTIFICATION
        // =====================================================
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // =====================================================
        // NOTIFICATION TYPE
        // =====================================================
        type: {
            type: String,
            enum: [
                "reaction",
                "reply",
                "features",
                "badge",
            ],
            required: true,
        },

        // =====================================================
        // NOTIFICATION EMOJI
        // =====================================================
        emoji: {
            type: String,
            default: "🔔",
        },

        // =====================================================
        // NOTIFICATION MESSAGE
        // =====================================================
        message: {
            type: String,
            required: true,
        },

        // =====================================================
        // RELATED COMPLIMENT
        // =====================================================
        // This tells the frontend which compliment card
        // should be opened.
        complimentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Compliment",
        },

        // =====================================================
        // RELATED REPLY
        // =====================================================
        // This tells the frontend which exact reply
        // should be opened/highlighted.
        //
        // For reaction notifications this can be null.
        // For reply notifications this contains the
        // newly-created reply's _id.
        replyId: {
            type: mongoose.Schema.Types.ObjectId,
        },

        // =====================================================
        // READ / UNREAD
        // =====================================================
        read: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "Notification",
    notificationSchema
);