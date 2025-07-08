import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, AuthResponse, ApiResponse } from "@rooster-ai/shared";
import { apiClient } from "@/lib/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post<ApiResponse<AuthResponse>>(
            "/auth/login",
            {
              email,
              password,
            }
          );

          const { user, tokens } = response.data.data!;

          set({
            user,
            token: tokens.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });

          // Set token for future requests
          apiClient.defaults.headers.common["Authorization"] =
            `Bearer ${tokens.accessToken}`;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        delete apiClient.defaults.headers.common["Authorization"];
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post<ApiResponse<AuthResponse>>(
            "/auth/register",
            {
              email,
              password,
              name,
            }
          );

          const { user, tokens } = response.data.data!;

          set({
            user,
            token: tokens.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });

          apiClient.defaults.headers.common["Authorization"] =
            `Bearer ${tokens.accessToken}`;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      refreshToken: async () => {
        // Implementation for token refresh
      },

      setUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
