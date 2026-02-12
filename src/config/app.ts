// src/config/app.ts
import { env } from '@/utils/env'

export const appConfig = {
  appName: env('VITE_APP_NAME'),
  appUrl: env('VITE_APP_URL'),
  apiUrl: env('VITE_APP_API_URL') + '/api/' + env('VITE_API_VERSION'),
  apiBaseURL: env('VITE_APP_API_URL'),
  apiVersion: env('VITE_API_VERSION'),
  apiPaginationLimit: env('VITE_API_PAGINATION_LIMIT'),
}

// export const appName = appConfig.appName

export const isDevMode = import.meta.env.DEV
export const isProductionMode = import.meta.env.PROD