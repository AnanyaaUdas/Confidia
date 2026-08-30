import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import BadgeCard from "../components/BadgeCard";
import useAppStore from "../store/useAppStore";
import "../style/profile.css";

const Profile = () => {
  const User = useAppStore((s) => s.User);
  const isLoggedIn = useAppStore((s) => s.isLoggedIn);
  const badges = useAppStore((s) => s.badges);
  const myCompliments = useAppStore((s) => s.myCompliments);
  const profileLoading = useAppStore((s) => s.profileLoading);
  const loadProfile = useAppStore((s) => s.loadProfile);
  const updateProfile = useAppStore((s) => s.updateProfile);

  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    if (isLoggedIn) loadProfile();
  }, [isLoggedIn, loadProfile]);

  useEffect(() => {
    if (User) {
      setForm((f) => ({
        ...f,
        firstName: User.firstName || "",
        lastName: User.lastName || "",
        username: User.username || "",
        email: User.email || "",
      }));
    }
  }, [User]);

  useEffect(() => {
    if (!editing) return;
    const onKey = (e) => {
      if (e.key === "Escape") setEditing(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [editing]);

  const openEdit = () => {
    setFormError("");
    setFormSuccess("");
    setChangingPassword(false);
    setForm((f) => ({ ...f, currentPassword: "", newPassword: "" }));
    setEditing(true);
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setFormError("First and last name are required");
      return;
    }
    if (!form.username.trim() || form.username.trim().length < 3) {
      setFormError("Username must be at least 3 characters");
      return;
    }
    if (!form.email.trim()) {
      setFormError("Email is required");
      return;
    }
    if (changingPassword && (!form.currentPassword || !form.newPassword)) {
      setFormError("Fill in both password fields to change your password");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        email: form.email,
      };
      if (changingPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }
      await updateProfile(payload);
      setFormSuccess("Profile updated");
      setForm((f) => ({ ...f, currentPassword: "", newPassword: "" }));
      setChangingPassword(false);
      setTimeout(() => setEditing(false), 900);
    } catch (err) {
      setFormError(err.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  const shared = User?.complimentsShared ?? 0;
  const reactions = User?.reactionsGiven ?? 0;
  const streak = User?.dayStreak ?? 0;

  const calculatedBadges = (badges || []).map((badge) => {
    if (badge.id === "first" || badge.title === "First Compliment") {
      return { ...badge, progress: `${Math.min(shared, 1)}/1`, unlocked: shared >= 1 };
    }
    if (badge.id === "spread" || badge.title === "Spread Happiness") {
      return { ...badge, progress: `${Math.min(shared, 10)}/10`, unlocked: shared >= 10 };
    }
    if (badge.id === "hero" || badge.title === "Campus Hero") {
      return {
        ...badge,
        progress: `${Math.min(reactions, 100)}/100`,
        unlocked: reactions >= 100,
      };
    }
    if (badge.id === "streak" || badge.title === "Kindness Streak") {
      return { ...badge, progress: `${Math.min(streak, 5)}/5`, unlocked: streak >= 5 };
    }
    return badge;
  });

  const memberLabel = User?.memberSince
    ? new Date(User.memberSince).toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <>
      <NavBar />
      <main className="profile-page">
        {!isLoggedIn ? (
          <div className="profile-guest">
            <div className="profile-guest-card">
              <span className="profile-guest-emoji">🌸</span>
              <h1>Your kindness profile</h1>
              <p>
                Log in to track compliments, reactions, streaks, and unlock campus badges.
                Your real name stays private — only your anonymous username appears in the
                app.
              </p>
              <div className="profile-guest-actions">
                <Link to="/user-login" className="primary-btn">
                  Log in
                </Link>
                <Link to="/user-register" className="secondary-btn">
                  Create account
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            <section className="profile-hero-card">
              <div className="profile-avatar">
                {(User?.firstName || User?.username || "?").charAt(0).toUpperCase()}
                {(User?.lastName || "").charAt(0).toUpperCase()}
              </div>
              <div className="profile-hero-text">
                <p className="profile-kicker">Campus kindness profile</p>
                <h1>@{User?.username}</h1>
                <p className="profile-sub">
                  {User?.firstName} {User?.lastName} · Member since {memberLabel}
                </p>
              </div>
              <div className="profile-hero-actions">
                <button type="button" className="secondary-btn" onClick={openEdit}>
                  Edit profile
                </button>
              </div>
            </section>

            {editing && (
              <div className="profile-modal-overlay" onClick={() => setEditing(false)}>
                <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="profile-modal-head">
                    <h2>Edit profile</h2>
                    <button
                      type="button"
                      className="profile-modal-close"
                      onClick={() => setEditing(false)}
                      aria-label="Close"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="profile-modal-avatar">
                    {(form.firstName || form.username || "?").charAt(0).toUpperCase()}
                    {(form.lastName || "").charAt(0).toUpperCase()}
                  </div>

                  <form onSubmit={handleSave} className="profile-modal-body">
                    <div className="profile-edit-grid">
                      <div className="form-group">
                        <span>First name</span>
                        <input
                          name="firstName"
                          value={form.firstName}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <span>Last name</span>
                        <input
                          name="lastName"
                          value={form.lastName}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <span>Username</span>
                      <input
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <span>Email</span>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                      />
                    </div>

                    {!changingPassword ? (
                      <button
                        type="button"
                        className="profile-modal-password-toggle"
                        onClick={() => setChangingPassword(true)}
                      >
                        🔒 Change password
                      </button>
                    ) : (
                      <div className="profile-modal-password-block">
                        <div className="form-group">
                          <span>Current password</span>
                          <input
                            name="currentPassword"
                            type="password"
                            value={form.currentPassword}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-group">
                          <span>New password</span>
                          <input
                            name="newPassword"
                            type="password"
                            value={form.newPassword}
                            onChange={handleChange}
                          />
                        </div>
                        <button
                          type="button"
                          className="profile-modal-password-cancel"
                          onClick={() => {
                            setChangingPassword(false);
                            setForm((f) => ({ ...f, currentPassword: "", newPassword: "" }));
                          }}
                        >
                          Never mind
                        </button>
                      </div>
                    )}

                    {formError && <p className="profile-form-error">{formError}</p>}
                    {formSuccess && <p className="profile-form-success">{formSuccess}</p>}

                    <div className="profile-modal-actions">
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => setEditing(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="primary-btn" disabled={saving}>
                        {saving ? "Saving…" : "Save changes"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <section className="profile-stats-row">
              <div className="profile-stat">
                <span className="profile-stat-num">{shared}</span>
                <span className="profile-stat-label">Compliments shared</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-num">{reactions}</span>
                <span className="profile-stat-label">Reactions given</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-num">{streak}</span>
                <span className="profile-stat-label">Day streak 🔥</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-num">
                  {calculatedBadges.filter((b) => b.unlocked).length}
                </span>
                <span className="profile-stat-label">Badges unlocked</span>
              </div>
            </section>

            <section className="profile-section">
              <div className="profile-section-head">
                <h2>Badges</h2>
                <p>Keep sharing kindness to unlock more.</p>
              </div>
              {profileLoading ? (
                <p className="profile-muted">Loading badges…</p>
              ) : (
                <div className="badge-grid">
                  {calculatedBadges.map((badge, index) => (
                    <BadgeCard
                      key={badge.id || index}
                      emoji={badge.emoji}
                      title={badge.title}
                      description={badge.description}
                      progress={badge.progress}
                      unlocked={badge.unlocked}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="profile-section">
              <div className="profile-section-head">
                <h2>Your compliments</h2>
                <p>Anonymous posts you’ve shared on the wall.</p>
              </div>
              {profileLoading && !myCompliments?.length ? (
                <p className="profile-muted">Loading…</p>
              ) : !myCompliments?.length ? (
                <div className="profile-empty">
                  <p>You haven’t posted yet. Be the first kind voice today.</p>
                  <Link to="/write" className="primary-btn">
                    Write your first compliment
                  </Link>
                </div>
              ) : (
                <div className="profile-compliments">
                  {myCompliments.map((c) => (
                    <article key={c.id} className="profile-comp-card">
                      <div className="profile-comp-top">
                        <span className="profile-comp-emoji">{c.emoji || "💌"}</span>
                        <div>
                          <strong>To: {c.to}</strong>
                          <span className="profile-comp-meta">
                            {c.time || "Recently"}
                            {c.featured ? " · ⭐ Featured" : ""}
                          </span>
                        </div>
                      </div>
                      <p>{c.message}</p>
                      <div className="profile-comp-footer">
                        <span>
                          {(c.counts || [0, 0, 0]).reduce((a, b) => a + b, 0)} reactions
                        </span>
                        <span>{c.commentsCount || 0} replies</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  );
};

export default Profile;
