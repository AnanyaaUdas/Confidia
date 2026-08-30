const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "confidia-admin-secret-change-me";

const generateUsername = async () => {
  const adjectives = [
    "Kind",
    "Happy",
    "Gentle",
    "Bright",
    "Warm",
    "Sweet",
    "Lovely",
    "Calm",
    "Caring",
    "Friendly",
    "Sunny",
    "Cheerful",
    "Graceful",
    "Radiant",
    "Joyful",
  ];
  const nouns = [
    "Heart",
    "Soul",
    "Flower",
    "Star",
    "Smile",
    "Cloud",
    "Sunshine",
    "Friend",
    "Dreamer",
    "Butterfly",
    "Spark",
    "Bloom",
    "Wave",
    "Petal",
    "Breeze",
  ];

  let username;
  let exists = true;
  let attempts = 0;

  while (exists && attempts < 20) {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(1000 + Math.random() * 9000);
    username = `${adjective}_${noun}${number}`;
    const existingUser = await User.findOne({ username });
    exists = !!existingUser;
    attempts++;
  }

  return username;
};

function publicUser(user) {
  return {
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
  };
}

function signToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "14d" });
}

/* Update day streak based on consecutive calendar days of activity */
async function touchStreak(user) {
  const now = new Date();
  const last = user.lastActiveAt ? new Date(user.lastActiveAt) : null;
  let streak = user.dayStreak || 0;

  if (!last) {
    streak = 1;
  } else {
    const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.round((today - lastDay) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // same day — keep streak
    } else if (diffDays === 1) {
      streak = streak + 1;
    } else {
      streak = 1;
    }
  }

  user.dayStreak = streak;
  user.lastActiveAt = now;
  await user.save();
  return user;
}

// REGISTER
const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      username: preferredUsername,
    } = req.body;

    if (!firstName?.trim() || !lastName?.trim()) {
      return res.status(400).json({ message: "First and last name are required" });
    }
    if (!email?.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const emailNorm = email.trim().toLowerCase();
    const existingEmail = await User.findOne({ email: emailNorm });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    let username;
    if (preferredUsername && preferredUsername.trim().length >= 3) {
      const clean = preferredUsername.trim().replace(/\s+/g, "_").slice(0, 24);
      const taken = await User.findOne({ username: clean });
      if (taken) {
        return res.status(400).json({ message: "Username already taken" });
      }
      username = clean;
    } else {
      username = await generateUsername();
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username,
      email: emailNorm,
      password: hashedPassword,
      dayStreak: 1,
      lastActiveAt: new Date(),
    });

    const token = signToken(user._id);

    res.status(201).json({
      message: "Registration successful",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Registration error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email or username already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN
const loginUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const loginId = (email || username || "").trim();

    if (!loginId || !password) {
      return res.status(400).json({ message: "Email/username and password required" });
    }

    const user = await User.findOne({
      $or: [{ email: loginId.toLowerCase() }, { username: loginId }],
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (user.suspended) {
      return res.status(403).json({ message: "This account has been suspended" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    await touchStreak(user);

    const token = signToken(user._id);

    res.status(200).json({
      message: "Login successful",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  publicUser,
  touchStreak,
};
