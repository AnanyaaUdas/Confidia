const mongoose = require("mongoose");

const complimentSchema = new mongoose.Schema(
    {
        to: {
            type: String,
            required: true,
        },

        message: {
            type: String,
            required: true,
        },

        category: {
            type: String,
            required: true,
        },

        mood: {
            type: String,
            default: "Grateful",
        },

        isFeatured: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        reactions: {
            heart: {
                type: Number,
                default: 0,
            },
            smile: {
                type: Number,
                default: 0,
            },
            clap: {
                type: Number,
                default: 0,
            },

            reactedBy: [
                {
                    userId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                    },
                    reaction: {
                        type: String,
                        enum: ["heart", "smile", "clap"],
                    },
                },
            ],
        },
        replies: [
    {
        text: {
            type: String,
            required: true,
        },

        repliedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },

        // The user this reply is directed to
        repliedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },

        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
],
    },
    
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "Compliment",
    complimentSchema
);