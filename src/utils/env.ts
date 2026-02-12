// src/utils/env.ts
export function env(key: string, defaultValue?: string): string {
  const value = import.meta.env[key] || defaultValue
  if (value === undefined) {
    throw new Error(`Missing environment variable: ${key}`)
  }
  return value
}
export function isProduction(): boolean {
  return import.meta.env.MODE === 'production'
}