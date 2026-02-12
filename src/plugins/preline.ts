import { type App, nextTick } from 'vue'
import { HSStaticMethods } from 'preline'

export default {
  install(app: App) {
    app.mixin({
      mounted() {
        nextTick(() => {
          HSStaticMethods.autoInit()
        })
      },
    })
  },
}
