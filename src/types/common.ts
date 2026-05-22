export interface Meta {
  current_page: number
  from: number
  last_page: number
  path?: string
  per_page: number
  to: number
  total: number
}

export interface Links {
  first: string
  last: string
  prev: string | null
  next: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  links: Links
  meta: Meta
}

export interface Customer {
  id: number
  uuid?: string
  name: string
  full_name?: string
  phone: string
  email?: string
  address?: string
  created_at?: string
  updated_at?: string
}

export interface Currency {
  id: number
  code: string
  name: string
  symbol: string
  decimal_places?: number
  exchange_rate?: number
  is_active?: boolean
  is_default?: boolean
}
