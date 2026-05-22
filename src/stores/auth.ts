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
                this.token = token
                setToken(token)
                localStorage.setItem('token', token)
                
                // Set axios authorization header immediately
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
            }
        },
        async fetchUser() {
            await axiosInstance
                .get(`${appConfig.apiUrl}/user`)
                .then((response) => {
                    // Check if data is wrapped in a data property
                    const userData = response.data.data || response.data
                    
                    if (userData) {
                        this.setUser(userData)
                    }
                })
                .catch(handleError)
        },
        async logout() {
            try {
                // Call API logout endpoint
                await axiosInstance.post(`${appConfig.apiUrl}/logout`)
            } catch (error) {
                console.warn('Logout API call failed:', error)
            } finally {
                // Clear auth data regardless of API call result
                const { removeCookie: removeToken } = useCookie('token', '')
                const { removeCookie: removeXsrfToken } = useCookie('XSRF-TOKEN', '')
                
                // Remove cookies
                removeToken()
                removeXsrfToken()
                
                // Clear localStorage
                localStorage.removeItem('token')
                
                // Clear state
                this.token = ''
                this.user = null
                
                // Clear axios authorization header
                delete axiosInstance.defaults.headers.common['Authorization']
            }
        },
        async validatePassword(password: string): Promise<boolean> {
            try {
                const response = await axiosInstance.post(`${appConfig.apiUrl}/auth/validate-password`, {
                    password
                })
                return response.data.valid === true
            } catch (error) {
                console.error('Password validation failed:', error)
                return false
            }
        },
    },
})
