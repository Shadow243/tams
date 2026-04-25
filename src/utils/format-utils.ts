// src/utils/format-utils.ts
import { useUserSettings } from '@/composables/useUserSettings'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/fr'
import 'dayjs/locale/en'

// Extend dayjs with plugins
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(relativeTime)

/**
 * Format a date according to user settings
 */
export function formatDate(date: Date | string | number | null | undefined, opts?: { withTime?: boolean; format?: string }): string {
  if (!date) return ''
  
  const { settings } = useUserSettings()
  const userFormat = opts?.format || settings.value.dateFormat || 'DD/MM/YYYY'
  const userTimezone = settings.value.timezone || 'Africa/Kinshasa'
  
  let d: Date
  if (typeof date === 'string' || typeof date === 'number') {
    d = new Date(date)
  } else {
    d = date
  }
  
  // Validate date
  if (isNaN(d.getTime())) return ''
  
  try {
    let day = dayjs(d).tz(userTimezone)
    let format = userFormat
    if (opts?.withTime) format += ' HH:mm:ss'
    return day.format(format)
  } catch (error) {
    console.error('Date formatting error:', error)
    // Fallback: Intl.DateTimeFormat
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: userTimezone
    }
    
    if (opts?.withTime) {
      options.hour = '2-digit'
      options.minute = '2-digit'
      options.second = '2-digit'
    }
    
    const locale = settings.value.language === 'en' ? 'en-US' : 'fr-FR'
    return new Intl.DateTimeFormat(locale, options).format(d)
  }
}

/**
 * Format a date for display (short format)
 */
export function formatDateShort(date: Date | string | number | null | undefined): string {
  return formatDate(date, { withTime: false })
}

/**
 * Format a date with time
 */
export function formatDateTime(date: Date | string | number | null | undefined): string {
  return formatDate(date, { withTime: true })
}

/**
 * Format a relative date (e.g., "2 hours ago")
 */
export function formatDateRelative(date: Date | string | number | null | undefined): string {
  if (!date) return ''
  
  const { settings } = useUserSettings()
  const locale = settings.value.language === 'en' ? 'en' : 'fr'
  
  try {
    return (dayjs(date).locale(locale) as any).fromNow()
  } catch (error) {
    return formatDate(date)
  }
}

/**
 * Format a number according to user settings (thousand separator)
 */
export function formatNumber(value: number | string | null | undefined, decimals = 0): string {
  if (value === null || value === undefined || value === '') return '0'
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numValue)) return '0'
  
  const { settings } = useUserSettings()
  const sep = settings.value.thousandSeparator || ','
  
  try {
    // Always format with en-US (comma as thousand separator, dot as decimal)
    let formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: true
    }).format(numValue)
    
    // Replace thousand separator with user's preference
    // en-US uses comma (,) for thousands, we need to replace it
    if (sep !== ',') {
      formatted = formatted.replace(/,/g, sep)
    }
    
    return formatted
  } catch (error) {
    console.error('Number formatting error:', error)
    return numValue.toFixed(decimals)
  }
}

/**
 * Format a currency value according to user settings (symbol position)
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currency?: string,
  options?: { decimals?: number; showSymbol?: boolean }
): string {
  if (amount === null || amount === undefined || amount === '') return ''
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(numAmount)) return ''
  
  const { settings } = useUserSettings()
  const position = settings.value.currencyPosition || 'before'
  const decimals = options?.decimals ?? 2
  const showSymbol = options?.showSymbol ?? true
  
  // Determine currency symbol
  const curr = currency || settings.value.transactions?.defaultCurrency || 'USD'
  const currencySymbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'CDF': 'FC',
    'XAF': 'FCFA',
    'XOF': 'FCFA',
  }
  const symbol = currencySymbols[curr] || curr
  
  // Format the number
  const formatted = formatNumber(numAmount, decimals)
  
  if (!showSymbol) return formatted
  
  // Apply symbol position
  return position === 'before' ? `${symbol} ${formatted}` : `${formatted} ${symbol}`
}

/**
 * Format a percentage
 */
export function formatPercent(value: number | string | null | undefined, decimals = 2): string {
  if (value === null || value === undefined || value === '') return '0%'
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numValue)) return '0%'
  
  return `${formatNumber(numValue, decimals)}%`
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${formatNumber(bytes / Math.pow(k, i), 2)} ${sizes[i]}`
}
