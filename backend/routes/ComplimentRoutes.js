const express = require("express");

const {
    createCompliment,
    getCompliments,
    searchCompliments,
    addReaction,
    replyToCompliment
} = require("../controllers/ComplimentController");

const router = express.Router();

router.post("/", createCompliment);
router.get("/", getCompliments);
router.get("/search", searchCompliments);
router.patch("/:id/reaction",addReaction);
router.post("/:id/reply", replyToCompliment);

module.exports = router;