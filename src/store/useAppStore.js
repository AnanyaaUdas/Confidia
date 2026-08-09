import { create } from "zustand";

const useAppStore = create((set) => ({
  // LOGIN

  isLoggedIn: false,
  User : {
    name: "Priyanya",
    memberSince: "August 2026",
    complimentsShared: 3,
    reactionsGiven: 12,
    dayStreak: 1,
},
badges : [
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


  toggleLogin: () =>
    set((state) => ({
      isLoggedIn: !state.isLoggedIn,
    })),

  
  // REACTIONS

  userReactions: {},

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
        userReactions: {
          ...state.userReactions,
          [reactionKey]: !alreadyReacted,
        },

        reactionCounts: state.reactionCounts.map(
          (cardCounts, index) => {
            if (index !== cardIndex) {
              return cardCounts;
            }

            return cardCounts.map((count, rIndex) => {
              if (rIndex !== reactionIndex) {
                return count;
              }

              return alreadyReacted
                ? count - 1
                : count + 1;
            });
          }
        ),
      };
    }),
}));

export default useAppStore;