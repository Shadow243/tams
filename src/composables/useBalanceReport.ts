import { ref } from 'vue'
import { axiosInstance } from '@/plugins/axios'
import { appConfig } from '@/config/app'
import type { BalanceReport } from '@/types'

export function useBalanceReport() {
  const report = ref<BalanceReport | null>(null)
  const loading = ref(false)

  async function fetchReport(silent = false) {
    if (!silent) loading.value = true
    try {
      const { data } = await axiosInstance.get(`${appConfig.apiUrl}/reports/balances`)
      report.value = data
    } catch (e) {
      console.error(e)
    } finally {
      if (!silent) loading.value = false
    }
  }

  return { report, loading, fetchReport }
}
