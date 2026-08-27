const API = "http://localhost:4000/api";

export async function fetchCompliments() {
  const res = await fetch(`${API}/compliments`);
  if (!res.ok) throw new Error("Failed to fetch compliments");
  return res.json();
}

export async function postCompliment(body) {
  const res = await fetch(`${API}/compliments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to post compliment");
  return res.json();
}

export async function reportCompliment(id, reason) {
  const res = await fetch(`${API}/compliments/${id}/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error("Failed to report");
  return res.json();
}

export async function reactCompliment(id, reactionIndex, delta = 1) {
  const res = await fetch(`${API}/compliments/${id}/react`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reactionIndex, delta }),
  });
  if (!res.ok) throw new Error("Failed to react");
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
  return res.json();
}

export async function adminUsers(token) {
  const res = await fetch(`${API}/admin/users`, { headers: adminHeaders(token) });
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

export async function adminModerationLog(token) {
  const res = await fetch(`${API}/admin/moderation-log`, { headers: adminHeaders(token) });
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
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
