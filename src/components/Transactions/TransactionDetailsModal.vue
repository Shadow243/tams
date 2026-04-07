<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-backdrop" @click.self="closeModal">
        <div class="transaction-details-modal" @click.stop>
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="ti ti-file-invoice me-2"></i>
              {{ t('transactions.transaction_details') || 'Détails de la transaction' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>

          <div class="modal-body">
            <!-- Loading Spinner -->
            <div v-if="loading" class="loading-container">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Chargement...</span>
              </div>
              <p class="mt-3 text-muted">
                {{ t('transactions.loading_details') || 'Chargement des détails...' }}
              </p>
            </div>

            <!-- Transaction Details -->
            <div v-else-if="transaction">
              <!-- Transaction Status Timeline -->
              <div class="status-timeline mb-4">
                <h6 class="mb-3">
                  {{ t('transactions.status_timeline') || 'État de la transaction' }}
                </h6>
                <div class="timeline">
                  <div
                    class="timeline-item"
                    :class="{
                      active: isStatusActive('pending'),
                      completed: isStatusCompleted('pending'),
                    }"
                  >
                    <div class="timeline-marker">
                      <i class="ti ti-clock"></i>
                    </div>
                    <div class="timeline-content">
                      <h6>{{ t('transactions.pending') || 'En attente' }}</h6>
                      <small class="text-muted">Transaction initialisée</small>
                    </div>
                  </div>

                  <div
                    class="timeline-item"
                    :class="{
                      active: isStatusActive('available'),
                      completed: isStatusCompleted('available'),
                    }"
                    v-if="showAvailableStep"
                  >
                    <div class="timeline-marker">
                      <i class="ti ti-check"></i>
                    </div>
                    <div class="timeline-content">
                      <h6>{{ t('transactions.available') || 'Disponible' }}</h6>
                      <small class="text-muted">Prête pour retrait</small>
                    </div>
                  </div>

                  <div
                    class="timeline-item"
                    :class="{
                      active: isStatusActive('completed'),
                      completed: isStatusCompleted('completed'),
                    }"
                  >
                    <div class="timeline-marker">
                      <i class="ti ti-circle-check"></i>
                    </div>
                    <div class="timeline-content">
                      <h6>{{ t('transactions.completed') || 'Complétée' }}</h6>
                      <small class="text-muted">Transaction terminée</small>
                    </div>
                  </div>

                  <!-- Cancelled State -->
                  <div
                    class="timeline-item cancelled"
                    v-if="transaction.status === 'cancelled'"
                    :class="{ active: true }"
                  >
                    <div class="timeline-marker">
                      <i class="ti ti-x"></i>
                    </div>
                    <div class="timeline-content">
                      <h6>{{ t('transactions.cancelled') || 'Annulée' }}</h6>
                      <small class="text-muted">Transaction annulée</small>
                    </div>
                  </div>

                  <!-- Failed State -->
                  <div
                    class="timeline-item failed"
                    v-if="transaction.status === 'failed'"
                    :class="{ active: true }"
                  >
                    <div class="timeline-marker">
                      <i class="ti ti-alert-circle"></i>
                    </div>
                    <div class="timeline-content">
                      <h6>{{ t('transactions.failed') || 'Échouée' }}</h6>
                      <small class="text-muted">Transaction échouée</small>
                    </div>
                  </div>

                  <!-- Expired State -->
                  <div
                    class="timeline-item expired"
                    v-if="transaction.status === 'expired'"
                    :class="{ active: true }"
                  >
                    <div class="timeline-marker">
                      <i class="ti ti-clock-off"></i>
                    </div>
                    <div class="timeline-content">
                      <h6>{{ t('transactions.expired') || 'Expirée' }}</h6>
                      <small class="text-muted">Transaction expirée</small>
                    </div>
                  </div>
                </div>
              </div>

              <hr />

              <!-- Transaction Info -->
              <div class="transaction-info">
                <h6 class="mb-3">
                  {{ t('transactions.general_info') || 'Informations générales' }}
                </h6>

                <div class="info-group">
                  <div class="info-item">
                    <label><i class="ti ti-hash me-1"></i>{{ t('transactions.reference') }}</label>
                    <strong>{{ transaction.reference }}</strong>
                  </div>

                  <div class="info-item">
                    <label><i class="ti ti-category me-1"></i>{{ t('transactions.type') }}</label>
                    <strong>{{ transaction.transaction_type?.name }}</strong>
                  </div>

                  <div class="info-item">
                    <label><i class="ti ti-building me-1"></i>{{ t('transactions.branch') }}</label>
                    <strong>{{ transaction.branch?.name }}</strong>
                  </div>

                  <div class="info-item" v-if="transaction.destination_branch">
                    <label
                      ><i class="ti ti-building-store me-1"></i
                      >{{ t('transactions.destination_branch') }}</label
                    >
                    <strong>{{ transaction.destination_branch?.name }}</strong>
                  </div>

                  <div class="info-item" v-if="transaction.customer">
                    <label><i class="ti ti-user me-1"></i>{{ t('transactions.customer') }}</label>
                    <strong>{{ transaction.customer.full_name }}</strong>
                    <small class="text-muted d-block">{{ transaction.customer.phone }}</small>
                  </div>

                  <div class="info-item" v-else-if="transaction.customer_phone">
                    <label><i class="ti ti-phone me-1"></i>{{ t('transactions.phone') }}</label>
                    <strong>{{ transaction.customer_phone }}</strong>
                  </div>

                  <div class="info-item" v-if="transaction.withdrawal_code">
                    <label
                      ><i class="ti ti-key me-1"></i>{{ t('transactions.withdrawal_code') }}</label
                    >
                    <strong class="badge bg-primary">{{ transaction.withdrawal_code }}</strong>
                  </div>
                </div>
              </div>

              <hr />

              <!-- Amounts -->
              <div class="transaction-amounts">
                <h6 class="mb-3">{{ t('transactions.amounts_info') || 'Détails des montants' }}</h6>

                <div class="info-group">
                  <div class="info-item">
                    <label>{{ t('transactions.gross_amount') }}</label>
                    <strong class="text-primary">{{
                      formatCurrency(transaction.gross_amount, transaction)
                    }}</strong>
                  </div>

                  <div class="info-item">
                    <label>{{ t('transactions.fee_amount') }}</label>
                    <strong class="text-warning">{{
                      formatCurrency(transaction.fee_amount, transaction)
                    }}</strong>
                    <small class="text-muted d-block">{{
                      transaction.fee_mode_applied_label
                    }}</small>
                  </div>

                  <div class="info-item">
                    <label>{{ t('transactions.net_amount') }}</label>
                    <strong class="text-success fs-5">{{
                      formatCurrency(transaction.net_amount, transaction)
                    }}</strong>
                  </div>

                  <div class="info-item">
                    <label>{{ t('transactions.currency') }}</label>
                    <span class="badge bg-info"
                      >{{ transaction.currency?.name }} ({{
                        transaction.currency?.code || transaction.currency_code
                      }})</span
                    >
                  </div>
                </div>
              </div>

              <hr />

              <!-- Additional Info -->
              <div class="additional-info">
                <h6 class="mb-3">
                  {{ t('transactions.additional_info') || 'Informations complémentaires' }}
                </h6>

                <div class="info-group">
                  <div class="info-item">
                    <label
                      ><i class="ti ti-user-circle me-1"></i
                      >{{ t('transactions.created_by') }}</label
                    >
                    <strong>{{ transaction.user?.name }}</strong>
                  </div>

                  <div class="info-item">
                    <label
                      ><i class="ti ti-calendar me-1"></i>{{ t('transactions.created_at') }}</label
                    >
                    <strong>{{ formatDate(transaction.created_at) }}</strong>
                  </div>

                  <div class="info-item" v-if="transaction.expires_at">
                    <label
                      ><i class="ti ti-clock-hour-4 me-1"></i
                      >{{ t('transactions.expires_at') }}</label
                    >
                    <strong :class="{ 'text-danger': transaction.is_expired }">
                      {{ formatDate(transaction.expires_at) }}
                    </strong>
                    <span v-if="transaction.is_expired" class="badge bg-danger ms-2">Expiré</span>
                  </div>

                  <div class="info-item" v-if="transaction.updated_at">
                    <label
                      ><i class="ti ti-clock-edit me-1"></i
                      >{{ t('transactions.updated_at') }}</label
                    >
                    <strong>{{ formatDate(transaction.updated_at) }}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              <i class="ti ti-x me-1"></i>
              {{ t('transactions.close') || 'Fermer' }}
            </button>
            <button
              v-if="transaction?.can_be_modified"
              type="button"
              class="btn btn-primary"
              @click="handleEdit"
            >
              <i class="ti ti-edit me-1"></i>
              {{ t('transactions.edit') || 'Modifier' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useI18n } from '@/composables/useI18n'
import type { Transaction } from '@/types'

const { t } = useI18n()

interface Props {
  show: boolean
  transaction: Transaction | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

// Debug: Watch props changes
watchEffect(() => {
  console.log('🔍 Modal State:', {
    show: props.show,
    loading: props.loading,
    hasTransaction: !!props.transaction,
    transactionId: props.transaction?.id,
    transactionUUID: props.transaction?.uuid,
  })
})

const emit = defineEmits<{
  close: []
  edit: [transaction: Transaction]
}>()

const closeModal = () => {
  emit('close')
}

const handleEdit = () => {
  if (props.transaction) {
    emit('edit', props.transaction)
  }
}

const showAvailableStep = computed(() => {
  return (
    props.transaction?.transaction_type?.code?.includes('SEND') ||
    props.transaction?.transaction_type?.code?.includes('TRANSFER')
  )
})

const isStatusActive = (status: string) => {
  return props.transaction?.status === status
}

const isStatusCompleted = (status: string) => {
  const statusOrder = ['pending', 'available', 'completed']
  const currentIndex = statusOrder.indexOf(props.transaction?.status || '')
  const checkIndex = statusOrder.indexOf(status)
  return currentIndex > checkIndex
}

const formatCurrency = (amount: number, transaction: Transaction) => {
  const currencyCode = transaction.currency?.code || transaction.currency_code || 'CDF'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
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
  align-items: stretch;
}

.transaction-details-modal {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 500px;
  max-width: 90vw;
  background: var(--theme-secondary-bg);
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3);
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

/* Timeline Styles */
.status-timeline {
  background: var(--theme-tertiary-bg);
  padding: 1.5rem;
  border-radius: 8px;
}

.timeline {
  position: relative;
  padding-left: 2.5rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 11px;
  top: 4px;
  bottom: 0;
  width: 2px;
  background: var(--theme-border-color);
}

.timeline-item {
  position: relative;
  padding-bottom: 1.75rem;
  opacity: 0.5;
  display: flex;
  align-items: flex-start;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-item.active,
.timeline-item.completed {
  opacity: 1;
}

.timeline-marker {
  position: absolute;
  left: -2.5rem;
  top: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--theme-secondary-bg);
  border: 2px solid var(--theme-border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  flex-shrink: 0;
  font-size: 0.75rem;
}

.timeline-marker i {
  line-height: 1;
}

.timeline-item.active .timeline-marker {
  background: var(--theme-primary);
  border-color: var(--theme-primary);
  color: white;
  animation: pulse 2s infinite;
}

.timeline-item.completed .timeline-marker {
  background: var(--theme-success);
  border-color: var(--theme-success);
  color: white;
}

.timeline-item.cancelled .timeline-marker {
  background: var(--theme-warning);
  border-color: var(--theme-warning);
  color: white;
}

.timeline-item.failed .timeline-marker,
.timeline-item.expired .timeline-marker {
  background: var(--theme-danger);
  border-color: var(--theme-danger);
  color: white;
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(var(--theme-primary-rgb), 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(var(--theme-primary-rgb), 0);
  }
}

.timeline-content {
  flex: 1;
  padding-top: 0;
  min-width: 0;
}

.timeline-content h6 {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--theme-heading-color);
  line-height: 1.4;
}

.timeline-content small {
  font-size: 0.8rem;
  line-height: 1.3;
  display: block;
  color: var(--theme-secondary-color);
}

/* Info Groups */
.info-group {
  display: grid;
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item label {
  font-size: 0.875rem;
  color: var(--theme-secondary-color);
  font-weight: 500;
  margin: 0;
}

.info-item strong {
  color: var(--theme-heading-color);
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .transaction-details-modal,
.modal-leave-active .transaction-details-modal {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .transaction-details-modal {
  transform: translateX(100%);
}

.modal-leave-to .transaction-details-modal {
  transform: translateX(100%);
}

/* Loading Spinner */
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
</style>
