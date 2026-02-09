import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  user: { id: string; email: string; name?: string } | null
  apiKey: string | null
  isLoading: boolean
  setAuth: (token: string, user: AuthState['user'], apiKey: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      apiKey: null,
      isLoading: false,
      setAuth: (token, user, apiKey) => set({ token, user, apiKey }),
      logout: () => set({ token: null, user: null, apiKey: null }),
    }),
    { name: 'ogify-auth' }
  )
)

export function useAuth() {
  const { token, user, apiKey, isLoading, logout } = useAuthStore()
  
  return {
    isAuthenticated: !!token,
    isLoading,
    user,
    token,
    apiKey,
    logout,
  }
}
