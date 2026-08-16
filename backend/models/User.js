const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },

        lastName: {
            type: String,
            required: true,
            trim: true,
        },

        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
        },

        complimentsShared: {
            type: Number,
            default: 0,
        },

        reactionGiven: {
            type: Number,
            default: 0,
        },

        dayStreak: {
            type: Number,
            default: 0,
        },

        memberSince: {
            type: Date,
            default: Date.now,
        },
    },

    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);