import { defineStore } from 'pinia'
import { axiosInstance } from '@/plugins/axios'
import { appConfig } from '@/config/app'
import { handleError, showSuccessMessage } from '@/utils/notification'
import type { UsersResponse, User } from '@/types'

interface UserFormData {
    name: string
    username: string
    email: string
    phone?: string
    gender?: string
    country_code?: string
    branch_id?: number | null
    role_id?: number | null
    password?: string
    password_confirmation?: string
    is_driver?: boolean
    car_plate_number?: string
    car_brand?: string
    car_color?: string
    driving_license?: string
    cni?: string
    is_email_verified?: boolean
    is_phone_verified?: boolean
    is_active?: boolean
}

export const useUserStore = defineStore('users', {
    state: () => ({
        users: null as UsersResponse | null,
        user_list: [] as UsersResponse['data'],
        loading: false,
        processing: false,
        currentUser: null as User | null,
        filters: {
            search: '',
            status: '',
            perPage: 20,
        },
    }),

    getters: {
        isLoading: (state) => state.loading,
        isProcessing: (state) => state.processing,
        allUsers: (state) => state.users,
    },

    actions: {
        setUsers(users: UsersResponse | null): void {
            this.users = users
        },

        async fetchUsers(page: number = 1, search?: string, status?: string, perPage?: number): Promise<void> {
            this.loading = true
            try {
                // Update filters if provided, otherwise use stored filters
                if (search !== undefined) this.filters.search = search
                if (status !== undefined) this.filters.status = status
                if (perPage !== undefined) this.filters.perPage = perPage

                const params: Record<string, string> = {}

                if (this.filters.search && this.filters.search.trim() !== '') {
                    params.search = this.filters.search.trim()
                }
                
                if (this.filters.status !== undefined && this.filters.status !== '') {
                    params.active = this.filters.status
                }
                
                params.paginate = this.filters.perPage.toString()
                params.page = page.toString()

                console.log('🔍 Fetching users with params:', params)
                console.log('📊 Current filters:', this.filters)

                const response = await axiosInstance.get(`${appConfig.apiUrl}/users`, {
                    params,
                })

                if (response.data) {
                    this.setUsers(response.data)
                    this.user_list = response.data.data || []
                }
            } catch (error) {
                console.error('❌ Error fetching users:', error)
                handleError(error)
            } finally {
                this.loading = false
            }
        },

        setCurrentUser(user: User | null): void {
            this.currentUser = user
        },

        async storeUser(userData: UserFormData): Promise<boolean> {
            this.processing = true
            try {
                const url = this.currentUser
                    ? `${appConfig.apiUrl}/users/${this.currentUser.id}`
                    : `${appConfig.apiUrl}/users`

                const method = this.currentUser ? 'put' : 'post'

                const { data } = await axiosInstance[method](url, userData)

                if (data) {
                    const message = this.currentUser
                        ? 'Utilisateur modifié avec succès'
                        : 'Utilisateur créé avec succès'

                    showSuccessMessage(message)

                    // Rafraîchir la liste
                    await this.fetchUsers()

                    // Réinitialiser l'utilisateur courant
                    this.setCurrentUser(null)

                    return true
                }
                return false
            } catch (error) {
                handleError(error)
                return false
            } finally {
                this.processing = false
            }
        },

        async deleteUser(userId: number): Promise<boolean> {
            this.processing = true
            try {
                await axiosInstance.delete(`${appConfig.apiUrl}/users/${userId}`)

                showSuccessMessage('Utilisateur supprimé avec succès')

                // Rafraîchir la liste
                await this.fetchUsers()

                return true
            } catch (error) {
                handleError(error)
                return false
            } finally {
                this.processing = false
            }
        },

        async bulkDeleteUsers(userIds: number[]): Promise<boolean> {
            this.processing = true
            try {
                await axiosInstance.post(`${appConfig.apiUrl}/users/bulk-delete`, {
                    ids: userIds,
                })

                showSuccessMessage(`${userIds.length} utilisateur(s) supprimé(s) avec succès`)

                // Rafraîchir la liste
                await this.fetchUsers()

                return true
            } catch (error) {
                handleError(error)
                return false
            } finally {
                this.processing = false
            }
        },

    },
})
