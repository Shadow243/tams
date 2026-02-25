import type { Operator, OperatorsResponse } from '@/types'

/**
 * Mock operator data
 */
export const mockOperator: Operator = {
  id: 1,
  name: 'MTN',
  country_id: 1,
  country: {
    id: 1,
    name: 'United States',
    code: 'US',
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
  },
  logo: 'mtn-logo.png',
  logo_url: 'http://localhost/storage/operators/mtn-logo.png',
  created_at: '2024-01-01T00:00:00.000000Z',
  updated_at: '2024-01-01T00:00:00.000000Z',
}

export const mockOperators: Operator[] = [
  mockOperator,
  {
    id: 2,
    name: 'Orange',
    country_id: 2,
    country: {
      id: 2,
      name: 'France',
      code: 'FR',
      created_at: '2024-01-02T00:00:00.000000Z',
      updated_at: '2024-01-02T00:00:00.000000Z',
    },
    logo: 'orange-logo.png',
    logo_url: 'http://localhost/storage/operators/orange-logo.png',
    created_at: '2024-01-02T00:00:00.000000Z',
    updated_at: '2024-01-02T00:00:00.000000Z',
  },
  {
    id: 3,
    name: 'Vodafone',
    country_id: 3,
    country: {
      id: 3,
      name: 'Germany',
      code: 'DE',
      created_at: '2024-01-03T00:00:00.000000Z',
      updated_at: '2024-01-03T00:00:00.000000Z',
    },
    logo: null,
    logo_url: null,
    created_at: '2024-01-03T00:00:00.000000Z',
    updated_at: '2024-01-03T00:00:00.000000Z',
  },
]

export const mockOperatorsResponse: OperatorsResponse = {
  data: mockOperators,
  meta: {
    current_page: 1,
    from: 1,
    last_page: 1,
    path: 'http://localhost/api/operators',
    per_page: 20,
    to: 3,
    total: 3,
  },
  links: {
    first: 'http://localhost/api/operators?page=1',
    last: 'http://localhost/api/operators?page=1',
    prev: null,
    next: null,
  },
}
