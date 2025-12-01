export interface ServiceParams {
  pagination?: {
    page?: number
    pageSize?: number
  }
  search?: {
    query?: string
    filters?: Record<string, any>
  }
  orderBy?:
    | Record<string, 'asc' | 'desc'>
    | Array<Record<string, 'asc' | 'desc'>>
}

export interface ServiceResult<T> {
  data: T
  pagination?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}
