import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'

// Mock useI18n before importing component
const translations: Record<string, string> = {
  'operators.edit': 'Edit',
  'operators.delete': 'Delete',
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

import Operator from '@/components/Operators/Operator.vue'
import { mockOperator, mockOperators } from '@/__tests__/fixtures/operators'

describe('Operator.vue', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    wrapper = mount(Operator, {
      props: {
        operator: mockOperator,
        index: 0,
      },
      global: {
        mocks: {
          t: (key: string) => translations[key] || key,
        },
      },
    })
  })

  it('renders operator information correctly', () => {
    expect(wrapper.text()).toContain(mockOperator.name)
    expect(wrapper.text()).toContain(mockOperator.country.name)
  })

  it('displays the correct index number', () => {
    expect(wrapper.text()).toContain('1') // index + 1
  })

  it('formats the date correctly', () => {
    const formattedDate = new Date(mockOperator.created_at).toLocaleDateString()
    expect(wrapper.text()).toContain(formattedDate)
  })

  it('renders logo image when logo_url is provided', () => {
    const img = wrapper.find('.avatar img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe(mockOperator.logo_url)
    expect(img.attributes('alt')).toBe(mockOperator.name)
  })

  it('renders initials avatar when no logo is provided', async () => {
    const operatorWithoutLogo = {
      ...mockOperators[2], // Vodafone has no logo
    }

    await wrapper.setProps({ operator: operatorWithoutLogo })

    const avatarTitle = wrapper.find('.avatar-title')
    expect(avatarTitle.exists()).toBe(true)
    expect(avatarTitle.text()).toBe('V') // First letter of Vodafone
  })

  it('displays "N/A" when country is not provided', async () => {
    const operatorWithoutCountry = {
      ...mockOperator,
      country: null,
    }

    await wrapper.setProps({ operator: operatorWithoutCountry })
    expect(wrapper.text()).toContain('N/A')
  })

  it('emits edit event when edit button is clicked', async () => {
    const editButton = wrapper.findAll('a.btn-success')[0]
    await editButton.trigger('click')

    expect(wrapper.emitted('edit')).toBeTruthy()
    expect(wrapper.emitted('edit')?.[0]).toEqual([mockOperator])
  })

  it('emits delete event when delete button is clicked', async () => {
    const deleteButton = wrapper.findAll('a.btn-danger')[0]
    await deleteButton.trigger('click')

    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.emitted('delete')?.[0]).toEqual([mockOperator.id])
  })

  it('renders edit button with correct title', () => {
    const editButton = wrapper.find('a.btn-success')
    expect(editButton.attributes('title')).toBe('Edit')
  })

  it('renders delete button with correct title', () => {
    const deleteButton = wrapper.find('a.btn-danger')
    expect(deleteButton.attributes('title')).toBe('Delete')
  })

  it('displays operator name as a link', () => {
    const nameLink = wrapper.find('a.link-reset')
    expect(nameLink.text()).toBe(mockOperator.name)
  })

  it('has correct avatar classes', () => {
    const avatar = wrapper.find('.avatar')
    expect(avatar.classes()).toContain('avatar-sm')
  })
})
