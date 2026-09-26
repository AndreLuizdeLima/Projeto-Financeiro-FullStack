import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { requestAccessToken } from '@/auth/auth-api'
import { getStoredAuthTokens } from '@/auth/token-storage'

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export const api = axios.create({
  baseURL: apiBaseUrl,
})

let refreshPromise: Promise<string> | null = null
let onSessionExpired: (() => void) | null = null

export function configureSessionExpiration(handler: () => void) {
  onSessionExpired = handler

  return () => {
    if (onSessionExpired === handler) {
      onSessionExpired = null
    }
  }
}

function isAuthenticationEndpoint(url?: string) {
  return url?.includes('/auth/login') || url?.includes('/auth/refresh')
}

function refreshAccessToken(refreshToken: string) {
  refreshPromise ??= requestAccessToken(refreshToken).finally(() => {
    refreshPromise = null
  })

  return refreshPromise
}

api.interceptors.request.use((config) => {
  const accessToken = getStoredAuthTokens()?.accessToken

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetryableRequestConfig | undefined

    if (
      error.response?.status !== 401 ||
      !request ||
      request._retry ||
      isAuthenticationEndpoint(request.url)
    ) {
      return Promise.reject(error)
    }

    const refreshToken = getStoredAuthTokens()?.refreshToken

    if (!refreshToken) {
      onSessionExpired?.()
      return Promise.reject(error)
    }

    request._retry = true

    try {
      const accessToken = await refreshAccessToken(refreshToken)
      request.headers.Authorization = `Bearer ${accessToken}`
      return api(request)
    } catch {
      onSessionExpired?.()
      return Promise.reject(error)
    }
  },
)
