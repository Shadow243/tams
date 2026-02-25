import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'

// Mock useI18n before importing component
const translations: Record<string, string> = {
  'countries.edit': 'Edit',
  'countries.delete': 'Delete',
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

import Country from '@/components/Countries/Country.vue'
import { mockCountry } from '@/__tests__/fixtures/countries'

describe('Country.vue', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    wrapper = mount(Country, {
      props: {
        country: mockCountry,
        index: 0,
      },
      global: {
        mocks: {
          t: (key: string) => translations[key] || key,
        },
      },
    })
  })

  it('renders country information correctly', () => {
    expect(wrapper.text()).toContain(mockCountry.name)
    expect(wrapper.text()).toContain(mockCountry.code)
  })

  it('displays the correct index number', () => {
    expect(wrapper.text()).toContain('1') // index + 1
  })

  it('formats the date correctly', () => {
    const formattedDate = new Date(mockCountry.created_at).toLocaleDateString()
    expect(wrapper.text()).toContain(formattedDate)
  })

  it('emits edit event when edit button is clicked', async () => {
    const editButton = wrapper.findAll('a.btn-success')[0]
    await editButton.trigger('click')

    expect(wrapper.emitted('edit')).toBeTruthy()
    expect(wrapper.emitted('edit')?.[0]).toEqual([mockCountry])
  })

  it('emits delete event when delete button is clicked', async () => {
    const deleteButton = wrapper.findAll('a.btn-danger')[0]
    await deleteButton.trigger('click')

    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.emitted('delete')?.[0]).toEqual([mockCountry.id])
  })

  it('renders edit button with correct title', () => {
    const editButton = wrapper.find('a.btn-success')
    expect(editButton.attributes('title')).toBe('Edit')
  })

  it('renders delete button with correct title', () => {
    const deleteButton = wrapper.find('a.btn-danger')
    expect(deleteButton.attributes('title')).toBe('Delete')
  })

  it('displays country name as a link', () => {
    const nameLink = wrapper.find('a.link-reset')
    expect(nameLink.text()).toBe(mockCountry.name)
  })
})
