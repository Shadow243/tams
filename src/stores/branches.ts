import { defineStore } from 'pinia'
import { axiosInstance } from '@/plugins/axios'
import { appConfig } from '@/config/app'
import { handleError, showSuccessMessage } from '@/utils/notification'
import type { BranchesResponse, Branch, BranchFormData } from '@/types'

export const useBranchStore = defineStore('branches', {
    state: () => ({
        branches: null as BranchesResponse | null,
        branch_list: [] as BranchesResponse['data'],
        loading: false,
        processing: false,
        currentBranch: null as Branch | null,
        filters: {
            search: '',
            perPage: 20,
            status: '',
            country_id: null as number | null,
        },
    }),

    getters: {
        isLoading: (state) => state.loading,
        isProcessing: (state) => state.processing,
        allBranches: (state) => state.branches,
        activeBranches: (state) => state.branch_list.filter(b => b.is_active),
    },

    actions: {
        setBranches(branches: BranchesResponse | null): void {
            this.branches = branches
        },

        async fetchBranches(page: number = 1, search?: string, perPage?: number): Promise<void> {
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

                if (this.filters.country_id) {
                    params.country_id = this.filters.country_id.toString()
                }
                
                params.per_page = this.filters.perPage.toString()
                params.page = page.toString()
                const response = await axiosInstance.get(`${appConfig.apiUrl}/branches`, {
                    params,
                })

                if (response.data) {
                    this.setBranches(response.data)
                    this.branch_list = response.data.data || []
                }
            } catch (error) {
                handleError(error)
            } finally {
                this.loading = false
            }
        },

        setCurrentBranch(branch: Branch | null): void {
            this.currentBranch = branch
        },

        async storeBranch(branchData: BranchFormData): Promise<boolean> {
            this.processing = true
            try {
                const url = this.currentBranch
                    ? `${appConfig.apiUrl}/branches/${this.currentBranch.id}`
                    : `${appConfig.apiUrl}/branches`

                const method = this.currentBranch ? 'put' : 'post'

                const { data } = await axiosInstance[method](url, branchData)

                if (data) {
                    const message = this.currentBranch
                        ? 'Branch updated successfully'
                        : 'Branch created successfully'

                    showSuccessMessage(message)

                    // Refresh the list
                    await this.fetchBranches()

                    // Reset current branch
                    this.setCurrentBranch(null)

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

        async deleteBranch(branchId: number): Promise<boolean> {
            this.processing = true
            try {
                await axiosInstance.delete(`${appConfig.apiUrl}/branches/${branchId}`)

                showSuccessMessage('Branch deleted successfully')

                // Refresh the list
                await this.fetchBranches()

                return true
            } catch (error) {
                handleError(error)
                return false
            } finally {
                this.processing = false
            }
        },

        async toggleBranchStatus(branchId: number): Promise<boolean> {
            this.processing = true
            try {
                await axiosInstance.patch(`${appConfig.apiUrl}/branches/${branchId}/toggle-status`)

                showSuccessMessage('Branch status updated successfully')

                // Refresh the list
                await this.fetchBranches()

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

        setCountryFilter(countryId: number | null): void {
            this.filters.country_id = countryId
        },

        resetFilters(): void {
            this.filters = {
                search: '',
                perPage: 20,
                status: '',
                country_id: null,
            }
        },
    },
})
