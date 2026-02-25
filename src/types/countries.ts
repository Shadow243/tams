import type { PaginationLink, Meta } from "./global";

export interface Country {
    id: number;
    name: string;
    code: string;
    created_at: string;
    updated_at: string;
}

export type CountryList = Country[];

export interface CountriesResponse {
    data: Country[];
    links: PaginationLink[];
    meta: Meta;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    per_page: number;
    total: number;
}
