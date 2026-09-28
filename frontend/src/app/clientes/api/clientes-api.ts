import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

type ClienteListItem = {
  id: number
  cnpj: string
  nomeFantasia: string
  razaoSocial: string
  isActive: boolean
}

type ClientesPageResponse = {
  data: ClienteListItem[]
  meta: {
    page: number
    total: number
    hasNextPage: boolean
  }
}

type CreateClienteInput = {
  cnpj: string
  nomeFantasia: string
  razaoSocial: string
}

type UpdateClienteInput = Partial<CreateClienteInput> & {
  isActive?: boolean
}

const clientesQueryKey = ['clientes'] as const

async function requestClientes(page: number): Promise<ClientesPageResponse> {
  const response = await api.get<ClientesPageResponse>('/cliente', {
    params: { page, limit: 20 },
  })

  return response.data
}

function useClientesQuery(page: number) {
  return useQuery({
    queryKey: [...clientesQueryKey, page],
    queryFn: () => requestClientes(page),
  })
}

async function createCliente(input: CreateClienteInput) {
  const response = await api.post<ClienteListItem>('/cliente', input)
  return response.data
}

async function updateCliente(id: number, input: UpdateClienteInput) {
  const response = await api.patch<ClienteListItem>(`/cliente/${id}`, input)
  return response.data
}

export {
  createCliente,
  clientesQueryKey,
  updateCliente,
  useClientesQuery,
  type ClienteListItem,
  type CreateClienteInput,
  type UpdateClienteInput,
}
