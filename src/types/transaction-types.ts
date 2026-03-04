export interface TransactionType {
  id: number
  uuid: string
  code: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface TransactionTypeList {
  id: number
  uuid: string
  code: string
  name: string
  description: string | null
}

export interface TransactionTypesResponse {
  data: TransactionType[]
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number
    last_page: number
    path: string
    per_page: number
    to: number
    total: number
  }
}

export interface TransactionTypeFormData {
  code: string
  name: string
  description: string
}
