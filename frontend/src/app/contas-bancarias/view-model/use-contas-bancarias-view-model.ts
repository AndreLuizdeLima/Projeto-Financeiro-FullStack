import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  contasBancariasQueryKey,
  createContaBancaria,
  updateContaBancaria,
  useContasBancariasQuery,
  type ContaBancariaListItem,
  type CreateContaBancariaInput,
  type UpdateContaBancariaInput,
} from '@/app/contas-bancarias/api/contas-bancarias-api'
import { toast } from '@/components/ui/toast'
import { getApiErrorMessage } from '@/lib/get-api-error-message'

type ContaBancariaModalState =
  | { type: 'create' }
  | { type: 'edit'; contaBancaria: ContaBancariaListItem }
  | null

function useContasBancariasViewModel() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState<ContaBancariaModalState>(null)
  const contasBancariasQuery = useContasBancariasQuery(page)
  const createMutation = useMutation({ mutationFn: createContaBancaria })
  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: UpdateContaBancariaInput }) =>
      updateContaBancaria(id, values),
  })

  function openCreateModal() {
    createMutation.reset()
    setModal({ type: 'create' })
  }

  function openEditModal(contaBancaria: ContaBancariaListItem) {
    updateMutation.reset()
    setModal({ type: 'edit', contaBancaria })
  }

  function closeModal() {
    setModal(null)
  }

  async function refreshContasBancarias() {
    await queryClient.invalidateQueries({ queryKey: contasBancariasQueryKey })
  }

  async function saveContaBancaria(
    values: CreateContaBancariaInput | UpdateContaBancariaInput,
  ) {
    if (modal?.type === 'create') {
      await createMutation.mutateAsync({
        conta: values.conta!,
        nome: values.nome!,
        tipo: values.tipo!,
      })
      await refreshContasBancarias()
      closeModal()
      toast({
        title: 'Conta bancária cadastrada',
        description: 'O cadastro foi criado com sucesso.',
        variant: 'success',
      })
      return
    }

    if (modal?.type === 'edit') {
      await updateMutation.mutateAsync({ id: modal.contaBancaria.id, values })
      await refreshContasBancarias()
      closeModal()
      toast({
        title: 'Conta bancária atualizada',
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
    closeModal,
    contasBancarias: contasBancariasQuery.data?.data ?? [],
    contasBancariasError: contasBancariasQuery.isError
      ? getApiErrorMessage(contasBancariasQuery.error)
      : undefined,
    contasBancariasMetadata: contasBancariasQuery.data?.meta,
    contasBancariasQuery,
    formSubmissionError,
    isSaving: createMutation.isPending || updateMutation.isPending,
    modal,
    openCreateModal,
    openEditModal,
    page,
    saveContaBancaria,
    setPage,
  }
}

export { useContasBancariasViewModel }
