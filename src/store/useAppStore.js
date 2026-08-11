import { create } from "zustand";

/* =====================================================
   SEED DATA
   Single source of truth for every compliment shown
   anywhere in the app (Home preview, full Wall, Admin).
===================================================== */

const seedCompliments = [
  {
    id: 1,
    featured: true,
    emoji: "🌟",
    to: "COMPUTER SCIENCE DEPARTMENT",
    message: "Thank you for organizing amazing workshops.",
    time: "3h ago",
    category: "college",
    reactions: ["❤️", "😊", "👏"],
    counts: [28, 16, 4],
    commentsCount: 3,
    reported: false,
    reportReason: null,
  },
  {
    id: 2,
    featured: false,
    emoji: "😊",
    to: "LIBRARY STAFF",
    message:
      "Shoutout to the library staff for always being kind, even five minutes before closing.",
    time: "9h ago",
    category: "college",
    reactions: ["❤️", "😊", "👏"],
    counts: [19, 12, 1],
    commentsCount: 1,
    reported: false,
    reportReason: null,
  },
  {
    id: 3,
    featured: false,
    emoji: "👩‍🏫",
    to: "PROF. FROM SEM 3 MATHS",
    message:
      "You explained the same doubt four times without making me feel stupid. Thank you.",
    time: "20h ago",
    category: "teacher",
    reactions: ["❤️", "😊", "👏"],
    counts: [63, 22, 9],
    commentsCount: 2,
    reported: false,
    reportReason: null,
  },
  {
    id: 4,
    featured: false,
    emoji: "💙",
    to: "A STRANGER IN THE CORRIDOR",
    message:
      "To the person who helped me carry my books yesterday, thank you. You probably don't know how much that meant.",
    time: "6h ago",
    category: "friends",
    reactions: ["❤️", "😊", "👏"],
    counts: [54, 31, 2],
    commentsCount: 5,
    reported: false,
    reportReason: null,
  },
  {
    id: 5,
    featured: false,
    emoji: "😊",
    to: "WHOEVER FOUND MY WALLET",
    message: "To whoever returned my lost wallet, you're amazing.",
    time: "12h ago",
    category: "friends",
    reactions: ["❤️", "😊", "👏"],
    counts: [87, 40, 6],
    commentsCount: 8,
    reported: false,
    reportReason: null,
  },
  {
    id: 6,
    featured: false,
    emoji: "🎓",
    to: "DRAMA CLUB",
    message: "Your last play made me cry in the best way. Please never stop.",
    time: "1d ago",
    category: "clubs",
    reactions: ["❤️", "😊", "👏"],
    counts: [31, 18, 5],
    commentsCount: 2,
    reported: false,
    reportReason: null,
  },
  {
    id: 7,
    featured: false,
    emoji: "💙",
    to: "THE LAB ASSISTANT",
    message:
      "You stayed back so we could finish our project. Quiet kindness counts the most.",
    time: "2d ago",
    category: "college",
    reactions: ["❤️", "😊", "👏"],
    counts: [22, 9, 2],
    commentsCount: 0,
    reported: false,
    reportReason: null,
  },
  {
    id: 8,
    featured: false,
    emoji: "🌸",
    to: "MY BEST FRIEND",
    message: "Thank you for always listening when I need someone.",
    time: "3d ago",
    category: "friends",
    reactions: ["❤️", "😊", "👏"],
    counts: [45, 20, 3],
    commentsCount: 1,
    reported: false,
    reportReason: null,
  },
];

const initialReactionCounts = {};
seedCompliments.forEach((c) => {
  initialReactionCounts[c.id] = [...c.counts];
});

const useAppStore = create((set, get) => ({
  // =====================================================
  // LOGIN
  // =====================================================

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

  // =====================================================
  // COMPLIMENTS (shared across Home, Wall, and Admin)
  // =====================================================

  compliments: seedCompliments,

  // reactionCounts / userReactions are keyed by compliment id,
  // NOT array index, so deleting a post never shifts anyone
  // else's reaction state.
  reactionCounts: initialReactionCounts,
  userReactions: {},

  handleReaction: (id, reactionIndex) =>
    set((state) => {
      const reactionKey = `${id}-${reactionIndex}`;
      const alreadyReacted = state.userReactions[reactionKey] === true;
      const currentCounts = state.reactionCounts[id] || [0, 0, 0];

      return {
        userReactions: {
          ...state.userReactions,
          [reactionKey]: !alreadyReacted,
        },
        reactionCounts: {
          ...state.reactionCounts,
          [id]: currentCounts.map((count, i) =>
            i !== reactionIndex ? count : alreadyReacted ? count - 1 : count + 1
          ),
        },
      };
    }),

  // =====================================================
  // MODERATION
  // A compliment gets flagged with `reported: true`. Admin
  // can either approve it (dismiss the report, keep it live)
  // or delete it (removes it everywhere, permanently).
  // =====================================================

  moderationLog: [],

  reportCompliment: (id, reason = "Reported by a user") =>
    set((state) => ({
      compliments: state.compliments.map((c) =>
        c.id === id ? { ...c, reported: true, reportReason: reason } : c
      ),
    })),

  approveReport: (id) =>
    set((state) => {
      const target = state.compliments.find((c) => c.id === id);
      if (!target) return state;

      return {
        compliments: state.compliments.map((c) =>
          c.id === id ? { ...c, reported: false, reportReason: null } : c
        ),
        moderationLog: [
          {
            id,
            to: target.to,
            message: target.message,
            emoji: target.emoji,
            action: "approved",
            time: "Just now",
          },
          ...state.moderationLog,
        ],
      };
    }),

  deleteCompliment: (id) =>
    set((state) => {
      const target = state.compliments.find((c) => c.id === id);
      if (!target) return state;

      const { [id]: _removed, ...restCounts } = state.reactionCounts;

      return {
        compliments: state.compliments.filter((c) => c.id !== id),
        reactionCounts: restCounts,
        moderationLog: [
          {
            id,
            to: target.to,
            message: target.message,
            emoji: target.emoji,
            action: "deleted",
            time: "Just now",
          },
          ...state.moderationLog,
        ],
      };
    }),

  // Convenience selector (call as get().getPendingReports() outside components)
  getPendingReports: () => get().compliments.filter((c) => c.reported),
}));

export default useAppStore;
