// @ts-nocheck
declare type Optional<T> = T | null
declare type Nullable<T> = T | undefined | null

export type { Optional, Nullable }

export type Meta = {
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    per_page: number;
    total: number;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

declare global {
    interface Window {
        futatrans: {
            name: string
            locale: string
            baseURL: string
            locales: ILocale[]
            fallbackLocale: string
            mapApiKey: string
        }
    }
    type middleware = 'auth' | 'guest'

    interface ILocale {
        name: string
        iso: string
    }

    interface JQuery {
        block()
        unblock()
        unblockUI()
    }
}
