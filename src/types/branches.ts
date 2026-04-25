import type { PaginationLink, Meta } from "./global";
import type { Country } from "./countries";

export interface BranchBalance {
    currency_code: string;
    currency?: {
        code: string;
        name: string;
        symbol: string;
    } | null;
    cash_balance: number;
    formatted_balance?: string;
}

export interface Branch {
    id: number;
    uuid: string;
    code: string;
    name: string;
    country_id: number;
    country?: Country;
    address: string | null;
    cash_balance: string | number;
    balances?: BranchBalance[];
    status: 'active' | 'inactive';
    status_label: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export type BranchList = Branch[];

export interface BranchesResponse {
    data: Branch[];
    links: PaginationLink[];
    meta: Meta;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    per_page: number;
    total: number;
}

export interface BranchBalanceReportItem {
    currency_code: string
    currency_name?: string
    currency_symbol?: string
    cash_balance: number
}

export interface BranchBalanceReport {
    id: number
    name: string
    code: string
    status: string
    balances: BranchBalanceReportItem[]
}

export interface WalletBalanceReport {
    id: number
    wallet_number: string
    operator_name?: string
    branch_name?: string
    currency_code?: string
    currency_symbol?: string
    balance: number
    virtual_balance: number
    status: string
}

export interface BalanceSummaryItem {
    currency_code: string
    currency_symbol?: string
    total_branch_cash: number
    total_wallet_virtual: number
}

export interface BalanceReport {
    branches: BranchBalanceReport[]
    wallets: WalletBalanceReport[]
    summary: BalanceSummaryItem[]
}

export interface BranchFormData {
    code: string;
    name: string;
    country_id: number | null;
    address?: string;
    cash_balance?: number | string;
    status?: 'active' | 'inactive';
}
