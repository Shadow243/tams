export interface User {
    id: number
    uuid: string
    name: string
    username: string
    gender: string
    country_code: string
    phone_number: string
    full_number: string
    email: string
    locale: string
    active: number
    created_at: string
    updated_at: string
    email_verified_at: string | null
    permissions: string[]
}

export interface LoginCredentials {
    login: string
    password: string
}

export interface LoginResponse {
    token: string
    user: User
}
