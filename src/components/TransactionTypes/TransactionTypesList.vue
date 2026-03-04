<template>
  <div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="card-title mb-0">{{ t('transaction_types.page_title') }}</h5>
      <div class="d-flex gap-2">
        <!-- Export Dropdown -->
        <div class="dropdown">
          <button
            class="btn btn-outline-secondary dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            :disabled="isExportingPDF"
          >
            <span v-if="isExportingPDF" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="ti ti-download me-1"></i>
            {{
              isExportingPDF
                ? t('transaction_types.exporting') || 'Exporting...'
                : t('transaction_types.export') || 'Export'
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
        <button class="btn btn-primary" @click="$emit('add')">
          <i class="ti ti-plus me-1"></i>
          {{ t('transaction_types.add_transaction_type') }}
        </button>
      </div>
    </div>

    <div class="card-body">
      <!-- Filters -->
      <div class="row g-3 mb-3">
        <!-- Search -->
        <div class="col-md-6">
          <div class="app-search">
            <i class="ti ti-search"></i>
            <input
              type="text"
              class="form-control"
              :placeholder="t('transaction_types.search_placeholder')"
              v-model="searchQuery"
              @input="debouncedSearch"
            />
          </div>
        </div>

        <!-- Per Page -->
        <div class="col-md-3">
          <select class="form-select" v-model.number="perPage" @change="handlePerPageChange">
            <option :value="10">10 {{ t('transaction_types.per_page') || 'per page' }}</option>
            <option :value="15">15 {{ t('transaction_types.per_page') || 'per page' }}</option>
            <option :value="25">25 {{ t('transaction_types.per_page') || 'per page' }}</option>
            <option :value="50">50 {{ t('transaction_types.per_page') || 'per page' }}</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead>
            <tr>
              <th width="5%">#</th>
              <th width="25%">{{ t('transaction_types.table.code') }}</th>
              <th width="25%">{{ t('transaction_types.table.name') }}</th>
              <th width="35%">{{ t('transaction_types.table.description') }}</th>
              <th width="10%" class="text-center">{{ t('transaction_types.table.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="transactionTypes.length === 0">
              <td colspan="5" class="text-center py-4">
                {{ t('transaction_types.no_records') }}
              </td>
            </tr>
            <tr
              v-else
              v-for="(transactionType, index) in transactionTypes"
              :key="transactionType.id"
            >
              <td>{{ getItemNumber(index) }}</td>
              <td>
                <span class="badge bg-primary-subtle text-primary font-monospace">
                  {{ transactionType.code }}
                </span>
              </td>
              <td>{{ transactionType.name }}</td>
              <td>
                <span class="text-muted">{{ transactionType.description || '-' }}</span>
              </td>
              <td class="text-center">
                <div class="dropdown">
                  <button
                    class="btn btn-sm btn-light dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i class="ti ti-dots-vertical"></i>
                  </button>
                  <ul class="dropdown-menu">
                    <li>
                      <a
                        class="dropdown-item"
                        href="#"
                        @click.prevent="$emit('edit', transactionType)"
                      >
                        <i class="ti ti-edit me-2"></i>
                        {{ t('transaction_types.edit') || 'Edit' }}
                      </a>
                    </li>
                    <li><hr class="dropdown-divider" /></li>
                    <li>
                      <a
                        class="dropdown-item text-danger"
                        href="#"
                        @click.prevent="$emit('delete', transactionType.id)"
                      >
                        <i class="ti ti-trash me-2"></i>
                        {{ t('transaction_types.delete') || 'Delete' }}
                      </a>
                    </li>
                  </ul>
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
          {{ t('transaction_types.showing') || 'Showing' }} {{ meta.from }}
          {{ t('transaction_types.to') || 'to' }} {{ meta.to }}
          {{ t('transaction_types.of') || 'of' }} {{ meta.total }}
          {{ t('transaction_types.entries') || 'entries' }}
        </div>

        <nav aria-label="Page navigation">
          <ul class="pagination mb-0">
            <li class="page-item" :class="{ disabled: meta.current_page === 1 }">
              <a
                class="page-link"
                href="#"
                @click.prevent="handlePageChange(meta.current_page - 1)"
              >
                {{ t('transaction_types.previous') || 'Previous' }}
              </a>
            </li>

            <li
              v-for="page in visiblePages"
              :key="page"
              class="page-item"
              :class="{ active: page === meta.current_page }"
            >
              <a class="page-link" href="#" @click.prevent="handlePageChange(page)">
                {{ page }}
              </a>
            </li>

            <li class="page-item" :class="{ disabled: meta.current_page === meta.last_page }">
              <a
                class="page-link"
                href="#"
                @click.prevent="handlePageChange(meta.current_page + 1)"
              >
                {{ t('transaction_types.next') || 'Next' }}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '@/composables/useI18n'
import debounce from 'lodash.debounce'
import { axiosInstance } from '@/plugins/axios'
import { appConfig } from '@/config/app'
import type { TransactionType, Meta } from '@/types'

const { t } = useI18n()

interface Props {
  transactionTypes: TransactionType[]
  meta: Meta | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  add: []
  edit: [transactionType: any]
  delete: [id: number]
  search: [query: string]
  pageChange: [page: number]
  perPageChange: [perPage: number]
}>()

const searchQuery = ref('')
const perPage = ref(15)
const isExportingPDF = ref(false)

const debouncedSearch = debounce(() => {
  emit('search', searchQuery.value)
}, 500)

const handlePageChange = (page: number) => {
  if (props.meta && page >= 1 && page <= props.meta.last_page) {
    emit('pageChange', page)
  }
}

const handlePerPageChange = () => {
  emit('perPageChange', perPage.value)
}

const getItemNumber = (index: number) => {
  if (!props.meta) return index + 1
  return (props.meta.current_page - 1) * props.meta.per_page + index + 1
}

const visiblePages = computed(() => {
  if (!props.meta) return []

  const current = props.meta.current_page
  const last = props.meta.last_page
  const pages: number[] = []

  if (last <= 5) {
    for (let i = 1; i <= last; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 3) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
    } else if (current >= last - 2) {
      for (let i = last - 4; i <= last; i++) {
        pages.push(i)
      }
    } else {
      for (let i = current - 2; i <= current + 2; i++) {
        pages.push(i)
      }
    }
  }

  return pages
})

const exportCSV = () => {
  const headers = [
    t('transaction_types.table.code'),
    t('transaction_types.table.name'),
    t('transaction_types.table.description'),
  ]

  const rows = props.transactionTypes.map((type) => [type.code, type.name, type.description || ''])

  let csv = headers.join(',') + '\n'
  rows.forEach((row) => {
    csv += row.map((cell) => `"${cell}"`).join(',') + '\n'
  })

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `transaction-types-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const exportPDF = async () => {
  if (isExportingPDF.value) return

  try {
    isExportingPDF.value = true

    const params: Record<string, string> = {}

    if (searchQuery.value) {
      params.search = searchQuery.value
    }

    const response = await axiosInstance.get(`${appConfig.apiUrl}/transaction-types/export/pdf`, {
      params,
      responseType: 'blob',
    })

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `transaction-types-${new Date().toISOString().split('T')[0]}.pdf`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting PDF:', error)
    alert("Erreur lors de l'export PDF")
  } finally {
    isExportingPDF.value = false
  }
}
</script>

<style scoped>
.app-search {
  position: relative;
  display: flex;
  align-items: center;
}

.app-search i {
  position: absolute;
  left: 12px;
  color: #6c757d;
  z-index: 1;
}

.app-search input {
  padding-left: 38px;
}

.font-monospace {
  font-family: 'Courier New', Courier, monospace;
}
</style>
