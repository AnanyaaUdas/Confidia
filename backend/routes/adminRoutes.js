const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const AdminController = require("../controllers/AdminController");

const JWT_SECRET = process.env.JWT_SECRET || "confidia-admin-secret-change-me";

function requireAdmin(req, res, next) {
  const header = req.headers["x-admin-token"] || req.headers.authorization;
  const token = header && header.startsWith("Bearer ") ? header.slice(7) : header;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== "admin") throw new Error("not admin");
    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

router.post("/login", AdminController.login);
router.get("/stats", requireAdmin, AdminController.stats);
router.get("/pending", requireAdmin, AdminController.pending);
router.get("/compliments", requireAdmin, AdminController.allCompliments);
router.get("/users", requireAdmin, AdminController.users);
router.post("/users/:id/suspend", requireAdmin, AdminController.suspendUser);
router.post("/users/:id/unsuspend", requireAdmin, AdminController.unsuspendUser);
router.delete("/users/:id", requireAdmin, AdminController.removeUser);
router.post("/approve/:id", requireAdmin, AdminController.approve);
router.delete("/compliments/:id", requireAdmin, AdminController.remove);

module.exports = router;
