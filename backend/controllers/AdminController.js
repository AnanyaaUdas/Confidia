const jwt = require("jsonwebtoken");
const Compliment = require("../models/Compliment");
const User = require("../models/User");
const Report = require("../models/Report");

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "confidia2026";
const JWT_SECRET = process.env.JWT_SECRET || "confidia-admin-secret-change-me";

exports.login = (req, res) => {
  const { username, password } = req.body || {};
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ role: "admin", username }, JWT_SECRET, {
      expiresIn: "12h",
    });
    return res.json({ token });
  }
  return res.status(401).json({ error: "Invalid credentials" });
};

exports.stats = async (_req, res) => {
  try {
    const [compliments, users, reported, list] = await Promise.all([
      Compliment.countDocuments(),
      User.countDocuments(),
      Compliment.countDocuments({ reported: true }),
      Compliment.find().lean(),
    ]);
    let reactions = 0;
    let comments = 0;
    for (const c of list) {
      if (c.reactions) {
        reactions +=
          (c.reactions.heart || 0) + (c.reactions.smile || 0) + (c.reactions.clap || 0);
      }
      comments += Array.isArray(c.replies) ? c.replies.length : 0;
    }
    res.json({ compliments, users, reactions, comments, reported });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

function shapeCompliment(doc) {
  const c = doc.toObject ? doc.toObject() : doc;
  const created = c.createdAt ? new Date(c.createdAt) : new Date();
  const diff = Math.floor((Date.now() - created.getTime()) / 1000);
  let time = "Just now";
  if (diff >= 86400) time = `${Math.floor(diff / 86400)}d ago`;
  else if (diff >= 3600) time = `${Math.floor(diff / 3600)}h ago`;
  else if (diff >= 60) time = `${Math.floor(diff / 60)}m ago`;
  return {
    ...c,
    id: c._id.toString(),
    time,
    commentsCount: Array.isArray(c.replies) ? c.replies.length : 0,
  };
}

function shapeUser(doc) {
  const u = doc.toObject ? doc.toObject() : doc;
  return { ...u, id: u._id.toString() };
}

exports.pending = async (_req, res) => {
  try {
    const list = await Compliment.find({ reported: true }).sort({ updatedAt: -1 });
    res.json(list.map(shapeCompliment));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.allCompliments = async (_req, res) => {
  try {
    const list = await Compliment.find().sort({ createdAt: -1 });
    res.json(list.map(shapeCompliment));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.users = async (_req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users.map(shapeUser));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.suspendUser = async (req, res) => {
  try {
    const { reason } = req.body || {};
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { suspended: true, suspendedReason: reason || null },
      { new: true, select: "-password" },
    );
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json(shapeUser(user));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.unsuspendUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { suspended: false, suspendedReason: null },
      { new: true, select: "-password" },
    );
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json(shapeUser(user));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.removeUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "Not found" });
    await Compliment.deleteMany({ createdBy: req.params.id });
    await Report.deleteMany({ reportedBy: req.params.id });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.approve = async (req, res) => {
  try {
    const doc = await Compliment.findByIdAndUpdate(
      req.params.id,
      { reported: false, reportReason: null },
      { new: true },
    );
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const doc = await Compliment.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    await Report.deleteMany({ complimentId: req.params.id });
    const io = req.app.get("io");
    if (io) {
      io.emit("compliment:commentsChanged", {
        complimentId: req.params.id,
        commentsCount: 0,
        removed: true,
      });
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
