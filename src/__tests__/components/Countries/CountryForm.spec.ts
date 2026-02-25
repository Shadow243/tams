import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// Mock useI18n before importing component
const translations: Record<string, string> = {
  'countries.addCountry': 'Add Country',
  'countries.editCountry': 'Edit Country',
  'countries.form.create': 'Create',
  'countries.form.update': 'Update',
  'countries.form.cancel': 'Cancel',
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

import CountryForm from '@/components/Countries/CountryForm.vue'

describe('CountryForm.vue', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(CountryForm, {
      props: {
        isEditing: false,
        formData: {
          name: '',
          code: '',
        },
        processing: false,
      },
      global: {
        mocks: {
          t: (key: string) => translations[key] || key,
        },
      },
    })
  })

  it('renders form fields correctly', () => {
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.findAll('input[type="text"]').length).toBe(2) // name and code
  })

  it('displays "Add Country" title when not editing', () => {
    expect(wrapper.text()).toContain('Add Country')
  })

  it('displays "Edit Country" title when editing', async () => {
    await wrapper.setProps({ isEditing: true })
    expect(wrapper.text()).toContain('Edit Country')
  })

  it('updates local form when props change', async () => {
    await wrapper.setProps({
      formData: {
        name: 'United States',
        code: 'US',
      },
    })

    const inputs = wrapper.findAll('input[type="text"]')
    expect((inputs[0].element as HTMLInputElement).value).toBe('United States')
    expect((inputs[1].element as HTMLInputElement).value).toBe('US')
  })

  it('binds country code input correctly', async () => {
    const codeInput = wrapper.findAll('input[type="text"]')[1]
    await codeInput.setValue('us')
    
    // Input is styled with text-transform: uppercase in CSS
    expect((codeInput.element as HTMLInputElement).value).toBe('us')
  })

  it('emits submit event with form data when submitted', async () => {
    const inputs = wrapper.findAll('input[type="text"]')
    await inputs[0].setValue('France')
    await inputs[1].setValue('FR')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    expect(wrapper.emitted('submit')).toBeTruthy()
    const emittedData = wrapper.emitted('submit')?.[0][0] as { name: string; code: string }
    expect(emittedData).toEqual({
      name: 'France',
      code: 'FR',
    })
  })

  it('shows cancel button when editing', async () => {
    await wrapper.setProps({ isEditing: true })
    expect(wrapper.find('button.btn-light').exists()).toBe(true)
  })

  it('emits cancel event when cancel button is clicked', async () => {
    await wrapper.setProps({ isEditing: true })
    
    const cancelButton = wrapper.find('button.btn-light')
    await cancelButton.trigger('click')

    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('shows create button text when not editing', () => {
    expect(wrapper.text()).toContain('Create')
  })

  it('shows update button text when editing', async () => {
    await wrapper.setProps({ isEditing: true })
    expect(wrapper.text()).toContain('Update')
  })

  it('disables submit button when processing', async () => {
    await wrapper.setProps({ processing: true })
    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.attributes('disabled')).toBeDefined()
  })

  it('shows spinner when processing', async () => {
    await wrapper.setProps({ processing: true })
    expect(wrapper.find('.spinner-border').exists()).toBe(true)
  })
})
