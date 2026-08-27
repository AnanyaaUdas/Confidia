import { create } from "zustand";

// =====================================================
// DAY STREAK HELPER
// =====================================================

const getTodayStr = () => {
    return new Date().toDateString();
};

const bumpStreak = (currentStreak) => {
    const todayStr = getTodayStr();

    const lastActive = localStorage.getItem(
        "confidiaLastActive"
    );

    // =================================================
    // ALREADY ACTIVE TODAY
    // =================================================

    if (lastActive === todayStr) {

        // IMPORTANT:
        // If localStorage says the user was active today
        // but the saved streak is somehow 0,
        // repair it to 1.

        return Math.max(
            Number(currentStreak) || 0,
            1
        );
    }

    // =================================================
    // YESTERDAY
    // =================================================

    const yesterday = new Date();

    yesterday.setDate(
        yesterday.getDate() - 1
    );

    const yesterdayStr =
        yesterday.toDateString();

    // =================================================
    // SAVE TODAY AS LAST ACTIVE
    // =================================================

    localStorage.setItem(
        "confidiaLastActive",
        todayStr
    );

    // =================================================
    // CONTINUE STREAK
    // =================================================

    if (lastActive === yesterdayStr) {
        return (
            Number(currentStreak) || 0
        ) + 1;
    }

    // =================================================
    // FIRST ACTION / MISSED DAY
    // =================================================

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
    _id:
        user?._id ||
        user?.id ||
        "",

    username:
        user?.username || "",

    firstName:
        user?.firstName || "",

    lastName:
        user?.lastName || "",

    memberSince:
        user?.memberSince || "",

    complimentsShared:
        Number(user?.complimentsShared) || 0,

    reactionsGiven:
        Number(user?.reactionsGiven) || 0,

    dayStreak:
        Number(user?.dayStreak) || 0,
});

// =====================================================
// SAVE USER
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
        const raw =
            localStorage.getItem(
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

        const storedUser =
            buildUser(JSON.parse(raw));

        // =================================================
        // REPAIR TODAY'S STREAK
        // =================================================

        const todayStr = getTodayStr();

        const lastActive =
            localStorage.getItem(
                "confidiaLastActive"
            );

        // If the user already performed a kindness
        // action today but somehow has streak 0,
        // restore it to 1.

        if (
            lastActive === todayStr &&
            storedUser.dayStreak < 1
        ) {
            storedUser.dayStreak = 1;

            saveUserToStorage(
                storedUser
            );
        }

        return {
            User: storedUser,
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
// GET REACTED COMPLIMENT IDS
// =====================================================

const getStoredReactedCompliments = () => {
    try {
        const raw =
            localStorage.getItem(
                "confidiaReactedCompliments"
            );

        if (!raw) {
            return [];
        }

        const parsed =
            JSON.parse(raw);

        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        console.error(
            "Failed to restore reacted compliments:",
            error
        );

        return [];
    }
};

// =====================================================
// SAVE REACTED COMPLIMENT IDS
// =====================================================

const saveReactedCompliments = (ids) => {
    try {
        localStorage.setItem(
            "confidiaReactedCompliments",
            JSON.stringify(ids)
        );
    } catch (error) {
        console.error(
            "Failed to save reacted compliments:",
            error
        );
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

        const newUser =
            buildUser(user);

        saveUserToStorage(
            newUser
        );

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

        localStorage.removeItem(
            "confidiaReactedCompliments"
        );

        set({
            isLoggedIn: false,
            User: emptyUser,
            reactedComplimentIds: [],
        });
    },

    // =====================================================
    // BADGES
    // =====================================================

    badges: [

        {
            emoji: "💌",
            title: "First Compliment",
            description:
                "Break the ice.",
            target: 1,
        },

        {
            emoji: "🌸",
            title: "Spread Happiness",
            description:
                "10 compliments.",
            target: 10,
        },

        {
            emoji: "⭐",
            title: "Campus Hero",
            description:
                "100 reactions.",
            target: 100,
        },

        {
            emoji: "🔥",
            title: "Kindness Streak",
            description:
                "5 days in a row.",
            target: 5,
        },
    ],

    // =====================================================
    // REACTED COMPLIMENTS
    // =====================================================

    reactedComplimentIds:
        getStoredReactedCompliments(),

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
                Number(
                    state.User
                        .complimentsShared
                ) || 0;

            const beforeStreak =
                Number(
                    state.User.dayStreak
                ) || 0;

            // =================================================
            // INCREASE COMPLIMENT COUNT
            // =================================================

            const afterShared =
                beforeShared + 1;

            // =================================================
            // INCREASE STREAK
            // =================================================

            const afterStreak =
                bumpStreak(
                    beforeStreak
                );

            let unlocked = null;

            // =================================================
            // FIRST COMPLIMENT
            // =================================================

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

            // =================================================
            // 10 COMPLIMENTS
            // =================================================

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

            // =================================================
            // 5 DAY STREAK
            // =================================================

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

            // =================================================
            // UPDATED USER
            // =================================================

            const updatedUser = {

                ...state.User,

                complimentsShared:
                    afterShared,

                dayStreak:
                    afterStreak,
            };

            // =================================================
            // SAVE
            // =================================================

            saveUserToStorage(
                updatedUser
            );

            return {

                compliments: [
                    ...state.compliments,
                    compliment,
                ],

                User:
                    updatedUser,

                celebration:
                    unlocked ||
                    state.celebration,
            };
        }),

    // =====================================================
    // REACTION ADDED
    // =====================================================

    addReaction: (complimentId) =>

        set((state) => {

            if (!complimentId) {
                return state;
            }

            const id =
                String(complimentId);

            // =================================================
            // CHECK IF ALREADY REACTED
            // =================================================

            const alreadyReacted =
                state.reactedComplimentIds.includes(
                    id
                );

            if (alreadyReacted) {
                return state;
            }

            // =================================================
            // REACTION COUNT
            // =================================================

            const beforeGiven =
                Number(
                    state.User
                        .reactionsGiven
                ) || 0;

            const afterGiven =
                beforeGiven + 1;

            // =================================================
            // STREAK
            // =================================================

            const beforeStreak =
                Number(
                    state.User.dayStreak
                ) || 0;

            const afterStreak =
                bumpStreak(
                    beforeStreak
                );

            let unlocked = null;

            // =================================================
            // 100 REACTIONS
            // =================================================

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

            // =================================================
            // 5 DAY STREAK
            // =================================================

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

            // =================================================
            // UPDATED USER
            // =================================================

            const updatedUser = {

                ...state.User,

                reactionsGiven:
                    afterGiven,

                dayStreak:
                    afterStreak,
            };

            // =================================================
            // SAVE REACTION ID
            // =================================================

            const updatedIds = [
                ...state.reactedComplimentIds,
                id,
            ];

            // =================================================
            // SAVE USER
            // =================================================

            saveUserToStorage(
                updatedUser
            );

            saveReactedCompliments(
                updatedIds
            );

            return {

                User:
                    updatedUser,

                reactedComplimentIds:
                    updatedIds,

                celebration:
                    unlocked ||
                    state.celebration,
            };
        }),

    // =====================================================
    // REACTION REMOVED
    // =====================================================

    removeReaction: (complimentId) =>

        set((state) => {

            if (!complimentId) {
                return state;
            }

            const id =
                String(complimentId);

            const alreadyReacted =
                state.reactedComplimentIds.includes(
                    id
                );

            // =================================================
            // NOTHING TO REMOVE
            // =================================================

            if (!alreadyReacted) {
                return state;
            }

            // =================================================
            // REMOVE ID
            // =================================================

            const updatedIds =
                state.reactedComplimentIds.filter(
                    (storedId) =>
                        storedId !== id
                );

            // =================================================
            // DECREASE REACTION COUNT
            // =================================================

            const afterGiven =
                Math.max(
                    0,
                    (
                        Number(
                            state.User
                                .reactionsGiven
                        ) || 0
                    ) - 1
                );

            const updatedUser = {

                ...state.User,

                reactionsGiven:
                    afterGiven,
            };

            // =================================================
            // SAVE
            // =================================================

            saveUserToStorage(
                updatedUser
            );

            saveReactedCompliments(
                updatedIds
            );

            return {

                User:
                    updatedUser,

                reactedComplimentIds:
                    updatedIds,
            };
        }),
}));

export default useAppStore;