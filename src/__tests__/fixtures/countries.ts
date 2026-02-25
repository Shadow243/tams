import type { Country, CountriesResponse } from '@/types'

/**
 * Mock country data
 */
export const mockCountry: Country = {
  id: 1,
  name: 'United States',
  code: 'US',
  created_at: '2024-01-01T00:00:00.000000Z',
  updated_at: '2024-01-01T00:00:00.000000Z',
}

export const mockCountries: Country[] = [
  mockCountry,
  {
    id: 2,
    name: 'France',
    code: 'FR',
    created_at: '2024-01-02T00:00:00.000000Z',
    updated_at: '2024-01-02T00:00:00.000000Z',
  },
  {
    id: 3,
    name: 'Germany',
    code: 'DE',
    created_at: '2024-01-03T00:00:00.000000Z',
    updated_at: '2024-01-03T00:00:00.000000Z',
  },
]

export const mockCountriesResponse: CountriesResponse = {
  data: mockCountries,
  meta: {
    current_page: 1,
    from: 1,
    last_page: 1,
    path: 'http://localhost/api/countries',
    per_page: 20,
    to: 3,
    total: 3,
  },
  links: {
    first: 'http://localhost/api/countries?page=1',
    last: 'http://localhost/api/countries?page=1',
    prev: null,
    next: null,
  },
}
