import { createContext } from 'react'
import type { AuthTokens } from '@/auth/token-storage'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export type AuthContextValue = {
  status: AuthStatus
  isAuthenticated: boolean
  login: (tokens: AuthTokens) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
