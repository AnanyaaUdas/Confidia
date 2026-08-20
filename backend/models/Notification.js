const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            required: true,
        },
        type: {
            type: String,
            enum:[
                "reaction",
                "reply",
                "features",
                "badge",
            ],
            required: true,
        },
        emoji: {
            type: String,
            default:"🔔",
        },
        message: {
            type: String,
            required: true,
        },
        complimentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Compliment",
        },
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