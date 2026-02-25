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

import { useOperatorStore } from '@/stores/operators'
import { axiosInstance } from '@/plugins/axios'
import * as notifications from '@/utils/notification'
import { mockOperatorsResponse, mockOperator } from '@/__tests__/fixtures/operators'

const mockAxios = axiosInstance as any
const mockNotifications = notifications as any

describe('Operators Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('State', () => {
    it('has correct initial state', () => {
      const store = useOperatorStore()

      expect(store.operators).toBeNull()
      expect(store.operator_list).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.processing).toBe(false)
      expect(store.currentOperator).toBeNull()
      expect(store.filters).toEqual({
        search: '',
        perPage: 20,
      })
    })
  })

  describe('Getters', () => {
    it('isLoading returns loading state', () => {
      const store = useOperatorStore()
      expect(store.isLoading).toBe(false)

      store.loading = true
      expect(store.isLoading).toBe(true)
    })

    it('isProcessing returns processing state', () => {
      const store = useOperatorStore()
      expect(store.isProcessing).toBe(false)

      store.processing = true
      expect(store.isProcessing).toBe(true)
    })

    it('allOperators returns operators', () => {
      const store = useOperatorStore()
      expect(store.allOperators).toBeNull()

      store.operators = mockOperatorsResponse
      expect(store.allOperators).toEqual(mockOperatorsResponse)
    })
  })

  describe('Actions', () => {
    describe('fetchOperators', () => {
      it('fetches operators successfully', async () => {
        const store = useOperatorStore()
        mockAxios.get.mockResolvedValue({ data: mockOperatorsResponse })

        await store.fetchOperators()

        expect(mockAxios.get).toHaveBeenCalledWith(
          'http://localhost:8000/operators',
          expect.objectContaining({
            params: expect.objectContaining({
              paginate: '20',
              page: '1',
            }),
          })
        )
        expect(store.operators).toEqual(mockOperatorsResponse)
        expect(store.operator_list).toEqual(mockOperatorsResponse.data)
        expect(store.loading).toBe(false)
      })

      it('fetches operators with search query', async () => {
        const store = useOperatorStore()
        mockAxios.get.mockResolvedValue({ data: mockOperatorsResponse })

        await store.fetchOperators(1, 'MTN')

        expect(mockAxios.get).toHaveBeenCalledWith(
          'http://localhost:8000/operators',
          expect.objectContaining({
            params: expect.objectContaining({
              search: 'MTN',
            }),
          })
        )
        expect(store.filters.search).toBe('MTN')
      })

      it('handles fetch errors', async () => {
        const store = useOperatorStore()
        const error = new Error('Network error')
        mockAxios.get.mockRejectedValue(error)

        await store.fetchOperators()

        expect(mockNotifications.handleError).toHaveBeenCalledWith(error)
        expect(store.loading).toBe(false)
      })
    })

    describe('storeOperator', () => {
      it('creates new operator with FormData', async () => {
        const store = useOperatorStore()
        const newOperator = {
          name: 'New Operator',
          country_id: 1,
          logo: new File(['test'], 'test.png', { type: 'image/png' }),
        }

        mockAxios.post.mockResolvedValue({ data: mockOperator })
        mockAxios.get.mockResolvedValue({ data: mockOperatorsResponse })

        const result = await store.storeOperator(newOperator)

        expect(mockAxios.post).toHaveBeenCalled()
        const callArgs = mockAxios.post.mock.calls[0]
        expect(callArgs[0]).toBe('http://localhost:8000/operators')
        expect(callArgs[1]).toBeInstanceOf(FormData)
        expect(callArgs[2]).toEqual({
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        expect(mockNotifications.showSuccessMessage).toHaveBeenCalledWith(
          'Operator created successfully'
        )
        expect(result).toBe(true)
      })

      it('updates existing operator with _method field', async () => {
        const store = useOperatorStore()
        store.currentOperator = mockOperator
        const updatedData = {
          name: 'Updated Operator',
          country_id: 2,
          logo: null,
        }

        mockAxios.post.mockResolvedValue({ data: mockOperator })
        mockAxios.get.mockResolvedValue({ data: mockOperatorsResponse })

        const result = await store.storeOperator(updatedData)

        expect(mockAxios.post).toHaveBeenCalled()
        const callArgs = mockAxios.post.mock.calls[0]
        expect(callArgs[0]).toBe(`http://localhost:8000/operators/${mockOperator.id}`)
        expect(callArgs[1]).toBeInstanceOf(FormData)
        
        // Verify _method is set for updates
        const formData = callArgs[1] as FormData
        expect(formData.get('_method')).toBe('PUT')
        
        expect(mockNotifications.showSuccessMessage).toHaveBeenCalledWith(
          'Operator updated successfully'
        )
        expect(result).toBe(true)
        expect(store.currentOperator).toBeNull()
      })

      it('handles store errors', async () => {
        const store = useOperatorStore()
        const error = new Error('Validation error')
        mockAxios.post.mockRejectedValue(error)

        const result = await store.storeOperator({
          name: 'Test',
          country_id: 1,
          logo: null,
        })

        expect(mockNotifications.handleError).toHaveBeenCalledWith(error)
        expect(result).toBe(false)
        expect(store.processing).toBe(false)
      })

      it('creates FormData with logo when provided', async () => {
        const store = useOperatorStore()
        const logo = new File(['test'], 'logo.png', { type: 'image/png' })
        
        mockAxios.post.mockResolvedValue({ data: mockOperator })
        mockAxios.get.mockResolvedValue({ data: mockOperatorsResponse })

        await store.storeOperator({
          name: 'Test Operator',
          country_id: 1,
          logo,
        })

        const formData = mockAxios.post.mock.calls[0][1] as FormData
        expect(formData.get('logo')).toBe(logo)
      })

      it('creates FormData without logo when not provided', async () => {
        const store = useOperatorStore()
        
        mockAxios.post.mockResolvedValue({ data: mockOperator })
        mockAxios.get.mockResolvedValue({ data: mockOperatorsResponse })

        await store.storeOperator({
          name: 'Test Operator',
          country_id: 1,
          logo: null,
        })

        const formData = mockAxios.post.mock.calls[0][1] as FormData
        expect(formData.has('logo')).toBe(false)
      })
    })

    describe('deleteOperator', () => {
      it('deletes operator successfully', async () => {
        const store = useOperatorStore()
        mockAxios.delete.mockResolvedValue({ data: { message: 'Deleted' } })
        mockAxios.get.mockResolvedValue({ data: mockOperatorsResponse })

        const result = await store.deleteOperator(1)

        expect(mockAxios.delete).toHaveBeenCalledWith('http://localhost:8000/operators/1')
        expect(mockNotifications.showSuccessMessage).toHaveBeenCalledWith(
          'Operator deleted successfully'
        )
        expect(result).toBe(true)
      })

      it('handles delete errors', async () => {
        const store = useOperatorStore()
        const error = new Error('Delete error')
        mockAxios.delete.mockRejectedValue(error)

        const result = await store.deleteOperator(1)

        expect(mockNotifications.handleError).toHaveBeenCalledWith(error)
        expect(result).toBe(false)
        expect(store.processing).toBe(false)
      })
    })

    describe('setCurrentOperator', () => {
      it('sets current operator', () => {
        const store = useOperatorStore()
        store.setCurrentOperator(mockOperator)

        expect(store.currentOperator).toEqual(mockOperator)
      })

      it('clears current operator when null is passed', () => {
        const store = useOperatorStore()
        store.currentOperator = mockOperator
        store.setCurrentOperator(null)

        expect(store.currentOperator).toBeNull()
      })
    })
  })
})
