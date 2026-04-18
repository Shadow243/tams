/**
 * Centralized theme management utilities
 * Handles theme application across the application
 */

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeConfig {
  theme?: ThemeMode
  monochrome?: boolean
  'sidenav-size'?: string
  [key: string]: any
}

/**
 * Get system theme preference
 */
export const getSystemTheme = (): 'light' | 'dark' => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Get saved theme configuration from sessionStorage
 */
export const getSavedThemeConfig = (): ThemeConfig => {
  try {
    const savedConfig = sessionStorage.getItem('__THEME_CONFIG__')
    if (savedConfig) {
      return JSON.parse(savedConfig)
    }
  } catch (error) {
    console.error('Failed to parse theme config:', error)
  }

  // Fallback to window config or defaults
  return (window as any).config || { theme: 'light' }
}

/**
 * Save theme configuration to sessionStorage
 */
export const saveThemeConfig = (config: ThemeConfig): void => {
  try {
    sessionStorage.setItem('__THEME_CONFIG__', JSON.stringify(config))
    // Also update window config
    ;(window as any).config = { ...(window as any).config, ...config }
  } catch (error) {
    console.error('Failed to save theme config:', error)
  }
}

/**
 * Update theme icon visibility in the UI
 */
export const updateThemeIcon = (theme: ThemeMode): void => {
  const lightIcon = document.getElementById('theme-icon-light')
  const darkIcon = document.getElementById('theme-icon-dark')
  const systemIcon = document.getElementById('theme-icon-system')

  // Hide all icons first
  lightIcon?.classList.add('d-none')
  darkIcon?.classList.add('d-none')
  systemIcon?.classList.add('d-none')

  // Show the appropriate icon
  if (theme === 'light') {
    lightIcon?.classList.remove('d-none')
  } else if (theme === 'dark') {
    darkIcon?.classList.remove('d-none')
  } else if (theme === 'system') {
    systemIcon?.classList.remove('d-none')
  }
}

/**
 * Apply theme to the document
 */
export const applyTheme = (theme: ThemeMode): void => {
  const html = document.documentElement

  // Determine the actual theme to apply
  const actualTheme = theme === 'system' ? getSystemTheme() : theme

  // Apply theme to HTML element
  html.setAttribute('data-bs-theme', actualTheme)

  // Get current config
  const config = getSavedThemeConfig()
  config.theme = theme

  // Save updated config
  saveThemeConfig(config)

  // Update icon
  updateThemeIcon(theme)

  // Update radio buttons if they exist
  const radios = document.querySelectorAll('input[name="data-bs-theme"]')
  radios.forEach((radio: any) => {
    radio.checked = radio.value === theme
  })
}

/**
 * Apply monochrome mode to the document
 */
export const applyMonochromeMode = (isMonochrome: boolean): void => {
  const html = document.documentElement

  if (isMonochrome) {
    html.classList.add('monochrome')
  } else {
    html.classList.remove('monochrome')
  }

  // Get current config
  const config = getSavedThemeConfig()
  config.monochrome = isMonochrome

  // Save updated config
  saveThemeConfig(config)
}

/**
 * Initialize theme from user settings
 * Loads theme from localStorage userSettings or falls back to sessionStorage
 */
export const initializeThemeFromSettings = (): void => {
  try {
    // Try to load from localStorage userSettings first
    const userSettings = localStorage.getItem('userSettings')
    if (userSettings) {
      const settings = JSON.parse(userSettings)
      if (settings.theme) {
        applyTheme(settings.theme)
      }
      if (settings.monochromeMode !== undefined) {
        applyMonochromeMode(settings.monochromeMode)
      }
      if (settings.textSize) {
        applyTextSize(settings.textSize)
      }
      return
    }
  } catch (error) {
    console.error('Failed to load theme from userSettings:', error)
  }

  // Fallback to sessionStorage
  const config = getSavedThemeConfig()
  if (config.theme) {
    applyTheme(config.theme)
  }
  if (config.monochrome !== undefined) {
    applyMonochromeMode(config.monochrome)
  }
  if (config.textSize) {
    applyTextSize(config.textSize)
  }
}

/**
 * Listen for system theme changes when in system mode
 */
export const watchSystemTheme = (callback: () => void): void => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  const handleChange = () => {
    const config = getSavedThemeConfig()
    if (config.theme === 'system') {
      callback()
    }
  }

  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleChange)
  } else {
    // Legacy browsers
    mediaQuery.addListener(handleChange)
  }
}

/**
 * Apply text size to the document
 */
export const applyTextSize = (textSize: 'small' | 'medium' | 'large'): void => {
  const html = document.documentElement

  // Apply text-size attribute to HTML element
  html.setAttribute('data-text-size', textSize)

  // Get current config
  const config = getSavedThemeConfig()
  config.textSize = textSize

  // Save updated config
  saveThemeConfig(config)
}
