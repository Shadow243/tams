/**
 * User Settings Composable
 * Provides access to user settings stored in localStorage
 */

import { ref, watch, computed } from 'vue'

interface UserSettings {
  theme?: string
  itemsPerPage?: number
  textSize?: string
  monochromeMode?: boolean
  language?: string
  timezone?: string
  dateFormat?: string
  currencyPosition?: string
  thousandSeparator?: string
  notifications?: {
    email?: {
      transactions?: boolean
      validations?: boolean
      reports?: boolean
    }
    push?: {
      transactions?: boolean
      validations?: boolean
    }
    alertLargeTransactions?: boolean
    alertThreshold?: number
  }
  security?: {
    twoFactorAuth?: boolean
    autoLockMinutes?: number
    requirePasswordForSensitive?: boolean
  }
  transactions?: {
    defaultCurrency?: string
    defaultBranchId?: number | null
    autoPrintReceipt?: boolean
    receiptFormat?: string
    receiptLanguage?: string
  }
}

// Default settings
const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  itemsPerPage: 25,
  textSize: 'medium',
  monochromeMode: false,
  language: 'fr',
}

/**
 * Get user settings from localStorage
 */
function getUserSettings(): UserSettings {
  try {
    const settingsStr = localStorage.getItem('userSettings')
    if (settingsStr) {
      const settings = JSON.parse(settingsStr)
      return { ...DEFAULT_SETTINGS, ...settings }
    }
  } catch (error) {
    console.error('Failed to load user settings:', error)
  }
  return DEFAULT_SETTINGS
}

/**
 * Save user settings to localStorage
 */
function saveUserSettings(settings: UserSettings): void {
  try {
    localStorage.setItem('userSettings', JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save user settings:', error)
  }
}

// Module-level singleton — shared across all useUserSettings() calls in the same tab
const _sharedSettings = ref<UserSettings>(getUserSettings())

function _refreshSharedSettings() {
  _sharedSettings.value = getUserSettings()
}

if (typeof window !== 'undefined') {
  // Cross-tab sync via storage event
  window.addEventListener('storage', (event: StorageEvent) => {
    if (event.key === 'userSettings') _refreshSharedSettings()
  })
  // Same-tab sync via custom event dispatched after manual localStorage writes
  window.addEventListener('userSettingsUpdated', _refreshSharedSettings)
}

/**
 * Composable to access user settings
 */
export function useUserSettings() {
  const settings = _sharedSettings

  // Create reactive computed refs for each setting
  const itemsPerPage = computed(() => settings.value.itemsPerPage || DEFAULT_SETTINGS.itemsPerPage || 25)
  const theme = computed(() => settings.value.theme || DEFAULT_SETTINGS.theme || 'light')
  const textSize = computed(() => settings.value.textSize || DEFAULT_SETTINGS.textSize || 'medium')
  const language = computed(() => settings.value.language || DEFAULT_SETTINGS.language || 'fr')

  // Get items per page setting
  const getItemsPerPage = (): number => {
    return settings.value.itemsPerPage || DEFAULT_SETTINGS.itemsPerPage || 25
  }

  // Get theme setting
  const getTheme = (): string => {
    return settings.value.theme || DEFAULT_SETTINGS.theme || 'light'
  }

  // Get text size setting
  const getTextSize = (): string => {
    return settings.value.textSize || DEFAULT_SETTINGS.textSize || 'medium'
  }

  // Get language setting
  const getLanguage = (): string => {
    return settings.value.language || DEFAULT_SETTINGS.language || 'fr'
  }

  // Update a specific setting
  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]): void => {
    settings.value = { ...settings.value, [key]: value }
    saveUserSettings(settings.value)
  }

  // Refresh settings from localStorage
  const refreshSettings = (): void => {
    settings.value = getUserSettings()
  }

  return {
    settings,
    itemsPerPage, // Reactive computed ref
    theme, // Reactive computed ref
    textSize, // Reactive computed ref
    language, // Reactive computed ref
    getItemsPerPage, // Legacy function
    getTheme,
    getTextSize,
    getLanguage,
    updateSetting,
    refreshSettings,
  }
}
