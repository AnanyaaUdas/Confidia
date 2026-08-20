const Compliment = require("../models/Compliment");
const Notification = require("../models/Notification");

// =====================================================
// CREATE A NEW COMPLIMENT
// =====================================================

const createCompliment = async (req, res) => {
    try {
        const compliment = await Compliment.create(req.body);

        res.status(201).json(compliment);
    } catch (error) {
        console.error(
            "CREATE COMPLIMENT ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to create compliment",
            error: error.message,
        });
    }
};

// =====================================================
// GET ALL COMPLIMENTS
// =====================================================

const getCompliments = async (req, res) => {
    try {
        const compliments = await Compliment.find()
            .sort({ createdAt: -1 });

        res.status(200).json(compliments);
    } catch (error) {
        console.error(
            "GET COMPLIMENTS ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to get compliments",
            error: error.message,
        });
    }
};

// =====================================================
// SEARCH COMPLIMENTS
// =====================================================

const searchCompliments = async (req, res) => {
    try {
        const { keyword } = req.query;

        // If there is no keyword,
        // return all compliments.
        if (
            !keyword ||
            keyword.trim() === ""
        ) {
            const compliments = await Compliment.find()
                .sort({ createdAt: -1 });

            return res.status(200).json(
                compliments
            );
        }

        const compliments =
            await Compliment.find({
                $or: [
                    {
                        to: {
                            $regex: keyword,
                            $options: "i",
                        },
                    },
                    {
                        message: {
                            $regex: keyword,
                            $options: "i",
                        },
                    },
                    {
                        category: {
                            $regex: keyword,
                            $options: "i",
                        },
                    },
                    {
                        mood: {
                            $regex: keyword,
                            $options: "i",
                        },
                    },
                ],
            }).sort({ createdAt: -1 });

        res.status(200).json(compliments);
    } catch (error) {
        console.error(
            "SEARCH COMPLIMENTS ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to search compliments",
            error: error.message,
        });
    }
};

// =====================================================
// ADD REACTION TO A COMPLIMENT
// =====================================================

const addReaction = async (req, res) => {
    try {
        const { reaction, reactedBy } = req.body;

        // =========================
        // FIND COMPLIMENT
        // =========================

        const compliment =
            await Compliment.findById(
                req.params.id
            );

        if (!compliment) {
            return res.status(404).json({
                message: "Compliment not found",
            });
        }

        // =========================
        // VALIDATE REACTION
        // =========================

        if (
            ![
                "heart",
                "smile",
                "clap",
            ].includes(reaction)
        ) {
            return res.status(400).json({
                message: "Invalid reaction",
            });
        }

        // =========================
        // ADD REACTION
        // =========================

        compliment.reactions[reaction] += 1;

        await compliment.save();

        // =========================
        // REACTION EMOJIS
        // =========================

        const reactionEmojis = {
            heart: "❤️",
            smile: "😊",
            clap: "👏",
        };

        // =========================
        // NOTIFY COMPLIMENT OWNER
        // =========================

        const notificationRecipient =
            compliment.createdBy;

        /*
         * Don't notify the user if they
         * reacted to their own compliment.
         */

        if (
            notificationRecipient &&
            (
                !reactedBy ||
                notificationRecipient.toString() !==
                    reactedBy.toString()
            )
        ) {
            await Notification.create({
                recipient:
                    notificationRecipient,

                type: "reaction",

                emoji:
                    reactionEmojis[reaction],

                message:
                    `Someone reacted ${reactionEmojis[reaction]} to your compliment.`,

                complimentId:
                    compliment._id,
            });
        }

        // =========================
        // RESPONSE
        // =========================

        res.status(200).json(compliment);
    } catch (error) {
        console.error(
            "REACTION ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to add reaction",
            error: error.message,
        });
    }
};

// =====================================================
// REPLY TO A COMPLIMENT OR ANOTHER REPLY
// =====================================================

const replyToCompliment = async (req, res) => {
    try {
        const {
            text,
            repliedBy,
            repliedTo,
        } = req.body;

        // =================================================
        // VALIDATE TEXT
        // =================================================

        if (
            !text ||
            !text.trim()
        ) {
            return res.status(400).json({
                message:
                    "Reply text is required",
            });
        }

        // =================================================
        // FIND COMPLIMENT
        // =================================================

        const compliment =
            await Compliment.findById(
                req.params.id
            );

        if (!compliment) {
            return res.status(404).json({
                message:
                    "Compliment not found",
            });
        }

        // =================================================
        // CREATE REPLY OBJECT
        // =================================================

        const newReply = {
            text: text.trim(),

            // Person who sent this reply
            repliedBy:
                repliedBy || null,

            // Person whose reply this is responding to
            // OR null if replying to original compliment
            repliedTo:
                repliedTo || null,

            createdAt: new Date(),
        };

        // =================================================
        // SAVE REPLY
        // =================================================

        compliment.replies.push(
            newReply
        );

        await compliment.save();

        // Get the actual saved reply
        const savedReply =
            compliment.replies[
                compliment.replies.length - 1
            ];

        // =================================================
        // DETERMINE NOTIFICATION RECIPIENT
        // =================================================

        /*
         * CASE 1
         *
         * Someone replies to the original compliment:
         *
         * Person A creates compliment
         * Person B replies
         *
         * repliedTo = null
         *
         * Notification goes to:
         *
         * compliment.createdBy
         *
         *
         * CASE 2
         *
         * Someone replies to another person's reply:
         *
         * Person A creates compliment
         * Person B replies
         * Person C replies to Person B
         *
         * repliedTo = Person B
         *
         * Notification goes to:
         *
         * repliedTo
         */

        const notificationRecipient =
            repliedTo ||
            compliment.createdBy;

        // =================================================
        // DEBUG LOGS
        // =================================================

        console.log(
            "========================================"
        );

        console.log(
            "REPLY NOTIFICATION DEBUG"
        );

        console.log(
            "Compliment ID:",
            compliment._id
        );

        console.log(
            "Compliment creator:",
            compliment.createdBy
        );

        console.log(
            "Reply sender:",
            repliedBy
        );

        console.log(
            "Reply target:",
            repliedTo
        );

        console.log(
            "Notification recipient:",
            notificationRecipient
        );

        console.log(
            "========================================"
        );

        // =================================================
        // CREATE NOTIFICATION
        // =================================================

        /*
         * Don't notify someone when they
         * reply to themselves.
         */

        if (
            notificationRecipient &&
            (
                !repliedBy ||
                notificationRecipient.toString() !==
                    repliedBy.toString()
            )
        ) {
            /*
             * Different message depending on
             * what the person replied to.
             */

            const notificationMessage =
                repliedTo
                    ? "Someone replied to your reply 💌"
                    : "Someone replied to your compliment 💌";

            await Notification.create({
                recipient:
                    notificationRecipient,

                type: "reply",

                message:
                    notificationMessage,

                complimentId:
                    compliment._id,
            });

            console.log(
                "✅ REPLY NOTIFICATION CREATED"
            );

            console.log(
                "Recipient:",
                notificationRecipient
            );

            console.log(
                "Message:",
                notificationMessage
            );
        } else {
            console.log(
                "⚠️ NO REPLY NOTIFICATION CREATED"
            );

            console.log(
                "Reason: recipient is missing or sender is recipient."
            );
        }

        // =================================================
        // RESPONSE
        // =================================================

        res.status(201).json({
            message:
                "Reply added successfully",

            reply: savedReply,

            compliment,
        });
    } catch (error) {
        console.error(
            "REPLY ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to add reply",

            error:
                error.message,
        });
    }
};

// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
    createCompliment,
    getCompliments,
    searchCompliments,
    addReaction,
    replyToCompliment,
};