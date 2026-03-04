import { defineStore } from 'pinia'
import { axiosInstance } from '@/plugins/axios'
import { appConfig } from '@/config/app'
import { handleError, showSuccessMessage } from '@/utils/notification'
import type { WalletsResponse, Wallet, WalletFormData } from '@/types'

export const useWalletStore = defineStore('wallets', {
    state: () => ({
        wallets: null as WalletsResponse | null,
        wallet_list: [] as WalletsResponse['data'],
        loading: false,
        processing: false,
        currentWallet: null as Wallet | null,
        filters: {
            search: '',
            perPage: 20,
            status: '',
            branch_id: null as number | null,
            operator_id: null as number | null,
        },
    }),

    getters: {
        isLoading: (state) => state.loading,
        isProcessing: (state) => state.processing,
        allWallets: (state) => state.wallets,
        activeWallets: (state) => state.wallet_list.filter(w => w.is_active),
    },

    actions: {
        setWallets(wallets: WalletsResponse | null): void {
            this.wallets = wallets
        },

        async fetchWallets(page: number = 1, search?: string, perPage?: number): Promise<void> {
            this.loading = true
            try {
                // Update filters if provided, otherwise use stored filters
                if (search !== undefined) this.filters.search = search
                if (perPage !== undefined) this.filters.perPage = perPage

                const params: Record<string, string> = {}

                if (this.filters.search && this.filters.search.trim() !== '') {
                    params.search = this.filters.search.trim()
                }

                if (this.filters.status) {
                    params.status = this.filters.status
                }

                if (this.filters.branch_id) {
                    params.branch_id = this.filters.branch_id.toString()
                }

                if (this.filters.operator_id) {
                    params.operator_id = this.filters.operator_id.toString()
                }
                
                params.per_page = this.filters.perPage.toString()
                params.page = page.toString()
                
                const response = await axiosInstance.get(`${appConfig.apiUrl}/wallets`, {
                    params,
                })

                if (response.data) {
                    this.setWallets(response.data)
                    this.wallet_list = response.data.data || []
                }
            } catch (error) {
                handleError(error)
            } finally {
                this.loading = false
            }
        },

        setCurrentWallet(wallet: Wallet | null): void {
            this.currentWallet = wallet
        },

        async storeWallet(walletData: WalletFormData): Promise<boolean> {
            this.processing = true
            try {
                const url = this.currentWallet
                    ? `${appConfig.apiUrl}/wallets/${this.currentWallet.id}`
                    : `${appConfig.apiUrl}/wallets`

                const method = this.currentWallet ? 'put' : 'post'

                const { data } = await axiosInstance[method](url, walletData)

                if (data) {
                    const message = this.currentWallet
                        ? 'Wallet updated successfully'
                        : 'Wallet created successfully'

                    showSuccessMessage(message)

                    // Refresh the list
                    await this.fetchWallets()

                    // Reset current wallet
                    this.setCurrentWallet(null)

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

        async deleteWallet(walletId: number): Promise<boolean> {
            this.processing = true
            try {
                await axiosInstance.delete(`${appConfig.apiUrl}/wallets/${walletId}`)

                showSuccessMessage('Wallet deleted successfully')

                // Refresh the list
                await this.fetchWallets()

                return true
            } catch (error) {
                handleError(error)
                return false
            } finally {
                this.processing = false
            }
        },

        async toggleWalletStatus(walletId: number): Promise<boolean> {
            this.processing = true
            try {
                await axiosInstance.patch(`${appConfig.apiUrl}/wallets/${walletId}/toggle-status`)

                showSuccessMessage('Wallet status updated successfully')

                // Refresh the list
                await this.fetchWallets()

                return true
            } catch (error) {
                handleError(error)
                return false
            } finally {
                this.processing = false
            }
        },

        setStatusFilter(status: string): void {
            this.filters.status = status
        },

        setBranchFilter(branchId: number | null): void {
            this.filters.branch_id = branchId
        },

        setOperatorFilter(operatorId: number | null): void {
            this.filters.operator_id = operatorId
        },

        resetFilters(): void {
            this.filters = {
                search: '',
                perPage: 20,
                status: '',
                branch_id: null,
                operator_id: null,
            }
        },
    },
})
