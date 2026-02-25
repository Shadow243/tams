import type { User } from "./auth";
import type { PaginationLink, Meta } from "./global";

export type UserList = User[];

export interface UsersResponse {
    data: User[];
    links: PaginationLink[];
    meta: Meta;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    per_page: number;
    total: number;
}
