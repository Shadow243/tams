// src/utils/format-utils.ts
import { useUserSettings } from '@/composables/useUserSettings'

/**
 * Format a date according to user settings
 */
export function formatDate(date: Date | string | number, opts?: { withTime?: boolean }) {
  const { settings } = useUserSettings()
  const userFormat = settings.value.dateFormat || 'DD/MM/YYYY'
  const userTimezone = settings.value.timezone || 'Africa/Kinshasa'
  let d: Date
  if (typeof date === 'string' || typeof date === 'number') {
    d = new Date(date)
  } else {
    d = date
  }
  // Use dayjs if available, fallback to Intl
  try {
    // @ts-ignore
    if (window.dayjs) {
      // @ts-ignore
      let day = window.dayjs(d).tz(userTimezone)
      let format = userFormat
      if (opts?.withTime) format += ' HH:mm'
      return day.format(format)
    }
  } catch {}
  // Fallback: Intl.DateTimeFormat
  const options: Intl.DateTimeFormatOptions = {}
  if (userFormat === 'DD/MM/YYYY') {
    options.day = '2-digit'; options.month = '2-digit'; options.year = 'numeric'
  } else if (userFormat === 'MM/DD/YYYY') {
    options.month = '2-digit'; options.day = '2-digit'; options.year = 'numeric'
  } else if (userFormat === 'YYYY-MM-DD') {
    options.year = 'numeric'; options.month = '2-digit'; options.day = '2-digit'
  }
  if (opts?.withTime) {
    options.hour = '2-digit'; options.minute = '2-digit'
  }
  // Timezone not handled by Intl in all browsers
  return new Intl.DateTimeFormat(settings.value.language || 'fr', options).format(d)
}

/**
 * Format a number according to user settings (thousand separator)
 */
export function formatNumber(value: number) {
  const { settings } = useUserSettings()
  const sep = settings.value.thousandSeparator || ','
  // Use Intl.NumberFormat with custom separator if possible
  let locale = settings.value.language === 'en' ? 'en-US' : 'fr-FR'
  let formatted = new Intl.NumberFormat(locale).format(value)
  if (sep !== ',' && sep !== '.') {
    formatted = formatted.replace(/\,|\./g, sep)
  } else if (sep === '.') {
    formatted = formatted.replace(/,/g, '.')
  }
  return formatted
}

/**
 * Format a currency value according to user settings (symbol position)
 */
export function formatCurrency(amount: number, currency = 'USD') {
  const { settings } = useUserSettings()
  const position = settings.value.currencyPosition || 'before'
  const locale = settings.value.language === 'en' ? 'en-US' : 'fr-FR'
  const symbol = currency === 'USD' ? '$' : (currency === 'EUR' ? '€' : currency)
  const formatted = formatNumber(amount)
  return position === 'before' ? `${symbol} ${formatted}` : `${formatted} ${symbol}`
}
