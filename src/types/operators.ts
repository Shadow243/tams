import type { PaginationLink, Meta } from "./global";

export interface Operator {
    id: number;
    name: string;
    country_id: number;
    country?: {
        id: number;
        name: string;
        code: string;
    };
    logo: string | null;
    logo_url: string | null;
    created_at: string;
    updated_at: string;
}

export type OperatorList = Operator[];

export interface OperatorsResponse {
    data: Operator[];
    links: PaginationLink[];
    meta: Meta;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    per_page: number;
    total: number;
}
