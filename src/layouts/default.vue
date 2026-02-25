<template>
  <!-- metainfo component removed - needs proper plugin configuration -->
  <!-- <metainfo>
    <template #title="{ content }">TAMS | {{ content }}</template>
  </metainfo> -->
  <div id="main-wrapper" class="wrapper">
    <TopBar v-if="user" />
    <SideBar v-if="user" />
    <div class="content-page" role="main">
      <router-view v-slot="{ Component, route }">
        <transition name="scale" mode="out-in">
          <div class="container-fluid" :key="route.name">
            <component :is="Component"></component>
          </div>
        </transition>
      </router-view>
      <Footer v-if="user" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import TopBar from './partials/TheTopBar.vue'
import SideBar from './partials/TheSidebar.vue'
import Footer from './partials/TheFooter.vue'
import { useHead } from '@vueuse/head'

import { useAuthStore } from '@/stores/auth'

useHead({
  title: 'Accueil',
  htmlAttrs: {
    lang: 'fr',
    amp: true,
  },
  link: [
    // {
    //   rel: 'stylesheet',
    //   href: '/css/bulma.min.css',
    // },
  ],
  script: [
    // {
    //   src: '/js/build.js',
    //   tagPosition: 'body', // equivalent to `to: 'body'`
    // },
  ],
})

const user = computed(() => authStore.user)

const authStore = useAuthStore()
</script>

<style>
</style>