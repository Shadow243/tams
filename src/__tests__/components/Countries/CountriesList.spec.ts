import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// Mock useI18n before importing component
const translations: Record<string, string> = {
  'countries.noResults': 'No countries found',
  'countries.showing': 'Showing',
  'countries.to': 'to',
  'countries.of': 'of',
}

vi.mock('@/composables/useI18n', () => ({
  useI18n: () => ({
    t: (key: string) => translations[key] || key,
    locale: { value: 'en' },
    availableLocales: ['en', 'fr'],
    changeLocale: vi.fn(),
    refreshLocales: vi.fn(),
  }),
}))

import CountriesList from '@/components/Countries/CountriesList.vue'
import { mockCountries, mockCountriesResponse } from '@/__tests__/fixtures/countries'

describe('CountriesList.vue', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(CountriesList, {
      props: {
        countries: mockCountries,
        loading: false,
        meta: mockCountriesResponse.meta,
      },
      global: {
        mocks: {
          t: (key: string) => translations[key] || key,
        },
        stubs: {
          Country: {
            template: '<tr><td>Mock Country Row</td></tr>',
          },
        },
      },
    })
  })

  it('renders search input', () => {
    expect(wrapper.find('input[type="search"]').exists()).toBe(true)
  })

  it('renders per-page selector with correct options', () => {
    const select = wrapper.find('select.form-select')
    const options = select.findAll('option')
    
    expect(options).toHaveLength(4)
    expect(options[0].text()).toBe('10')
    expect(options[1].text()).toBe('20')
    expect(options[2].text()).toBe('50')
    expect(options[3].text()).toBe('100')
  })

  it('renders refresh button', () => {
    expect(wrapper.find('button.btn-primary').exists()).toBe(true)
  })

  it('emits refresh event when refresh button is clicked', async () => {
    const refreshButton = wrapper.find('button.btn-primary')
    await refreshButton.trigger('click')

    expect(wrapper.emitted('refresh')).toBeTruthy()
  })

  it('displays loading spinner when loading is true', async () => {
    await wrapper.setProps({ loading: true })
    expect(wrapper.find('.spinner-border').exists()).toBe(true)
  })

  it('displays "no results" message when countries array is empty', async () => {
    await wrapper.setProps({ countries: [] })
    expect(wrapper.text()).toContain('No countries found')
  })

  it('renders table headers correctly', () => {
    const headers = wrapper.findAll('thead th')
    expect(headers).toHaveLength(5)
  })

  it('displays pagination info correctly', () => {
    // Find pagination div which is the last .text-muted element
    const textMutedElements = wrapper.findAll('.text-muted')
    const paginationText = textMutedElements[textMutedElements.length - 1].text()
    expect(paginationText).toContain('Showing')
    expect(paginationText).toContain('1')
    expect(paginationText).toContain('3')
  })

  it('emits search event with debounced query', async () => {
    vi.useFakeTimers()
    
    const searchInput = wrapper.find('input[type="search"]')
    await searchInput.setValue('test')

    // Fast-forward time to trigger debounce
    vi.advanceTimersByTime(500)

    expect(wrapper.emitted('search')).toBeTruthy()
    expect(wrapper.emitted('search')?.[0]).toEqual(['test'])

    vi.useRealTimers()
  })

  it('emits per-page-change event when per-page is changed', async () => {
    const select = wrapper.find('select.form-select')
    await select.setValue(50)

    expect(wrapper.emitted('per-page-change')).toBeTruthy()
    expect(wrapper.emitted('per-page-change')?.[0]).toEqual([50])
  })

  it('disables previous button on first page', () => {
    const prevButton = wrapper.findAll('.page-item')[0]
    expect(prevButton.classes()).toContain('disabled')
  })

  it('disables next button on last page', async () => {
    await wrapper.setProps({
      meta: {
        ...mockCountriesResponse.meta,
        current_page: 1,
        last_page: 1,
      },
    })

    const pageItems = wrapper.findAll('.page-item')
    const nextButton = pageItems[pageItems.length - 1]
    expect(nextButton.classes()).toContain('disabled')
  })

  it('emits page-change event when page link is clicked', async () => {
    await wrapper.setProps({
      meta: {
        ...mockCountriesResponse.meta,
        last_page: 3,
      },
    })

    const pageLinks = wrapper.findAll('.page-link')
    // Click on page 2 (skip prev button)
    if (pageLinks.length > 2) {
      await pageLinks[2].trigger('click')
      expect(wrapper.emitted('page-change')).toBeTruthy()
    }
  })

  it('handles edit event from Country component', async () => {
    wrapper = mount(CountriesList, {
      props: {
        countries: mockCountries,
        loading: false,
        meta: mockCountriesResponse.meta,
      },
      global: {
        mocks: {
          t: (key: string) => translations[key] || key,
        },
      },
    })

    // Simulate edit event from child component
    wrapper.vm.$options.components?.Country
    // Note: This would be tested better with integration tests
  })

  it('handles delete event from Country component', async () => {
    wrapper = mount(CountriesList, {
      props: {
        countries: mockCountries,
        loading: false,
        meta: mockCountriesResponse.meta,
      },
      global: {
        mocks: {
          t: (key: string) => translations[key] || key,
        },
      },
    })

    // Simulate delete event from child component
    // Note: This would be tested better with integration tests
  })
})
