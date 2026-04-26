import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { axiosInstance } from '@/plugins/axios'
import type {
  Transaction,
  TransactionFormData,
  TransactionFilters,
  TransactionStatistics,
  DashboardStatistics,
  DashboardFilters,
  Meta
} from '@/types'
import { appConfig } from '@/config/app'

interface TransactionsResponse {
  data: Transaction[]
  meta: Meta
}

export const useTransactionStore = defineStore('transaction', () => {
  // State
  const transactions = ref<TransactionsResponse | null>(null)
  const transaction_list = ref<Transaction[]>([])
  const loading = ref(false)
  const loadingTransaction = ref(false)
  const loadingStatistics = ref(false)
  const loadingDashboard = ref(false)
  const processing = ref(false)
  const currentTransaction = ref<Transaction | null>(null)
  const statistics = ref<TransactionStatistics | null>(null)
  const dashboardStatistics = ref<DashboardStatistics | null>(null)

  // AbortController for in-flight dashboard requests
  let dashboardAbortController: AbortController | null = null

  // Filters
  const filters = ref<TransactionFilters>({
    search: '',
    transaction_type_id: null,
    branch_id: null,
    user_id: null,
    customer_id: null,
    customer_phone: null,
    status: '',
    start_date: null,
    end_date: null,
    per_page: 15
  })

  // Computed
  const getTransactions = computed(() => transaction_list.value)
  const isLoading = computed(() => loading.value)
  const isProcessing = computed(() => processing.value)
  const getStatistics = computed(() => statistics.value)

  // Actions
  async function fetchTransactions(page = 1) {
    loading.value = true
    try {
      const params: Record<string, string | number> = {
        page,
        per_page: filters.value.per_page
      }

      if (filters.value.search) {
        params.search = filters.value.search
      }

      if (filters.value.transaction_type_id) {
        params.transaction_type_id = filters.value.transaction_type_id
      }

      if (filters.value.branch_id) {
        params.branch_id = filters.value.branch_id
      }

      if (filters.value.user_id) {
        params.user_id = filters.value.user_id
      }

      if (filters.value.customer_id) {
        params.customer_id = filters.value.customer_id
      }

      if (filters.value.customer_phone) {
        params.customer_phone = filters.value.customer_phone
      }

      if (filters.value.status) {
        params.status = filters.value.status
      }

      if (filters.value.start_date) {
        params.start_date = filters.value.start_date
      }

      if (filters.value.end_date) {
        params.end_date = filters.value.end_date
      }

      const response = await axiosInstance.get(`${appConfig.apiUrl}/transactions`, { params })
      transactions.value = response.data
      transaction_list.value = response.data.data
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchTransaction(id: string) {
    loadingTransaction.value = true
    try {
      const response = await axiosInstance.get(`${appConfig.apiUrl}/transactions/${id}`)
      
      // Handle both response formats: direct data or wrapped in data property
      const transactionData = response.data.data || response.data
      
      currentTransaction.value = transactionData
      return transactionData
    } catch (error) {
      throw error
    } finally {
      loadingTransaction.value = false
    }
  }

  async function storeTransaction(data: TransactionFormData) {
    processing.value = true
    try {
      const response = currentTransaction.value?.id
        ? await axiosInstance.put(
            `${appConfig.apiUrl}/transactions/${currentTransaction.value.id}`,
            data
          )
        : await axiosInstance.post(`${appConfig.apiUrl}/transactions`, data)

      await fetchTransactions()
      return response.data
    } catch (error) {
      throw error
    } finally {
      processing.value = false
    }
  }

  async function deleteTransaction(id: string) {
    processing.value = true
    try {
      const response = await axiosInstance.delete(`${appConfig.apiUrl}/transactions/${id}`)
      await fetchTransactions()
      return response.data
    } catch (error) {
      throw error
    } finally {
      processing.value = false
    }
  }

  async function cancelTransaction(id: string) {
    processing.value = true
    try {
      const response = await axiosInstance.patch(`${appConfig.apiUrl}/transactions/${id}/cancel`)
      await fetchTransactions()
      return response.data
    } catch (error) {
      throw error
    } finally {
      processing.value = false
    }
  }

  async function completeTransaction(id: string) {
    processing.value = true
    try {
      const response = await axiosInstance.patch(
        `${appConfig.apiUrl}/transactions/${id}/complete`
      )
      await fetchTransactions()
      return response.data
    } catch (error) {
      throw error
    } finally {
      processing.value = false
    }
  }

  async function changeTransactionStatus(id: string, status: string) {
    processing.value = true
    try {
      const response = await axiosInstance.patch(
        `${appConfig.apiUrl}/transactions/${id}/change-status`,
        { status }
      )
      await fetchTransactions()
      return response.data
    } catch (error) {
      throw error
    } finally {
      processing.value = false
    }
  }

  async function verifyWithdrawalCode(code: string) {
    processing.value = true
    try {
      const response = await axiosInstance.post(
        `${appConfig.apiUrl}/transactions/verify-withdrawal`,
        { code }
      )
      return response.data.data
    } catch (error) {
      throw error
    } finally {
      processing.value = false
    }
  }

  async function fetchStatistics() {
    loadingStatistics.value = true
    try {
      const params: Record<string, string | number> = {}

      if (filters.value.start_date) {
        params.start_date = filters.value.start_date
      }

      if (filters.value.end_date) {
        params.end_date = filters.value.end_date
      }

      if (filters.value.branch_id) {
        params.branch_id = filters.value.branch_id
      }

      if (filters.value.currency_id) {
        params.currency_id = filters.value.currency_id
      }

      const response = await axiosInstance.get(`${appConfig.apiUrl}/transactions/statistics`, {
        params
      })
      
      // Handle both response formats: direct data or wrapped in data property
      const statsData = response.data.data || response.data
      
      statistics.value = statsData
      return statsData
    } catch (error) {
      console.error('❌ Error fetching statistics:', error)
      throw error
    } finally {
      loadingStatistics.value = false
    }
  }

  function setCurrentTransaction(transaction: Transaction | null) {
    currentTransaction.value = transaction
  }

  async function fetchDashboardStatistics(dashboardFilters?: Partial<DashboardFilters>, silent = false) {
    // Cancel any in-flight dashboard request
    if (dashboardAbortController) {
      dashboardAbortController.abort()
    }
    dashboardAbortController = new AbortController()

    if (!silent) loadingDashboard.value = true
    try {
      const params: Record<string, string | number> = {}

      if (dashboardFilters?.start_date) {
        params.start_date = dashboardFilters.start_date
      }

      if (dashboardFilters?.end_date) {
        params.end_date = dashboardFilters.end_date
      }

      if (dashboardFilters?.branch_id) {
        params.branch_id = dashboardFilters.branch_id
      }

      if (dashboardFilters?.currency_id) {
        params.currency_id = dashboardFilters.currency_id
      }

      if (dashboardFilters?.transaction_type_id) {
        params.transaction_type_id = dashboardFilters.transaction_type_id
      }

      const response = await axiosInstance.get(
        `${appConfig.apiUrl}/transactions/dashboard/statistics`,
        { params, signal: dashboardAbortController.signal }
      )
      const responseData = response.data.data || response.data
      // recent_transactions comes as a resource collection with a nested 'data' key
      if (responseData.recent_transactions?.data) {
        responseData.recent_transactions = responseData.recent_transactions.data
      }
      dashboardStatistics.value = responseData
      return responseData
    } catch (error: any) {
      // Ignore cancellation errors — a new request is already in flight
      if (error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError') {
        return
      }
      throw error
    } finally {
      if (!silent) loadingDashboard.value = false
    }
  }

  function updateFilters(newFilters: Partial<TransactionFilters>) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function resetFilters() {
    filters.value = {
      search: '',
      transaction_type_id: null,
      branch_id: null,
      user_id: null,
      customer_id: null,
      customer_phone: null,
      status: '',
      start_date: null,
      end_date: null,
      per_page: 15
    }
  }

  function reset() {
    transactions.value = null
    transaction_list.value = []
    currentTransaction.value = null
    statistics.value = null
    loading.value = false
    processing.value = false
    resetFilters()
  }

  return {
    // State
    transactions,
    transaction_list,
    loading,
    loadingTransaction,
    loadingStatistics,
    loadingDashboard,
    processing,
    currentTransaction,
    statistics,
    dashboardStatistics,
    filters,

    // Computed
    getTransactions,
    isLoading,
    isProcessing,
    getStatistics,

    // Actions
    fetchTransactions,
    fetchTransaction,
    storeTransaction,
    deleteTransaction,
    cancelTransaction,
    completeTransaction,
    changeTransactionStatus,
    verifyWithdrawalCode,
    fetchStatistics,
    fetchDashboardStatistics,
    setCurrentTransaction,
    updateFilters,
    resetFilters,
    reset
  }
})
