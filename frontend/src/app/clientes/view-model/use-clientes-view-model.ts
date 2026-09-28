import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createCliente,
  clientesQueryKey,
  updateCliente,
  useClientesQuery,
  type ClienteListItem,
  type CreateClienteInput,
  type UpdateClienteInput,
} from '@/app/clientes/api/clientes-api'
import { toast } from '@/components/ui/toast'
import { getApiErrorMessage } from '@/lib/get-api-error-message'

type ClienteModalState =
  | { type: 'create' }
  | { type: 'edit'; cliente: ClienteListItem }
  | null

function useClientesViewModel() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState<ClienteModalState>(null)
  const clientesQuery = useClientesQuery(page)
  const createMutation = useMutation({ mutationFn: createCliente })
  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: UpdateClienteInput }) =>
      updateCliente(id, values),
  })

  function openCreateModal() {
    createMutation.reset()
    setModal({ type: 'create' })
  }

  function openEditModal(cliente: ClienteListItem) {
    updateMutation.reset()
    setModal({ type: 'edit', cliente })
  }

  function closeModal() {
    setModal(null)
  }

  async function refreshClientes() {
    await queryClient.invalidateQueries({ queryKey: clientesQueryKey })
  }

  async function saveCliente(values: CreateClienteInput | UpdateClienteInput) {
    if (modal?.type === 'create') {
      await createMutation.mutateAsync({
        cnpj: values.cnpj!,
        nomeFantasia: values.nomeFantasia!,
        razaoSocial: values.razaoSocial!,
      })
      await refreshClientes()
      closeModal()
      toast({
        title: 'Cliente cadastrado',
        description: 'O cadastro foi criado com sucesso.',
        variant: 'success',
      })
      return
    }

    if (modal?.type === 'edit') {
      await updateMutation.mutateAsync({ id: modal.cliente.id, values })
      await refreshClientes()
      closeModal()
      toast({
        title: 'Cliente atualizado',
        description: 'As alterações foram salvas com sucesso.',
        variant: 'success',
      })
    }
  }

  const formSubmissionError =
    modal?.type === 'create' && createMutation.isError
      ? getApiErrorMessage(createMutation.error)
      : modal?.type === 'edit' && updateMutation.isError
        ? getApiErrorMessage(updateMutation.error)
        : undefined

  return {
    clientes: clientesQuery.data?.data ?? [],
    clientesError: clientesQuery.isError
      ? getApiErrorMessage(clientesQuery.error)
      : undefined,
    clientesMetadata: clientesQuery.data?.meta,
    clientesQuery,
    closeModal,
    formSubmissionError,
    isSaving: createMutation.isPending || updateMutation.isPending,
    modal,
    openCreateModal,
    openEditModal,
    page,
    saveCliente,
    setPage,
  }
}

export { useClientesViewModel }
