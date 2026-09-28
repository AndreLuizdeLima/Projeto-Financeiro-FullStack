import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createFormaRecebimento,
  formasRecebimentoQueryKey,
  updateFormaRecebimento,
  useFormasRecebimentoQuery,
  type CreateFormaRecebimentoInput,
  type FormaRecebimentoListItem,
  type UpdateFormaRecebimentoInput,
} from '@/app/formas-recebimento/api/formas-recebimento-api'
import { toast } from '@/components/ui/toast'
import { getApiErrorMessage } from '@/lib/get-api-error-message'

type FormaRecebimentoModalState =
  | { type: 'create' }
  | { type: 'edit'; formaRecebimento: FormaRecebimentoListItem }
  | null

function useFormasRecebimentoViewModel() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState<FormaRecebimentoModalState>(null)
  const formasRecebimentoQuery = useFormasRecebimentoQuery(page)
  const createMutation = useMutation({ mutationFn: createFormaRecebimento })
  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: UpdateFormaRecebimentoInput }) =>
      updateFormaRecebimento(id, values),
  })

  function openCreateModal() {
    createMutation.reset()
    setModal({ type: 'create' })
  }

  function openEditModal(formaRecebimento: FormaRecebimentoListItem) {
    updateMutation.reset()
    setModal({ type: 'edit', formaRecebimento })
  }

  function closeModal() {
    setModal(null)
  }

  async function refreshFormasRecebimento() {
    await queryClient.invalidateQueries({ queryKey: formasRecebimentoQueryKey })
  }

  async function saveFormaRecebimento(
    values: CreateFormaRecebimentoInput | UpdateFormaRecebimentoInput,
  ) {
    if (modal?.type === 'create') {
      await createMutation.mutateAsync({ nome: values.nome! })
      await refreshFormasRecebimento()
      closeModal()
      toast({
        title: 'Forma de recebimento cadastrada',
        description: 'O cadastro foi criado com sucesso.',
        variant: 'success',
      })
      return
    }

    if (modal?.type === 'edit') {
      await updateMutation.mutateAsync({ id: modal.formaRecebimento.id, values })
      await refreshFormasRecebimento()
      closeModal()
      toast({
        title: 'Forma de recebimento atualizada',
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
    formSubmissionError,
    formasRecebimento: formasRecebimentoQuery.data?.data ?? [],
    formasRecebimentoError: formasRecebimentoQuery.isError
      ? getApiErrorMessage(formasRecebimentoQuery.error)
      : undefined,
    formasRecebimentoMetadata: formasRecebimentoQuery.data?.meta,
    formasRecebimentoQuery,
    isSaving: createMutation.isPending || updateMutation.isPending,
    modal,
    openCreateModal,
    openEditModal,
    page,
    saveFormaRecebimento,
    setPage,
  }
}

export { useFormasRecebimentoViewModel }
