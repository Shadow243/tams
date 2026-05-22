export type BalanceEffect = 'none' | 'debit' | 'credit'
export type BalanceAmount = 'gross' | 'net' | 'fee'

export interface TransactionType {
  requires_dest_customer: boolean
  id: number
  uuid: string
  code: string
  name: string
  description: string | null
  branch_effect: BalanceEffect
  branch_amount: BalanceAmount
  wallet_effect: BalanceEffect
  wallet_amount: BalanceAmount
  dest_branch_effect: BalanceEffect
  dest_branch_amount: BalanceAmount
  dest_wallet_effect: BalanceEffect
  dest_wallet_amount: BalanceAmount
  customer_account_effect: BalanceEffect
  customer_account_amount: BalanceAmount
  created_at: string
  updated_at: string
}

export interface TransactionTypeList {
  requires_dest_customer: boolean
  id: number
  uuid: string
  code: string
  name: string
  description: string | null
  branch_effect: BalanceEffect
  branch_amount: BalanceAmount
  wallet_effect: BalanceEffect
  wallet_amount: BalanceAmount
  dest_branch_effect: BalanceEffect
  dest_branch_amount: BalanceAmount
  dest_wallet_effect: BalanceEffect
  dest_wallet_amount: BalanceAmount
  customer_account_effect: BalanceEffect
  customer_account_amount: BalanceAmount
  created_at: string
  updated_at: string
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
  branch_effect: BalanceEffect
  branch_amount: BalanceAmount
  wallet_effect: BalanceEffect
  wallet_amount: BalanceAmount
  dest_branch_effect: BalanceEffect
  dest_branch_amount: BalanceAmount
  dest_wallet_effect: BalanceEffect
  dest_wallet_amount: BalanceAmount
  customer_account_effect: BalanceEffect
  customer_account_amount: BalanceAmount
}
