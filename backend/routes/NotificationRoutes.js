const express = require("express");
const router = express.Router();

const {
    getNotifications,
    markAsRead,
    markAllAsRead,
} = require("../controllers/notificationController");

// Order matters: "/user/:userId/read-all" must be declared before
// "/:id/read" would otherwise be fine here since the paths don't
// collide, but keeping the more specific route first is a safe
// habit as more routes get added later.
router.patch("/user/:userId/read-all", markAllAsRead);

router.get("/:userId", getNotifications);
router.patch("/:id/read", markAsRead);

module.exports = router;