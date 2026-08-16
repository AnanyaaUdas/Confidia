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
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "Compliment",
    complimentSchema
);