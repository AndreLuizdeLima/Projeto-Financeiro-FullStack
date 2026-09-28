import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  centrosDeCustoQueryKey,
  createCentroDeCusto,
  updateCentroDeCusto,
  useCentrosDeCustoQuery,
  type CentroDeCustoListItem,
  type CreateCentroDeCustoInput,
  type UpdateCentroDeCustoInput,
} from '@/app/centros-de-custo/api/centros-de-custo-api'
import { toast } from '@/components/ui/toast'
import { getApiErrorMessage } from '@/lib/get-api-error-message'

type CentroDeCustoModalState =
  | { type: 'create' }
  | { type: 'edit'; centroDeCusto: CentroDeCustoListItem }
  | null

function useCentrosDeCustoViewModel() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState<CentroDeCustoModalState>(null)
  const centrosDeCustoQuery = useCentrosDeCustoQuery(page)
  const createMutation = useMutation({ mutationFn: createCentroDeCusto })
  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: UpdateCentroDeCustoInput }) =>
      updateCentroDeCusto(id, values),
  })

  function openCreateModal() {
    createMutation.reset()
    setModal({ type: 'create' })
  }

  function openEditModal(centroDeCusto: CentroDeCustoListItem) {
    updateMutation.reset()
    setModal({ type: 'edit', centroDeCusto })
  }

  function closeModal() {
    setModal(null)
  }

  async function refreshCentrosDeCusto() {
    await queryClient.invalidateQueries({ queryKey: centrosDeCustoQueryKey })
  }

  async function saveCentroDeCusto(
    values: CreateCentroDeCustoInput | UpdateCentroDeCustoInput,
  ) {
    if (modal?.type === 'create') {
      await createMutation.mutateAsync({ nome: values.nome! })
      await refreshCentrosDeCusto()
      closeModal()
      toast({
        title: 'Centro de custo cadastrado',
        description: 'O cadastro foi criado com sucesso.',
        variant: 'success',
      })
      return
    }

    if (modal?.type === 'edit') {
      await updateMutation.mutateAsync({ id: modal.centroDeCusto.id, values })
      await refreshCentrosDeCusto()
      closeModal()
      toast({
        title: 'Centro de custo atualizado',
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
    centrosDeCusto: centrosDeCustoQuery.data?.data ?? [],
    centrosDeCustoError: centrosDeCustoQuery.isError
      ? getApiErrorMessage(centrosDeCustoQuery.error)
      : undefined,
    centrosDeCustoMetadata: centrosDeCustoQuery.data?.meta,
    centrosDeCustoQuery,
    closeModal,
    formSubmissionError,
    isSaving: createMutation.isPending || updateMutation.isPending,
    modal,
    openCreateModal,
    openEditModal,
    page,
    saveCentroDeCusto,
    setPage,
  }
}

export { useCentrosDeCustoViewModel }
