import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type UserListItem = {
  id: number
  nome: string
  email: string
  isActive: boolean
  createDate: string
  updateDate?: string
}

export type UsersPageResponse = {
  data: UserListItem[]
  meta: {
    page: number
    total: number
    hasNextPage: boolean
  }
}

export type CreateUserInput = {
  nome: string
  email: string
  password: string
}

export type UpdateUserInput = {
  nome: string
  email: string
  password?: string
}

export const usersQueryKey = ['users'] as const

async function requestUsers(page: number): Promise<UsersPageResponse> {
  const response = await api.get<UsersPageResponse>('/users', {
    params: { page, limit: 20 },
  })

  return response.data
}

function useUsersQuery(page: number) {
  return useQuery({
    queryKey: [...usersQueryKey, page],
    queryFn: () => requestUsers(page),
  })
}

async function createUser(input: CreateUserInput) {
  const response = await api.post<UserListItem>('/users', input)
  return response.data
}

async function updateUser(id: number, input: UpdateUserInput) {
  const response = await api.patch<UserListItem>(`/users/${id}`, input)
  return response.data
}

async function deactivateUser(id: number) {
  const response = await api.delete<UserListItem>(`/users/${id}`)
  return response.data
}

export { createUser, deactivateUser, updateUser, useUsersQuery }
