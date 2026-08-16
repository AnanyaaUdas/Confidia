import { create } from "zustand";

// =========================
// DAY STREAK HELPER
// =========================
// Any "kindness action" (writing a compliment, reacting to one)
// counts as being active today. If the person was also active
// yesterday, the streak grows; if they skipped a day, it resets.

const getTodayStr = () => new Date().toDateString();

const bumpStreak = (currentStreak) => {
    const todayStr = getTodayStr();
    const lastActive = localStorage.getItem("confidiaLastActive");

    // Already counted today — streak doesn't change
    if (lastActive === todayStr) {
        return currentStreak;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    localStorage.setItem("confidiaLastActive", todayStr);

    // Was active yesterday -> keep the streak going
    if (lastActive === yesterdayStr) {
        return currentStreak + 1;
    }

    // First time ever, or a day (or more) was missed -> restart
    return 1;
};

const useAppStore = create((set) => ({

    // =========================
    // LOGIN / USER
    // =========================

    isLoggedIn: false,

    isAdmin: false,


    setAdmin: (value) =>
        set({
            isAdmin: value,
        }),

    toggleLogin: () =>
        set((state) => ({
            isLoggedIn: !state.isLoggedIn,
        })),

    User: {

        username: "",

        firstName: "",

        lastName: "",

        memberSince: "",

        complimentsShared: 0,

        reactionsGiven: 0,

        dayStreak: 0,

    },


    // =========================
    // SET LOGGED-IN USER
    // =========================

    setUser: (user) =>
        set({

            User: {

                username:
                    user.username || "",

                firstName:
                    user.firstName || "",

                lastName:
                    user.lastName || "",

                memberSince:
                    user.memberSince || "",

                complimentsShared:
                    user.complimentsShared || 0,

                reactionsGiven:
                    user.reactionsGiven || 0,

                dayStreak:
                    user.dayStreak || 0,

            },

            isLoggedIn: true,

        }),


    // =========================
    // LOGOUT
    // =========================

    logout: () =>
        set({

            isLoggedIn: false,

            User: {

                username: "",

                firstName: "",

                lastName: "",

                memberSince: "",

                complimentsShared: 0,

                reactionsGiven: 0,

                dayStreak: 0,

            },

        }),


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
            progress: "0/5",
            unlocked: false,
        },

    ],


    // =========================
    // BADGE CELEBRATION POPUP
    // =========================
    // Whichever component just unlocked a badge (Write, or a
    // reaction on the Wall) drops it here; BadgeCelebration.jsx
    // renders it once, app-wide.

    celebration: null,

    setCelebration: (badge) =>
        set({ celebration: badge }),

    clearCelebration: () =>
        set({ celebration: null }),


    // =========================
    // COMPLIMENTS
    // =========================

    compliments: [],


    addCompliment: (compliment) =>
        set((state) => {

            const beforeShared = state.User.complimentsShared;
            const beforeStreak = state.User.dayStreak;

            const afterShared = beforeShared + 1;
            const afterStreak = bumpStreak(beforeStreak);

            let unlocked = null;

            if (beforeShared < 1 && afterShared >= 1) {
                unlocked = state.badges.find(
                    (b) => b.title === "First Compliment"
                );
            } else if (beforeShared < 10 && afterShared >= 10) {
                unlocked = state.badges.find(
                    (b) => b.title === "Spread Happiness"
                );
            } else if (beforeStreak < 5 && afterStreak >= 5) {
                unlocked = state.badges.find(
                    (b) => b.title === "Kindness Streak"
                );
            }

            return {

                compliments: [
                    ...state.compliments,
                    compliment,
                ],


                reactionCounts: [

                    ...state.reactionCounts,

                    [0, 0, 0],

                ],


                User: {

                    ...state.User,

                    complimentsShared: afterShared,

                    dayStreak: afterStreak,

                },

                celebration: unlocked || state.celebration,

            };

        }),


    // =========================
    // REACTIONS GIVEN (own stats)
    // =========================
    // Called whenever the user reacts to someone else's
    // compliment on the Wall — separate from the demo
    // reaction-count toggler further down.

    addReaction: () =>
        set((state) => {

            const beforeGiven = state.User.reactionsGiven;
            const beforeStreak = state.User.dayStreak;

            const afterGiven = beforeGiven + 1;
            const afterStreak = bumpStreak(beforeStreak);

            let unlocked = null;

            if (beforeGiven < 100 && afterGiven >= 100) {
                unlocked = state.badges.find(
                    (b) => b.title === "Campus Hero"
                );
            } else if (beforeStreak < 5 && afterStreak >= 5) {
                unlocked = state.badges.find(
                    (b) => b.title === "Kindness Streak"
                );
            }

            return {

                User: {

                    ...state.User,

                    reactionsGiven: afterGiven,

                    dayStreak: afterStreak,

                },

                celebration: unlocked || state.celebration,

            };

        }),


    // =========================
    // REACTIONS
    // =========================

    userReactions: {},


    reactionCounts: [

        [28, 16, 4],

        [19, 12, 1],

        [63, 22, 9],

        [54, 31, 2],

        [87, 40, 6],

        [31, 18, 5],

    ],


    handleReaction:
        (cardIndex, reactionIndex) =>

            set((state) => {

                const reactionKey =
                    `${cardIndex}-${reactionIndex}`;


                const alreadyReacted =
                    state.userReactions[
                        reactionKey
                    ] === true;


                return {

                    userReactions: {

                        ...state.userReactions,

                        [reactionKey]:
                            !alreadyReacted,

                    },


                    reactionCounts:
                        state.reactionCounts.map(
                            (
                                cardCounts,
                                index
                            ) => {

                                if (
                                    index !==
                                    cardIndex
                                ) {

                                    return cardCounts;

                                }


                                return cardCounts.map(
                                    (
                                        count,
                                        rIndex
                                    ) => {

                                        if (
                                            rIndex !==
                                            reactionIndex
                                        ) {

                                            return count;

                                        }


                                        return alreadyReacted

                                            ? Math.max(
                                                0,
                                                count - 1
                                            )

                                            : count + 1;

                                    }
                                );

                            }
                        ),


                    User: {

                        ...state.User,

                        reactionsGiven:

                            alreadyReacted

                                ? Math.max(
                                    0,
                                    state.User
                                        .reactionsGiven -
                                        1
                                )

                                : state.User
                                    .reactionsGiven +
                                    1,

                    },

                };

            }),

}));


export default useAppStore;