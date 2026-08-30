require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connectDB = require("./config/db");

const authRoutes = require("./routes/AuthRoutes");
const complimentRoutes = require("./routes/ComplimentRoutes");
const reportRoutes = require("./routes/reportRoutes");
const notificationRoutes = require("./routes/NotificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const reactionRoutes = require("./routes/ReactionRoutes");

const Compliment = require("./models/Compliment");
const User = require("./models/User");
const Report = require("./models/Report");
const protect = require("./middleware/authMiddleware");

const app = express();

const httpServer = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
  },
});

app.set("io", io);

app.use(
  cors({
    origin: allowedOrigins,
  })
);app.use(express.json());

// core routes
app.use("/api/auth", authRoutes);
app.use("/api/compliments", complimentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reactions", reactionRoutes);

// health check + public stats
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

app.get("/api/stats", async (_req, res) => {
  try {
    const [compliments, kindStudents, list] = await Promise.all([
      Compliment.countDocuments(),
      User.countDocuments(),
      Compliment.find().lean(),
    ]);
    let smiles = 0;
    for (const c of list) {
      if (c.reactions) {
        smiles +=
          (Number(c.reactions.heart) || 0) +
          (Number(c.reactions.smile) || 0) +
          (Number(c.reactions.clap) || 0);
      }
      if (Array.isArray(c.replies)) smiles += c.replies.length;
    }
    res.json({ compliments, smiles, kindStudents });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// helper to shape a compliment doc for the frontend
function formatCompliment(doc) {
  const c = doc.toObject ? doc.toObject() : doc;
  const counts = [
    Number(c.reactions?.heart) || 0,
    Number(c.reactions?.smile) || 0,
    Number(c.reactions?.clap) || 0,
  ];
  const created = c.createdAt ? new Date(c.createdAt) : new Date();
  const s = Math.floor((Date.now() - created.getTime()) / 1000);
  let time = "Just now";
  if (s >= 86400) time = `${Math.floor(s / 86400)}d ago`;
  else if (s >= 3600) time = `${Math.floor(s / 3600)}h ago`;
  else if (s >= 60) time = `${Math.floor(s / 60)}m ago`;

  return {
    id: c._id.toString(),
    _id: c._id.toString(),
    featured: !!(c.isFeatured || c.featured),
    emoji: c.emoji || "💌",
    to: c.to,
    message: c.message,
    time,
    category: (c.category || "everyone").toLowerCase(),
    reactions: ["❤️", "😊", "👏"],
    counts,
    commentsCount: Array.isArray(c.replies) ? c.replies.length : 0,
    reported: !!c.reported,
    reportReason: c.reportReason || null,
    createdBy: c.createdBy ? c.createdBy.toString() : null,
    createdAt: c.createdAt,
    replies: c.replies || [],
  };
}

// Formatted list for the React wall
app.get("/api/wall", async (_req, res) => {
  try {
    const list = await Compliment.find().sort({ createdAt: -1 });
    res.json(list.map(formatCompliment));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// list of other users a logged-in user can start a chat with
app.get("/api/users", protect, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select("firstName lastName username lastActiveAt")
      .sort({ username: 1 });
    res.json(
      users.map((u) => ({
        id: u._id.toString(),
        firstName: u.firstName,
        lastName: u.lastName,
        username: u.username,
        lastActiveAt: u.lastActiveAt,
      })),
    );
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// used on page reload to restore the logged in user
app.get("/api/auth/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.suspended) {
      return res.status(403).json({ error: "This account has been suspended" });
    }

    // bump streak if they are back after a day
    try {
      const { touchStreak, publicUser } = require("./controllers/AuthController");
      await touchStreak(user);
      return res.json(publicUser(user));
    } catch (_) {
      res.json({
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        complimentsShared: user.complimentsShared || 0,
        reactionsGiven: user.reactionsGiven || 0,
        dayStreak: user.dayStreak || 0,
        memberSince: user.memberSince,
        lastActiveAt: user.lastActiveAt,
      });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// User profile: own compliments + computed badges
app.get("/api/auth/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    const myCompliments = await Compliment.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    const shared = user.complimentsShared || 0;
    const reactions = user.reactionsGiven || 0;
    const streak = user.dayStreak || 0;

    const badges = [
      {
        id: "first",
        emoji: "💌",
        title: "First Compliment",
        description: "Break the ice and share your first kind word.",
        progress: `${Math.min(shared, 1)}/1`,
        unlocked: shared >= 1,
        target: 1,
        current: Math.min(shared, 1),
      },
      {
        id: "spread",
        emoji: "🌸",
        title: "Spread Happiness",
        description: "Share 10 compliments on the wall.",
        progress: `${Math.min(shared, 10)}/10`,
        unlocked: shared >= 10,
        target: 10,
        current: Math.min(shared, 10),
      },
      {
        id: "hero",
        emoji: "⭐",
        title: "Campus Hero",
        description: "Give 100 reactions to others.",
        progress: `${Math.min(reactions, 100)}/100`,
        unlocked: reactions >= 100,
        target: 100,
        current: Math.min(reactions, 100),
      },
      {
        id: "streak",
        emoji: "🔥",
        title: "Kindness Streak",
        description: "Stay active 5 days in a row.",
        progress: `${Math.min(streak, 5)}/5`,
        unlocked: streak >= 5,
        target: 5,
        current: Math.min(streak, 5),
      },
      {
        id: "featured",
        emoji: "✨",
        title: "Spotlight",
        description: "Get a compliment featured by admins.",
        progress: myCompliments.some((c) => c.isFeatured) ? "1/1" : "0/1",
        unlocked: myCompliments.some((c) => c.isFeatured),
        target: 1,
        current: myCompliments.some((c) => c.isFeatured) ? 1 : 0,
      },
    ];

    res.json({
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        complimentsShared: shared,
        reactionsGiven: reactions,
        dayStreak: streak,
        memberSince: user.memberSince,
        lastActiveAt: user.lastActiveAt,
      },
      badges,
      compliments: myCompliments.map(formatCompliment),
    });
  } catch (e) {
    console.error("profile error:", e);
    res.status(500).json({ error: e.message });
  }
});

app.patch("/api/auth/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { firstName, lastName, username, email, currentPassword, newPassword } =
      req.body || {};

    if (firstName?.trim()) user.firstName = firstName.trim();
    if (lastName?.trim()) user.lastName = lastName.trim();

    if (username?.trim() && username.trim() !== user.username) {
      const clean = username.trim().replace(/\s+/g, "_").slice(0, 24);
      const taken = await User.findOne({ username: clean, _id: { $ne: user._id } });
      if (taken) return res.status(400).json({ error: "Username already taken" });
      user.username = clean;
    }

    if (email?.trim() && email.trim().toLowerCase() !== user.email) {
      const emailNorm = email.trim().toLowerCase();
      const taken = await User.findOne({ email: emailNorm, _id: { $ne: user._id } });
      if (taken) return res.status(400).json({ error: "Email already in use" });
      user.email = emailNorm;
    }

    if (newPassword) {
      if (!currentPassword) {
        return res
          .status(400)
          .json({ error: "Enter your current password to set a new one" });
      }
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) return res.status(400).json({ error: "Current password is incorrect" });
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "New password must be at least 6 characters" });
      }
      user.password = await bcrypt.hash(newPassword, 12);
    }

    await user.save();

    res.json({
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      complimentsShared: user.complimentsShared || 0,
      reactionsGiven: user.reactionsGiven || 0,
      dayStreak: user.dayStreak || 0,
      memberSince: user.memberSince,
      lastActiveAt: user.lastActiveAt,
    });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(400).json({ error: "Username or email already in use" });
    }
    console.error("profile update error:", e);
    res.status(500).json({ error: e.message });
  }
});

// report a compliment
app.post("/api/compliments/:id/report", protect, async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid compliment id" });
    }
    const reason = (req.body && req.body.reason) || "Reported by a user";
    const compliment = await Compliment.findById(id);
    if (!compliment) return res.status(404).json({ error: "Compliment not found" });

    const existing = await Report.findOne({
      complimentId: id,
      reportedBy: req.user.id,
      status: "pending",
    });
    if (existing) {
      return res
        .status(400)
        .json({ error: "You have already reported this compliment." });
    }

    await Report.create({
      complimentId: id,
      reportedBy: req.user.id,
      reason,
    });

    compliment.reported = true;
    compliment.reportReason = reason;
    await compliment.save();

    res.json(formatCompliment(compliment));
  } catch (e) {
    console.error("report compat error:", e);
    res.status(500).json({ error: e.message });
  }
});

// react to a compliment
app.post("/api/compliments/:id/react", protect, async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid compliment id" });
    }
    const { reactionIndex = 0, delta = 1 } = req.body || {};
    const keys = ["heart", "smile", "clap"];
    const reaction = keys[reactionIndex];
    if (!reaction) return res.status(400).json({ error: "Invalid reaction" });

    const compliment = await Compliment.findById(id);
    if (!compliment) return res.status(404).json({ error: "Not found" });

    if (!compliment.reactions) {
      compliment.reactions = { heart: 0, smile: 0, clap: 0, reactedBy: [] };
    }
    compliment.reactions[reaction] = Math.max(
      0,
      (compliment.reactions[reaction] || 0) + (delta || 1),
    );
    compliment.markModified("reactions");
    await compliment.save();

    if (delta > 0) {
      await User.findByIdAndUpdate(req.user.id, { $inc: { reactionsGiven: 1 } });
      // Notification for compliment author (your util)
      try {
        const createNotification = require("./utils/createNotification");
        await createNotification({
          recipientId: compliment.createdBy,
          actorId: req.user.id,
          type: "reaction",
          complimentId: compliment._id,
          complimentTo: compliment.to,
          emoji: { heart: "❤️", smile: "😊", clap: "👏" }[reaction],
        });
      } catch (err) {
        console.error("notification:", err.message);
      }
    }

    res.json({
      counts: [
        compliment.reactions.heart || 0,
        compliment.reactions.smile || 0,
        compliment.reactions.clap || 0,
      ],
    });
  } catch (e) {
    console.error("react compat error:", e);
    res.status(500).json({ error: e.message });
  }
});

// create a new compliment for the wall
app.post("/api/wall", protect, async (req, res) => {
  try {
    const author = await User.findById(req.user.id).select("suspended");
    if (author?.suspended) {
      return res.status(403).json({ error: "This account has been suspended" });
    }
    const {
      to,
      message,
      category = "everyone",
      emoji = "💌",
      mood = "Grateful",
    } = req.body || {};
    if (!to?.trim() || !message?.trim()) {
      return res.status(400).json({ error: "Recipient and message required" });
    }
    if (message.trim().length > 800) {
      return res.status(400).json({ error: "Message is too long (max 800 characters)" });
    }
    if (to.trim().length > 80) {
      return res.status(400).json({ error: "Recipient name is too long" });
    }

    const catMap = {
      everyone: "everyone",
      friends: "friends",
      teachers: "teacher",
      teacher: "teacher",
      college: "college",
      clubs: "clubs",
    };
    const cat = catMap[String(category).toLowerCase()] || "everyone";

    const doc = await Compliment.create({
      to: to.trim(),
      message: message.trim(),
      category: cat,
      mood: mood || "Grateful",
      emoji: emoji || "💌",
      createdBy: req.user.id,
    });

    const user = await User.findById(req.user.id);
    if (user) {
      user.complimentsShared = (user.complimentsShared || 0) + 1;
      try {
        const { touchStreak } = require("./controllers/AuthController");
        await touchStreak(user);
      } catch (_) {
        user.lastActiveAt = new Date();
        await user.save();
      }
    }

    res.status(201).json(formatCompliment(doc));
    io.emit("compliment:created", { category: cat });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// live private (1-to-1) chat via socket.io
const chatSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
  },
  { timestamps: true },
);
const ChatMessage =
  mongoose.models.ChatMessage || mongoose.model("ChatMessage", chatSchema);

function dmRoomId(a, b) {
  return [String(a), String(b)].sort().join("_");
}

// only logged-in users may open a socket connection, and every user connects
// as themselves (identity comes from their JWT, never from client input)
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("unauthorized"));
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "confidia-admin-secret-change-me",
    );
    const account = await User.findById(decoded.id).select("suspended");
    if (!account || account.suspended) return next(new Error("unauthorized"));
    socket.data.userId = decoded.id;
    next();
  } catch (e) {
    next(new Error("unauthorized"));
  }
});

io.on("connection", (socket) => {
  // a private room the user can be notified on regardless of which
  // conversation they currently have open
  socket.join(`user:${socket.data.userId}`);

  socket.on("chat:join-dm", async ({ otherUserId } = {}) => {
    if (!otherUserId || !mongoose.Types.ObjectId.isValid(otherUserId)) return;
    const roomId = dmRoomId(socket.data.userId, otherUserId);
    socket.join(roomId);

    const history = await ChatMessage.find({ roomId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    socket.emit("chat:history", {
      roomId,
      messages: history.reverse().map((m) => ({
        id: m._id.toString(),
        roomId: m.roomId,
        senderId: m.senderId.toString(),
        recipientId: m.recipientId.toString(),
        text: m.text,
        time: m.createdAt,
      })),
    });
  });

  socket.on("chat:message", async ({ otherUserId, text } = {}) => {
    const msg = (text || "").trim().slice(0, 500);
    if (!msg || !otherUserId || !mongoose.Types.ObjectId.isValid(otherUserId)) return;

    const roomId = dmRoomId(socket.data.userId, otherUserId);
    const doc = await ChatMessage.create({
      roomId,
      senderId: socket.data.userId,
      recipientId: otherUserId,
      text: msg,
    });

    const payload = {
      id: doc._id.toString(),
      roomId,
      senderId: doc.senderId.toString(),
      recipientId: doc.recipientId.toString(),
      text: doc.text,
      time: doc.createdAt,
    };

    // deliver to whoever has this conversation open...
    io.to(roomId).emit("chat:message", payload);
    // ...and let the recipient know even if they don't have it open
    io.to(`user:${otherUserId}`).emit("chat:message", payload);
  });
});

// ===================== START =====================
const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Confidia backend on http://localhost:${PORT}`);
    console.log(
      "Routes: /api/auth /api/compliments /api/reports /api/notifications /api/admin",
    );
  });
});
