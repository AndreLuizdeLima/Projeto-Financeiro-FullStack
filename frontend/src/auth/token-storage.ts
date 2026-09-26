export type AuthTokens = {
  accessToken: string
  refreshToken: string
}

const AUTH_STORAGE_KEY = 'financeiro.auth.tokens'

function isAuthTokens(value: unknown): value is AuthTokens {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const tokens = value as Record<string, unknown>
  return (
    typeof tokens.accessToken === 'string' &&
    typeof tokens.refreshToken === 'string' &&
    tokens.accessToken.length > 0 &&
    tokens.refreshToken.length > 0
  )
}

export function getStoredAuthTokens(): AuthTokens | null {
  try {
    const value = window.localStorage.getItem(AUTH_STORAGE_KEY)

    if (!value) {
      return null
    }

    const tokens: unknown = JSON.parse(value)
    return isAuthTokens(tokens) ? tokens : null
  } catch {
    return null
  }
}

export function saveAuthTokens(tokens: AuthTokens) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(tokens))
}

export function saveAccessToken(accessToken: string): AuthTokens | null {
  const tokens = getStoredAuthTokens()

  if (!tokens) {
    return null
  }

  const updatedTokens = { ...tokens, accessToken }
  saveAuthTokens(updatedTokens)
  return updatedTokens
}

export function clearAuthTokens() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}
