<template>
  <component :is="layout" v-if="layout" />
  <!-- <ReloadPrompt /> -->
</template>

<script lang="ts">
import { useRoute } from 'vue-router'
import { watch, shallowRef, provide, onBeforeUnmount, onMounted } from 'vue'
import { appConfig } from '@/config/app'
// import { axiosInstance } from "@/plugins/axios";
import { layouts } from '@/utils/dynamic-importer'
import useLocale from '@/composables/locale-composable'
import type { Component } from 'vue'

// import ReloadPrompt from '@/components/Shared/ReloadPrompt.vue'

export default {
  name: 'App',
  // components: { ReloadPrompt },
  setup() {
    const route = useRoute()
    const { loadAppConfig } = useLocale()

    const layout = shallowRef<Component | null>(null)

    const resolveLayout = (layout: string | undefined): Promise<Component> => {
      const defaultLayout = 'default'

      return new Promise((resolve) => {
        resolve(layouts[layout ?? defaultLayout])
      })
    }

    const setLayout = async (layoutName: string | undefined) => {
      if (!layoutName) {
        layoutName = 'default'
      }
      layout.value = await resolveLayout(layoutName)
    }

    provide('apiBaseURL', appConfig.apiBaseURL)

    watch(route, (newRoute: typeof route) =>
      setLayout((newRoute.meta as { layout?: string }).layout)
    )

    setLayout((route.meta as { layout?: string }).layout)

    loadAppConfig()

    function beforeWindowUnload(e: unknown) {
      console.warn('Window unload event triggered', e)
    }

    onMounted(() => {
      window.addEventListener('beforeunload', beforeWindowUnload)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('beforeunload', beforeWindowUnload)
    })

    return {
      layout,
    }
  },
}
</script>
