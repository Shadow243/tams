export interface FeeRule {
  id: number
  uuid: string
  transaction_type_id: number
  transaction_type?: {
    id: number
    code: string
    name: string
  }
  operator_id: number | null
  operator?: {
    id: number
    name: string
  }
  branch_id: number | null
  branch?: {
    id: number
    code: string
    name: string
  }
  fee_mode: 'fixed' | 'percentage' | 'negotiable'
  fee_mode_label: string
  value: number | null
  min_fee: number | null
  max_fee: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FeeRuleList {
  id: number
  uuid: string
  transaction_type_id: number
  transaction_type?: {
    id: number
    code: string
    name: string
  }
  operator_id: number | null
  operator?: {
    id: number
    name: string
  }
  branch_id: number | null
  branch?: {
    id: number
    code: string
    name: string
  }
  fee_mode: 'fixed' | 'percentage' | 'negotiable'
  fee_mode_label: string
  value: number | null
  min_fee: number | null
  max_fee: number | null
  is_active: boolean
}

export interface FeeRulesResponse {
  data: FeeRule[]
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

export interface FeeRuleFormData {
  transaction_type_id: number | null
  operator_id: number | null
  branch_id: number | null
  fee_mode: 'fixed' | 'percentage' | 'negotiable'
  value: number | null
  min_fee: number | null
  max_fee: number | null
  is_active: boolean
}
