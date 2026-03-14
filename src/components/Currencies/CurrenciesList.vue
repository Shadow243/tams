<template>
  <div class="card">
    <div class="card-header border-light justify-content-between">
      <div class="d-flex gap-2 flex-wrap">
        <div class="app-search">
          <input
            v-model="searchQuery"
            type="search"
            class="form-control"
            :placeholder="t('currencies.search_placeholder') || 'Rechercher une devise...'"
          />
          <i class="ti ti-search app-search-icon text-muted"></i>
        </div>
      </div>

      <div class="d-flex align-items-center gap-2">
        <!-- Records Per Page -->
        <div>
          <select v-model="perPage" class="form-select form-control my-1 my-md-0">
            <option :value="10">10</option>
            <option :value="15">15</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
        </div>

        <button
          type="button"
          @click="refreshTable"
          class="btn btn-primary"
          :title="t('currencies.refresh') || 'Actualiser'"
        >
          <i class="ti ti-refresh"></i>
        </button>
      </div>
    </div>

    <div class="card-body">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">{{ t('common.loading') }}</span>
        </div>
      </div>

      <!-- Currencies Table -->
      <div v-else class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>{{ t('currencies.code') }}</th>
              <th>{{ t('currencies.name') }}</th>
              <th>{{ t('currencies.symbol') }}</th>
              <th>{{ t('currencies.table.country') || 'Pays' }}</th>
              <th class="text-end">{{ t('currencies.exchange_rate') }}</th>
              <th class="text-center">{{ t('currencies.decimal_places') }}</th>
              <th class="text-center">{{ t('currencies.status') }}</th>
              <th class="text-center">{{ t('currencies.default') }}</th>
              <th>{{ t('currencies.example') }}</th>
              <th class="text-center">{{ t('currencies.actions') || 'Actions' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="currency in currencies" :key="currency.id">
              <td>
                <strong class="text-primary">{{ currency.code }}</strong>
              </td>
              <td>{{ currency.name }}</td>
              <td>
                <span class="badge bg-secondary">{{ currency.symbol }}</span>
              </td>
              <td>
                <span v-if="currency.country" class="text-muted">
                  {{ currency.country.name }}
                </span>
                <span v-else class="text-muted fst-italic">—</span>
              </td>
              <td class="text-end font-monospace">
                {{ formatExchangeRate(currency.exchange_rate) }}
              </td>
              <td class="text-center">
                <span class="badge bg-info">{{ currency.decimal_places }}</span>
              </td>
              <td class="text-center">
                <span class="badge" :class="currency.is_active ? 'bg-success' : 'bg-danger'">
                  {{ currency.is_active ? t('currencies.active') : t('currencies.inactive') }}
                </span>
              </td>
              <td class="text-center">
                <i
                  v-if="currency.is_default"
                  class="ti ti-star-filled text-warning"
                  :title="t('currencies.default_currency')"
                ></i>
              </td>
              <td>
                <code>{{ formatExample(currency, 1000) }}</code>
              </td>
              <td class="text-center">
                <div class="btn-group btn-group-sm">
                  <button
                    type="button"
                    class="btn btn-light"
                    @click="$emit('edit', currency)"
                    :title="t('currencies.edit') || 'Modifier'"
                  >
                    <i class="ti ti-edit"></i>
                  </button>
                  <button
                    type="button"
                    class="btn btn-light text-danger"
                    @click="$emit('delete', currency)"
                    :title="t('currencies.delete') || 'Supprimer'"
                    :disabled="currency.is_default"
                  >
                    <i class="ti ti-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div v-if="currencies.length === 0" class="text-center py-5">
          <i class="ti ti-currency-dollar display-1 text-muted mb-3"></i>
          <p class="text-muted">{{ t('currencies.no_currencies') }}</p>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="card-footer border-light">
      <div class="row align-items-center">
        <div class="col-sm-6">
          <div class="text-muted">
            {{ t('common.showing') || 'Showing' }}
            <span class="fw-semibold">{{ from }}</span>
            {{ t('common.to') || 'to' }}
            <span class="fw-semibold">{{ to }}</span>
            {{ t('common.of') || 'of' }}
            <span class="fw-semibold">{{ total }}</span>
            {{ t('currencies.currencies') || 'devises' }}
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

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from '@/composables/useI18n'
import debounce from 'lodash.debounce'
import type { Currency } from '@/stores/currencies'
import type { Meta } from '@/types'

const { t } = useI18n()

interface Props {
  currencies: Currency[]
  meta?: Meta
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  (e: 'search', query: string): void
  (e: 'per-page-change', perPage: number): void
  (e: 'page-change', page: number): void
  (e: 'refresh'): void
  (e: 'edit', currency: Currency): void
  (e: 'delete', currency: Currency): void
}>()

const searchQuery = ref('')
const perPage = ref(15)

// Pagination computed properties
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

const formatExchangeRate = (rate: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(rate)
}

const formatExample = (currency: Currency, amount: number): string => {
  const formattedAmount = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: currency.decimal_places,
    maximumFractionDigits: currency.decimal_places,
  }).format(amount)

  // Place symbol based on currency
  if (['USD', 'EUR'].includes(currency.code)) {
    return `${currency.symbol} ${formattedAmount}`
  }

  return `${formattedAmount} ${currency.symbol}`
}
</script>

<style scoped>
.font-monospace {
  font-family: 'Courier New', monospace;
}
</style>
