import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// Mock useI18n before importing component
const translations: Record<string, string> = {
  'operators.noResults': 'No operators found',
  'operators.showing': 'Showing',
  'operators.to': 'to',
  'operators.of': 'of',
  'operators.table.name': 'Name',
  'operators.table.country': 'Country',
  'operators.table.createdAt': 'Created At',
  'operators.table.actions': 'Actions',
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

import OperatorsList from '@/components/Operators/OperatorsList.vue'
import { mockOperators, mockOperatorsResponse } from '@/__tests__/fixtures/operators'

describe('OperatorsList.vue', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(OperatorsList, {
      props: {
        operators: mockOperators,
        loading: false,
        meta: mockOperatorsResponse.meta,
      },
      global: {
        mocks: {
          t: (key: string) => translations[key] || key,
        },
        stubs: {
          Operator: {
            template: '<tr><td>Mock Operator Row</td></tr>',
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

  it('displays "no results" message when operators array is empty', async () => {
    await wrapper.setProps({ operators: [] })
    expect(wrapper.text()).toContain('No operators found')
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
        ...mockOperatorsResponse.meta,
        current_page: 1,
        last_page: 1,
      },
    })

    const pageItems = wrapper.findAll('.page-item')
    const nextButton = pageItems[pageItems.length - 1]
    expect(nextButton.classes()).toContain('disabled')
  })

  it('displays correct table headers', () => {
    expect(wrapper.text()).toContain('Name')
    expect(wrapper.text()).toContain('Country')
    expect(wrapper.text()).toContain('Created At')
    expect(wrapper.text()).toContain('Actions')
  })

  it('renders operator rows when data is available', () => {
    const tbody = wrapper.find('tbody')
    expect(tbody.findAll('tr').length).toBeGreaterThan(0)
  })
})
