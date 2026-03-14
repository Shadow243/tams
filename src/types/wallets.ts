import type { PaginationLink, Meta } from "./global";
import type { Branch } from "./branches";
import type { Operator } from "./operators";
import type { Currency } from "@/stores/currencies";

export interface Wallet {
    id: number;
    uuid: string;
    branch_id: number;
    branch?: Branch;
    operator_id: number;
    operator?: Operator;
    wallet_number: string;
    balance: string | number;
    currency_id: number;
    currency?: Currency;
    formatted_balance: string;
    status: 'active' | 'inactive';
    status_label: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export type WalletList = Wallet[];

export interface WalletsResponse {
    data: Wallet[];
    links: PaginationLink[];
    meta: Meta;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    per_page: number;
    total: number;
}

export interface WalletFormData {
    branch_id: number | null;
    operator_id: number | null;
    wallet_number: string;
    balance?: number | string;
    currency_id?: number | null;
    status?: 'active' | 'inactive';
}
