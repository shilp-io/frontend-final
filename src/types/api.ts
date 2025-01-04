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

export interface UserAPIResponse extends ApiResponse<User> {}
export interface UsersListResponse extends PaginatedResponse<User> {} 