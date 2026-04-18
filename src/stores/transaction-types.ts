import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { axiosInstance } from '@/plugins/axios'
import type {
  TransactionType,
  TransactionTypeList,
  TransactionTypesResponse,
  TransactionTypeFormData
} from '@/types'
import { appConfig } from '@/config/app'

export const useTransactionTypeStore = defineStore('transactionType', () => {
  // State
  const transactionTypes = ref<TransactionTypesResponse | null>(null)
  const transactionType_list = ref<TransactionTypeList[]>([])
  const loading = ref(false)
  const processing = ref(false)
  const currentTransactionType = ref<TransactionType | null>(null)

  // Filters
  const filters = ref({
    search: '',
    perPage: 30,
    code: ''
  })

  // Computed
  const getTransactionTypes = computed(() => transactionType_list.value)
  const isLoading = computed(() => loading.value)
  const isProcessing = computed(() => processing.value)

  // Actions
  async function fetchTransactionTypes() {
    loading.value = true
    try {
      const params: Record<string, string | number> = {
        per_page: filters.value.perPage
      }

      if (filters.value.search) {
        params.search = filters.value.search
      }

      if (filters.value.code) {
        params.code = filters.value.code
      }

      const response = await axiosInstance.get(`${appConfig.apiUrl}/transaction-types`, { params })
      transactionTypes.value = response.data
      transactionType_list.value = response.data.data
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchTransactionType(id: number) {
    loading.value = true
    try {
      const response = await axiosInstance.get(`${appConfig.apiUrl}/transaction-types/${id}`)
      currentTransactionType.value = response.data.data
      return response.data.data
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  async function storeTransactionType(data: TransactionTypeFormData) {
    processing.value = true
    try {
      const response = currentTransactionType.value?.id
        ? await axiosInstance.put(`${appConfig.apiUrl}/transaction-types/${currentTransactionType.value.id}`, data)
        : await axiosInstance.post(`${appConfig.apiUrl}/transaction-types`, data)

      await fetchTransactionTypes()
      return response.data
    } catch (error) {
      throw error
    } finally {
      processing.value = false
    }
  }

  async function deleteTransactionType(id: number) {
    processing.value = true
    try {
      await axiosInstance.delete(`${appConfig.apiUrl}/transaction-types/${id}`)
      await fetchTransactionTypes()
    } catch (error) {
      throw error
    } finally {
      processing.value = false
    }
  }

  function setCodeFilter(code: string) {
    filters.value.code = code
  }

  function resetFilters() {
    filters.value = {
      search: '',
      perPage: 30,
      code: ''
    }
  }

  function setCurrentTransactionType(transactionType: TransactionType | null) {
    currentTransactionType.value = transactionType
  }

  function $reset() {
    transactionTypes.value = null
    transactionType_list.value = []
    loading.value = false
    processing.value = false
    currentTransactionType.value = null
    resetFilters()
  }

  return {
    // State
    transactionTypes,
    transactionType_list,
    loading,
    processing,
    currentTransactionType,
    filters,
    // Computed
    getTransactionTypes,
    isLoading,
    isProcessing,
    // Actions
    fetchTransactionTypes,
    fetchTransactionType,
    storeTransactionType,
    deleteTransactionType,
    setCodeFilter,
    resetFilters,
    setCurrentTransactionType,
    $reset
  }
})
