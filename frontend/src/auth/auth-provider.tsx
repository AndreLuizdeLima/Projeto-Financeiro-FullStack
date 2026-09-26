import { type PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { requestAccessToken } from '@/auth/auth-api'
import { AuthContext, type AuthContextValue, type AuthStatus } from '@/auth/auth-context'
import {
  clearAuthTokens,
  getStoredAuthTokens,
  saveAuthTokens,
  type AuthTokens,
} from '@/auth/token-storage'
import { configureSessionExpiration } from '@/lib/api'

function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<AuthStatus>(() =>
    getStoredAuthTokens() ? 'loading' : 'unauthenticated',
  )

  const clearSession = useCallback(() => {
    clearAuthTokens()
    queryClient.clear()
    setStatus('unauthenticated')
  }, [queryClient])

  const login = useCallback((tokens: AuthTokens) => {
    saveAuthTokens(tokens)
    setStatus('authenticated')
  }, [])

  useEffect(() => configureSessionExpiration(clearSession), [clearSession])

  useEffect(() => {
    let isActive = true

    async function restoreSession() {
      const tokens = getStoredAuthTokens()

      if (!tokens) {
        if (isActive) {
          setStatus('unauthenticated')
        }
        return
      }

      try {
        await requestAccessToken(tokens.refreshToken)

        if (isActive) {
          setStatus('authenticated')
        }
      } catch {
        if (isActive) {
          clearSession()
        }
      }
    }

    void restoreSession()

    return () => {
      isActive = false
    }
  }, [clearSession])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      isAuthenticated: status === 'authenticated',
      login,
      logout: clearSession,
    }),
    [clearSession, login, status],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthProvider }
