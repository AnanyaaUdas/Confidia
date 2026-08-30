const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
function userHeaders(extra = {}) {
  const token = localStorage.getItem("confidia_user_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export async function fetchPublicStats() {
  const res = await fetch(`${API}/stats`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export async function fetchCompliments() {
  // formatted feed for the wall page
  const res = await fetch(`${API}/wall`);
  if (!res.ok) {
    // fallback to raw modular route
    const res2 = await fetch(`${API}/compliments`);
    if (!res2.ok) throw new Error("Failed to fetch compliments");
    const raw = await res2.json();
    return (raw || []).map(normalizeCompliment);
  }
  return res.json();
}

function normalizeCompliment(c) {
  if (c.id && c.counts) return c;
  const counts = [
    Number(c.reactions?.heart) || 0,
    Number(c.reactions?.smile) || 0,
    Number(c.reactions?.clap) || 0,
  ];
  return {
    id: (c._id || c.id || "").toString(),
    featured: !!(c.isFeatured || c.featured),
    emoji: c.emoji || "💌",
    to: c.to,
    message: c.message,
    time: c.time || "Just now",
    category: (c.category || "everyone").toLowerCase(),
    reactions: ["❤️", "😊", "👏"],
    counts,
    commentsCount: Array.isArray(c.replies) ? c.replies.length : c.commentsCount || 0,
    reported: !!c.reported,
    reportReason: c.reportReason || null,
    createdBy: c.createdBy ? c.createdBy.toString() : null,
  };
}

export async function postCompliment(body) {
  // Prefer wall compat (sets createdBy from token)
  const res = await fetch(`${API}/wall`, {
    method: "POST",
    headers: userHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || data.message || "Failed to post compliment");
  }
  return res.json();
}

export async function reportCompliment(id, reason) {
  if (!id) throw new Error("Missing compliment id");
  const res = await fetch(`${API}/compliments/${id}/report`, {
    method: "POST",
    headers: userHeaders(),
    body: JSON.stringify({ reason: reason || "Reported by a user" }),
  });
  if (!res.ok) {
    let msg = "Failed to report";
    try {
      const body = await res.json();
      msg = body.error || body.message || msg;
    } catch (_) {}
    throw new Error(msg);
  }
  return res.json();
}

export async function replyToCompliment(id, text, repliedBy, repliedTo) {
  if (!id) throw new Error("Missing compliment id");
  const res = await fetch(`${API}/compliments/${id}/reply`, {
    method: "POST",
    headers: userHeaders(),
    body: JSON.stringify({ text, repliedBy, repliedTo: repliedTo || null }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || data.error || "Failed to send reply");
  }
  return res.json();
}

export async function reactCompliment(id, reactionIndex, delta = 1) {
  const res = await fetch(`${API}/compliments/${id}/react`, {
    method: "POST",
    headers: userHeaders(),
    body: JSON.stringify({ reactionIndex, delta }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || data.message || "Failed to react");
  }
  return res.json();
}

// ---------- user auth ----------

export async function userRegister(payload) {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      password: payload.password,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || "Registration failed");
  // some backends skip the token on register, so log in right after
  if (data.token) return data;
  // Auto-login after register
  return userLogin(payload.email, payload.password);
}

export async function userLogin(usernameOrEmail, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: usernameOrEmail,
      username: usernameOrEmail,
      password,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || "Login failed");
  return data;
}

export async function userMe() {
  const res = await fetch(`${API}/auth/me`, { headers: userHeaders() });
  if (!res.ok) throw new Error("Not logged in");
  return res.json();
}

export async function fetchUserProfile() {
  const res = await fetch(`${API}/auth/profile`, { headers: userHeaders() });
  if (!res.ok) throw new Error("Failed to load profile");
  return res.json();
}

export async function updateUserProfile(payload) {
  const res = await fetch(`${API}/auth/profile`, {
    method: "PATCH",
    headers: userHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || "Failed to update profile");
  return data;
}

export async function fetchChatUsers() {
  const res = await fetch(`${API}/users`, { headers: userHeaders() });
  if (!res.ok) throw new Error("Failed to load users");
  return res.json();
}

export async function fetchNotifications(userId) {
  const res = await fetch(`${API}/notifications/${userId}`, {
    headers: userHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load notifications");
  return res.json();
}

export async function markNotificationRead(id) {
  const res = await fetch(`${API}/notifications/${id}/read`, {
    method: "PATCH",
    headers: userHeaders(),
  });
  if (!res.ok) throw new Error("Failed to mark read");
  return res.json();
}

export async function markAllNotificationsRead(userId) {
  const res = await fetch(`${API}/notifications/user/${userId}/read-all`, {
    method: "PATCH",
    headers: userHeaders(),
  });
  if (!res.ok) throw new Error("Failed to mark all read");
  return res.json();
}

// ---------- Admin ----------

export async function adminLogin(username, password) {
  const res = await fetch(`${API}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

function adminHeaders(token) {
  return {
    "Content-Type": "application/json",
    "x-admin-token": token,
  };
}

export async function adminStats(token) {
  const res = await fetch(`${API}/admin/stats`, { headers: adminHeaders(token) });
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

export async function adminPending(token) {
  const res = await fetch(`${API}/admin/pending`, { headers: adminHeaders(token) });
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

export async function adminAllCompliments(token) {
  const res = await fetch(`${API}/admin/compliments`, { headers: adminHeaders(token) });
  if (!res.ok) throw new Error("Unauthorized");
  const list = await res.json();
  return (list || []).map(normalizeCompliment);
}

export async function adminUsers(token) {
  const res = await fetch(`${API}/admin/users`, { headers: adminHeaders(token) });
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

export async function adminSuspendUser(token, id, reason) {
  const res = await fetch(`${API}/admin/users/${id}/suspend`, {
    method: "POST",
    headers: adminHeaders(token),
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error("Suspend failed");
  return res.json();
}

export async function adminUnsuspendUser(token, id) {
  const res = await fetch(`${API}/admin/users/${id}/unsuspend`, {
    method: "POST",
    headers: adminHeaders(token),
  });
  if (!res.ok) throw new Error("Unsuspend failed");
  return res.json();
}

export async function adminRemoveUser(token, id) {
  const res = await fetch(`${API}/admin/users/${id}`, {
    method: "DELETE",
    headers: adminHeaders(token),
  });
  if (!res.ok) throw new Error("Remove failed");
  return res.json();
}

export async function adminModerationLog(_token) {
  return [];
}

export async function adminApprove(token, id) {
  const res = await fetch(`${API}/admin/approve/${id}`, {
    method: "POST",
    headers: adminHeaders(token),
  });
  if (!res.ok) throw new Error("Approve failed");
  return res.json();
}

export async function adminDelete(token, id) {
  const res = await fetch(`${API}/admin/compliments/${id}`, {
    method: "DELETE",
    headers: adminHeaders(token),
  });
  if (!res.ok) throw new Error("Delete failed");
  return res.json();
}
