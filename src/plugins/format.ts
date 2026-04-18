// src/plugins/format.ts
import type { App } from 'vue'
import {
  formatDate,
  formatDateShort,
  formatDateTime,
  formatDateRelative,
  formatNumber,
  formatCurrency,
  formatPercent,
  formatFileSize
} from '@/utils/format-utils'

/**
 * Format plugin to make formatting utilities available globally in templates
 * Usage in templates: {{ $format.currency(1000) }}, {{ $format.date(date) }}
 */
export const formatPlugin = {
  install(app: App) {
    const format = {
      date: formatDate,
      dateShort: formatDateShort,
      dateTime: formatDateTime,
      dateRelative: formatDateRelative,
      number: formatNumber,
      currency: formatCurrency,
      percent: formatPercent,
      fileSize: formatFileSize,
    }

    // Make available via this.$format in options API
    app.config.globalProperties.$format = format

    // Make available via inject() in composition API
    app.provide('format', format)
  }
}

// Export type for TypeScript
export type FormatPlugin = {
  date: typeof formatDate
  dateShort: typeof formatDateShort
  dateTime: typeof formatDateTime
  dateRelative: typeof formatDateRelative
  number: typeof formatNumber
  currency: typeof formatCurrency
  percent: typeof formatPercent
  fileSize: typeof formatFileSize
}

// Composable for use in composition API
export function useFormat(): FormatPlugin {
  return {
    date: formatDate,
    dateShort: formatDateShort,
    dateTime: formatDateTime,
    dateRelative: formatDateRelative,
    number: formatNumber,
    currency: formatCurrency,
    percent: formatPercent,
    fileSize: formatFileSize,
  }
}
