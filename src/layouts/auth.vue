<template>
  <!-- metainfo component removed - needs proper plugin configuration -->
  <!-- <metainfo>
    <template #title="{ content }">TAMS - {{ content }}</template>
  </metainfo> -->
  <div id="main-wrapper" class="auth-box p-0 w-100">
    <router-view></router-view>
  </div>
</template>

<script setup>
import { useHead } from '@vueuse/head'
import { computed, onMounted } from 'vue'
import { useMainStore } from '@/stores/main'
import useLocale from '@/composables/locale-composable'
import { loadScript } from '@/utils/ui-utils'

useHead({
  title: 'Acceuil',
  htmlAttrs: {
    lang: 'en',
    amp: true,
  },
})

const appName = 'FUTATRANS'
const currDate = new Date()
const mainStore = useMainStore()
const copyrightDate = currDate.getFullYear()

const { locale, changeLocale, getLocaleFlag } = useLocale()

const locales = computed(() => mainStore.locales)

onMounted(() => {
  //   loadScript('/js/build.js').then(() => {
  //     if (typeof window.NioApp !== undefined && typeof window.NioApp.Slider.init === 'function') {
  //       window.NioApp.Slider.init()
  //     }
  //   })
  //   $('body').addClass('npc-crypto bg-white pg-auth')
})
</script>
<style lang="scss" scoped></style>
