import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// Mock useI18n before importing component
const translations: Record<string, string> = {
  'operators.addOperator': 'Add Operator',
  'operators.editOperator': 'Edit Operator',
  'operators.form.create': 'Create',
  'operators.form.update': 'Update',
  'operators.form.cancel': 'Cancel',
  'operators.form.logoHelper': 'Max 2MB. Supported formats: JPEG, JPG, PNG, SVG',
  'operators.form.logoPreview': 'Logo Preview',
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

import OperatorForm from '@/components/Operators/OperatorForm.vue'
import { mockCountries } from '@/__tests__/fixtures/countries'

// Mock the ImageCropModal component
vi.mock('@/components/Shared/ImageCropModal.vue', () => ({
  default: {
    name: 'ImageCropModal',
    template: '<div class="mock-image-crop-modal"></div>',
  },
}))

describe('OperatorForm.vue', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(OperatorForm, {
      props: {
        isEditing: false,
        formData: {
          name: '',
          country_id: null,
          logo_url: null,
        },
        processing: false,
        countries: mockCountries,
      },
      global: {
        mocks: {
          t: (key: string) => translations[key] || key,
        },
        stubs: {
          ImageCropModal: true,
        },
      },
    })
  })

  it('renders form fields correctly', () => {
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.find('select.form-select').exists()).toBe(true)
    expect(wrapper.find('input[type="file"]').exists()).toBe(true)
  })

  it('displays "Add Operator" title when not editing', () => {
    expect(wrapper.text()).toContain('Add Operator')
  })

  it('displays "Edit Operator" title when editing', async () => {
    await wrapper.setProps({ isEditing: true })
    expect(wrapper.text()).toContain('Edit Operator')
  })

  it('populates country dropdown with provided countries', () => {
    const options = wrapper.findAll('select.form-select option')
    // +1 for the "Select Country" option
    expect(options.length).toBe(mockCountries.length + 1)
    expect(options[1].text()).toBe(mockCountries[0].name)
    expect(options[2].text()).toBe(mockCountries[1].name)
  })

  it('updates local form when props change', async () => {
    await wrapper.setProps({
      formData: {
        name: 'MTN',
        country_id: 1,
        logo_url: 'http://example.com/logo.png',
      },
    })

    const nameInput = wrapper.find('input[type="text"]')
    expect((nameInput.element as HTMLInputElement).value).toBe('MTN')
  })

  it('emits submit event with form data', async () => {
    const nameInput = wrapper.find('input[type="text"]')
    const countrySelect = wrapper.find('select.form-select')

    await nameInput.setValue('Orange')
    await countrySelect.setValue(2)

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    expect(wrapper.emitted('submit')).toBeTruthy()
    const emittedData = wrapper.emitted('submit')?.[0][0] as {
      name: string
      country_id: number | null
      logo: File | null
    }
    expect(emittedData.name).toBe('Orange')
    expect(emittedData.country_id).toBe(2)
    expect(emittedData.logo).toBeNull()
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

  it('displays logo preview when logo_url is provided', async () => {
    await wrapper.setProps({
      formData: {
        name: 'Test',
        country_id: 1,
        logo_url: 'http://example.com/test-logo.png',
      },
    })

    const previewImage = wrapper.find('.img-thumbnail')
    expect(previewImage.exists()).toBe(true)
    expect(previewImage.attributes('src')).toBe('http://example.com/test-logo.png')
  })

  it('accepts file input with correct file types', () => {
    const fileInput = wrapper.find('input[type="file"]')
    expect(fileInput.attributes('accept')).toBe('image/jpeg,image/jpg,image/png,image/svg+xml')
  })

  it('displays logo helper text', () => {
    expect(wrapper.text()).toContain('Max 2MB')
  })

  it('validates SVG files and sets them directly without modal', async () => {
    const fileInput = wrapper.find('input[type="file"]')
    const svgFile = new File(['<svg></svg>'], 'test.svg', { type: 'image/svg+xml' })

    // Mock FileReader class
    class MockFileReader {
      result: string | null = 'data:image/svg+xml;base64,test'
      onload: ((e: Event) => void) | null = null
      
      readAsDataURL = vi.fn(function(this: MockFileReader) {
        setTimeout(() => {
          if (this.onload) {
            this.onload({ target: this } as any)
          }
        }, 0)
      })
    }

    global.FileReader = MockFileReader as any

    Object.defineProperty(fileInput.element, 'files', {
      value: [svgFile],
      writable: false,
    })

    await fileInput.trigger('change')
    await wrapper.vm.$nextTick()

    // SVG should not trigger the crop modal
    expect(wrapper.vm.showCropModal).toBe(false)
  })

  it('shows remove logo button when logo preview exists', async () => {
    // Set a logo preview by manually updating the ref
    wrapper.vm.logoPreview = 'data:image/png;base64,test'
    await wrapper.vm.$nextTick()

    const removeButton = wrapper.find('.btn-danger.btn-sm')
    expect(removeButton.exists()).toBe(true)
  })

  it('displays logo preview label', async () => {
    await wrapper.setProps({
      formData: {
        name: 'Test',
        country_id: 1,
        logo_url: 'http://example.com/test-logo.png',
      },
    })

    expect(wrapper.text()).toContain('Logo Preview')
  })

  it('requires name and country fields', () => {
    const nameInput = wrapper.find('input[type="text"]')
    const countrySelect = wrapper.find('select.form-select')

    expect(nameInput.attributes('required')).toBeDefined()
    expect(countrySelect.attributes('required')).toBeDefined()
  })
})
