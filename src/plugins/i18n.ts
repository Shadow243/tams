// src/plugins/i18n.ts
import { createI18n } from 'vue-i18n'
import fr from '@/locales/fr-FR.json'
import en from '@/locales/en-US.json'

// Message type
export type MessageSchema = typeof fr

// Storage key
const STORAGE_KEY = 'app-locale'
const savedLocale = (localStorage.getItem(STORAGE_KEY) || 'fr-FR') as 'fr-FR' | 'en-US'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:8000'
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1'

// Deep merge utility
function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const output = { ...target }
  for (const key in source) {
    if (source[key] instanceof Object && key in target && !(source[key] instanceof Array)) {
      output[key] = deepMerge(target[key], source[key] as any)
    } else {
      output[key] = source[key] as any
    }
  }
  return output
}

// Translation messages (initial)
const messages = { 'fr-FR': fr, 'en-US': en }

// Locale code mapping (API -> Internal)
const localeMapping: Record<string, 'fr-FR' | 'en-US'> = {
  'fr': 'fr-FR',
  'en': 'en-US',
}

// Create i18n instance with strong typing
export const i18n = createI18n<[MessageSchema], 'fr-FR' | 'en-US'>({
  legacy: false, // Composition API mode
  locale: savedLocale,
  fallbackLocale: 'en-US',
  messages,
  globalInjection: true, // Allows using $t in templates
})

/**
 * Load available locales from API
 */
export async function loadAvailableLocales(): Promise<Record<string, string>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/locales`)
    if (!response.ok) {
      console.warn('Failed to load available locales from API:', response.statusText)
      return {}
    }
    const locales = await response.json()
    return locales
  } catch (error) {
    console.error('Error loading available locales from API:', error)
    return {}
  }
}

/**
 * Load translations for a specific locale from API
 */
export async function loadLocaleTranslations(locale: string): Promise<MessageSchema | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/translations/${locale}`)
    if (!response.ok) {
      console.warn(`Failed to load translations for locale ${locale}:`, response.statusText)
      return null
    }
    const translations = await response.json()
    return translations
  } catch (error) {
    console.error(`Error loading translations for locale ${locale}:`, error)
    return null
  }
}

/**
 * Load locales from API (deprecated - kept for backward compatibility)
 */
export async function loadApiLocales(): Promise<Record<string, MessageSchema>> {
  try {
    const availableLocales = await loadAvailableLocales()
    const localeTranslations: Record<string, MessageSchema> = {}
    
    // Load translations for each available locale
    for (const localeCode in availableLocales) {
      const translations = await loadLocaleTranslations(localeCode)
      if (translations) {
        localeTranslations[localeCode] = translations
      }
    }
    
    return localeTranslations
  } catch (error) {
    console.error('Error loading API locales:', error)
    return {}
  }
}

/**
 * Merge API locales with local locales
 */
export async function mergeApiLocales(): Promise<void> {
  try {
    const availableLocales = await loadAvailableLocales()
    
    // Load and merge translations for each available locale
    for (const apiLocaleCode in availableLocales) {
      // Map API locale code to internal locale code
      const internalLocaleCode = localeMapping[apiLocaleCode] || apiLocaleCode
      
      // Load translations from API
      const apiTranslations = await loadLocaleTranslations(apiLocaleCode)
      
      if (apiTranslations) {
        // Get current messages
        const currentMessages = i18n.global.messages.value[internalLocaleCode] as MessageSchema
        
        if (currentMessages) {
          // Merge API translations with local translations
          const merged = deepMerge(currentMessages, apiTranslations)
          i18n.global.setLocaleMessage(internalLocaleCode, merged)
        } else {
          // Add new locale if not present locally
          i18n.global.setLocaleMessage(internalLocaleCode, apiTranslations)
        }
      }
    }
    
    console.log('API locales merged successfully')
  } catch (error) {
    console.error('Error merging API locales:', error)
  }
}

/**
 * Helper function to change locale
 */
export function changeLocale(locale: 'fr-FR' | 'en-US') {
  i18n.global.locale.value = locale
  localStorage.setItem(STORAGE_KEY, locale)
}

// Default export for installation
export default i18n