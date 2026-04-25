import { vi } from 'vitest'
import { config } from '@vue/test-utils'

/**
 * Translation dictionary for tests
 */
const translations: Record<string, string> = {
  // Countries
  'countries.addCountry': 'Add Country',
  'countries.editCountry': 'Edit Country',
  'countries.delete': 'Delete',
  'countries.edit': 'Edit',
  'countries.refresh': 'Refresh',
  'countries.searchPlaceholder': 'Search countries...',
  'countries.showing': 'Showing',
  'countries.to': 'to',
  'countries.of': 'of',
  'countries.noResults': 'No countries found',
  'countries.table.name': 'Country Name',
  'countries.table.code': 'Code',
  'countries.table.createdAt': 'Created At',
  'countries.table.actions': 'Actions',
  'countries.form.name': 'Country Name',
  'countries.form.code': 'Country Code',
  'countries.form.codeHelper': 'ISO 3166-1 alpha-2 or alpha-3 code (e.g., US, USA)',
  'countries.form.cancel': 'Cancel',
  'countries.form.update': 'Update',
  'countries.form.create': 'Create',
  
  // Operators
  'operators.addOperator': 'Add Operator',
  'operators.editOperator': 'Edit Operator',
  'operators.delete': 'Delete',
  'operators.edit': 'Edit',
  'operators.refresh': 'Refresh',
  'operators.searchPlaceholder': 'Search operators...',
  'operators.showing': 'Showing',
  'operators.to': 'to',
  'operators.of': 'of',
  'operators.noResults': 'No operators found',
  'operators.table.name': 'Operator Name',
  'operators.table.country': 'Country',
  'operators.table.createdAt': 'Created At',
  'operators.table.actions': 'Actions',
  'operators.form.name': 'Operator Name',
  'operators.form.country': 'Country',
  'operators.form.selectCountry': 'Select Country',
  'operators.form.logo': 'Logo',
  'operators.form.logoHelper': 'Max 2MB. Supported formats: JPEG, JPG, PNG, SVG',
  'operators.form.logoPreview': 'Logo Preview',
  'operators.form.cancel': 'Cancel',
  'operators.form.update': 'Update',
  'operators.form.create': 'Create',
  
  // Common
  'common.resizeImage': 'Resize Image',
  'common.width': 'Width',
  'common.height': 'Height',
  'common.maintainAspectRatio': 'Maintain aspect ratio',
  'common.originalSize': 'Original size',
  'common.quality': 'Quality',
  'common.save': 'Save',
  'common.saveResized': 'Save Resized',
  'common.useOriginal': 'Use Original',
  'common.cancel': 'Cancel',
}

/**
 * Translation function for tests
 */
const t = (key: string, defaultValue?: string): string => {
  return translations[key] || defaultValue || key
}

/**
 * Mock i18n composable
 */
export const mockI18n = {
  t: vi.fn((key: string, defaultValue?: string): string => translations[key] || defaultValue || key),
  locale: { value: 'en' },
  availableLocales: ['en', 'fr'],
  changeLocale: vi.fn(),
  refreshLocales: vi.fn(),
}

/**
 * Configure global mocks for @vue/test-utils
 */
config.global.mocks = {
  t,
}

/**
 * Mock useI18n
 */
vi.mock('@/composables/useI18n', () => ({
  useI18n: () => mockI18n,
}))

/**
 * Mock notification utilities
 */
export const mockNotifications = {
  showSuccessMessage: vi.fn(),
  showErrorMessage: vi.fn(),
  showWarningMessage: vi.fn(),
  handleError: vi.fn(),
}

vi.mock('@/utils/notification', () => mockNotifications)

/**
 * Mock axios instance
 */
export const mockAxios = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}

vi.mock('@/plugins/axios', () => ({
  axiosInstance: mockAxios,
}))

/**
 * Mock app config
 */
vi.mock('@/config/app', () => ({
  appConfig: {
    apiUrl: 'http://localhost:8000',
    appName: 'TAMS Test',
  },
}))

/**
 * Reset all mocks
 */
export const resetAllMocks = () => {
  vi.clearAllMocks()
  mockI18n.t.mockImplementation((key: string, defaultValue?: string) => defaultValue || key)
}
