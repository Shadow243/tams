import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// Mock useI18n before importing component
const translations: Record<string, string> = {
  'common.resizeImage': 'Resize Image',
  'common.width': 'Width',
  'common.height': 'Height',
  'common.maintainAspectRatio': 'Maintain aspect ratio',
  'common.save': 'Save',
  'common.saveResized': 'Save Resized',
  'common.useOriginal': 'Use Original',
  'common.cancel': 'Cancel',
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

import ImageCropModal from '@/components/Shared/ImageCropModal.vue'

describe('ImageCropModal.vue', () => {
  let wrapper: ReturnType<typeof mount>
  const mockFile = new File(['test'], 'test.png', { type: 'image/png' })
  const mockImageSrc = 'data:image/png;base64,test'

  beforeEach(async () => {
    setActivePinia(createPinia())
    
    wrapper = mount(ImageCropModal, {
      props: {
        show: true,
        imageSrc: mockImageSrc,
        fileName: 'test.png',
        fileType: 'image/png',
        originalFile: mockFile,
      },
      global: {
        mocks: {
          t: (key: string) => translations[key] || key,
        },
      },
    })

    // Wait for component to mount and find the img element
    await wrapper.vm.$nextTick()
    
    // Mock the image element's natural dimensions
    const img = wrapper.find('img').element as HTMLImageElement
    Object.defineProperty(img, 'naturalWidth', {
      get: () => 800,
      configurable: true,
    })
    Object.defineProperty(img, 'naturalHeight', {
      get: () => 600,
      configurable: true,
    })
    
    // Trigger the onload event to simulate image loading
    const loadEvent = new Event('load')
    img.dispatchEvent(loadEvent)
    
    // Give the component time to process the load event
    await wrapper.vm.$nextTick()
  })

  it('renders modal when show is true', () => {
    expect(wrapper.find('.modal').exists()).toBe(true)
    expect(wrapper.find('.modal').classes()).toContain('show')
  })

  it('does not render when show is false', async () => {
    await wrapper.setProps({ show: false })
    expect(wrapper.find('.modal').exists()).toBe(false)
  })

  it('displays modal title', () => {
    expect(wrapper.find('.modal-title').text()).toBe('Resize Image')
  })

  it('renders image with correct src', () => {
    const img = wrapper.find('img')
    expect(img.attributes('src')).toBe(mockImageSrc)
  })

  it('renders width and height inputs', () => {
    const inputs = wrapper.findAll('input[type="number"]')
    expect(inputs.length).toBe(2)
  })

  it('renders aspect ratio checkbox', () => {
    const checkbox = wrapper.find('input[type="checkbox"]')
    expect(checkbox.exists()).toBe(true)
    expect((checkbox.element as HTMLInputElement).checked).toBe(true)
  })

  it('renders quality slider for JPEG images', async () => {
    await wrapper.setProps({ fileType: 'image/jpeg' })
    await wrapper.vm.$nextTick()

    const rangeInput = wrapper.find('input[type="range"]')
    expect(rangeInput.exists()).toBe(true)
  })

  it('does not render quality slider for PNG images', () => {
    const rangeInput = wrapper.find('input[type="range"]')
    expect(rangeInput.exists()).toBe(false)
  })

  it('renders three buttons: cancel, use original, save', () => {
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThanOrEqual(3)
    
    expect(wrapper.text()).toContain('Cancel')
    expect(wrapper.text()).toContain('Use Original')
    expect(wrapper.text()).toContain('Save')
  })

  it('emits cancel event when cancel button is clicked', async () => {
    const cancelButton = wrapper.find('.btn-light')
    await cancelButton.trigger('click')

    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('emits useOriginal event when use original button is clicked', async () => {
    const useOriginalButton = wrapper.find('.btn-secondary')
    await useOriginalButton.trigger('click')

    expect(wrapper.emitted('useOriginal')).toBeTruthy()
    expect(wrapper.emitted('useOriginal')?.[0]).toEqual([mockFile])
  })

  it('emits cancel when backdrop is clicked', async () => {
    const modal = wrapper.find('.modal')
    await modal.trigger('click')

    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('updates height when width changes and aspect ratio is maintained', async () => {
    const widthInput = wrapper.findAll('input[type="number"]')[0]
    const heightInput = wrapper.findAll('input[type="number"]')[1]
    
    // Initial values should be naturalWidth and naturalHeight
    expect(parseInt((widthInput.element as HTMLInputElement).value)).toBe(800)
    expect(parseInt((heightInput.element as HTMLInputElement).value)).toBe(600)
    
    await widthInput.setValue(400)
    await wrapper.vm.$nextTick()

    // With aspect ratio of 800/600 = 1.333, height should be 400/1.333 = 300
    expect(parseInt((heightInput.element as HTMLInputElement).value)).toBe(300)
  })

  it('does not auto-update height when aspect ratio is not maintained', async () => {
    const checkbox = wrapper.find('input[type="checkbox"]')
    await checkbox.setValue(false)

    const widthInput = wrapper.findAll('input[type="number"]')[0]
    const initialHeight = (wrapper.findAll('input[type="number"]')[1].element as HTMLInputElement)
      .value

    await widthInput.setValue(400)
    await wrapper.vm.$nextTick()

    // Height should not change
    const heightInput = wrapper.findAll('input[type="number"]')[1]
    expect((heightInput.element as HTMLInputElement).value).toBe(initialHeight)
  })

  it('shows "Save Resized" when dimensions are changed', async () => {
    await wrapper.vm.$nextTick()
    
    const widthInput = wrapper.findAll('input[type="number"]')[0]
    await widthInput.setValue(400)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Save Resized')
  })

  it('displays original image dimensions', async () => {
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('800 x 600')
  })

  it('closes modal when close button (×) is clicked', async () => {
    const closeButton = wrapper.find('.btn-close')
    await closeButton.trigger('click')

    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('handles JPEG file type correctly', async () => {
    await wrapper.setProps({ fileType: 'image/jpeg' })
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.isJpeg).toBe(true)
    expect(wrapper.find('input[type="range"]').exists()).toBe(true)
  })

  it('handles quality slider changes', async () => {
    await wrapper.setProps({ fileType: 'image/jpeg' })
    await wrapper.vm.$nextTick()

    const qualitySlider = wrapper.find('input[type="range"]')
    await qualitySlider.setValue(75)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('75%')
  })

  it('emits save event with file when save button is clicked', async () => {
    // Mock canvas and its methods
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({
        drawImage: vi.fn(),
      })),
      toBlob: vi.fn((callback) => {
        const blob = new Blob(['test'], { type: 'image/png' })
        callback(blob)
      }),
    }

    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'canvas') {
        return mockCanvas as any
      }
      return document.createElement(tagName)
    })

    const saveButton = wrapper.find('.btn-primary')
    await saveButton.trigger('click')

    // Wait for async operations
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(wrapper.emitted('save')).toBeTruthy()
    expect(wrapper.emitted('save')?.[0][0]).toBeInstanceOf(File)
  })
})
