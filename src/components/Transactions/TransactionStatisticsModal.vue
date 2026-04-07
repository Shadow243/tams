<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-backdrop" @click.self="closeModal">
        <div class="statistics-modal" @click.stop>
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="ti ti-chart-bar me-2"></i>
              {{ t('transactions.statistics') || 'Statistiques des Transactions' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>

          <!-- Filters Section -->
          <div class="modal-filters">
            <div class="row g-3">
              <div class="col-md-4">
                <label class="form-label">
                  <i class="ti ti-currency-dollar me-1"></i>
                  {{ t('transactions.currency') || 'Devise' }}
                </label>
                <select v-model="selectedCurrency" class="form-select" @change="handleFilterChange">
                  <option
                    v-for="currency in availableCurrencies"
                    :key="currency.id"
                    :value="currency.id"
                  >
                    {{ currency.code }} - {{ currency.name }}
                  </option>
                </select>
              </div>

              <div class="col-md-4">
                <label class="form-label">
                  <i class="ti ti-calendar me-1"></i>
                  {{ t('transactions.period') || 'Période' }}
                </label>
                <select v-model="selectedPeriod" class="form-select" @change="handleFilterChange">
                  <option value="today">{{ t('transactions.today') || "Aujourd'hui" }}</option>
                  <option value="yesterday">{{ t('transactions.yesterday') || 'Hier' }}</option>
                  <option value="week">{{ t('transactions.this_week') || 'Cette semaine' }}</option>
                  <option value="month">{{ t('transactions.this_month') || 'Ce mois' }}</option>
                  <option value="last_month">
                    {{ t('transactions.last_month') || 'Mois passé' }}
                  </option>
                  <option value="year">{{ t('transactions.this_year') || 'Cette année' }}</option>
                  <option value="custom">{{ t('transactions.custom') || 'Personnalisée' }}</option>
                </select>
              </div>

              <div class="col-md-4" v-if="selectedPeriod === 'custom'">
                <label class="form-label">
                  <i class="ti ti-calendar-event me-1"></i>
                  {{ t('transactions.date_range') || 'Plage de dates' }}
                </label>
                <div class="d-flex gap-2">
                  <input
                    type="date"
                    v-model="customStartDate"
                    class="form-control form-control-sm"
                    @change="handleFilterChange"
                  />
                  <input
                    type="date"
                    v-model="customEndDate"
                    class="form-control form-control-sm"
                    @change="handleFilterChange"
                  />
                </div>
              </div>

              <div class="col-md-4" v-else>
                <label class="form-label">&nbsp;</label>
                <button type="button" class="btn btn-primary w-100" @click="handleFilterChange">
                  <i class="ti ti-refresh me-1"></i>
                  {{ t('transactions.refresh') || 'Actualiser' }}
                </button>
              </div>
            </div>
          </div>

          <div class="modal-body">
            <!-- Loading Spinner -->
            <div v-if="loading" class="loading-container">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Chargement...</span>
              </div>
              <p class="mt-3 text-muted">
                {{ t('transactions.loading_stats') || 'Chargement des statistiques...' }}
              </p>
            </div>

            <!-- Statistics Content -->
            <div v-else-if="statistics" class="statistics-content">
              <!-- Overview Cards -->
              <div class="stats-overview">
                <div class="stat-card primary">
                  <div class="stat-icon">
                    <i class="ti ti-file-invoice"></i>
                  </div>
                  <div class="stat-details">
                    <h3>{{ statistics.total_transactions || 0 }}</h3>
                    <p>{{ t('transactions.total_transactions') || 'Total Transactions' }}</p>
                  </div>
                </div>

                <div class="stat-card success">
                  <div class="stat-icon">
                    <i class="ti ti-cash"></i>
                  </div>
                  <div class="stat-details">
                    <h3>{{ formatCurrency(statistics.total_amount || 0) }}</h3>
                    <p>{{ t('transactions.total_amount') || 'Montant Total' }}</p>
                  </div>
                </div>

                <div class="stat-card warning">
                  <div class="stat-icon">
                    <i class="ti ti-receipt"></i>
                  </div>
                  <div class="stat-details">
                    <h3>{{ formatCurrency(statistics.total_fees || 0) }}</h3>
                    <p>{{ t('transactions.total_fees') || 'Total Frais' }}</p>
                  </div>
                </div>

                <div class="stat-card info">
                  <div class="stat-icon">
                    <i class="ti ti-wallet"></i>
                  </div>
                  <div class="stat-details">
                    <h3>{{ formatCurrency(statistics.total_net || 0) }}</h3>
                    <p>{{ t('transactions.total_net') || 'Montant Net' }}</p>
                  </div>
                </div>
              </div>

              <hr class="my-4" />

              <!-- Status Breakdown -->
              <div class="status-breakdown">
                <h6 class="mb-3">
                  <i class="ti ti-chart-pie me-2"></i>
                  {{ t('transactions.by_status') || 'Répartition par Statut' }}
                </h6>

                <div class="status-grid">
                  <div class="status-item">
                    <span class="badge bg-warning">
                      <i class="ti ti-clock me-1"></i>
                      {{ t('transactions.pending') || 'En attente' }}
                    </span>
                    <strong>{{ statistics.by_status?.pending || 0 }}</strong>
                  </div>

                  <div class="status-item">
                    <span class="badge bg-info">
                      <i class="ti ti-check me-1"></i>
                      {{ t('transactions.available') || 'Disponible' }}
                    </span>
                    <strong>{{ statistics.by_status?.available || 0 }}</strong>
                  </div>

                  <div class="status-item">
                    <span class="badge bg-success">
                      <i class="ti ti-circle-check me-1"></i>
                      {{ t('transactions.completed') || 'Complétée' }}
                    </span>
                    <strong>{{ statistics.by_status?.completed || 0 }}</strong>
                  </div>

                  <div class="status-item">
                    <span class="badge bg-secondary">
                      <i class="ti ti-x me-1"></i>
                      {{ t('transactions.cancelled') || 'Annulée' }}
                    </span>
                    <strong>{{ statistics.by_status?.cancelled || 0 }}</strong>
                  </div>

                  <div class="status-item">
                    <span class="badge bg-danger">
                      <i class="ti ti-alert-circle me-1"></i>
                      {{ t('transactions.failed') || 'Échouée' }}
                    </span>
                    <strong>{{ statistics.by_status?.failed || 0 }}</strong>
                  </div>

                  <div class="status-item">
                    <span class="badge bg-dark">
                      <i class="ti ti-clock-hour-4 me-1"></i>
                      {{ t('transactions.expired') || 'Expirée' }}
                    </span>
                    <strong>{{ statistics.by_status?.expired || 0 }}</strong>
                  </div>
                </div>
              </div>
            </div>

            <!-- No Data -->
            <div v-else class="no-data">
              <i class="ti ti-chart-bar-off"></i>
              <p>{{ t('transactions.no_statistics') || 'Aucune statistique disponible' }}</p>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              <i class="ti ti-x me-1"></i>
              {{ t('transactions.close') || 'Fermer' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useCurrencyStore } from '@/stores/currencies'
import type { TransactionStatistics } from '@/types'

const { t } = useI18n()
const currencyStore = useCurrencyStore()

interface Props {
  show: boolean
  statistics: TransactionStatistics | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  close: []
  'filter-change': [
    filters: {
      currencyId: number
      currencyCode: string
      period: string
      startDate?: string
      endDate?: string
    }
  ]
}>()

// Filter states
const selectedCurrency = ref<number | null>(null)
const selectedCurrencyCode = ref('')
const selectedPeriod = ref('today')
const customStartDate = ref('')
const customEndDate = ref('')

// Load currencies on component mount
onMounted(async () => {
  if (currencyStore.allCurrencies.length === 0) {
    await currencyStore.fetchAllCurrencies()
  }

  // Set default currency
  if (currencyStore.defaultCurrency) {
    selectedCurrency.value = currencyStore.defaultCurrency.id
    selectedCurrencyCode.value = currencyStore.defaultCurrency.code
  } else if (currencyStore.activeCurrencies.length > 0) {
    selectedCurrency.value = currencyStore.activeCurrencies[0].id
    selectedCurrencyCode.value = currencyStore.activeCurrencies[0].code
  }
})

// Initialize dates when modal opens
watch(
  () => props.show,
  (isShown) => {
    if (isShown) {
      if (!customStartDate.value) {
        const today = new Date()
        customEndDate.value = today.toISOString().split('T')[0]
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)
        customStartDate.value = weekAgo.toISOString().split('T')[0]
      }

      // Set default currency if not already set
      if (!selectedCurrency.value) {
        if (currencyStore.defaultCurrency) {
          selectedCurrency.value = currencyStore.defaultCurrency.id
          selectedCurrencyCode.value = currencyStore.defaultCurrency.code
        } else if (currencyStore.activeCurrencies.length > 0) {
          selectedCurrency.value = currencyStore.activeCurrencies[0].id
          selectedCurrencyCode.value = currencyStore.activeCurrencies[0].code
        }
      }
    }
  }
)

const closeModal = () => {
  emit('close')
}

const handleFilterChange = () => {
  // Vérifier qu'une devise est sélectionnée
  if (!selectedCurrency.value) {
    return
  }

  // Update currency code when currency changes
  const currency = currencyStore.allCurrencies.find((c) => c.id === selectedCurrency.value)
  if (currency) {
    selectedCurrencyCode.value = currency.code
  }

  const filters: any = {
    currencyId: selectedCurrency.value,
    currencyCode: selectedCurrencyCode.value,
    period: selectedPeriod.value,
  }

  if (selectedPeriod.value === 'custom') {
    filters.startDate = customStartDate.value
    filters.endDate = customEndDate.value
  }

  emit('filter-change', filters)
}

const formatCurrency = (amount: number | string) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  if (!selectedCurrencyCode.value) {
    return new Intl.NumberFormat('fr-FR').format(numAmount || 0)
  }

  return currencyStore.formatAmount(numAmount || 0, selectedCurrencyCode.value)
}

const availableCurrencies = computed(() => currencyStore.activeCurrencies)
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
}

.statistics-modal {
  width: 800px;
  max-width: 95vw;
  max-height: 90vh;
  background: var(--theme-secondary-bg);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--theme-border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--theme-tertiary-bg);
}

.modal-filters {
  padding: 1.25rem 1.5rem;
  background: var(--theme-tertiary-bg);
  border-bottom: 1px solid var(--theme-border-color);
}

.modal-filters .form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--theme-heading-color);
  margin-bottom: 0.5rem;
}

.modal-filters .form-select,
.modal-filters .form-control {
  font-size: 0.875rem;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--theme-heading-color);
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.btn-close:hover {
  opacity: 1;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--theme-border-color);
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  background: var(--theme-tertiary-bg);
}

/* Statistics Content */
.statistics-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Stats Overview Cards */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: var(--theme-tertiary-bg);
  border-radius: 8px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-left: 4px solid;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card.primary {
  border-left-color: var(--theme-primary);
}

.stat-card.success {
  border-left-color: var(--theme-success);
}

.stat-card.warning {
  border-left-color: var(--theme-warning);
}

.stat-card.info {
  border-left-color: var(--theme-info);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: rgba(var(--theme-primary-rgb), 0.1);
  color: var(--theme-primary);
  flex-shrink: 0;
}

.stat-card.success .stat-icon {
  background: rgba(var(--theme-success-rgb), 0.1);
  color: var(--theme-success);
}

.stat-card.warning .stat-icon {
  background: rgba(var(--theme-warning-rgb), 0.1);
  color: var(--theme-warning);
}

.stat-card.info .stat-icon {
  background: rgba(var(--theme-info-rgb), 0.1);
  color: var(--theme-info);
}

.stat-details {
  flex: 1;
  min-width: 0;
}

.stat-details h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--theme-heading-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-details p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--theme-secondary-color);
}

/* Status Breakdown */
.status-breakdown {
  background: var(--theme-tertiary-bg);
  padding: 1.5rem;
  border-radius: 8px;
}

.status-breakdown h6 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--theme-heading-color);
  margin-bottom: 1rem;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--theme-secondary-bg);
  border-radius: 6px;
  transition: transform 0.2s;
}

.status-item:hover {
  transform: translateX(4px);
}

.status-item .badge {
  font-size: 0.875rem;
  padding: 0.4rem 0.75rem;
  font-weight: 500;
}

.status-item strong {
  font-size: 1.25rem;
  color: var(--theme-heading-color);
}

/* Loading Container */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
}

.loading-container .spinner-border {
  width: 3rem;
  height: 3rem;
}

/* No Data */
.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: var(--theme-secondary-color);
  text-align: center;
}

.no-data i {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-data p {
  font-size: 1rem;
  margin: 0;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .statistics-modal,
.modal-leave-active .statistics-modal {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .statistics-modal {
  transform: scale(0.9);
  opacity: 0;
}

.modal-leave-to .statistics-modal {
  transform: scale(0.9);
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .stats-overview {
    grid-template-columns: 1fr;
  }

  .status-grid {
    grid-template-columns: 1fr;
  }
}
</style>
