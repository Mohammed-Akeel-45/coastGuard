import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LoginResponseSchema, UserProfile } from "@shared/schema";

interface AuthState {
    token: string | null;
    user: LoginResponseSchema | null;
    setAuth: (user: LoginResponseSchema) => void;
    clearAuth: () => void;
    isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            setAuth: (user) => set({ user }),
            clearAuth: () => set({ token: null, user: null }),
            isAuthenticated: () => !!get().token && !!get().user,
        }),
        {
            name: "coastguard-auth",
        }
    )
);

interface MapLayersState {
    showHotspots: boolean;
    showReports: boolean;
    showSocialPosts: boolean;
    toggleHotspots: () => void;
    toggleReports: () => void;
    toggleSocialPosts: () => void;
}

export const useMapLayersStore = create<MapLayersState>((set) => ({
    showHotspots: true,
    showReports: true,
    showSocialPosts: false,
    toggleHotspots: () => set((state) => ({ showHotspots: !state.showHotspots })),
    toggleReports: () => set((state) => ({ showReports: !state.showReports })),
    toggleSocialPosts: () => set((state) => ({ showSocialPosts: !state.showSocialPosts })),
}));

interface NetworkState {
    isOnline: boolean;
    setOnline: (online: boolean) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
    isOnline: true,
    setOnline: (online) => set({ isOnline: online }),
}));
