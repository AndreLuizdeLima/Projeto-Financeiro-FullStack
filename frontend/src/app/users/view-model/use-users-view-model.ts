import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createUser,
  deactivateUser,
  updateUser,
  useUsersQuery,
  usersQueryKey,
  type UserListItem,
} from '@/app/users/api/users-api'
import { toast } from '@/components/ui/toast'
import type { UserFormValues } from '@/app/users/model/user-form-values'
import { getUsersErrorMessage } from './get-users-error-message'

type UserModalState =
  | { type: 'create' }
  | { type: 'edit'; user: UserListItem }
  | null

function useUsersViewModel() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState<UserModalState>(null)
  const [userToDeactivate, setUserToDeactivate] = useState<UserListItem | null>(null)
  const usersQuery = useUsersQuery(page)
  const createMutation = useMutation({ mutationFn: createUser })
  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: UserFormValues }) =>
      updateUser(id, values),
  })
  const deactivateMutation = useMutation({ mutationFn: deactivateUser })

  function openCreateModal() {
    createMutation.reset()
    setModal({ type: 'create' })
  }

  function openEditModal(user: UserListItem) {
    if (!user.isActive) {
      return
    }

    updateMutation.reset()
    setModal({ type: 'edit', user })
  }

  function closeModal() {
    setModal(null)
  }

  function requestDeactivation(user: UserListItem) {
    if (!user.isActive) {
      return
    }

    setUserToDeactivate(user)
  }

  function closeDeactivationDialog() {
    setUserToDeactivate(null)
  }

  function canEditUser(user: UserListItem) {
    return user.isActive
  }

  function canDeactivateUser(user: UserListItem) {
    return user.isActive
  }

  async function refreshUsers() {
    await queryClient.invalidateQueries({ queryKey: usersQueryKey })
  }

  async function saveUser(values: UserFormValues) {
    if (modal?.type === 'create') {
      await createMutation.mutateAsync({
        nome: values.nome,
        email: values.email,
        password: values.password!,
      })
      await refreshUsers()
      closeModal()
      toast({
        title: 'Usuário cadastrado',
        description: 'O acesso foi criado com sucesso.',
        variant: 'success',
      })
      return
    }

    if (modal?.type === 'edit') {
      await updateMutation.mutateAsync({ id: modal.user.id, values })
      await refreshUsers()
      closeModal()
      toast({
        title: 'Usuário atualizado',
        description: 'Os dados foram salvos com sucesso.',
        variant: 'success',
      })
    }
  }

  async function deactivateSelectedUser() {
    if (!userToDeactivate) {
      return
    }

    try {
      await deactivateMutation.mutateAsync(userToDeactivate.id)
      await refreshUsers()
      closeDeactivationDialog()
      toast({
        title: 'Usuário inativado',
        description: 'O cadastro foi preservado no histórico.',
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: 'Não foi possível inativar o usuário',
        description: getUsersErrorMessage(error),
        variant: 'destructive',
      })
      throw error
    }
  }

  const formSubmissionError =
    modal?.type === 'create' && createMutation.isError
      ? getUsersErrorMessage(createMutation.error)
      : modal?.type === 'edit' && updateMutation.isError
        ? getUsersErrorMessage(updateMutation.error)
        : undefined

  return {
    canDeactivateUser,
    canEditUser,
    closeDeactivationDialog,
    closeModal,
    deactivateSelectedUser,
    formSubmissionError,
    isDeactivating: deactivateMutation.isPending,
    isSaving: createMutation.isPending || updateMutation.isPending,
    modal,
    openCreateModal,
    openEditModal,
    page,
    requestDeactivation,
    saveUser,
    setPage,
    userToDeactivate,
    users: usersQuery.data?.data ?? [],
    usersError: usersQuery.isError ? getUsersErrorMessage(usersQuery.error) : undefined,
    usersMetadata: usersQuery.data?.meta,
    usersQuery,
  }
}

export { useUsersViewModel }
