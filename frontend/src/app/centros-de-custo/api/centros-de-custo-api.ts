import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

type CentroDeCustoListItem = {
  id: number
  nome: string
  isActive: boolean
}

type CentrosDeCustoPageResponse = {
  data: CentroDeCustoListItem[]
  meta: {
    page: number
    total: number
    hasNextPage: boolean
  }
}

type CreateCentroDeCustoInput = {
  nome: string
}

type UpdateCentroDeCustoInput = Partial<CreateCentroDeCustoInput> & {
  isActive?: boolean
}

const centrosDeCustoQueryKey = ['centros-de-custo'] as const

async function requestCentrosDeCusto(
  page: number,
): Promise<CentrosDeCustoPageResponse> {
  const response = await api.get<CentrosDeCustoPageResponse>('/centro-de-custo', {
    params: { page, limit: 20 },
  })

  return response.data
}

function useCentrosDeCustoQuery(page: number) {
  return useQuery({
    queryKey: [...centrosDeCustoQueryKey, page],
    queryFn: () => requestCentrosDeCusto(page),
  })
}

async function createCentroDeCusto(input: CreateCentroDeCustoInput) {
  const response = await api.post<CentroDeCustoListItem>('/centro-de-custo', input)
  return response.data
}

async function updateCentroDeCusto(
  id: number,
  input: UpdateCentroDeCustoInput,
) {
  const response = await api.patch<CentroDeCustoListItem>(
    `/centro-de-custo/${id}`,
    input,
  )
  return response.data
}

export {
  centrosDeCustoQueryKey,
  createCentroDeCusto,
  updateCentroDeCusto,
  useCentrosDeCustoQuery,
  type CentroDeCustoListItem,
  type CreateCentroDeCustoInput,
  type UpdateCentroDeCustoInput,
}
