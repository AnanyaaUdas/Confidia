const Notification = require("../models/Notification");

// GET /api/notifications/:userId
// Latest notifications for one user, newest first. Capped at 50 so the dropdown never has to render (or fetch) 
// an unbounded list for a very active account.
exports.getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.find({
      recipient: userId,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(notifications);
  } catch (error) {
    console.error("getNotifications error:", error);
    res.status(500).json({
      message: "Failed to load notifications",
    });
  }
};

// PATCH /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.status(200).json(notification);
  } catch (error) {
    console.error("markAsRead error:", error);
    res.status(500).json({
      message: "Failed to mark notification as read",
    });
  }
};

// PATCH /api/notifications/user/:userId/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    await Notification.updateMany({ recipient: userId, read: false }, { read: true });

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("markAllAsRead error:", error);
    res.status(500).json({
      message: "Failed to mark all notifications as read",
    });
  }
};
