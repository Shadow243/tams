import type { Directive } from 'vue'
import { HSStaticMethods } from 'preline'

export const vPreline: Directive = {
  mounted() {
    HSStaticMethods.autoInit()
  },
  updated() {
    HSStaticMethods.autoInit()
  },
}
