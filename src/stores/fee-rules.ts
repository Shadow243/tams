import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { axiosInstance } from '@/plugins/axios'
import type {
  FeeRule,
  FeeRuleList,
  FeeRulesResponse,
  FeeRuleFormData
} from '@/types'
import { appConfig } from '@/config/app'

export const useFeeRuleStore = defineStore('feeRule', () => {
  // State
  const feeRules = ref<FeeRulesResponse | null>(null)
  const feeRule_list = ref<FeeRuleList[]>([])
  const loading = ref(false)
  const processing = ref(false)
  const currentFeeRule = ref<FeeRule | null>(null)

  // Filters
  const filters = ref({
    search: '',
    perPage: 15,
    transaction_type_id: null as number | null,
    operator_id: null as number | null,
    branch_id: null as number | null,
    fee_mode: '',
    is_active: null as boolean | null
  })

  // Computed
  const getFeeRules = computed(() => feeRule_list.value)
  const isLoading = computed(() => loading.value)
  const isProcessing = computed(() => processing.value)

  // Actions
  async function fetchFeeRules() {
    loading.value = true
    try {
      const params: Record<string, string | number> = {
        per_page: filters.value.perPage
      }

      if (filters.value.search) {
        params.search = filters.value.search
      }

      if (filters.value.transaction_type_id) {
        params.transaction_type_id = filters.value.transaction_type_id
      }

      if (filters.value.operator_id !== null) {
        params.operator_id = filters.value.operator_id
      }

      if (filters.value.branch_id !== null) {
        params.branch_id = filters.value.branch_id
      }

      if (filters.value.fee_mode) {
        params.fee_mode = filters.value.fee_mode
      }

      if (filters.value.is_active !== null) {
        params.is_active = filters.value.is_active ? 1 : 0
      }

      const response = await axiosInstance.get(`${appConfig.apiUrl}/fee-rules`, { params })
      feeRules.value = response.data
      feeRule_list.value = response.data.data
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchFeeRule(id: number) {
    loading.value = true
    try {
      const response = await axiosInstance.get(`${appConfig.apiUrl}/fee-rules/${id}`)
      currentFeeRule.value = response.data.data
      return response.data.data
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  async function storeFeeRule(data: FeeRuleFormData) {
    processing.value = true
    try {
      const response = currentFeeRule.value?.id
        ? await axiosInstance.put(`${appConfig.apiUrl}/fee-rules/${currentFeeRule.value.id}`, data)
        : await axiosInstance.post(`${appConfig.apiUrl}/fee-rules`, data)

      await fetchFeeRules()
      return response.data
    } catch (error) {
      throw error
    } finally {
      processing.value = false
    }
  }

  async function deleteFeeRule(id: number) {
    processing.value = true
    try {
      await axiosInstance.delete(`${appConfig.apiUrl}/fee-rules/${id}`)
      await fetchFeeRules()
    } catch (error) {
      throw error
    } finally {
      processing.value = false
    }
  }

  async function toggleFeeRuleStatus(id: number) {
    processing.value = true
    try {
      await axiosInstance.patch(`${appConfig.apiUrl}/fee-rules/${id}/toggle-status`)
      await fetchFeeRules()
    } catch (error) {
      throw error
    } finally {
      processing.value = false
    }
  }

  async function getApplicableFeeRule(
    transactionTypeId: number,
    operatorId?: number,
    branchId?: number
  ) {
    loading.value = true
    try {
      const params: Record<string, number> = {
        transaction_type_id: transactionTypeId
      }

      if (operatorId) {
        params.operator_id = operatorId
      }

      if (branchId) {
        params.branch_id = branchId
      }

      const response = await axiosInstance.get(`${appConfig.apiUrl}/fee-rules/applicable`, {
        params
      })
      return response.data.data
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  function resetFilters() {
    filters.value = {
      search: '',
      perPage: 15,
      transaction_type_id: null,
      operator_id: null,
      branch_id: null,
      fee_mode: '',
      is_active: null
    }
  }

  function setCurrentFeeRule(feeRule: FeeRule | null) {
    currentFeeRule.value = feeRule
  }

  function $reset() {
    feeRules.value = null
    feeRule_list.value = []
    loading.value = false
    processing.value = false
    currentFeeRule.value = null
    resetFilters()
  }

  return {
    // State
    feeRules,
    feeRule_list,
    loading,
    processing,
    currentFeeRule,
    filters,
    // Computed
    getFeeRules,
    isLoading,
    isProcessing,
    // Actions
    fetchFeeRules,
    fetchFeeRule,
    storeFeeRule,
    deleteFeeRule,
    toggleFeeRuleStatus,
    getApplicableFeeRule,
    resetFilters,
    setCurrentFeeRule,
    $reset
  }
})
