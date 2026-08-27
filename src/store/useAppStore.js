import { create } from "zustand";

// =====================================================
// DAY STREAK HELPER
// =====================================================

const getTodayStr = () => new Date().toDateString();

const bumpStreak = (currentStreak) => {
    const todayStr = getTodayStr();

    const lastActive = localStorage.getItem(
        "confidiaLastActive"
    );

    // Already counted today
    if (lastActive === todayStr) {
        return currentStreak;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayStr = yesterday.toDateString();

    localStorage.setItem(
        "confidiaLastActive",
        todayStr
    );

    // Active yesterday -> continue streak
    if (lastActive === yesterdayStr) {
        return currentStreak + 1;
    }

    // First time or missed a day
    return 1;
};

// =====================================================
// EMPTY USER
// =====================================================

const emptyUser = {
    _id: "",
    username: "",
    firstName: "",
    lastName: "",
    memberSince: "",
    complimentsShared: 0,
    reactionsGiven: 0,
    dayStreak: 0,
};

// =====================================================
// BUILD USER
// =====================================================

const buildUser = (user = {}) => ({
    _id: user?._id || user?.id || "",
    username: user?.username || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    memberSince: user?.memberSince || "",

    complimentsShared:
        Number(user?.complimentsShared) || 0,

    reactionsGiven:
        Number(user?.reactionsGiven) || 0,

    dayStreak:
        Number(user?.dayStreak) || 0,
});

// =====================================================
// SAVE USER TO LOCAL STORAGE
// =====================================================

const saveUserToStorage = (user) => {
    try {
        localStorage.setItem(
            "confidiaUser",
            JSON.stringify(user)
        );

        localStorage.setItem(
            "isLoggedIn",
            "true"
        );
    } catch (error) {
        console.error(
            "Failed to save user:",
            error
        );
    }
};

// =====================================================
// GET STORED USER
// =====================================================

const getStoredUser = () => {
    try {
        const raw = localStorage.getItem(
            "confidiaUser"
        );

        const wasLoggedIn =
            localStorage.getItem(
                "isLoggedIn"
            ) === "true";

        if (!raw || !wasLoggedIn) {
            return {
                User: emptyUser,
                isLoggedIn: false,
            };
        }

        return {
            User: buildUser(
                JSON.parse(raw)
            ),
            isLoggedIn: true,
        };
    } catch (error) {
        console.error(
            "Failed to restore saved session:",
            error
        );

        return {
            User: emptyUser,
            isLoggedIn: false,
        };
    }
};

// =====================================================
// STORE
// =====================================================

const useAppStore = create((set) => ({

    // =====================================================
    // LOGIN / USER
    // =====================================================

    ...getStoredUser(),

    isAdmin: false,

    setAdmin: (value) =>
        set({
            isAdmin: value,
        }),

    toggleLogin: () =>
        set((state) => ({
            isLoggedIn:
                !state.isLoggedIn,
        })),

    // =====================================================
    // SET LOGGED-IN USER
    // =====================================================

    setUser: (user) => {
        const newUser = buildUser(user);

        saveUserToStorage(newUser);

        set({
            User: newUser,
            isLoggedIn: true,
        });
    },

    // =====================================================
    // LOGOUT
    // =====================================================

    logout: () => {
        localStorage.removeItem(
            "confidiaUser"
        );

        localStorage.removeItem(
            "isLoggedIn"
        );

        localStorage.removeItem(
            "confidiaLastActive"
        );

        set({
            isLoggedIn: false,
            User: emptyUser,
        });
    },

    // =====================================================
    // BADGES
    // =====================================================

    badges: [
        {
            emoji: "💌",
            title: "First Compliment",
            description: "Break the ice.",
            target: 1,
        },

        {
            emoji: "🌸",
            title: "Spread Happiness",
            description: "10 compliments.",
            target: 10,
        },

        {
            emoji: "⭐",
            title: "Campus Hero",
            description: "100 reactions.",
            target: 100,
        },

        {
            emoji: "🔥",
            title: "Kindness Streak",
            description: "5 days in a row.",
            target: 5,
        },
    ],

    // =====================================================
    // BADGE CELEBRATION
    // =====================================================

    celebration: null,

    setCelebration: (badge) =>
        set({
            celebration: badge,
        }),

    clearCelebration: () =>
        set({
            celebration: null,
        }),

    // =====================================================
    // COMPLIMENTS
    // =====================================================

    compliments: [],

    addCompliment: (compliment) =>
        set((state) => {

            const beforeShared =
                state.User.complimentsShared;

            const beforeStreak =
                state.User.dayStreak;

            const afterShared =
                beforeShared + 1;

            const afterStreak =
                bumpStreak(beforeStreak);

            let unlocked = null;

            // First compliment
            if (
                beforeShared < 1 &&
                afterShared >= 1
            ) {
                unlocked =
                    state.badges.find(
                        (badge) =>
                            badge.title ===
                            "First Compliment"
                    );
            }

            // 10 compliments
            else if (
                beforeShared < 10 &&
                afterShared >= 10
            ) {
                unlocked =
                    state.badges.find(
                        (badge) =>
                            badge.title ===
                            "Spread Happiness"
                    );
            }

            // 5-day streak
            else if (
                beforeStreak < 5 &&
                afterStreak >= 5
            ) {
                unlocked =
                    state.badges.find(
                        (badge) =>
                            badge.title ===
                            "Kindness Streak"
                    );
            }

            const updatedUser = {
                ...state.User,

                complimentsShared:
                    afterShared,

                dayStreak:
                    afterStreak,
            };

            // ⭐ IMPORTANT
            // Save updated statistics
            // so refresh does NOT reset them.

            saveUserToStorage(
                updatedUser
            );

            return {
                compliments: [
                    ...state.compliments,
                    compliment,
                ],

                User: updatedUser,

                celebration:
                    unlocked ||
                    state.celebration,
            };
        }),

    // =====================================================
    // REACTIONS GIVEN
    // =====================================================

    addReaction: () =>
        set((state) => {

            const beforeGiven =
                state.User.reactionsGiven;

            const beforeStreak =
                state.User.dayStreak;

            const afterGiven =
                beforeGiven + 1;

            const afterStreak =
                bumpStreak(beforeStreak);

            let unlocked = null;

            // 100 reactions
            if (
                beforeGiven < 100 &&
                afterGiven >= 100
            ) {
                unlocked =
                    state.badges.find(
                        (badge) =>
                            badge.title ===
                            "Campus Hero"
                    );
            }

            // 5-day streak
            else if (
                beforeStreak < 5 &&
                afterStreak >= 5
            ) {
                unlocked =
                    state.badges.find(
                        (badge) =>
                            badge.title ===
                            "Kindness Streak"
                    );
            }

            const updatedUser = {
                ...state.User,

                reactionsGiven:
                    afterGiven,

                dayStreak:
                    afterStreak,
            };

            // ⭐ IMPORTANT
            // Save updated statistics.

            saveUserToStorage(
                updatedUser
            );

            return {
                User: updatedUser,

                celebration:
                    unlocked ||
                    state.celebration,
            };
        }),
}));

export default useAppStore;