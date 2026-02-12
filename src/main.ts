import './assets/vendor/css/custom.css'
import './assets/vendor/css/vendors.min.css'
import './assets/vendor/css/app.min.css'
import 'toastr/toastr.scss'
import 'sweetalert2/dist/sweetalert2.min.css'
import 'nprogress/nprogress.css'

// import './assets/vendor/js/config.js'
import './assets/vendor/js/vendors.js'
import './assets/vendor/js/app.js'

// Disable I18nManager from app.js since we use vue-i18n instead
if (typeof window !== 'undefined') {
  // Override I18nManager to prevent translation loading errors
  (window as any).I18nManager = class {
    async init() {
      // Do nothing - we use vue-i18n for translations
      return Promise.resolve();
    }
  };
}

import './assets/vendor/js/app.js'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@vueuse/head'



// import i18n, { mergeApiLocales } from './plugins/i18n'
import { mergeApiLocales } from '@/plugins/i18n'

import { registerGlobalMixins } from "@/mixins";
import { registerPlugins } from './plugins';

import NProgress from 'nprogress'

// Configure NProgress early, before router is imported
if (typeof document !== 'undefined') {
  NProgress.configure({
    minimum: 0.1,
    easing: 'ease',
    showSpinner: true,
  })
}



import App from './App.vue'
import router from './router'

import { vPreline } from './directives/preline'



// Application initialization
async function initApp() {
  // Load and merge locales from API
  await mergeApiLocales()

  const app = createApp(App)

  app.use(createPinia())
  registerPlugins(app)
  registerGlobalMixins(app);
//   app.use(i18n)
  app.use(router)
  const head = createHead()
  app.use(head)
  app.directive('preline', vPreline)

  app.mount('#app')
}

initApp()
