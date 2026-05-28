import type { Customer } from './common'
import type { Currency } from './common'
import type { Branch } from './branches'
import type { User } from './auth'
import type { Transaction } from './transactions'

export interface CustomerAccount {
  id: number
  uuid: string
  account_number: string
  customer_id: number
  customer?: Customer
  currency_id: number
  currency?: Currency
  branch_id: number
  branch?: Branch
  balance: number
  credit_limit: number
  available_balance: number
  is_in_debt: boolean
  debt_amount: number
  status: 'active' | 'suspended' | 'closed'
  status_label: string
  status_color: string
  is_vip: boolean
  notes?: string
  interest_settings?: AccountInterestSetting
  created_at: string
  updated_at: string
}

export interface AccountTransaction {
  id: number
  uuid: string
  reference: string
  customer_account_id: number
  customer_account?: CustomerAccount
  transaction_id?: string
  transaction?: Transaction
  user_id: number
  user?: User
  branch_id?: number
  branch?: Branch
  type: AccountTransactionType
  type_label: string
  type_sign: string
  type_color: string
  amount: number
  formatted_amount: string
  balance_before: number
  balance_after: number
  description?: string
  is_credit: boolean
  is_debit: boolean
  created_at: string
  updated_at: string
}

export type AccountTransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'interest_credit'
  | 'interest_debit'
  | 'fee'
  | 'adjustment'

export interface AccountInterestSetting {
  id: number
  uuid: string
  customer_account_id: number
  customer_account?: CustomerAccount
  interest_type: 'percentage' | 'fixed'
  interest_type_label: string
  interest_rate?: number
  fixed_amount?: number
  application_period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  application_period_label: string
  apply_on_negative_balance: boolean
  apply_on_positive_balance: boolean
  last_applied_at?: string
  next_application_date?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CustomerAccountFormData {
  customer_id: number
  currency_id: number
  branch_id: number | null
  credit_limit?: number
  is_vip?: boolean
  notes?: string
  initial_deposit?: number
  status?: 'active' | 'suspended' | 'closed'
}

export interface AccountOperationData {
  amount: number
  description?: string
  branch_id?: number | null
}

export interface InterestSimulation {
  applicable: boolean
  reason?: string
  current_balance?: number
  interest_amount?: number
  balance_after?: number
  interest_type?: string
  interest_rate?: number
  fixed_amount?: number
  application_period?: string
  is_debt_interest?: boolean
  next_application_date?: string
}
