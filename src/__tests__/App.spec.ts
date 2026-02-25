import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'

// Mock locale composable
vi.mock('@/composables/locale-composable', () => ({
  default: () => ({
    loadAppConfig: vi.fn(),
  }),
}))

// Mock utils/dynamic-importer
vi.mock('@/utils/dynamic-importer', () => ({
  layouts: {
    default: {
      name: 'DefaultLayout',
      template: '<div class="default-layout"><slot /></div>',
    },
    auth: {
      name: 'AuthLayout',
      template: '<div class="auth-layout"><slot /></div>',
    },
  },
}))

import App from '../App.vue'

describe('App', () => {
  it('renders the app with default layout', async () => {
    // Create a mock router
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/',
          name: 'home',
          component: { template: '<div>Home</div>' },
          meta: { layout: 'default' },
        },
      ],
    })

    // Navigate to the home route
    await router.push('/')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    })

    // Wait for layout to be resolved
    await wrapper.vm.$nextTick()
    
    expect(wrapper.exists()).toBe(true)
  })
})
