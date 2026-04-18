import { ref } from 'vue'
import { axiosInstance } from '@/plugins/axios'
import { appConfig } from '@/config/app'
import { showToast } from '@/utils/notification'

interface BranchBalance {
  currency_code: string
  currency_name?: string
  currency_symbol?: string
  cash_balance: number
  formatted_balance?: string
}

interface BranchBalancesResponse {
  branch_id: number
  branch_name: string
  balances: BranchBalance[]
}

interface BalanceInput {
  currency_code: string
  amount: number
}

export function useBranchBalances() {
  const loading = ref(false)
  const processing = ref(false)

  /**
   * Fetch branch balances for all currencies
   */
  const fetchBalances = async (branchId: number): Promise<BranchBalancesResponse> => {
    loading.value = true
    try {
      const response = await axiosInstance.get(`${appConfig.apiUrl}/branches/${branchId}/balances`)
      console.log('API Response:', response.data)
      return response.data
    } catch (error: any) {
      console.error('API Error:', error)
      showToast({
        type: 'error',
        message: error.response?.data?.message || 'Failed to load branch balances'
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Update branch balances for specific currencies
   */
  const updateBalances = async (
    branchId: number,
    balances: BalanceInput[]
  ): Promise<void> => {
    processing.value = true
    try {
      const response = await axiosInstance.put(`${appConfig.apiUrl}/branches/${branchId}/balances`, {
        balances
      })

      showToast({
        type: 'success',
        message: response.data.message || 'Branch balances updated successfully'
      })
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update branch balances'
      
      // Display validation errors if any
      if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat()
        showToast({
          type: 'error',
          message: errors.join('<br>')
        })
      } else {
        showToast({
          type: 'error',
          message
        })
      }
      throw error
    } finally {
      processing.value = false
    }
  }

  return {
    loading,
    processing,
    fetchBalances,
    updateBalances
  }
}
