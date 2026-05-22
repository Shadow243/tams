import { defineStore } from 'pinia'
import { axiosInstance } from '@/plugins/axios'
import { appConfig } from '@/config/app'
import { handleError, showSuccessMessage } from '@/utils/notification'
import type {
  CustomerAccount,
  CustomerAccountFormData,
  AccountTransaction,
  AccountOperationData,
  AccountInterestSetting,
  InterestSimulation,
} from '@/types'

interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export const useCustomerAccountStore = defineStore('customerAccounts', {
  state: () => ({
    accounts: null as PaginatedResponse<CustomerAccount> | null,
    account_list: [] as CustomerAccount[],
    loading: false,
    processing: false,
    currentAccount: null as CustomerAccount | null,
    transactions: [] as AccountTransaction[],
    filters: {
      search: '',
      perPage: 20,
      status: '' as '' | 'active' | 'suspended' | 'closed',
      is_vip: null as boolean | null,
      in_debt: false,
      customer_id: null as number | null,
    },
  }),

  getters: {
    isLoading: (state) => state.loading,
    isProcessing: (state) => state.processing,
    allAccounts: (state) => state.accounts,
    activeAccounts: (state) => state.account_list.filter((a) => a.status === 'active'),
    vipAccounts: (state) => state.account_list.filter((a) => a.is_vip),
    accountsInDebt: (state) => state.account_list.filter((a) => a.is_in_debt),
  },

  actions: {
    setAccounts(accounts: PaginatedResponse<CustomerAccount> | null): void {
      this.accounts = accounts
    },

    async fetchAccounts(page: number = 1, search?: string, perPage?: number): Promise<void> {
      this.loading = true
      try {
        if (search !== undefined) this.filters.search = search
        if (perPage !== undefined) this.filters.perPage = perPage

        const params: Record<string, string> = {}

        if (this.filters.search && this.filters.search.trim() !== '') {
          params.search = this.filters.search.trim()
        }

        if (this.filters.status) {
          params.status = this.filters.status
        }

        if (this.filters.is_vip !== null) {
          params.is_vip = this.filters.is_vip.toString()
        }

        if (this.filters.in_debt) {
          params.in_debt = 'true'
        }

        if (this.filters.customer_id) {
          params.customer_id = this.filters.customer_id.toString()
        }

        params.per_page = this.filters.perPage.toString()
        params.page = page.toString()

        const response = await axiosInstance.get(`${appConfig.apiUrl}/customer-accounts`, {
          params,
        })

        if (response.data) {
          this.setAccounts(response.data)
          this.account_list = response.data.data || []
        }
      } catch (error) {
        handleError(error)
      } finally {
        this.loading = false
      }
    },

    async fetchAccountsByCustomer(customerId: number): Promise<CustomerAccount[]> {
      this.loading = true
      try {
        const response = await axiosInstance.get(
          `${appConfig.apiUrl}/customer-accounts/customer/${customerId}`
        )
        return response.data.data || []
      } catch (error) {
        handleError(error)
        return []
      } finally {
        this.loading = false
      }
    },

    setCurrentAccount(account: CustomerAccount | null): void {
      this.currentAccount = account
    },

    async fetchAccount(identifier: string | number): Promise<CustomerAccount | null> {
      this.loading = true
      try {
        const response = await axiosInstance.get(
          `${appConfig.apiUrl}/customer-accounts/${identifier}`
        )
        const account = response.data?.data ?? response.data
        if (account?.id) {
          this.setCurrentAccount(account)
          return account
        }
        return null
      } catch (error) {
        handleError(error)
        return null
      } finally {
        this.loading = false
      }
    },

    async storeAccount(accountData: CustomerAccountFormData): Promise<boolean> {
      this.processing = true
      try {
        const url = this.currentAccount
          ? `${appConfig.apiUrl}/customer-accounts/${this.currentAccount.uuid}`
          : `${appConfig.apiUrl}/customer-accounts`

        const method = this.currentAccount ? 'put' : 'post'

        const { data } = await axiosInstance[method](url, accountData)

        if (data) {
          const message = this.currentAccount
            ? 'Compte client mis à jour avec succès'
            : 'Compte client créé avec succès'

          showSuccessMessage(message)
          await this.fetchAccounts()
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

    async deposit(
      accountId: string | number,
      data: AccountOperationData
    ): Promise<AccountTransaction | null> {
      this.processing = true
      try {
        const response = await axiosInstance.post(
          `${appConfig.apiUrl}/customer-accounts/${accountId}/deposit`,
          data
        )

        if (response.data?.data) {
          showSuccessMessage('Dépôt effectué avec succès')
          await this.fetchAccount(accountId)
          return response.data.data
        }
        return null
      } catch (error) {
        handleError(error)
        return null
      } finally {
        this.processing = false
      }
    },

    async withdraw(
      accountId: string | number,
      data: AccountOperationData
    ): Promise<AccountTransaction | null> {
      this.processing = true
      try {
        const response = await axiosInstance.post(
          `${appConfig.apiUrl}/customer-accounts/${accountId}/withdraw`,
          data
        )

        if (response.data?.data) {
          showSuccessMessage('Retrait effectué avec succès')
          await this.fetchAccount(accountId)
          return response.data.data
        }
        return null
      } catch (error) {
        handleError(error)
        return null
      } finally {
        this.processing = false
      }
    },

    async fetchTransactions(
      accountId: string | number,
      from?: string,
      to?: string
    ): Promise<void> {
      this.loading = true
      try {
        const params: Record<string, string> = {}
        if (from) params.from = from
        if (to) params.to = to

        const response = await axiosInstance.get(
          `${appConfig.apiUrl}/customer-accounts/${accountId}/transactions`,
          { params }
        )

        if (response.data) {
          this.transactions = response.data.data || []
        }
      } catch (error) {
        handleError(error)
      } finally {
        this.loading = false
      }
    },

    async applyInterest(accountId: string | number): Promise<boolean> {
      this.processing = true
      try {
        const response = await axiosInstance.post(
          `${appConfig.apiUrl}/customer-accounts/${accountId}/apply-interest`
        )

        if (response.data?.data) {
          showSuccessMessage('Intérêts appliqués avec succès')
          await this.fetchAccount(accountId)
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

    async simulateInterest(accountId: string | number): Promise<InterestSimulation | null> {
      try {
        const response = await axiosInstance.get(
          `${appConfig.apiUrl}/customer-accounts/${accountId}/simulate-interest`
        )
        return response.data?.data || null
      } catch (error) {
        handleError(error)
        return null
      }
    },

    async saveInterestSettings(
      accountId: string | number,
      settings: Partial<AccountInterestSetting>
    ): Promise<boolean> {
      this.processing = true
      try {
        const response = await axiosInstance.post(
          `${appConfig.apiUrl}/customer-accounts/${accountId}/interest-settings`,
          settings
        )

        if (response.data?.data) {
          showSuccessMessage('Paramètres d\'intérêts enregistrés avec succès')
          await this.fetchAccount(accountId)
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

    async fetchInterestSettings(
      accountId: string | number
    ): Promise<AccountInterestSetting | null> {
      try {
        const response = await axiosInstance.get(
          `${appConfig.apiUrl}/customer-accounts/${accountId}/interest-settings`
        )
        return response.data?.data || null
      } catch (error) {
        // Settings might not exist yet, don't show error
        return null
      }
    },

    async fetchDashboardReport(params: {
      start_date?: string
      end_date?: string
      branch_id?: number | null
    }): Promise<any | null> {
      try {
        const query: Record<string, any> = {}
        if (params.start_date) query.start_date = params.start_date
        if (params.end_date)   query.end_date   = params.end_date
        if (params.branch_id)  query.branch_id  = params.branch_id
        const response = await axiosInstance.get(
          `${appConfig.apiUrl}/customer-accounts/dashboard-report`,
          { params: query }
        )
        return response.data?.data ?? null
      } catch {
        return null
      }
    },

    resetFilters(): void {
      this.filters = {
        search: '',
        perPage: 20,
        status: '',
        is_vip: null,
        in_debt: false,
        customer_id: null,
      }
    },
  },
})
