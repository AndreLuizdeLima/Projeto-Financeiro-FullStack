import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

type FormaRecebimentoListItem = {
  id: number
  nome: string
  isActive: boolean
}

type FormasRecebimentoPageResponse = {
  data: FormaRecebimentoListItem[]
  meta: {
    page: number
    total: number
    hasNextPage: boolean
  }
}

type CreateFormaRecebimentoInput = {
  nome: string
}

type UpdateFormaRecebimentoInput = Partial<CreateFormaRecebimentoInput> & {
  isActive?: boolean
}

const formasRecebimentoQueryKey = ['formas-recebimento'] as const

async function requestFormasRecebimento(
  page: number,
): Promise<FormasRecebimentoPageResponse> {
  const response = await api.get<FormasRecebimentoPageResponse>(
    '/formas-recebimento',
    { params: { page, limit: 20 } },
  )

  return response.data
}

function useFormasRecebimentoQuery(page: number) {
  return useQuery({
    queryKey: [...formasRecebimentoQueryKey, page],
    queryFn: () => requestFormasRecebimento(page),
  })
}

async function createFormaRecebimento(input: CreateFormaRecebimentoInput) {
  const response = await api.post<FormaRecebimentoListItem>(
    '/formas-recebimento',
    input,
  )
  return response.data
}

async function updateFormaRecebimento(
  id: number,
  input: UpdateFormaRecebimentoInput,
) {
  const response = await api.patch<FormaRecebimentoListItem>(
    `/formas-recebimento/${id}`,
    input,
  )
  return response.data
}

export {
  createFormaRecebimento,
  formasRecebimentoQueryKey,
  updateFormaRecebimento,
  useFormasRecebimentoQuery,
  type CreateFormaRecebimentoInput,
  type FormaRecebimentoListItem,
  type UpdateFormaRecebimentoInput,
}
