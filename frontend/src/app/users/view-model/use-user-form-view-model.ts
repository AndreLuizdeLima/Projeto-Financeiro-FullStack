import { useState } from 'react'
import type { UserListItem } from '@/app/users/api/users-api'
import type { UserFormValues } from '@/app/users/model/user-form-values'

type UseUserFormViewModelParams = {
  mode: 'create' | 'edit'
  user?: UserListItem
  onSubmit: (values: UserFormValues) => Promise<void>
}

const validEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function useUserFormViewModel({ mode, user, onSubmit }: UseUserFormViewModelParams) {
  const isCreate = mode === 'create'
  const [nome, setNome] = useState(user?.nome ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState<string>()
  const shouldConfirmPassword = isCreate || password.length > 0

  async function submit() {
    const normalizedName = nome.trim()
    const normalizedEmail = email.trim()

    if (!normalizedName || !normalizedEmail || (isCreate && !password)) {
      setValidationError('Preencha os campos obrigatórios.')
      return
    }

    if (!validEmailPattern.test(normalizedEmail)) {
      setValidationError('Informe um e-mail válido.')
      return
    }

    if (shouldConfirmPassword && password !== confirmPassword) {
      setValidationError('As senhas devem ser iguais.')
      return
    }

    setValidationError(undefined)

    await onSubmit({
      nome: normalizedName,
      email: normalizedEmail,
      ...(password ? { password } : {}),
    })
  }

  return {
    confirmPassword,
    email,
    isCreate,
    nome,
    password,
    setConfirmPassword,
    setEmail,
    setNome,
    setPassword,
    shouldConfirmPassword,
    submit,
    validationError,
  }
}

export { useUserFormViewModel }
