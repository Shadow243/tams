// src/stores/currencies.ts

import { defineStore } from 'pinia'
import { axiosInstance } from '@/plugins/axios'
import { appConfig } from '@/config/app'
import { handleError } from '@/utils/notification'

export interface Country {
  id: number
  code: string
  name: string
}

export interface Currency {
  id: number
  code: string
  name: string
  symbol: string
  country_id: number | null
  country?: Country | null
  decimal_places: number
  exchange_rate: number
  is_active: boolean
  is_default: boolean
}

export interface CurrenciesMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

export interface CurrenciesResponse {
  data: Currency[]
  meta: CurrenciesMeta
}

export const useCurrencyStore = defineStore('currencies', {
  state: () => ({
    currencies: null as CurrenciesResponse | null,
    currency_list: [] as Currency[],
    allCurrencies: [] as Currency[], // For dropdowns (not paginated)
    defaultCurrency: null as Currency | null,
    loading: false,
    filters: {
      search: '',
      perPage: 15,
      is_active: null as boolean | null,
      country_id: null as number | null,
    },
  }),

  getters: {
    activeCurrencies: (state) => state.allCurrencies.filter((c) => c.is_active),
    
    getCurrencyByCode: (state) => {
      return (code: string) => state.allCurrencies.find((c) => c.code === code)
    },
  },

  actions: {
    async fetchCurrencies(page: number = 1, search?: string, perPage?: number): Promise<void> {
      this.loading = true
      try {
        // Update filters if provided
        if (search !== undefined) this.filters.search = search
        if (perPage !== undefined) this.filters.perPage = perPage

        const params: Record<string, string> = {}

        if (this.filters.search && this.filters.search.trim() !== '') {
          params.search = this.filters.search.trim()
        }

        if (this.filters.is_active !== null) {
          params.is_active = this.filters.is_active.toString()
        }

        if (this.filters.country_id) {
          params.country_id = this.filters.country_id.toString()
        }
        
        params.per_page = this.filters.perPage.toString()
        params.page = page.toString()
        
        const response = await axiosInstance.get(`${appConfig.apiUrl}/currencies`, {
          params,
        })

        if (response.data) {
          this.currencies = response.data
          this.currency_list = response.data.data || []
        }
      } catch (error) {
        handleError(error)
      } finally {
        this.loading = false
      }
    },

    async fetchAllCurrencies(): Promise<void> {
      this.loading = true
      try {
        const response = await axiosInstance.get(`${appConfig.apiUrl}/currencies/all`)
        this.allCurrencies = response.data.data || response.data
        this.defaultCurrency = this.allCurrencies.find((c) => c.is_default) || null
      } catch (error) {
        handleError(error)
      } finally {
        this.loading = false
      }
    },

    setStatusFilter(isActive: boolean | null): void {
      this.filters.is_active = isActive
    },

    setCountryFilter(countryId: number | null): void {
      this.filters.country_id = countryId
    },

    formatAmount(amount: number, currencyCode: string): string {
      const currency = this.getCurrencyByCode(currencyCode)
      if (!currency) {
        return new Intl.NumberFormat('fr-FR').format(amount)
      }

      const formattedAmount = new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: currency.decimal_places,
        maximumFractionDigits: currency.decimal_places,
      }).format(amount)

      // Place symbol based on currency ($ before, others after)
      if (['USD', 'EUR'].includes(currency.code)) {
        return `${currency.symbol} ${formattedAmount}`
      }

      return `${formattedAmount} ${currency.symbol}`
    },

    convertAmount(amount: number, fromCode: string, toCode: string): number {
      const fromCurrency = this.getCurrencyByCode(fromCode)
      const toCurrency = this.getCurrencyByCode(toCode)

      if (!fromCurrency || !toCurrency) {
        return amount
      }

      // Convert to base currency (CDF) first, then to target currency
      const amountInBase = amount / fromCurrency.exchange_rate
      return amountInBase * toCurrency.exchange_rate
    },
  },
})
