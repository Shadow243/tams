<template>
  <div class="card">
    <div class="card-header border-light justify-content-between">
      <div class="d-flex gap-2 flex-wrap">
        <div class="app-search">
          <input
            v-model="searchQuery"
            type="search"
            class="form-control"
            :placeholder="t('branches.searchPlaceholder') || 'Search branches...'"
          />
          <i class="ti ti-search app-search-icon text-muted"></i>
        </div>

        <!-- Status Filter -->
        <div class="app-search">
          <select v-model="statusFilter" class="form-select form-control my-1 my-md-0">
            <option value="">{{ t('branches.allStatuses') || 'All Statuses' }}</option>
            <option value="active">{{ t('branches.status.active') || 'Active' }}</option>
            <option value="inactive">{{ t('branches.status.inactive') || 'Inactive' }}</option>
          </select>
          <i class="ti ti-toggle-left app-search-icon text-muted"></i>
        </div>

        <!-- Country Filter -->
        <div class="app-search">
          <select v-model="countryFilter" class="form-select form-control my-1 my-md-0">
            <option :value="null">{{ t('branches.allCountries') || 'All Countries' }}</option>
            <option v-for="country in countries" :key="country.id" :value="country.id">
              {{ country.name }}
            </option>
          </select>
          <i class="ti ti-world app-search-icon text-muted"></i>
        </div>
      </div>

      <div class="d-flex align-items-center gap-2">
        <!-- Records Per Page -->
        <div>
          <select v-model="perPage" class="form-select form-control my-1 my-md-0">
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>

        <button
          type="button"
          @click="refreshTable"
          class="btn btn-primary"
          :title="t('branches.refresh') || 'Refresh'"
        >
          <i class="ti ti-refresh"></i>
        </button>

        <!-- Export Dropdown -->
        <div class="dropdown">
          <button
            class="btn btn-success dropdown-toggle"
            type="button"
            id="exportDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            :disabled="isExportingPDF"
          >
            <span v-if="isExportingPDF" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="ti ti-download me-1"></i>
            {{
              isExportingPDF
                ? t('branches.exporting') || 'Exporting...'
                : t('branches.export') || 'Export'
            }}
          </button>
          <ul class="dropdown-menu" aria-labelledby="exportDropdown">
            <li>
              <a class="dropdown-item" href="#" @click.prevent="exportCSV">
                <i class="ti ti-file-spreadsheet me-2"></i>
                {{ t('branches.exportCSV') || 'Export CSV' }}
              </a>
            </li>
            <li>
              <a
                class="dropdown-item"
                href="#"
                @click.prevent="exportPDF"
                :class="{ disabled: isExportingPDF }"
              >
                <span v-if="isExportingPDF" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="ti ti-file-type-pdf me-2"></i>
                {{ t('branches.exportPDF') || 'Export PDF' }}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-custom table-centered table-hover w-100 mb-0">
        <thead class="bg-light bg-opacity-25 thead-sm">
          <tr class="text-uppercase fs-xxs">
            <th class="text-center" style="width: 5%">#</th>
            <th>{{ t('branches.table.name') || 'Branch' }}</th>
            <th>{{ t('branches.table.country') || 'Country' }}</th>
            <th>{{ t('branches.table.address') || 'Address' }}</th>
            <th class="text-end">{{ t('branches.table.cashBalance') || 'Cash Balance' }}</th>
            <th class="text-center">{{ t('branches.table.status') || 'Status' }}</th>
            <th class="text-center">{{ t('branches.table.createdAt') || 'Created At' }}</th>
            <th class="text-center">{{ t('branches.table.actions') || 'Actions' }}</th>
          </tr>
        </thead>
        <!-- end table-head -->
        <tbody v-if="loading">
          <tr>
            <td colspan="8" class="text-center py-5">
              <div class="d-flex justify-content-center align-items-center">
                <div
                  class="spinner-border text-primary"
                  role="status"
                  style="width: 3rem; height: 3rem"
                >
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
        <tbody v-else-if="!branches.length">
          <tr>
            <td colspan="8" class="text-center py-5">
              <span class="text-muted">{{ t('branches.noResults') || 'No branches found' }}</span>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr v-for="(branch, index) in branches" :key="branch.id">
            <Branch
              :branch="branch"
              :index="index + from - 1"
              @edit="handleEdit"
              @delete="handleDelete"
              @toggle-status="handleToggleStatus"
              @manage-balances="handleManageBalances"
            />
          </tr>
        </tbody>
        <!-- end table-body -->
      </table>
      <!-- end table -->
    </div>
    <div class="card-footer border-0">
      <div class="d-flex justify-content-between align-items-center">
        <div class="text-muted">
          {{ t('branches.showing') || 'Showing' }} <span class="fw-semibold">{{ from }}</span>
          {{ t('branches.to') || 'to' }} <span class="fw-semibold">{{ to }}</span>
          {{ t('branches.of') || 'of' }} <span class="fw-semibold">{{ total }}</span>
          {{ t('branches.branches') || 'branches' }}
        </div>
        <div>
          <ul class="pagination pagination-sm pagination-boxed mb-0 justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a href="#" class="page-link" @click.prevent="goToPrevious"
                ><svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M15 6l-6 6l6 6"></path></svg
              ></a>
            </li>
            <li
              v-for="page in visiblePages"
              :key="page"
              class="page-item"
              :class="{ active: page === currentPage }"
            >
              <a href="#" class="page-link" @click.prevent="emit('page-change', page)">{{
                page
              }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === lastPage }">
              <a href="#" class="page-link" @click.prevent="goToNext"
                ><svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M9 6l6 6l-6 6"></path></svg
              ></a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, onMounted, type PropType } from 'vue'
import debounce from 'lodash.debounce'
import type { BranchesResponse, BranchList, Branch as BranchType, CountryList } from '@/types'
import { useI18n } from '@/composables/useI18n'
import { useUserSettings } from '@/composables/useUserSettings'
import { useCountryStore } from '@/stores/countries'
import { storeToRefs } from 'pinia'
import Branch from '@/components/Branches/Branch.vue'
import { axiosInstance } from '@/plugins/axios'
import { appConfig } from '@/config/app'

const { t } = useI18n()
const { getItemsPerPage } = useUserSettings()
const countryStore = useCountryStore()
const { country_list: countries } = storeToRefs(countryStore)

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'search', query: string): void
  (e: 'refresh'): void
  (e: 'per-page-change', perPage: number): void
  (e: 'status-filter', status: string): void
  (e: 'country-filter', countryId: number | null): void
  (e: 'edit', branch: BranchType): void
  (e: 'delete', branchId: number): void
  (e: 'toggle-status', branchId: number): void
  (e: 'manage-balances', branch: BranchType): void
}>()

const props = defineProps({
  branches: {
    type: Array as PropType<BranchList>,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  meta: {
    type: Object as PropType<BranchesResponse['meta']>,
    required: true,
  },
})

const searchQuery = ref('')
const perPage = ref(getItemsPerPage())
const statusFilter = ref('')
const countryFilter = ref<number | null>(null)
const isExportingPDF = ref(false)

// Load countries on mount
onMounted(async () => {
  if (!countries.value.length) {
    await countryStore.fetchCountries(1, '', 100)
  }
})

const from = computed(() => props.meta?.from ?? 0)
const to = computed(() => props.meta?.to ?? 0)
const total = computed(() => props.meta?.total ?? 0)
const currentPage = computed(() => props.meta?.current_page ?? 1)
const lastPage = computed(() => props.meta?.last_page ?? 1)

// Compute visible pages for pagination
const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(lastPage.value, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

const debouncedSearch = debounce((query: string) => {
  emit('search', query)
}, 500)

watch(searchQuery, (newValue) => {
  debouncedSearch(newValue)
})

watch(perPage, (newValue) => {
  emit('per-page-change', newValue)
})

watch(statusFilter, (newValue) => {
  emit('status-filter', newValue)
})

watch(countryFilter, (newValue) => {
  emit('country-filter', newValue)
})

const goToPrevious = () => {
  if (currentPage.value > 1) {
    emit('page-change', currentPage.value - 1)
  }
}

const goToNext = () => {
  if (currentPage.value < lastPage.value) {
    emit('page-change', currentPage.value + 1)
  }
}

const refreshTable = () => {
  emit('refresh')
}

// Export to CSV
const exportCSV = () => {
  // Prepare data for CSV
  const headers = [
    t('branches.table.code'),
    t('branches.table.name'),
    t('branches.table.country'),
    t('branches.table.address'),
    t('branches.table.cash_balance'),
    t('branches.table.status'),
  ]

  const rows = props.branches.map((branch: BranchType) => [
    branch.code || '',
    branch.name || '',
    branch.country?.name || '',
    branch.address || '',
    branch.cash_balance?.toString() || '0',
    branch.status === 'active' ? t('branches.status.active') : t('branches.status.inactive'),
  ])

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `branches_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Export to PDF via API
const exportPDF = async () => {
  if (isExportingPDF.value) return

  try {
    isExportingPDF.value = true

    // Build query parameters based on current filters
    const params: any = {}
    if (searchQuery.value) params.search = searchQuery.value
    if (statusFilter.value) params.status = statusFilter.value
    if (countryFilter.value) params.country_id = countryFilter.value

    // Call API endpoint
    const response = await axiosInstance.get(`${appConfig.apiUrl}/branches/export/pdf`, {
      params,
      responseType: 'blob',
    })

    // Create blob and download
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `branches_${new Date().toISOString().split('T')[0]}.pdf`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('PDF export error:', error)
    alert("Erreur lors de l'export PDF")
  } finally {
    isExportingPDF.value = false
  }
}

const handleEdit = (branch: BranchType) => {
  emit('edit', branch)
}

const handleDelete = (branchId: number) => {
  emit('delete', branchId)
}

const handleToggleStatus = (branchId: number) => {
  emit('toggle-status', branchId)
}

const handleManageBalances = (branch: BranchType) => {
  emit('manage-balances', branch)
}
</script>
