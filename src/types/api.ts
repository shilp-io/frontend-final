import type { User } from './auth'

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  status: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
}

export type UserAPIResponse = ApiResponse<User>
export type UsersListResponse = PaginatedResponse<User> 