import { create } from "zustand";
import {
  fetchCompliments,
  postCompliment,
  reportCompliment as apiReport,
  reactCompliment,
  replyToCompliment as apiReply,
  userLogin as apiUserLogin,
  userRegister as apiUserRegister,
  userMe,
  fetchUserProfile,
  updateUserProfile,
} from "../api";

const useAppStore = create((set, get) => ({
  isLoggedIn: !!localStorage.getItem("confidia_user_token"),
  userToken: localStorage.getItem("confidia_user_token") || null,
  User: null,

  badges: [
    {
      id: "first",
      emoji: "💌",
      title: "First Compliment",
      description: "Break the ice and share your first kind word.",
      progress: "0/1",
      unlocked: false,
    },
    {
      id: "spread",
      emoji: "🌸",
      title: "Spread Happiness",
      description: "Share 10 compliments on the wall.",
      progress: "0/10",
      unlocked: false,
    },
    {
      id: "hero",
      emoji: "⭐",
      title: "Campus Hero",
      description: "Give 100 reactions to others.",
      progress: "0/100",
      unlocked: false,
    },
    {
      id: "streak",
      emoji: "🔥",
      title: "Kindness Streak",
      description: "Stay active 5 days in a row.",
      progress: "0/5",
      unlocked: false,
    },
    {
      id: "featured",
      emoji: "✨",
      title: "Spotlight",
      description: "Get a compliment featured by admins.",
      progress: "0/1",
      unlocked: false,
    },
  ],
  myCompliments: [],
  profileLoading: false,
  celebration: null,

  compliments: [],
  reactionCounts: {},
  userReactions: {},
  moderationLog: [],
  loading: false,

  restoreSession: async () => {
    const token = localStorage.getItem("confidia_user_token");
    if (!token) {
      set({ isLoggedIn: false, userToken: null, User: null });
      return;
    }
    try {
      const user = await userMe();
      set({ isLoggedIn: true, userToken: token, User: user });
    } catch {
      localStorage.removeItem("confidia_user_token");
      set({ isLoggedIn: false, userToken: null, User: null });
    }
  },

  loginUser: async (username, password) => {
    const data = await apiUserLogin(username, password);
    if (!data.token) throw new Error("No token returned");
    localStorage.setItem("confidia_user_token", data.token);
    const user = data.user
      ? { ...data.user, id: (data.user.id || data.user._id || "").toString() }
      : null;
    set({ isLoggedIn: true, userToken: data.token, User: user });
    return user;
  },

  registerUser: async (payload) => {
    const data = await apiUserRegister(payload);
    if (!data.token) throw new Error("No token returned");
    localStorage.setItem("confidia_user_token", data.token);
    const user = data.user
      ? { ...data.user, id: (data.user.id || data.user._id || "").toString() }
      : null;
    set({ isLoggedIn: true, userToken: data.token, User: user });
    return user;
  },

  logoutUser: () => {
    localStorage.removeItem("confidia_user_token");
    set({ isLoggedIn: false, userToken: null, User: null });
  },

  requireAuth: () => {
    if (!get().isLoggedIn || !localStorage.getItem("confidia_user_token")) {
      throw new Error("Please log in first");
    }
  },

  loadProfile: async () => {
    if (!localStorage.getItem("confidia_user_token")) return;
    set({ profileLoading: true });
    try {
      const data = await fetchUserProfile();
      const prevBadges = get().badges;
      const newlyUnlocked = (data.badges || []).find(
        (b) => b.unlocked && !prevBadges.find((p) => p.id === b.id && p.unlocked),
      );
      set({
        User: data.user,
        badges: data.badges || get().badges,
        myCompliments: data.compliments || [],
        profileLoading: false,
        isLoggedIn: true,
      });
      if (newlyUnlocked) {
        set({ celebration: newlyUnlocked });
      }
    } catch (e) {
      console.error("loadProfile:", e);
      set({ profileLoading: false });
    }
  },

  clearCelebration: () => set({ celebration: null }),

  updateProfile: async (payload) => {
    const updated = await updateUserProfile(payload);
    set((s) => ({ User: { ...s.User, ...updated } }));
    return updated;
  },

  loadCompliments: async () => {
    set({ loading: true });
    try {
      const list = await fetchCompliments();
      const reactionCounts = {};
      const normalized = list.map((c) => ({
        ...c,
        reactions: Array.isArray(c.reactions) ? c.reactions : ["❤️", "😊", "👏"],
        counts: Array.isArray(c.counts) && c.counts.length >= 3 ? c.counts : [0, 0, 0],
        commentsCount: c.commentsCount || 0,
        replies: Array.isArray(c.replies) ? c.replies : [],
        emoji: c.emoji || "💌",
        reported: !!c.reported,
      }));
      normalized.forEach((c) => {
        reactionCounts[c.id] = [...c.counts];
      });
      set({ compliments: normalized, reactionCounts, loading: false });
    } catch (e) {
      console.error("loadCompliments:", e);
      set({ loading: false });
    }
  },

  addCompliment: async (payload) => {
    get().requireAuth();
    const item = await postCompliment(payload);
    set((s) => {
      const shared = (s.User?.complimentsShared || 0) + 1;
      const User = s.User ? { ...s.User, complimentsShared: shared } : s.User;
      return {
        compliments: [item, ...s.compliments],
        myCompliments: [item, ...(s.myCompliments || [])],
        reactionCounts: { ...s.reactionCounts, [item.id]: [0, 0, 0] },
        User,
      };
    });
    // refresh badges in background
    get().loadProfile?.();
    return item;
  },

  handleReaction: async (id, reactionIndex) => {
    get().requireAuth();
    const key = `${id}-${reactionIndex}`;
    const already = get().userReactions[key] === true;
    const delta = already ? -1 : 1;

    set((state) => {
      const current = state.reactionCounts[id] || [0, 0, 0];
      return {
        userReactions: { ...state.userReactions, [key]: !already },
        reactionCounts: {
          ...state.reactionCounts,
          [id]: current.map((n, i) => (i === reactionIndex ? Math.max(0, n + delta) : n)),
        },
      };
    });

    try {
      await reactCompliment(id, reactionIndex, delta);
    } catch (e) {
      // rollback optimistic UI
      set((state) => {
        const current = state.reactionCounts[id] || [0, 0, 0];
        return {
          userReactions: { ...state.userReactions, [key]: already },
          reactionCounts: {
            ...state.reactionCounts,
            [id]: current.map((n, i) =>
              i === reactionIndex ? Math.max(0, n - delta) : n,
            ),
          },
        };
      });
      throw e;
    }
  },

  reportCompliment: async (id, reason = "Reported by a user") => {
    get().requireAuth();
    if (!id) throw new Error("Invalid compliment id");
    await apiReport(id, reason);
    set((s) => ({
      compliments: s.compliments.map((c) =>
        c.id === id ? { ...c, reported: true, reportReason: reason } : c,
      ),
    }));
  },

  addReply: async (id, text, repliedTo) => {
    get().requireAuth();
    if (!id) throw new Error("Invalid compliment id");
    const clean = (text || "").trim();
    if (!clean) throw new Error("Write something first");
    const userId = get().User?.id;
    const data = await apiReply(id, clean, userId, repliedTo || null);
    const saved = data?.reply || null;
    const normalizedReply = saved
      ? {
          _id: (saved._id || saved.id || `temp-${Date.now()}`).toString(),
          text: saved.text,
          repliedBy: saved.repliedBy ? saved.repliedBy.toString() : userId || null,
          repliedTo: saved.repliedTo ? saved.repliedTo.toString() : repliedTo || null,
          createdAt: saved.createdAt || new Date().toISOString(),
        }
      : {
          _id: `temp-${Date.now()}`,
          text: clean,
          repliedBy: userId || null,
          repliedTo: repliedTo || null,
          createdAt: new Date().toISOString(),
        };
    set((s) => ({
      compliments: s.compliments.map((c) =>
        c.id === id
          ? {
              ...c,
              replies: [...(c.replies || []), normalizedReply],
              commentsCount: (c.commentsCount || 0) + 1,
            }
          : c,
      ),
    }));
    return normalizedReply;
  },

  setCommentsCount: (id, count) =>
    set((s) => ({
      compliments: s.compliments.map((c) =>
        c.id === id ? { ...c, commentsCount: count } : c,
      ),
    })),

  approveReport: (id) =>
    set((s) => ({
      compliments: s.compliments.map((c) =>
        c.id === id ? { ...c, reported: false, reportReason: null } : c,
      ),
    })),

  deleteCompliment: (id) =>
    set((s) => {
      const { [id]: _removed, ...restCounts } = s.reactionCounts;
      return {
        compliments: s.compliments.filter((c) => c.id !== id),
        reactionCounts: restCounts,
      };
    }),

  getPendingReports: () => get().compliments.filter((c) => c.reported),
}));

export default useAppStore;
