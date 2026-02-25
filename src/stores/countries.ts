import { defineStore } from 'pinia'
import { axiosInstance } from '@/plugins/axios'
import { appConfig } from '@/config/app'
import { handleError, showSuccessMessage } from '@/utils/notification'
import type { CountriesResponse, Country } from '@/types'

interface CountryFormData {
    name: string
    code: string
}

export const useCountryStore = defineStore('countries', {
    state: () => ({
        countries: null as CountriesResponse | null,
        country_list: [] as CountriesResponse['data'],
        loading: false,
        processing: false,
        currentCountry: null as Country | null,
        filters: {
            search: '',
            perPage: 20,
        },
    }),

    getters: {
        isLoading: (state) => state.loading,
        isProcessing: (state) => state.processing,
        allCountries: (state) => state.countries,
    },

    actions: {
        setCountries(countries: CountriesResponse | null): void {
            this.countries = countries
        },

        async fetchCountries(page: number = 1, search?: string, perPage?: number): Promise<void> {
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

                console.log('🔍 Fetching countries with params:', params)
                console.log('📊 Current filters:', this.filters)

                const response = await axiosInstance.get(`${appConfig.apiUrl}/countries`, {
                    params,
                })

                if (response.data) {
                    this.setCountries(response.data)
                    this.country_list = response.data.data || []
                }
            } catch (error) {
                console.error('❌ Error fetching countries:', error)
                handleError(error)
            } finally {
                this.loading = false
            }
        },

        setCurrentCountry(country: Country | null): void {
            this.currentCountry = country
        },

        async storeCountry(countryData: CountryFormData): Promise<boolean> {
            this.processing = true
            try {
                const url = this.currentCountry
                    ? `${appConfig.apiUrl}/countries/${this.currentCountry.id}`
                    : `${appConfig.apiUrl}/countries`

                const method = this.currentCountry ? 'put' : 'post'

                const { data } = await axiosInstance[method](url, countryData)

                if (data) {
                    const message = this.currentCountry
                        ? 'Country updated successfully'
                        : 'Country created successfully'

                    showSuccessMessage(message)

                    // Refresh the list
                    await this.fetchCountries()

                    // Reset current country
                    this.setCurrentCountry(null)

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

        async deleteCountry(countryId: number): Promise<boolean> {
            this.processing = true
            try {
                await axiosInstance.delete(`${appConfig.apiUrl}/countries/${countryId}`)

                showSuccessMessage('Country deleted successfully')

                // Refresh the list
                await this.fetchCountries()

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
