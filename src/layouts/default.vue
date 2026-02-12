<template>
  <!-- metainfo component removed - needs proper plugin configuration -->
  <!-- <metainfo>
    <template #title="{ content }">TAMS | {{ content }}</template>
  </metainfo> -->
  <div id="main-wrapper" class="flex">
    <SideBar v-if="user" />
    <div class="page-wrapper w-full" role="main">
      <TopBar v-if="user" />
      <!-- Main Content -->
      <div class="">
        <!-- <div class="container full-container py-5"> -->
        <!-- <router-view></router-view> -->
        <router-view v-slot="{ Component, route }">
          <transition name="scale" mode="out-in">
            <div class="container full-container pl-5 pr-5" :key="route.name">
              <component :is="Component"></component>
            </div>
          </transition>
        </router-view>
        <!-- </div> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import TopBar from './partials/TheTopBar.vue'
import SideBar from './partials/TheSidebar.vue'
import { useHead } from '@vueuse/head'

import { useAuthStore } from '@/stores/auth'

useHead({
  title: 'Accueil',
  htmlAttrs: {
    lang: 'en',
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