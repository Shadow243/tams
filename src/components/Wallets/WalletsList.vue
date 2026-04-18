<template>
  <div class="card">
    <div class="card-header border-light justify-content-between">
      <div class="d-flex gap-2 flex-wrap">
        <div class="app-search">
          <input
            v-model="searchQuery"
            type="search"
            class="form-control"
            :placeholder="t('wallets.searchPlaceholder') || 'Search wallets...'"
          />
          <i class="ti ti-search app-search-icon text-muted"></i>
        </div>

        <!-- Status Filter -->
        <div class="app-search">
          <select v-model="statusFilter" class="form-select form-control my-1 my-md-0">
            <option value="">{{ t('wallets.allStatuses') || 'All Statuses' }}</option>
            <option value="active">{{ t('wallets.status.active') || 'Active' }}</option>
            <option value="inactive">{{ t('wallets.status.inactive') || 'Inactive' }}</option>
          </select>
          <i class="ti ti-toggle-left app-search-icon text-muted"></i>
        </div>

        <!-- Branch Filter -->
        <div class="app-search">
          <select v-model="branchFilter" class="form-select form-control my-1 my-md-0">
            <option :value="null">{{ t('wallets.allBranches') || 'All Branches' }}</option>
            <option v-for="branch in branches" :key="branch.id" :value="branch.id">
              {{ branch.name }}
            </option>
          </select>
          <i class="ti ti-building app-search-icon text-muted"></i>
        </div>

        <!-- Operator Filter -->
        <div class="app-search">
          <select v-model="operatorFilter" class="form-select form-control my-1 my-md-0">
            <option :value="null">{{ t('wallets.allOperators') || 'All Operators' }}</option>
            <option v-for="operator in operators" :key="operator.id" :value="operator.id">
              {{ operator.name }}
            </option>
          </select>
          <i class="ti ti-device-mobile app-search-icon text-muted"></i>
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
          :title="t('wallets.refresh') || 'Refresh'"
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
                ? t('wallets.exporting') || 'Exporting...'
                : t('wallets.export') || 'Export'
            }}
          </button>
          <ul class="dropdown-menu" aria-labelledby="exportDropdown">
            <li>
              <a class="dropdown-item" href="#" @click.prevent="exportCSV">
                <i class="ti ti-file-spreadsheet me-2"></i>
                {{ t('wallets.exportCSV') || 'Export CSV' }}
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
                {{ t('wallets.exportPDF') || 'Export PDF' }}
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
            <th>{{ t('wallets.table.wallet_number') || 'Wallet Number' }}</th>
            <th>{{ t('wallets.table.branch') || 'Branch' }}</th>
            <th>{{ t('wallets.table.operator') || 'Operator' }}</th>
            <th class="text-end">{{ t('wallets.table.balance') || 'Balance' }}</th>
            <th class="text-center">{{ t('wallets.table.currency') || 'Currency' }}</th>
            <th class="text-center">{{ t('wallets.table.status') || 'Status' }}</th>
            <th class="text-center">{{ t('wallets.table.actions') || 'Actions' }}</th>
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
        <tbody v-else-if="!wallets.length">
          <tr>
            <td colspan="8" class="text-center py-5">
              <span class="text-muted">{{ t('wallets.noResults') || 'No wallets found' }}</span>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr v-for="(wallet, index) in wallets" :key="wallet.id">
            <td class="text-center">{{ index + from }}</td>
            <td>
              <span class="fw-medium">{{ wallet.wallet_number }}</span>
            </td>
            <td>{{ wallet.branch?.name || 'N/A' }}</td>
            <td>{{ wallet.operator?.name || 'N/A' }}</td>
            <td class="text-end">
              <span class="fw-semibold">{{ Number(wallet.balance).toFixed(2) }}</span>
            </td>
            <td class="text-center">
              <span class="badge bg-secondary">{{ wallet.currency?.code || 'N/A' }}</span>
            </td>
            <td class="text-center">
              <span
                :class="[
                  'badge',
                  wallet.status === 'active' ? 'badge-soft-success' : 'badge-soft-danger',
                ]"
              >
                {{ wallet.status_label }}
              </span>
            </td>
            <td class="text-center">
              <div class="dropdown">
                <button
                  class="btn btn-light btn-sm dropdown-toggle"
                  type="button"
                  :id="'dropdownMenuButton' + wallet.id"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i class="ti ti-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu" :aria-labelledby="'dropdownMenuButton' + wallet.id">
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="$emit('edit', wallet)">
                      <i class="ti ti-edit me-2 text-info"></i>
                      {{ t('wallets.edit') || 'Edit' }}
                    </a>
                  </li>
                  <li>
                    <a
                      class="dropdown-item"
                      href="#"
                      @click.prevent="$emit('toggle-status', wallet.id)"
                    >
                      <i
                        :class="[
                          'ti me-2',
                          wallet.status === 'active'
                            ? 'ti-toggle-right text-warning'
                            : 'ti-toggle-left text-success',
                        ]"
                      ></i>
                      {{
                        wallet.status === 'active'
                          ? t('wallets.deactivate') || 'Deactivate'
                          : t('wallets.activate') || 'Activate'
                      }}
                    </a>
                  </li>
                  <li><hr class="dropdown-divider" /></li>
                  <li>
                    <a
                      class="dropdown-item text-danger"
                      href="#"
                      @click.prevent="$emit('delete', wallet.id)"
                    >
                      <i class="ti ti-trash me-2"></i>
                      {{ t('wallets.delete') || 'Delete' }}
                    </a>
                  </li>
                </ul>
              </div>
            </td>
          </tr>
        </tbody>
        <!-- end table-body -->
      </table>
      <!-- end table -->
    </div>

    <!-- Pagination -->
    <div class="card-footer border-light">
      <div class="row align-items-center">
        <div class="col-sm-6">
          <div class="text-muted">
            {{ t('wallets.showing') || 'Showing' }}
            <span class="fw-semibold">{{ from }}</span>
            {{ t('wallets.to') || 'to' }}
            <span class="fw-semibold">{{ to }}</span>
            {{ t('wallets.of') || 'of' }}
            <span class="fw-semibold">{{ total }}</span>
            {{ t('wallets.wallets') || 'wallets' }}
          </div>
        </div>
        <div class="col-sm-6">
          <nav>
            <ul class="pagination pagination-sm justify-content-end mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="goToPrevious">
                  <i class="ti ti-chevron-left"></i>
                </a>
              </li>

              <li
                v-for="page in visiblePages"
                :key="page"
                class="page-item"
                :class="{ active: currentPage === page }"
              >
                <a class="page-link" href="#" @click.prevent="$emit('page-change', page)">
                  {{ page }}
                </a>
              </li>

              <li class="page-item" :class="{ disabled: currentPage === lastPage }">
                <a class="page-link" href="#" @click.prevent="goToNext">
                  <i class="ti ti-chevron-right"></i>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useUserSettings } from '@/composables/useUserSettings'
import { useBranchStore } from '@/stores/branches'
import { useOperatorStore } from '@/stores/operators'
import { storeToRefs } from 'pinia'
import debounce from 'lodash.debounce'
import { axiosInstance } from '@/plugins/axios'
import { appConfig } from '@/config/app'
import type { Wallet, Meta } from '@/types'

const { t } = useI18n()
const { getItemsPerPage } = useUserSettings()
const branchStore = useBranchStore()
const operatorStore = useOperatorStore()
const { branch_list: branches } = storeToRefs(branchStore)
const { operator_list: operators } = storeToRefs(operatorStore)

interface Props {
  wallets: Wallet[]
  meta?: Meta
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  (e: 'search', query: string): void
  (e: 'per-page-change', perPage: number): void
  (e: 'status-filter', status: string): void
  (e: 'branch-filter', branchId: number | null): void
  (e: 'operator-filter', operatorId: number | null): void
  (e: 'page-change', page: number): void
  (e: 'refresh'): void
  (e: 'edit', wallet: Wallet): void
  (e: 'delete', walletId: number): void
  (e: 'toggle-status', walletId: number): void
}>()

const searchQuery = ref('')
const perPage = ref(getItemsPerPage())
const statusFilter = ref('')
const branchFilter = ref<number | null>(null)
const operatorFilter = ref<number | null>(null)
const isExportingPDF = ref(false)

// Load branches and operators on mount
onMounted(async () => {
  if (!branches.value.length) {
    await branchStore.fetchBranches(1, '', 100)
  }
  if (!operators.value.length) {
    await operatorStore.fetchOperators(1, '', 100)
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

watch(branchFilter, (newValue) => {
  emit('branch-filter', newValue)
})

watch(operatorFilter, (newValue) => {
  emit('operator-filter', newValue)
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
    t('wallets.table.wallet_number'),
    t('wallets.table.branch'),
    t('wallets.table.operator'),
    t('wallets.table.balance'),
    t('wallets.table.currency'),
    t('wallets.table.status'),
  ]

  const rows = props.wallets.map((wallet: Wallet) => [
    wallet.wallet_number || '',
    wallet.branch?.name || '',
    wallet.operator?.name || '',
    wallet.balance?.toString() || '0',
    wallet.currency || '',
    wallet.status === 'active' ? t('wallets.status.active') : t('wallets.status.inactive'),
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
  link.setAttribute('download', `wallets_${new Date().toISOString().split('T')[0]}.csv`)
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
    if (branchFilter.value) params.branch_id = branchFilter.value
    if (operatorFilter.value) params.operator_id = operatorFilter.value

    // Call API endpoint
    const response = await axiosInstance.get(`${appConfig.apiUrl}/wallets/export/pdf`, {
      params,
      responseType: 'blob',
    })

    // Create blob and download
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `wallets_${new Date().toISOString().split('T')[0]}.pdf`)
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
</script>
