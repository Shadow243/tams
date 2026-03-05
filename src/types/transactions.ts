export type TransactionStatus =
  | 'pending'
  | 'available'
  | 'completed'
  | 'cancelled'
  | 'failed'
  | 'expired'

export type FeeModeApplied = 'fixed' | 'percentage' | 'negotiated' | 'manual_override'

export interface Transaction {
  id: string
  uuid: string
  reference: string
  transaction_type_id: number
  transaction_type?: {
    id: number
    code: string
    name: string
  }
  branch_id: number
  branch?: {
    id: number
    code: string
    name: string
  }
  destination_branch_id: number | null
  destination_branch?: {
    id: number
    code: string
    name: string
  }
  user_id: number
  user?: {
    id: number
    name: string
    email: string
  }
  customer_id: string | null
  customer?: {
    id: string
    full_name: string
    phone: string
    national_id: string | null
  }
  wallet_id: number | null
  wallet?: {
    id: number
    name: string
    code: string
  }
  customer_phone: string | null
  gross_amount: number
  fee_amount: number
  net_amount: number
  fee_rule_id: number | null
  fee_rule?: {
    id: number
    fee_mode: string
    value: number | null
  }
  fee_mode_applied: FeeModeApplied
  fee_mode_applied_label: string
  fee_snapshot: {
    fee_mode: string
    value: number | null
    min_fee: number | null
    max_fee: number | null
  } | null
  parent_transaction_id: string | null
  parent_transaction?: Transaction
  child_transactions?: Transaction[]
  withdrawal_code: string | null
  expires_at: string | null
  status: TransactionStatus
  status_label: string
  status_color: string
  can_be_modified: boolean
  can_be_cancelled: boolean
  is_expired: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface TransactionFormData {
  transaction_type_id: number | null
  branch_id: number | null
  destination_branch_id: number | null
  customer_id: string | null
  wallet_id: number | null
  customer_phone: string | null
  gross_amount: number | null
  fee_amount: number | null
  fee_mode_applied: FeeModeApplied | null
  fee_rule_id: number | null
  parent_transaction_id: string | null
  withdrawal_code: string | null
  expires_at: string | null
  status: TransactionStatus
}

export interface TransactionFilters {
  search: string
  transaction_type_id: number | null
  branch_id: number | null
  user_id: number | null
  customer_id: string | null
  customer_phone: string | null
  status: TransactionStatus | ''
  start_date: string | null
  end_date: string | null
  per_page: number
}

export interface TransactionStatistics {
  total_transactions: number
  total_amount: number
  total_fees: number
  total_net: number
  by_status: {
    pending: number
    available: number
    completed: number
    cancelled: number
    failed: number
    expired: number
  }
}
