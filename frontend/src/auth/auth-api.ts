import axios from 'axios'
import { saveAccessToken, type AuthTokens } from '@/auth/token-storage'

export type LoginCredentials = {
  email: string
  password: string
}

type AccessTokenResponse = {
  accessToken: string
}

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export const authApi = axios.create({
  baseURL: apiBaseUrl,
})

function isAuthTokens(value: unknown): value is AuthTokens {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const tokens = value as Record<string, unknown>
  return typeof tokens.accessToken === 'string' && typeof tokens.refreshToken === 'string'
}

function isAccessTokenResponse(value: unknown): value is AccessTokenResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).accessToken === 'string'
  )
}

export async function requestLogin(credentials: LoginCredentials): Promise<AuthTokens> {
  const response = await authApi.post<unknown>('/auth/login', credentials)

  if (!isAuthTokens(response.data)) {
    throw new Error('A API retornou uma resposta de autenticação inválida.')
  }

  return response.data
}

export async function requestAccessToken(refreshToken: string): Promise<string> {
  const response = await authApi.post<unknown>('/auth/refresh', { refreshToken })

  if (!isAccessTokenResponse(response.data)) {
    throw new Error('A API retornou uma resposta de atualização inválida.')
  }

  const tokens = saveAccessToken(response.data.accessToken)

  if (!tokens) {
    throw new Error('A sessão não está mais disponível.')
  }

  return tokens.accessToken
}
