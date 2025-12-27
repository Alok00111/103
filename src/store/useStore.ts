import { create } from 'zustand';

export interface User {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
}

export interface GameScore {
    chargerChallenge: number;
    mewingMaster: number;
    skibidiDodge: number;
}

interface StoreState {
    user: User | null;
    isPremium: boolean;
    gameScores: GameScore;
    isLoading: boolean;

    // Actions
    setUser: (user: User | null) => void;
    setPremium: (isPremium: boolean) => void;
    updateScore: (game: keyof GameScore, score: number) => void;
    setLoading: (loading: boolean) => void;
    logout: () => void;
}

export const useStore = create<StoreState>((set) => ({
    user: null,
    isPremium: false,
    gameScores: {
        chargerChallenge: 0,
        mewingMaster: 0,
        skibidiDodge: 0,
    },
    isLoading: true,

    setUser: (user) => set({ user }),

    setPremium: (isPremium) => set({ isPremium }),

    updateScore: (game, score) => set((state) => ({
        gameScores: {
            ...state.gameScores,
            [game]: Math.max(state.gameScores[game], score),
        },
    })),

    setLoading: (isLoading) => set({ isLoading }),

    logout: () => set({
        user: null,
        isPremium: false,
        gameScores: {
            chargerChallenge: 0,
            mewingMaster: 0,
            skibidiDodge: 0,
        },
    }),
}));
