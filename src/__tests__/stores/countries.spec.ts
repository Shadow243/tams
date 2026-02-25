import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock axios and utilities before store import
vi.mock('@/plugins/axios', () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@/utils/notification', () => ({
  showSuccessMessage: vi.fn(),
  showErrorMessage: vi.fn(),
  handleError: vi.fn(),
}))

vi.mock('@/composables/useI18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: { value: 'en' },
  }),
}))

vi.mock('@/config/app', () => ({
  appConfig: {
    apiUrl: 'http://localhost:8000',
    appName: 'TAMS Test',
  },
}))

import { useCountryStore } from '@/stores/countries'
import { axiosInstance } from '@/plugins/axios'
import * as notifications from '@/utils/notification'
import { mockCountriesResponse, mockCountry } from '@/__tests__/fixtures/countries'

const mockAxios = axiosInstance as any
const mockNotifications = notifications as any

describe('Countries Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('State', () => {
    it('has correct initial state', () => {
      const store = useCountryStore()

      expect(store.countries).toBeNull()
      expect(store.country_list).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.processing).toBe(false)
      expect(store.currentCountry).toBeNull()
      expect(store.filters).toEqual({
        search: '',
        perPage: 20,
      })
    })
  })

  describe('Getters', () => {
    it('isLoading returns loading state', () => {
      const store = useCountryStore()
      expect(store.isLoading).toBe(false)

      store.loading = true
      expect(store.isLoading).toBe(true)
    })

    it('isProcessing returns processing state', () => {
      const store = useCountryStore()
      expect(store.isProcessing).toBe(false)

      store.processing = true
      expect(store.isProcessing).toBe(true)
    })

    it('allCountries returns countries', () => {
      const store = useCountryStore()
      expect(store.allCountries).toBeNull()

      store.countries = mockCountriesResponse
      expect(store.allCountries).toEqual(mockCountriesResponse)
    })
  })

  describe('Actions', () => {
    describe('setCountries', () => {
      it('sets countries data', () => {
        const store = useCountryStore()
        store.setCountries(mockCountriesResponse)

        expect(store.countries).toEqual(mockCountriesResponse)
      })
    })

    describe('fetchCountries', () => {
      it('fetches countries successfully', async () => {
        const store = useCountryStore()
        mockAxios.get.mockResolvedValue({ data: mockCountriesResponse })

        await store.fetchCountries()

        expect(mockAxios.get).toHaveBeenCalledWith(
          'http://localhost:8000/countries',
          expect.objectContaining({
            params: expect.objectContaining({
              paginate: '20',
              page: '1',
            }),
          })
        )
        expect(store.countries).toEqual(mockCountriesResponse)
        expect(store.country_list).toEqual(mockCountriesResponse.data)
        expect(store.loading).toBe(false)
      })

      it('fetches countries with search query', async () => {
        const store = useCountryStore()
        mockAxios.get.mockResolvedValue({ data: mockCountriesResponse })

        await store.fetchCountries(1, 'test')

        expect(mockAxios.get).toHaveBeenCalledWith(
          'http://localhost:8000/countries',
          expect.objectContaining({
            params: expect.objectContaining({
              search: 'test',
              paginate: '20',
              page: '1',
            }),
          })
        )
        expect(store.filters.search).toBe('test')
      })

      it('fetches countries with custom perPage', async () => {
        const store = useCountryStore()
        mockAxios.get.mockResolvedValue({ data: mockCountriesResponse })

        await store.fetchCountries(1, '', 50)

        expect(mockAxios.get).toHaveBeenCalledWith(
          'http://localhost:8000/countries',
          expect.objectContaining({
            params: expect.objectContaining({
              paginate: '50',
              page: '1',
            }),
          })
        )
        expect(store.filters.perPage).toBe(50)
      })

      it('handles fetch errors', async () => {
        const store = useCountryStore()
        const error = new Error('Network error')
        mockAxios.get.mockRejectedValue(error)

        await store.fetchCountries()

        expect(mockNotifications.handleError).toHaveBeenCalledWith(error)
        expect(store.loading).toBe(false)
      })

      it('trims search query', async () => {
        const store = useCountryStore()
        mockAxios.get.mockResolvedValue({ data: mockCountriesResponse })

        await store.fetchCountries(1, '  test  ')

        expect(mockAxios.get).toHaveBeenCalledWith(
          'http://localhost:8000/countries',
          expect.objectContaining({
            params: expect.objectContaining({
              search: 'test',
            }),
          })
        )
      })

      it('does not include search param when empty', async () => {
        const store = useCountryStore()
        mockAxios.get.mockResolvedValue({ data: mockCountriesResponse })

        await store.fetchCountries(1, '')

        const callArgs = mockAxios.get.mock.calls[0][1]
        expect(callArgs.params.search).toBeUndefined()
      })
    })

    describe('setCurrentCountry', () => {
      it('sets current country', () => {
        const store = useCountryStore()
        store.setCurrentCountry(mockCountry)

        expect(store.currentCountry).toEqual(mockCountry)
      })

      it('clears current country when null is passed', () => {
        const store = useCountryStore()
        store.currentCountry = mockCountry
        store.setCurrentCountry(null)

        expect(store.currentCountry).toBeNull()
      })
    })

    describe('storeCountry', () => {
      it('creates new country successfully', async () => {
        const store = useCountryStore()
        const newCountry = { name: 'New Country', code: 'NC' }
        
        mockAxios.post.mockResolvedValue({ data: mockCountry })
        mockAxios.get.mockResolvedValue({ data: mockCountriesResponse })

        const result = await store.storeCountry(newCountry)

        expect(mockAxios.post).toHaveBeenCalledWith('http://localhost:8000/countries', newCountry)
        expect(mockNotifications.showSuccessMessage).toHaveBeenCalledWith(
          'Country created successfully'
        )
        expect(result).toBe(true)
        expect(store.currentCountry).toBeNull()
      })

      it('updates existing country successfully', async () => {
        const store = useCountryStore()
        store.currentCountry = mockCountry
        const updatedData = { name: 'Updated Country', code: 'UC' }

        mockAxios.put.mockResolvedValue({ data: mockCountry })
        mockAxios.get.mockResolvedValue({ data: mockCountriesResponse })

        const result = await store.storeCountry(updatedData)

        expect(mockAxios.put).toHaveBeenCalledWith(
          `http://localhost:8000/countries/${mockCountry.id}`,
          updatedData
        )
        expect(mockNotifications.showSuccessMessage).toHaveBeenCalledWith(
          'Country updated successfully'
        )
        expect(result).toBe(true)
        expect(store.currentCountry).toBeNull()
      })

      it('handles store errors', async () => {
        const store = useCountryStore()
        const error = new Error('Validation error')
        mockAxios.post.mockRejectedValue(error)

        const result = await store.storeCountry({ name: 'Test', code: 'TS' })

        expect(mockNotifications.handleError).toHaveBeenCalledWith(error)
        expect(result).toBe(false)
        expect(store.processing).toBe(false)
      })
    })

    describe('deleteCountry', () => {
      it('deletes country successfully', async () => {
        const store = useCountryStore()
        mockAxios.delete.mockResolvedValue({ data: { message: 'Deleted' } })
        mockAxios.get.mockResolvedValue({ data: mockCountriesResponse })

        const result = await store.deleteCountry(1)

        expect(mockAxios.delete).toHaveBeenCalledWith('http://localhost:8000/countries/1')
        expect(mockNotifications.showSuccessMessage).toHaveBeenCalledWith(
          'Country deleted successfully'
        )
        expect(result).toBe(true)
      })

      it('handles delete errors', async () => {
        const store = useCountryStore()
        const error = new Error('Delete error')
        mockAxios.delete.mockRejectedValue(error)

        const result = await store.deleteCountry(1)

        expect(mockNotifications.handleError).toHaveBeenCalledWith(error)
        expect(result).toBe(false)
        expect(store.processing).toBe(false)
      })
    })
  })
})
