import { create } from "zustand";
import {
  fetchCompliments,
  postCompliment,
  reportCompliment as apiReport,
  reactCompliment,
} from "../api";

const useAppStore = create((set, get) => ({
  isLoggedIn: false,
  User: {
    name: "Priyanya",
    memberSince: "August 2026",
    complimentsShared: 3,
    reactionsGiven: 12,
    dayStreak: 1,
  },
  badges: [
    { emoji: "💌", title: "First Compliment", description: "Break the ice.", progress: "0/1", unlocked: false },
    { emoji: "🌸", title: "Spread Happiness", description: "10 compliments.", progress: "0/10", unlocked: false },
    { emoji: "⭐", title: "Campus Hero", description: "100 reactions.", progress: "0/100", unlocked: false },
    { emoji: "🔥", title: "Kindness Streak", description: "5 days in a row.", progress: "1/5", unlocked: false },
  ],

  toggleLogin: () => set((state) => ({ isLoggedIn: !state.isLoggedIn })),

  compliments: [],
  reactionCounts: {},
  userReactions: {},
  moderationLog: [],
  loading: false,

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
    const item = await postCompliment(payload);
    set((s) => ({
      compliments: [item, ...s.compliments],
      reactionCounts: { ...s.reactionCounts, [item.id]: [0, 0, 0] },
    }));
    return item;
  },

  handleReaction: async (id, reactionIndex) => {
    const key = `${id}-${reactionIndex}`;
    const already = get().userReactions[key] === true;
    const delta = already ? -1 : 1;

    set((state) => {
      const current = state.reactionCounts[id] || [0, 0, 0];
      return {
        userReactions: { ...state.userReactions, [key]: !already },
        reactionCounts: {
          ...state.reactionCounts,
          [id]: current.map((n, i) =>
            i === reactionIndex ? Math.max(0, n + delta) : n
          ),
        },
      };
    });

    try {
      await reactCompliment(id, reactionIndex, delta);
    } catch (e) {
      console.error(e);
    }
  },

  reportCompliment: async (id, reason = "Reported by a user") => {
    try {
      await apiReport(id, reason);
    } catch (e) {
      console.error(e);
    }
    set((s) => ({
      compliments: s.compliments.map((c) =>
        c.id === id ? { ...c, reported: true, reportReason: reason } : c
      ),
    }));
  },

  approveReport: (id) =>
    set((s) => ({
      compliments: s.compliments.map((c) =>
        c.id === id ? { ...c, reported: false, reportReason: null } : c
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
