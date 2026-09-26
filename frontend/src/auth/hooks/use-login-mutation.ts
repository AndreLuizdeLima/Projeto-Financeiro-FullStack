import { useMutation } from '@tanstack/react-query'
import { requestLogin, type LoginCredentials } from '@/auth/auth-api'
import { useAuth } from '@/auth/use-auth'

function useLoginMutation() {
  const { login } = useAuth()

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => requestLogin(credentials),
    onSuccess: login,
  })
}

export { useLoginMutation }
