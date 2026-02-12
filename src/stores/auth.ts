// src/store/auth.ts

import { defineStore } from 'pinia'
import { axiosInstance } from '@/plugins/axios'
import { appConfig } from '@/config/app'
import { handleError } from '@/utils/notification'
import { useCookie } from '@vue-composable/cookie'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as User | null,
        token: localStorage.getItem('token') || '',
    }),
    getters: {
        check: (state) => state.user !== null,
        isAuthenticated: (state) => !!state.token,
        hasPermission: (state) => {
            return (requiredPermissions?: string[]) => {
                if (!requiredPermissions || requiredPermissions.length === 0) return true;
                if (!state.user || !state.user.permissions) return false;
                // Assume user.permissions is string[]
                return requiredPermissions.every(perm => state.user!.permissions.includes(perm));
            }
        }
    },
    actions: {
        setUser(user: User | null): void {
            this.user = user
        },
        setAuthData({ token, user }: { token: string; user: User }) {
            const { setCookie: setToken } = useCookie('token', '')
            if (user) {
                this.user = user
                setToken(token)
                localStorage.setItem('token', token)
            }
        },
        async fetchUser() {
            await axiosInstance
                .get(`${appConfig.apiUrl}/user`)
                .then(({ data }) => {
                    // const { user } = data
                    if (data) {
                        this.setUser(data)
                    }
                })
                .catch(handleError)
        },
        logout() {
            // ...
        },
    },
})
