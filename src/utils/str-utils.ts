import _isEmpty from 'lodash/isEmpty'

let UUID = 1

/**
 * Capitalizes the first letter of a string
 */
export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Returns a unique incremental ID number
 */
export function getUniqueID(): number {
  UUID++
  return UUID
}

/**
 * Converts a string to lowercase
 */
export const strtolower = (str: string): string => str.toLowerCase()

/**
 * Checks if a string or value is empty (uses lodash)
 */
export const isEmpty = (value: string): boolean => _isEmpty(value)

/**
 * Truncates a number to a specified number of decimal digits without rounding
 */
export const number_format = (val: number, digits = 2): number => {
  return Math.trunc(val * Math.pow(10, digits)) / Math.pow(10, digits)
}

/**
 * Converts a string into a URL-safe slug
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .normalize('NFD') // Remove accents
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
}