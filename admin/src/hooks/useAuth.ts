import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  name: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  user: AuthUser | null;
  role: "super_admin" | "researcher" | null;
  token: string | null;
  login: () => void;
  setSession: (token: string, role: "super_admin" | "researcher", user: AuthUser) => void;
  logout: () => void;
  isAdmin: () => boolean;
  isResearcher: () => boolean;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      token: null,

      // Redirects to Ballerina Google OAuth endpoint
      login: () => {
        const apiUrl = import.meta.env.VITE_API_URL ?? "https://api.brainlabsinc.org";
        window.location.href = `${apiUrl}/auth/google`;
      },


      // Called from /auth/callback after Google OAuth completes
      setSession: (token, role, user) => {
        set({ token, role, user });
      },

      logout: () => {
        set({ user: null, role: null, token: null });
      },

      isAdmin: () => get().role === "super_admin",
      isResearcher: () => get().role === "researcher",
    }),
    {
      name: "bl_admin_session",
      // Only persist token + role — user object is fetched fresh on callback
      partialize: (state) => ({
        token: state.token,
        role: state.role,
        user: state.user,
      }),
    }
  )
);
