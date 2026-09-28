import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

const tiposDeContaBancaria = [
  'ContaCorrente',
  'ContaPoupanca',
  'ContaSalario',
] as const

type TipoDeContaBancaria = (typeof tiposDeContaBancaria)[number]

const tipoDeContaBancariaLabels: Record<TipoDeContaBancaria, string> = {
  ContaCorrente: 'Conta corrente',
  ContaPoupanca: 'Conta poupança',
  ContaSalario: 'Conta salário',
}

type ContaBancariaListItem = {
  id: number
  nome: string
  conta: string
  tipo: TipoDeContaBancaria
  isActive: boolean
}

type ContasBancariasPageResponse = {
  data: ContaBancariaListItem[]
  meta: {
    page: number
    total: number
    hasNextPage: boolean
  }
}

type CreateContaBancariaInput = {
  nome: string
  conta: string
  tipo: TipoDeContaBancaria
}

type UpdateContaBancariaInput = Partial<CreateContaBancariaInput> & {
  isActive?: boolean
}

const contasBancariasQueryKey = ['contas-bancarias'] as const

async function requestContasBancarias(
  page: number,
): Promise<ContasBancariasPageResponse> {
  const response = await api.get<ContasBancariasPageResponse>('/conta-bancaria', {
    params: { page, limit: 20 },
  })

  return response.data
}

function useContasBancariasQuery(page: number) {
  return useQuery({
    queryKey: [...contasBancariasQueryKey, page],
    queryFn: () => requestContasBancarias(page),
  })
}

async function createContaBancaria(input: CreateContaBancariaInput) {
  const response = await api.post<ContaBancariaListItem>('/conta-bancaria', input)
  return response.data
}

async function updateContaBancaria(
  id: number,
  input: UpdateContaBancariaInput,
) {
  const response = await api.patch<ContaBancariaListItem>(
    `/conta-bancaria/${id}`,
    input,
  )
  return response.data
}

export {
  contasBancariasQueryKey,
  createContaBancaria,
  tipoDeContaBancariaLabels,
  tiposDeContaBancaria,
  updateContaBancaria,
  useContasBancariasQuery,
  type ContaBancariaListItem,
  type CreateContaBancariaInput,
  type TipoDeContaBancaria,
  type UpdateContaBancariaInput,
}
