// src/composables/useI18n.ts
import { useI18n as useVueI18n } from 'vue-i18n'
import { changeLocale, mergeApiLocales } from '@/plugins/i18n'
import type { MessageSchema } from '@/plugins/i18n'

/**
 * Internationalization composable
 * Modern wrapper around vue-i18n with strong TypeScript typing
 */
export function useI18n() {
  const { t, locale, availableLocales } = useVueI18n<{ message: MessageSchema }>()

  return {
    t, // Translation function
    locale, // Current locale (reactive)
    availableLocales, // Available locales
    changeLocale, // Function to change locale
    refreshLocales: mergeApiLocales, // Function to reload locales from API
  }
}