import { defineStore } from 'pinia'
import { axiosInstance } from '@/plugins/axios'
import { appConfig } from '@/config/app'
import { handleError, showSuccessMessage } from '@/utils/notification'
import type { OperatorsResponse, Operator } from '@/types'

interface OperatorFormData {
    name: string
    country_id: number | null
    logo?: File | null
}

export const useOperatorStore = defineStore('operators', {
    state: () => ({
        operators: null as OperatorsResponse | null,
        operator_list: [] as OperatorsResponse['data'],
        loading: false,
        processing: false,
        currentOperator: null as Operator | null,
        filters: {
            search: '',
            perPage: 20,
        },
    }),

    getters: {
        isLoading: (state) => state.loading,
        isProcessing: (state) => state.processing,
        allOperators: (state) => state.operators,
    },

    actions: {
        setOperators(operators: OperatorsResponse | null): void {
            this.operators = operators
        },

        async fetchOperators(page: number = 1, search?: string, perPage?: number): Promise<void> {
            this.loading = true
            try {
                // Update filters if provided, otherwise use stored filters
                if (search !== undefined) this.filters.search = search
                if (perPage !== undefined) this.filters.perPage = perPage

                const params: Record<string, string> = {}

                if (this.filters.search && this.filters.search.trim() !== '') {
                    params.search = this.filters.search.trim()
                }
                
                params.paginate = this.filters.perPage.toString()
                params.page = page.toString()

                const response = await axiosInstance.get(`${appConfig.apiUrl}/operators`, {
                    params,
                })

                if (response.data) {
                    this.setOperators(response.data)
                    this.operator_list = response.data.data || []
                }
            } catch (error) {
                handleError(error)
            } finally {
                this.loading = false
            }
        },

        setCurrentOperator(operator: Operator | null): void {
            this.currentOperator = operator
        },

        async storeOperator(operatorData: OperatorFormData): Promise<boolean> {
            this.processing = true
            try {
                const formData = new FormData()
                formData.append('name', operatorData.name)
                if (operatorData.country_id) {
                    formData.append('country_id', operatorData.country_id.toString())
                }
                if (operatorData.logo) {
                    formData.append('logo', operatorData.logo)
                }

                const url = this.currentOperator
                    ? `${appConfig.apiUrl}/operators/${this.currentOperator.id}`
                    : `${appConfig.apiUrl}/operators`

                const method = this.currentOperator ? 'post' : 'post'

                // For updates, we need to add _method field for Laravel
                if (this.currentOperator) {
                    formData.append('_method', 'PUT')
                }

                const { data } = await axiosInstance[method](url, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                })

                if (data) {
                    const message = this.currentOperator
                        ? 'Operator updated successfully'
                        : 'Operator created successfully'

                    showSuccessMessage(message)

                    // Refresh the list
                    await this.fetchOperators()

                    // Reset current operator
                    this.setCurrentOperator(null)

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

        async deleteOperator(operatorId: number): Promise<boolean> {
            this.processing = true
            try {
                await axiosInstance.delete(`${appConfig.apiUrl}/operators/${operatorId}`)

                showSuccessMessage('Operator deleted successfully')

                // Refresh the list
                await this.fetchOperators()

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
