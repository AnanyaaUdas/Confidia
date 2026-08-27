import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: ["http://localhost:5173", "http://127.0.0.1:5173"] },
});

app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"] }));
app.use(express.json());

// ===================== CONFIG =====================
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/confidia";
const JWT_SECRET = process.env.JWT_SECRET || "confidia-admin-secret-change-me";
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "confidia2026";

// ===================== SCHEMAS =====================
const userSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    username: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, sparse: true },
    password: String,
    complimentsShared: { type: Number, default: 0 },
    reactionsGiven: { type: Number, default: 0 },
    dayStreak: { type: Number, default: 0 },
    memberSince: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const complimentSchema = new mongoose.Schema(
  {
    featured: { type: Boolean, default: false },
    emoji: { type: String, default: "💌" },
    to: { type: String, required: true },
    message: { type: String, required: true },
    category: { type: String, default: "everyone" },
    reactions: { type: [String], default: ["❤️", "😊", "👏"] },
    counts: { type: [Number], default: [0, 0, 0] },
    commentsCount: { type: Number, default: 0 },
    reported: { type: Boolean, default: false },
    reportReason: { type: String, default: null },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

const moderationLogSchema = new mongoose.Schema(
  {
    complimentId: mongoose.Schema.Types.ObjectId,
    to: String,
    message: String,
    emoji: String,
    action: { type: String, enum: ["approved", "deleted"] },
  },
  { timestamps: true }
);

const chatMessageSchema = new mongoose.Schema(
  {
    room: { type: String, default: "campus" },
    nickname: { type: String, default: "Anonymous" },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
const Compliment = mongoose.model("Compliment", complimentSchema);
const ModerationLog = mongoose.model("ModerationLog", moderationLogSchema);
const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

// ===================== HELPERS =====================
function requireAdmin(req, res, next) {
  const header = req.headers["x-admin-token"] || req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : header;
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

function formatCompliment(doc) {
  const c = doc.toObject ? doc.toObject() : doc;
  return {
    id: c._id.toString(),
    featured: !!c.featured,
    emoji: c.emoji || "💌",
    to: c.to,
    message: c.message,
    time: relativeTime(c.createdAt),
    category: c.category || "everyone",
    reactions: c.reactions || ["❤️", "😊", "👏"],
    counts: c.counts || [0, 0, 0],
    commentsCount: c.commentsCount || 0,
    reported: !!c.reported,
    reportReason: c.reportReason || null,
    createdAt: c.createdAt,
  };
}

function relativeTime(date) {
  if (!date) return "Just now";
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

// ===================== PUBLIC API =====================

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

app.get("/api/compliments", async (_req, res) => {
  try {
    const list = await Compliment.find().sort({ createdAt: -1 }).lean();
    res.json(list.map(formatCompliment));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/compliments", async (req, res) => {
  try {
    const { to, message, category = "everyone", emoji = "💌" } = req.body;
    if (!to?.trim() || !message?.trim()) {
      return res.status(400).json({ error: "Recipient and message required" });
    }
    const doc = await Compliment.create({
      to: to.trim().toUpperCase(),
      message: message.trim(),
      category: String(category).toLowerCase(),
      emoji,
    });
    const item = formatCompliment(doc);
    io.emit("compliment:new", item);
    res.status(201).json(item);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/compliments/:id/report", async (req, res) => {
  try {
    const reason = req.body.reason || "Reported by a user";
    const doc = await Compliment.findByIdAndUpdate(
      req.params.id,
      { reported: true, reportReason: reason },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(formatCompliment(doc));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/compliments/:id/react", async (req, res) => {
  try {
    const { reactionIndex, delta = 1 } = req.body;
    const doc = await Compliment.findById(req.params.id);
    if (!doc || reactionIndex < 0 || reactionIndex > 2) {
      return res.status(400).json({ error: "Invalid" });
    }
    if (!doc.counts || doc.counts.length < 3) doc.counts = [0, 0, 0];
    doc.counts[reactionIndex] = Math.max(0, (doc.counts[reactionIndex] || 0) + delta);
    doc.markModified("counts");
    await doc.save();
    res.json({ counts: doc.counts });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ===================== ADMIN AUTH =====================

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ role: "admin", username }, JWT_SECRET, { expiresIn: "12h" });
    return res.json({ token });
  }
  res.status(401).json({ error: "Invalid credentials" });
});

// ===================== ADMIN API =====================

app.get("/api/admin/stats", requireAdmin, async (_req, res) => {
  try {
    const [complimentsCount, usersCount, reportedCount, allCompliments] = await Promise.all([
      Compliment.countDocuments(),
      User.countDocuments(),
      Compliment.countDocuments({ reported: true }),
      Compliment.find().select("counts commentsCount").lean(),
    ]);

    const totalReactions = allCompliments.reduce(
      (sum, c) => sum + (c.counts || []).reduce((a, b) => a + b, 0),
      0
    );
    const totalComments = allCompliments.reduce(
      (sum, c) => sum + (c.commentsCount || 0),
      0
    );

    res.json({
      compliments: complimentsCount,
      users: usersCount,
      reactions: totalReactions,
      comments: totalComments,
      reported: reportedCount,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/admin/pending", requireAdmin, async (_req, res) => {
  try {
    const list = await Compliment.find({ reported: true }).sort({ updatedAt: -1 });
    res.json(list.map(formatCompliment));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/admin/compliments", requireAdmin, async (_req, res) => {
  try {
    const list = await Compliment.find().sort({ createdAt: -1 });
    res.json(list.map(formatCompliment));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/admin/users", requireAdmin, async (_req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
    res.json(
      users.map((u) => ({
        id: u._id.toString(),
        firstName: u.firstName,
        lastName: u.lastName,
        username: u.username,
        email: u.email,
        complimentsShared: u.complimentsShared ?? 0,
        reactionsGiven: u.reactionsGiven ?? 0,
        dayStreak: u.dayStreak ?? 0,
        memberSince: u.memberSince || u.createdAt,
        createdAt: u.createdAt,
      }))
    );
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/admin/moderation-log", requireAdmin, async (_req, res) => {
  try {
    const log = await ModerationLog.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json(
      log.map((r) => ({
        id: r.complimentId?.toString(),
        to: r.to,
        message: r.message,
        emoji: r.emoji,
        action: r.action,
        time: relativeTime(r.createdAt),
      }))
    );
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/admin/approve/:id", requireAdmin, async (req, res) => {
  try {
    const doc = await Compliment.findByIdAndUpdate(
      req.params.id,
      { reported: false, reportReason: null },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: "Not found" });

    await ModerationLog.create({
      complimentId: doc._id,
      to: doc.to,
      message: doc.message,
      emoji: doc.emoji,
      action: "approved",
    });

    res.json(formatCompliment(doc));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/admin/compliments/:id", requireAdmin, async (req, res) => {
  try {
    const doc = await Compliment.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });

    await ModerationLog.create({
      complimentId: doc._id,
      to: doc.to,
      message: doc.message,
      emoji: doc.emoji,
      action: "deleted",
    });

    io.emit("compliment:deleted", doc._id.toString());
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ===================== ANONYMOUS CHAT =====================

io.on("connection", (socket) => {
  socket.on("chat:join", async ({ room = "campus", nickname }) => {
    const safeRoom = "campus";
    socket.join(safeRoom);
    socket.data.nickname = (nickname || "Anonymous").slice(0, 24);
    socket.data.room = safeRoom;

    const history = await ChatMessage.find({ room: safeRoom })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    socket.emit(
      "chat:history",
      history.reverse().map((m) => ({
        id: m._id.toString(),
        nickname: m.nickname,
        text: m.text,
        time: m.createdAt,
      }))
    );
  });

  socket.on("chat:message", async ({ text }) => {
    const msg = (text || "").trim().slice(0, 500);
    if (!msg) return;

    const doc = await ChatMessage.create({
      room: "campus",
      nickname: socket.data.nickname || "Anonymous",
      text: msg,
    });

    const payload = {
      id: doc._id.toString(),
      nickname: doc.nickname,
      text: doc.text,
      time: doc.createdAt,
      room: "campus",
    };
    io.to("campus").emit("chat:message", payload);
  });
});

app.get("/api/chat/:room", async (req, res) => {
  const room = req.params.room || "campus";
  const list = await ChatMessage.find({ room })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  res.json(
    list.reverse().map((m) => ({
      id: m._id.toString(),
      nickname: m.nickname,
      text: m.text,
      time: m.createdAt,
    }))
  );
});

// ===================== START =====================

const PORT = process.env.PORT || 4000;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB:", MONGO_URI);
    httpServer.listen(PORT, () => {
      console.log(`Confidia backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
