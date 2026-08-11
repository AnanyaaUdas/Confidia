import { create } from "zustand";

const useAppStore = create((set) => ({
  // =========================
  // LOGIN / USER
  // =========================

  isLoggedIn: false,
  isAdmin : false,
  
  setAdmin: (value) => 
    set({
      isAdmin: value
    }),

  User: {
    name: "Priyanya",
    memberSince: "August 2026",
    complimentsShared: 3,
    reactionsGiven: 12,
    dayStreak: 1,
  },

  toggleLogin: () =>
    set((state) => ({
      isLoggedIn: !state.isLoggedIn,
    })),

  // =========================
  // BADGES
  // =========================

  badges: [
    {
      emoji: "💌",
      title: "First Compliment",
      description: "Break the ice.",
      progress: "0/1",
      unlocked: false,
    },
    {
      emoji: "🌸",
      title: "Spread Happiness",
      description: "10 compliments.",
      progress: "0/10",
      unlocked: false,
    },
    {
      emoji: "⭐",
      title: "Campus Hero",
      description: "100 reactions.",
      progress: "0/100",
      unlocked: false,
    },
    {
      emoji: "🔥",
      title: "Kindness Streak",
      description: "5 days in a row.",
      progress: "1/5",
      unlocked: false,
    },
  ],

  // =========================
  // COMPLIMENTS
  // =========================

  compliments: [],

  addCompliment: (compliment) =>
    set((state) => ({
      compliments: [...state.compliments, compliment],

      // Add reaction counts for the NEW card
      reactionCounts: [
        ...state.reactionCounts,
        [0, 0, 0],
      ],

      User: {
        ...state.User,
        complimentsShared:
          state.User.complimentsShared + 1,
      },
    })),

  // =========================
  // REACTIONS
  // =========================

  userReactions: {},

  // Counts for the 6 original cards
  reactionCounts: [
    [28, 16, 4],
    [19, 12, 1],
    [63, 22, 9],
    [54, 31, 2],
    [87, 40, 6],
    [31, 18, 5],
  ],

  handleReaction: (cardIndex, reactionIndex) =>
    set((state) => {
      const reactionKey = `${cardIndex}-${reactionIndex}`;

      const alreadyReacted =
        state.userReactions[reactionKey] === true;

      return {
        // Remember whether this user reacted
        userReactions: {
          ...state.userReactions,
          [reactionKey]: !alreadyReacted,
        },

        // Update reaction count
        reactionCounts: state.reactionCounts.map(
          (cardCounts, index) => {
            if (index !== cardIndex) {
              return cardCounts;
            }

            return cardCounts.map(
              (count, rIndex) => {
                if (rIndex !== reactionIndex) {
                  return count;
                }

                return alreadyReacted
                  ? Math.max(0, count - 1)
                  : count + 1;
              }
            );
          }
        ),

        // Update profile reaction count
        User: {
          ...state.User,

          reactionsGiven: alreadyReacted
            ? Math.max(
                0,
                state.User.reactionsGiven - 1
              )
            : state.User.reactionsGiven + 1,
        },
      };
    }),
}));

export default useAppStore;