<template>
  <div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="card-title mb-0">{{ t('fee_rules.page_title') || 'Règles de frais' }}</h5>
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
                ? t('fee_rules.exporting') || 'Exporting...'
                : t('fee_rules.export') || 'Export'
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
          {{ t('fee_rules.add_fee_rule') || 'Ajouter une règle' }}
        </button>
      </div>
    </div>

    <div class="card-body">
      <!-- Filters -->
      <div class="row g-3 mb-3">
        <!-- Search -->
        <div class="col-md-4">
          <div class="app-search">
            <i class="ti ti-search"></i>
            <input
              type="text"
              class="form-control"
              :placeholder="t('fee_rules.search_placeholder') || 'Rechercher...'"
              v-model="searchQuery"
              @input="debouncedSearch"
            />
          </div>
        </div>

        <!-- Fee Mode Filter -->
        <div class="col-md-2">
          <div class="input-group">
            <span class="input-group-text">
              <i class="ti ti-coin"></i>
            </span>
            <select class="form-select" v-model="feeMode" @change="handleFilterChange">
              <option value="">{{ t('fee_rules.all_modes') || 'Tous les modes' }}</option>
              <option value="fixed">{{ t('fee_rules.fixed') || 'Fixe' }}</option>
              <option value="percentage">{{ t('fee_rules.percentage') || 'Pourcentage' }}</option>
              <option value="negotiable">{{ t('fee_rules.negotiable') || 'Négociable' }}</option>
            </select>
          </div>
        </div>

        <!-- Status Filter -->
        <div class="col-md-2">
          <div class="input-group">
            <span class="input-group-text">
              <i class="ti ti-toggle-left"></i>
            </span>
            <select class="form-select" v-model="status" @change="handleFilterChange">
              <option value="">{{ t('fee_rules.all_status') || 'Tous les statuts' }}</option>
              <option value="1">{{ t('fee_rules.active') || 'Actif' }}</option>
              <option value="0">{{ t('fee_rules.inactive') || 'Inactif' }}</option>
            </select>
          </div>
        </div>

        <!-- Per Page -->
        <div class="col-md-2">
          <div class="input-group">
            <span class="input-group-text">
              <i class="ti ti-list-numbers"></i>
            </span>
            <select class="form-select" v-model.number="perPage" @change="handlePerPageChange">
              <option :value="10">10 {{ t('fee_rules.per_page') || 'par page' }}</option>
              <option :value="15">15 {{ t('fee_rules.per_page') || 'par page' }}</option>
              <option :value="25">25 {{ t('fee_rules.per_page') || 'par page' }}</option>
              <option :value="50">50 {{ t('fee_rules.per_page') || 'par page' }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead>
            <tr>
              <th width="5%">#</th>
              <th width="15%">{{ t('fee_rules.table.transaction_type') || "Type d'opération" }}</th>
              <th width="12%">{{ t('fee_rules.table.operator') || 'Opérateur' }}</th>
              <th width="12%">{{ t('fee_rules.table.branch') || 'Agence' }}</th>
              <th width="10%">{{ t('fee_rules.table.fee_mode') || 'Mode' }}</th>
              <th width="10%">{{ t('fee_rules.table.value') || 'Valeur' }}</th>
              <th width="10%">{{ t('fee_rules.table.min_max') || 'Min/Max' }}</th>
              <th width="8%" class="text-center">{{ t('fee_rules.table.status') || 'Statut' }}</th>
              <th width="10%" class="text-center">
                {{ t('fee_rules.table.actions') || 'Actions' }}
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
            <tr v-else-if="feeRules.length === 0">
              <td colspan="9" class="text-center py-4">
                {{ t('fee_rules.no_records') || 'Aucune règle de frais trouvée' }}
              </td>
            </tr>
            <tr v-else v-for="(feeRule, index) in feeRules" :key="feeRule.id">
              <td>{{ getItemNumber(index) }}</td>
              <td>
                <div class="text-truncate">
                  <small class="text-muted d-block">{{ feeRule.transaction_type?.code }}</small>
                  {{ feeRule.transaction_type?.name }}
                </div>
              </td>
              <td>
                <span v-if="feeRule.operator" class="text-sm">{{ feeRule.operator.name }}</span>
                <span v-else class="text-muted">-</span>
              </td>
              <td>
                <span v-if="feeRule.branch" class="text-sm">{{ feeRule.branch.name }}</span>
                <span v-else class="text-muted">-</span>
              </td>
              <td>
                <span
                  class="badge"
                  :class="{
                    'bg-primary-subtle text-primary': feeRule.fee_mode === 'fixed',
                    'bg-success-subtle text-success': feeRule.fee_mode === 'percentage',
                    'bg-warning-subtle text-warning': feeRule.fee_mode === 'negotiable',
                  }"
                >
                  {{ feeRule.fee_mode_label }}
                </span>
              </td>
              <td>
                <span v-if="feeRule.value !== null">
                  {{ feeRule.value }}{{ feeRule.fee_mode === 'percentage' ? '%' : '' }}
                </span>
                <span v-else class="text-muted">-</span>
              </td>
              <td>
                <small class="text-muted">
                  <span v-if="feeRule.min_fee !== null">Min: {{ feeRule.min_fee }}</span>
                  <br v-if="feeRule.min_fee !== null && feeRule.max_fee !== null" />
                  <span v-if="feeRule.max_fee !== null">Max: {{ feeRule.max_fee }}</span>
                  <span v-if="!feeRule.min_fee && !feeRule.max_fee">-</span>
                </small>
              </td>
              <td class="text-center">
                <span
                  class="badge"
                  :class="{
                    'bg-success-subtle text-success': feeRule.is_active,
                    'bg-danger-subtle text-danger': !feeRule.is_active,
                  }"
                >
                  {{
                    feeRule.is_active
                      ? t('fee_rules.active') || 'Actif'
                      : t('fee_rules.inactive') || 'Inactif'
                  }}
                </span>
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
                      <a class="dropdown-item" href="#" @click.prevent="$emit('edit', feeRule)">
                        <i class="ti ti-edit me-2"></i>
                        {{ t('fee_rules.edit') || 'Modifier' }}
                      </a>
                    </li>
                    <li>
                      <a
                        class="dropdown-item"
                        href="#"
                        @click.prevent="$emit('toggle-status', feeRule.id)"
                      >
                        <i class="ti ti-toggle-left me-2"></i>
                        {{
                          feeRule.is_active
                            ? t('fee_rules.deactivate') || 'Désactiver'
                            : t('fee_rules.activate') || 'Activer'
                        }}
                      </a>
                    </li>
                    <li><hr class="dropdown-divider" /></li>
                    <li>
                      <a
                        class="dropdown-item text-danger"
                        href="#"
                        @click.prevent="$emit('delete', feeRule.id)"
                      >
                        <i class="ti ti-trash me-2"></i>
                        {{ t('fee_rules.delete') || 'Supprimer' }}
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
          {{ t('fee_rules.showing') || 'Affichage de' }} {{ meta.from }}
          {{ t('fee_rules.to') || 'à' }} {{ meta.to }} {{ t('fee_rules.of') || 'sur' }}
          {{ meta.total }}
          {{ t('fee_rules.entries') || 'entrées' }}
        </div>

        <nav aria-label="Page navigation">
          <ul class="pagination mb-0">
            <li class="page-item" :class="{ disabled: meta.current_page === 1 }">
              <a
                class="page-link"
                href="#"
                @click.prevent="handlePageChange(meta.current_page - 1)"
              >
                {{ t('fee_rules.previous') || 'Précédent' }}
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
                {{ t('fee_rules.next') || 'Suivant' }}
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
import { useUserSettings } from '@/composables/useUserSettings'
import debounce from 'lodash.debounce'
import { axiosInstance } from '@/plugins/axios'
import { appConfig } from '@/config/app'
import type { FeeRule, Meta } from '@/types'

const { t } = useI18n()
const { getItemsPerPage } = useUserSettings()

interface Props {
  feeRules: FeeRule[]
  meta: Meta | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  add: []
  edit: [feeRule: any]
  delete: [id: number]
  toggleStatus: [id: number]
  search: [query: string]
  filterChange: [filters: any]
  pageChange: [page: number]
  perPageChange: [perPage: number]
}>()

const searchQuery = ref('')
const perPage = ref(getItemsPerPage())
const feeMode = ref('')
const status = ref('')
const isExportingPDF = ref(false)

const debouncedSearch = debounce(() => {
  emit('search', searchQuery.value)
}, 500)

const handleFilterChange = () => {
  emit('filterChange', {
    fee_mode: feeMode.value,
    is_active: status.value ? status.value === '1' : null,
  })
}

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
    t('fee_rules.table.transaction_type'),
    t('fee_rules.table.operator'),
    t('fee_rules.table.branch'),
    t('fee_rules.table.fee_mode'),
    t('fee_rules.table.value'),
    t('fee_rules.table.min_fee'),
    t('fee_rules.table.max_fee'),
    t('fee_rules.table.status'),
  ]

  const rows = props.feeRules.map((rule) => [
    rule.transaction_type?.name || '',
    rule.operator?.name || '',
    rule.branch?.name || '',
    rule.fee_mode_label,
    rule.value || '',
    rule.min_fee || '',
    rule.max_fee || '',
    rule.is_active ? t('fee_rules.active') : t('fee_rules.inactive'),
  ])

  let csv = headers.join(',') + '\n'
  rows.forEach((row) => {
    csv += row.map((cell) => `"${cell}"`).join(',') + '\n'
  })

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `fee-rules-${new Date().toISOString().split('T')[0]}.csv`)
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

    if (feeMode.value) {
      params.fee_mode = feeMode.value
    }

    if (status.value) {
      params.is_active = status.value
    }

    const response = await axiosInstance.get(`${appConfig.apiUrl}/fee-rules/export/pdf`, {
      params,
      responseType: 'blob',
    })

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `fee-rules-${new Date().toISOString().split('T')[0]}.pdf`)
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

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}
</style>
