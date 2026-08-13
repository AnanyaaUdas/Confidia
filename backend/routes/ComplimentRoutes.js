const express = require("express");

const {
    createCompliment,
    getCompliments,
    addReaction
} = require("../controllers/ComplimentController");

const router = express.Router();

router.post("/", createCompliment);
router.get("/", getCompliments);
router.patch("/:id/reaction",addReaction);

module.exports = router;