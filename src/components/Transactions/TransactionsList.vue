<template>
  <div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="card-title mb-0">{{ t('transactions.page_title') || 'Transactions' }}</h5>
      <div class="d-flex gap-2">
        <!-- Refresh Button -->
        <button type="button" @click="refreshTable" class="btn btn-primary" title="Refresh">
          <i class="ti ti-refresh"></i>
        </button>

        <!-- Export Dropdown -->
        <div class="dropdown">
          <button
            class="btn btn-outline-success dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            :disabled="isExportingPDF"
          >
            <span v-if="isExportingPDF" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="ti ti-download me-1"></i>
            {{
              isExportingPDF
                ? t('transactions.exporting') || 'Export...'
                : t('transactions.export') || 'Export'
            }}
          </button>
          <ul class="dropdown-menu">
            <li>
              <a class="dropdown-item" href="#" @click.prevent="exportCSV">
                <i class="ti ti-file-type-csv me-2"></i>
                CSV
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
                PDF
              </a>
            </li>
          </ul>
        </div>

        <!-- Add Button -->
        <!-- <button class="btn btn-primary" @click="$emit('add')">
          <i class="ti ti-plus me-1"></i>
          {{ t('transactions.add_transaction') || 'Nouvelle transaction' }}
        </button> -->
      </div>
    </div>

    <div class="card-body">
      <!-- Filters -->
      <div class="row g-3 mb-3">
        <!-- Search -->
        <div class="col-md-3">
          <div class="app-search">
            <i class="ti ti-search"></i>
            <input
              type="text"
              class="form-control"
              :placeholder="t('transactions.search_placeholder') || 'Rechercher...'"
              v-model="searchQuery"
              @input="debouncedSearch"
            />
          </div>
        </div>

        <!-- Transaction Type Filter -->
        <div class="col-md-2">
          <div class="input-group">
            <span class="input-group-text">
              <i class="ti ti-category"></i>
            </span>
            <select
              class="form-select"
              v-model.number="transactionTypeId"
              @change="handleFilterChange"
            >
              <option :value="null">{{ t('transactions.all_types') || 'Tous les types' }}</option>
              <option v-for="type in transactionTypes" :key="type.id" :value="type.id">
                {{ type.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Status Filter -->
        <div class="col-md-2">
          <div class="input-group">
            <span class="input-group-text">
              <i class="ti ti-circle-check"></i>
            </span>
            <select class="form-select" v-model="status" @change="handleFilterChange">
              <option value="">{{ t('transactions.all_status') || 'Tous les statuts' }}</option>
              <option value="pending">{{ t('transactions.pending') || 'En attente' }}</option>
              <option value="available">{{ t('transactions.available') || 'Disponible' }}</option>
              <option value="completed">{{ t('transactions.completed') || 'Complétée' }}</option>
              <option value="cancelled">{{ t('transactions.cancelled') || 'Annulée' }}</option>
              <option value="failed">{{ t('transactions.failed') || 'Échouée' }}</option>
              <option value="expired">{{ t('transactions.expired') || 'Expirée' }}</option>
            </select>
          </div>
        </div>

        <!-- Date Range -->
        <div class="col-md-3">
          <div class="input-group">
            <span class="input-group-text">
              <i class="ti ti-calendar"></i>
            </span>
            <input
              type="date"
              class="form-control"
              v-model="startDate"
              @change="handleFilterChange"
              :placeholder="t('transactions.start_date') || 'Date début'"
            />
            <input
              type="date"
              class="form-control"
              v-model="endDate"
              @change="handleFilterChange"
              :placeholder="t('transactions.end_date') || 'Date fin'"
            />
          </div>
        </div>

        <!-- Per Page -->
        <div class="col-md-2">
          <div class="input-group">
            <span class="input-group-text">
              <i class="ti ti-list-numbers"></i>
            </span>
            <select class="form-select" v-model.number="perPage" @change="handlePerPageChange">
              <option :value="10">10 {{ t('transactions.per_page') || 'par page' }}</option>
              <option :value="15">15 {{ t('transactions.per_page') || 'par page' }}</option>
              <option :value="25">25 {{ t('transactions.per_page') || 'par page' }}</option>
              <option :value="50">50 {{ t('transactions.per_page') || 'par page' }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead>
            <tr>
              <th width="3%">#</th>
              <th width="10%">{{ t('transactions.table.reference') || 'Référence' }}</th>
              <th width="12%">{{ t('transactions.table.type') || 'Type' }}</th>
              <th width="10%">{{ t('transactions.table.customer') || 'Client' }}</th>
              <th width="10%">{{ t('transactions.table.amounts') || 'Montants' }}</th>
              <th width="6%">{{ t('transactions.table.currency') || 'Devise' }}</th>
              <th width="8%">{{ t('transactions.table.fees') || 'Frais' }}</th>
              <th width="8%" class="text-center">
                {{ t('transactions.table.status') || 'Statut' }}
              </th>
              <th width="10%">{{ t('transactions.table.date') || 'Date' }}</th>
              <th width="12%" class="text-center">
                {{ t('transactions.table.actions') || 'Actions' }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="9" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="transactions.length === 0">
              <td colspan="9" class="text-center py-4">
                {{ t('transactions.no_records') || 'Aucune transaction trouvée' }}
              </td>
            </tr>
            <tr v-else v-for="(transaction, index) in transactions" :key="transaction.id">
              <td>{{ getItemNumber(index) }}</td>
              <td>
                <div class="text-truncate">
                  <strong>{{ transaction.reference }}</strong>
                  <small v-if="transaction.withdrawal_code" class="text-muted d-block">
                    Code: {{ transaction.withdrawal_code }}
                  </small>
                </div>
              </td>
              <td>
                <div class="text-truncate">
                  <small class="text-muted d-block">{{ transaction.transaction_type?.code }}</small>
                  {{ transaction.transaction_type?.name }}
                </div>
              </td>
              <td>
                <div v-if="transaction.customer">
                  {{ transaction.customer.full_name }}
                  <small class="text-muted d-block">{{ transaction.customer.phone }}</small>
                </div>
                <div v-else-if="transaction.customer_phone">
                  <small class="text-muted">{{ transaction.customer_phone }}</small>
                </div>
                <span v-else class="text-muted">-</span>
              </td>
              <td>
                <div class="text-sm">
                  <div>
                    <strong>{{ formatCurrency(transaction.gross_amount, transaction) }}</strong>
                  </div>
                  <small class="text-muted"
                    >Net: {{ formatCurrency(transaction.net_amount, transaction) }}</small
                  >
                </div>
              </td>
              <td>
                <span class="badge bg-primary">
                  {{
                    transaction.currency?.name
                      ? transaction.currency.name + ' (' + transaction.currency.code + ')'
                      : transaction.currency_code || 'CDF'
                  }}
                </span>
              </td>
              <td>
                <span class="badge" :class="`bg-${getFeeModeBadge(transaction.fee_mode_applied)}`">
                  {{ formatCurrency(transaction.fee_amount, transaction) }}
                </span>
                <small class="text-muted d-block">{{ transaction.fee_mode_applied_label }}</small>
              </td>
              <td class="text-center">
                <span class="badge" :class="`bg-${transaction.status_color}`">
                  {{ transaction.status_label }}
                </span>
                <div v-if="transaction.is_expired" class="mt-1">
                  <i
                    class="ti ti-alert-triangle text-warning"
                    :title="t('transactions.expired') || 'Expiré'"
                  ></i>
                </div>
              </td>
              <td>
                <div class="text-sm">
                  {{ formatDate(transaction.created_at) }}
                  <small class="text-muted d-block">{{ transaction.user?.name }}</small>
                </div>
              </td>
              <td class="text-center">
                <div class="btn-group" role="group">
                  <button
                    type="button"
                    class="btn btn-sm btn-info"
                    @click.prevent.stop="handleView(transaction)"
                    :title="t('transactions.view') || 'Voir'"
                  >
                    <i class="ti ti-eye"></i>
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm btn-primary"
                    @click.prevent.stop="handleEdit(transaction)"
                    :disabled="!transaction.can_be_modified"
                    :title="t('transactions.edit') || 'Modifier'"
                  >
                    <i class="ti ti-edit"></i>
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm btn-success"
                    v-if="transaction.status === 'pending' || transaction.status === 'available'"
                    @click.prevent.stop="handleComplete(transaction.id || transaction.uuid)"
                    :title="t('transactions.complete') || 'Compléter'"
                  >
                    <i class="ti ti-check"></i>
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm btn-warning"
                    v-if="transaction.can_be_cancelled"
                    @click.prevent.stop="handleCancel(transaction.id || transaction.uuid)"
                    :title="t('transactions.cancel') || 'Annuler'"
                  >
                    <i class="ti ti-x"></i>
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm btn-danger"
                    @click.prevent.stop="handleDelete(transaction.id || transaction.uuid)"
                    :disabled="!transaction.can_be_cancelled"
                    :title="t('transactions.delete') || 'Supprimer'"
                  >
                    <i class="ti ti-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="meta && meta.last_page > 1"
        class="d-flex justify-content-between align-items-center mt-3"
      >
        <div class="text-muted">
          {{ t('transactions.showing') || 'Affichage' }} {{ meta.from }} - {{ meta.to }}
          {{ t('transactions.of') || 'sur' }} {{ meta.total }}
          {{ t('transactions.entries') || 'entrées' }}
        </div>
        <nav>
          <ul class="pagination mb-0">
            <li class="page-item" :class="{ disabled: meta.current_page === 1 }">
              <a class="page-link" href="#" @click.prevent="changePage(meta.current_page - 1)">
                <i class="ti ti-chevron-left"></i>
              </a>
            </li>
            <li
              v-for="page in visiblePages"
              :key="page"
              class="page-item"
              :class="{ active: page === meta.current_page }"
            >
              <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: meta.current_page === meta.last_page }">
              <a class="page-link" href="#" @click.prevent="changePage(meta.current_page + 1)">
                <i class="ti ti-chevron-right"></i>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { axiosInstance } from '@/plugins/axios'
import { appConfig } from '@/config/app'
import type { Transaction, Meta } from '@/types'

const { t } = useI18n()

interface Props {
  transactions: Transaction[]
  meta: Meta | null
  loading?: boolean
  transactionTypes?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  transactionTypes: () => [],
})

const emit = defineEmits<{
  add: []
  edit: [transaction: Transaction]
  view: [transaction: Transaction]
  delete: [id: string]
  cancel: [id: string]
  complete: [id: string]
  'show-statistics': []
  search: [query: string]
  'filter-change': [filters: any]
  'page-change': [page: number]
  refresh: []
}>()

// Debug: Watch transactions to verify data structure
watch(
  () => props.transactions,
  (newTransactions) => {
    if (newTransactions.length > 0) {
      console.log('✅ Sample transaction from API:', newTransactions[0])
      console.log('✅ Transaction ID:', newTransactions[0].id)
      console.log('✅ Transaction UUID:', newTransactions[0].uuid)
    }
  },
  { immediate: true }
)

// Filters
const searchQuery = ref('')
const transactionTypeId = ref<number | null>(null)
const status = ref('')
const startDate = ref('')
const endDate = ref('')
const perPage = ref(15)
const isExportingPDF = ref(false)

let searchTimeout: ReturnType<typeof setTimeout>

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    emit('search', searchQuery.value)
  }, 500)
}

const handleFilterChange = () => {
  emit('filter-change', {
    transaction_type_id: transactionTypeId.value,
    status: status.value,
    start_date: startDate.value,
    end_date: endDate.value,
  })
}

const handlePerPageChange = () => {
  emit('filter-change', { per_page: perPage.value })
}

const refreshTable = () => {
  emit('refresh')
}

const changePage = (page: number) => {
  if (props.meta && page >= 1 && page <= props.meta.last_page) {
    emit('page-change', page)
  }
}

const visiblePages = computed(() => {
  if (!props.meta) return []
  const current = props.meta.current_page
  const last = props.meta.last_page
  const delta = 2
  const range = []
  const rangeWithDots = []

  for (let i = Math.max(2, current - delta); i <= Math.min(last - 1, current + delta); i++) {
    range.push(i)
  }

  if (current - delta > 2) {
    rangeWithDots.push(1, '...')
  } else {
    rangeWithDots.push(1)
  }

  rangeWithDots.push(...range)

  if (current + delta < last - 1) {
    rangeWithDots.push('...', last)
  } else if (last > 1) {
    rangeWithDots.push(last)
  }

  return rangeWithDots.filter((p) => p !== 1 || last > 1)
})

const getItemNumber = (index: number) => {
  if (!props.meta) return index + 1
  return (props.meta.current_page - 1) * props.meta.per_page + index + 1
}

const formatCurrency = (amount: number, transaction?: Transaction) => {
  let currencyCode = 'CDF'
  if (transaction) {
    if (transaction.currency?.code) {
      currencyCode = transaction.currency.code
    } else if (transaction.currency_code) {
      currencyCode = transaction.currency_code
    }
  }
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getFeeModeBadge = (feeMode: string) => {
  const badges: Record<string, string> = {
    fixed: 'primary',
    percentage: 'info',
    negotiated: 'warning',
    manual_override: 'secondary',
  }
  return badges[feeMode] || 'secondary'
}

const exportCSV = () => {
  const csvContent = generateCSV()
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

const generateCSV = () => {
  const headers = [
    'Référence',
    'Type',
    'Client',
    'Téléphone',
    'Montant Brut',
    'Frais',
    'Montant Net',
    'Statut',
    'Date',
  ]

  const rows = props.transactions.map((t) => [
    t.reference,
    t.transaction_type?.name || '',
    t.customer?.full_name || '',
    t.customer_phone || '',
    t.gross_amount,
    t.fee_amount,
    t.net_amount,
    t.status_label,
    formatDate(t.created_at),
  ])

  return [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
}

const exportPDF = async () => {
  isExportingPDF.value = true
  try {
    const params: Record<string, any> = {}

    if (searchQuery.value) params.search = searchQuery.value
    if (transactionTypeId.value) params.transaction_type_id = transactionTypeId.value
    if (status.value) params.status = status.value
    if (startDate.value) params.start_date = startDate.value
    if (endDate.value) params.end_date = endDate.value

    const response = await axiosInstance.get(`${appConfig.apiUrl}/transactions/export/pdf`, {
      params,
      responseType: 'blob',
    })

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `transactions-${new Date().toISOString().split('T')[0]}.pdf`
    link.click()
  } catch (error) {
    console.error('Error exporting PDF:', error)
  } finally {
    isExportingPDF.value = false
  }
}

// Action handlers
const handleView = (transaction: Transaction) => {
  emit('view', transaction)
}

const handleEdit = (transaction: Transaction) => {
  emit('edit', transaction)
}

const handleDelete = (id: string) => {
  emit('delete', id)
}

const handleCancel = (id: string) => {
  emit('cancel', id)
}

const handleComplete = (id: string) => {
  emit('complete', id)
}
</script>

<style scoped>
.app-search {
  position: relative;
}

.app-search i {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.app-search input {
  padding-left: 35px;
}

/* Ensure icons don't capture clicks */
.btn i {
  pointer-events: none;
}

.badge {
  font-size: 0.75rem;
}
</style>
