import './assets/vendor/css/custom.css'
import './assets/vendor/css/vendors.min.css'
import './assets/vendor/css/app.min.css'
import 'toastr/toastr.scss'
import 'sweetalert2/dist/sweetalert2.min.css'
import 'nprogress/nprogress.css'

// import './assets/vendor/js/config.js'
import './assets/vendor/js/vendors.js'
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
  // Try to merge API locales but don't block app startup on failure
  mergeApiLocales().catch(() => {
    // API may not be available — local JSON translations are already loaded
  })

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
