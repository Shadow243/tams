<template>
  <div class="row">
    <div class="col-12">
      <div class="d-flex align-items-sm-center flex-sm-row flex-column my-3">
        <div class="flex-grow-1">
          <h4 class="fs-xl mb-1">{{ t('transactions.page_title') }}</h4>
          <p class="text-muted mb-0">
            {{ t('transactions.page_description') || 'Gérer toutes les transactions' }}
          </p>
        </div>

        <div class="text-end mt-3 mt-sm-0">
          <button v-if="canCreateTransaction" @click.prevent="handleAddTransaction" type="button" class="btn btn-primary me-2">
            <i class="ti ti-plus me-1"></i> {{ t('transactions.add_transaction') }}
          </button>
          <button @click.prevent="handleShowStatistics" type="button" class="btn btn-info">
            <i class="ti ti-chart-bar me-1"></i> {{ t('transactions.statistics') }}
          </button>
        </div>
      </div>

      <!-- Status Overview - Hidden on mobile, visible on tablet and desktop -->
      <div class="row mb-4 d-none d-md-flex">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <div class="d-flex align-items-center justify-content-between mb-4">
                <h5 class="card-title mb-0 fw-semibold">
                  <i class="ti ti-chart-pie me-2 text-primary"></i>
                  {{ t('transactions.by_status') || 'Répartition par Statut' }}
                </h5>
                <span class="text-muted small">{{
                  t('transactions.overview') || "Vue d'ensemble"
                }}</span>
              </div>

              <!-- Loading State -->
              <div v-if="store.loadingStatistics" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Chargement...</span>
                </div>
                <p class="mt-3 text-muted">
                  {{ t('transactions.loading_stats') || 'Chargement des statistiques...' }}
                </p>
              </div>

              <!-- Statistics Content -->
              <div v-else-if="store.statistics?.by_status" class="row g-3">
                <!-- Pending -->
                <div class="col-xl-2 col-lg-4 col-md-4 col-sm-6">
                  <div class="status-card status-pending">
                    <div class="status-icon-wrapper status-icon-warning">
                      <i class="ti ti-clock"></i>
                    </div>
                    <div class="status-content">
                      <h3 class="status-count">{{ store.statistics.by_status.pending || 0 }}</h3>
                      <p class="status-label mb-0">
                        {{ t('transactions.pending') || 'En attente' }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Available -->
                <div class="col-xl-2 col-lg-4 col-md-4 col-sm-6">
                  <div class="status-card status-available">
                    <div class="status-icon-wrapper status-icon-info">
                      <i class="ti ti-check"></i>
                    </div>
                    <div class="status-content">
                      <h3 class="status-count">{{ store.statistics.by_status.available || 0 }}</h3>
                      <p class="status-label mb-0">
                        {{ t('transactions.available') || 'Disponible' }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Completed -->
                <div class="col-xl-2 col-lg-4 col-md-4 col-sm-6">
                  <div class="status-card status-completed">
                    <div class="status-icon-wrapper status-icon-success">
                      <i class="ti ti-circle-check"></i>
                    </div>
                    <div class="status-content">
                      <h3 class="status-count">{{ store.statistics.by_status.completed || 0 }}</h3>
                      <p class="status-label mb-0">
                        {{ t('transactions.completed') || 'Complétée' }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Cancelled -->
                <div class="col-xl-2 col-lg-4 col-md-4 col-sm-6">
                  <div class="status-card status-cancelled">
                    <div class="status-icon-wrapper status-icon-secondary">
                      <i class="ti ti-x"></i>
                    </div>
                    <div class="status-content">
                      <h3 class="status-count">{{ store.statistics.by_status.cancelled || 0 }}</h3>
                      <p class="status-label mb-0">
                        {{ t('transactions.cancelled') || 'Annulée' }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Failed -->
                <div class="col-xl-2 col-lg-4 col-md-4 col-sm-6">
                  <div class="status-card status-failed">
                    <div class="status-icon-wrapper status-icon-danger">
                      <i class="ti ti-alert-circle"></i>
                    </div>
                    <div class="status-content">
                      <h3 class="status-count">{{ store.statistics.by_status.failed || 0 }}</h3>
                      <p class="status-label mb-0">{{ t('transactions.failed') || 'Échouée' }}</p>
                    </div>
                  </div>
                </div>

                <!-- Expired -->
                <div class="col-xl-2 col-lg-4 col-md-4 col-sm-6">
                  <div class="status-card status-expired">
                    <div class="status-icon-wrapper status-icon-dark">
                      <i class="ti ti-clock-hour-4"></i>
                    </div>
                    <div class="status-content">
                      <h3 class="status-count">{{ store.statistics.by_status.expired || 0 }}</h3>
                      <p class="status-label mb-0">{{ t('transactions.expired') || 'Expirée' }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- No Data State -->
              <div v-else class="text-center py-5">
                <i class="ti ti-chart-pie text-muted" style="font-size: 3rem"></i>
                <p class="mt-3 text-muted">
                  {{ t('transactions.no_statistics') || 'Aucune statistique disponible' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-12">
          <TransactionsList
            :transactions="store.transaction_list"
            :meta="store.transactions?.meta || null"
            :loading="store.loading"
            :transaction-types="transactionTypeStore.transactionType_list"
            @add="handleAddTransaction"
            @edit="handleEditTransaction"
            @view="handleViewTransaction"
            @delete="handleDeleteTransaction"
            @cancel="handleCancelTransaction"
            @complete="handleCompleteTransaction"
            @show-statistics="handleShowStatistics"
            @search="handleSearch"
            @filter-change="handleFilterChange"
            @page-change="handlePageChange"
            @refresh="handleRefresh"
          />
        </div>
      </div>
      <!-- end row-->
    </div>

    <TransactionFormModal
      ref="transactionFormModalRef"
      :show="showModal"
      :form-data="formData"
      :is-editing="isEditing"
      :processing="store.processing"
      :transaction-types="filteredTransactionTypes"
      :branches="branchStore.branch_list"
      :wallets="walletStore.wallet_list"
      @close="handleCloseModal"
      @submit="handleSubmit"
    />

    <TransactionDetailsModal
      :show="showDetailsModal"
      :transaction="selectedTransaction"
      :loading="store.loadingTransaction"
      @close="handleCloseDetailsModal"
      @edit="handleEditFromDetails"
    />

    <TransactionStatisticsModal
      :show="showStatisticsModal"
      :statistics="store.statistics"
      :loading="store.loadingStatistics"
      @close="showStatisticsModal = false"
      @filter-change="handleStatisticsFilterChange"
    />

    <TransactionReceiptModal
      :show="showReceiptModal"
      :transaction="receiptTransaction"
      @close="showReceiptModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useHead } from '@vueuse/head'
import { usePermissions } from '@/composables/usePermissions'
import { useUserSettings } from '@/composables/useUserSettings'
import { useTransactionStore } from '@/stores/transactions'
import { useTransactionTypeStore } from '@/stores/transaction-types'
import { useBranchStore } from '@/stores/branches'
import { useWalletStore } from '@/stores/wallets'
import { useCurrencyStore } from '@/stores/currencies'
import { useI18n } from '@/composables/useI18n'
import TransactionsList from '@/components/Transactions/TransactionsList.vue'
import TransactionFormModal from '@/components/Transactions/TransactionFormModal.vue'
import TransactionDetailsModal from '@/components/Transactions/TransactionDetailsModal.vue'
import TransactionStatisticsModal from '@/components/Transactions/TransactionStatisticsModal.vue'
import TransactionReceiptModal from '@/components/Transactions/TransactionReceiptModal.vue'
import type { TransactionFormData, Transaction } from '@/types'
import Swal from 'sweetalert2'

const { t } = useI18n()
const { canCreateTransaction, canEditTransaction, isCaissier } = usePermissions()

// Caissier ne peut créer que des ravitaillements internes (wallet_wallet)
const filteredTransactionTypes = computed(() =>
  isCaissier.value
    ? transactionTypeStore.transactionType_list.filter((t: any) => t.code === 'wallet_wallet')
    : transactionTypeStore.transactionType_list
)

useHead({
  title: t('transactions.page_title'),
  meta: [
    {
      name: 'description',
      content: t('transactions.page_description'),
    },
  ],
})

const store = useTransactionStore()
const transactionTypeStore = useTransactionTypeStore()
const branchStore = useBranchStore()
const walletStore = useWalletStore()
const currencyStore = useCurrencyStore()

const transactionFormModalRef = ref<InstanceType<typeof TransactionFormModal>>()
const { settings: userSettings } = useUserSettings()
const autoPrintReceipt = () => userSettings.value.transactions?.autoPrintReceipt === true

const showModal = ref(false)
const showDetailsModal = ref(false)
const showStatisticsModal = ref(false)
const showReceiptModal = ref(false)
const isEditing = ref(false)
const selectedTransaction = ref<Transaction | null>(null)
const receiptTransaction = ref<Transaction | null>(null)
const formData = ref<TransactionFormData>({
  transaction_type_id: null,
  branch_id: null,
  destination_branch_id: null,
  customer_id: null,
  wallet_id: null,
  customer_phone: null,
  currency_code: 'CDF',
  gross_amount: null,
  fee_amount: null,
  fee_mode_applied: null,
  fee_rule_id: null,
  parent_transaction_id: null,
  withdrawal_code: null,
  expires_at: null,
  status: 'pending',
})

onMounted(async () => {
  await Promise.all([
    store.fetchTransactions(),
    transactionTypeStore.fetchTransactionTypes(),
    branchStore.fetchBranches(),
    walletStore.fetchWallets(),
    currencyStore.fetchAllCurrencies(),

    store.updateFilters({
      currency_id: undefined,
      start_date: undefined,
      end_date: undefined,
    }),
    store.fetchStatistics(),
  ])
})

const handleAddTransaction = () => {
  isEditing.value = false

  // Pré-sélectionner le type ravitaillement pour le caissier (son seul type autorisé)
  const preselectedTypeId = isCaissier.value
    ? (transactionTypeStore.transactionType_list.find((t: any) => t.code === 'wallet_wallet')?.id ?? null)
    : null

  formData.value = {
    transaction_type_id: preselectedTypeId,
    branch_id: null,
    destination_branch_id: null,
    customer_id: null,
    wallet_id: null,
    customer_phone: null,
    currency_code: 'CDF',
    gross_amount: null,
    fee_amount: null,
    fee_mode_applied: null,
    fee_rule_id: null,
    parent_transaction_id: null,
    withdrawal_code: null,
    expires_at: null,
    status: 'pending',
  }
  store.setCurrentTransaction(null)
  showModal.value = true
}

const handleEditTransaction = (transaction: Transaction) => {
  isEditing.value = true
  formData.value = {
    transaction_type_id: transaction.transaction_type_id,
    branch_id: transaction.branch_id,
    destination_branch_id: transaction.destination_branch_id,
    customer_id: transaction.customer_id,
    wallet_id: transaction.wallet_id,
    customer_phone: transaction.customer_phone,
    currency_code: transaction.currency_code ?? 'CDF',
    gross_amount: transaction.gross_amount,
    fee_amount: transaction.fee_amount,
    fee_mode_applied: transaction.fee_mode_applied,
    fee_rule_id: transaction.fee_rule_id,
    parent_transaction_id: transaction.parent_transaction_id,
    withdrawal_code: transaction.withdrawal_code,
    expires_at: transaction.expires_at,
    status: transaction.status,
  }
  store.setCurrentTransaction(transaction)
  showModal.value = true
}

const handleViewTransaction = async (transaction: Transaction) => {
  console.log('Transaction received:', transaction)
  console.log('Transaction ID:', transaction.id)
  console.log('Transaction UUID:', transaction.uuid)

  // Use id or fallback to uuid
  const transactionId = transaction.id || transaction.uuid

  if (!transactionId) {
    Swal.fire({
      title: t('transactions.error') || 'Erreur!',
      text: 'ID de transaction invalide',
      icon: 'error',
    })
    return
  }

  // Show modal immediately and start loading
  showDetailsModal.value = true
  selectedTransaction.value = null

  try {
    const fullTransaction = await store.fetchTransaction(transactionId)
    console.log('Full transaction details:', fullTransaction)
    selectedTransaction.value = fullTransaction
  } catch (error) {
    console.error('Error fetching transaction:', error)
    showDetailsModal.value = false
    Swal.fire({
      title: t('transactions.error') || 'Erreur!',
      text: t('transactions.fetch_error') || 'Erreur lors du chargement des détails.',
      icon: 'error',
    })
  }
}

const handleCloseDetailsModal = () => {
  showDetailsModal.value = false
  selectedTransaction.value = null
}

const handleEditFromDetails = (transaction: Transaction) => {
  showDetailsModal.value = false
  handleEditTransaction(transaction)
}

const handleDeleteTransaction = (id: string) => {
  Swal.fire({
    title: t('transactions.confirm_delete_title') || 'Êtes-vous sûr?',
    text: t('transactions.confirm_delete_text') || 'Cette action ne peut pas être annulée!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: t('transactions.confirm_delete_button') || 'Oui, supprimer!',
    cancelButtonText: t('transactions.cancel') || 'Annuler',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await store.deleteTransaction(id)
        store.fetchStatistics()
        Swal.fire({
          title: t('transactions.success') || 'Succès!',
          text: t('transactions.delete_success') || 'Transaction supprimée avec succès.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (error) {
        console.error('Error deleting transaction:', error)
        Swal.fire({
          title: t('transactions.error') || 'Erreur!',
          text: t('transactions.delete_error') || 'Échec de la suppression.',
          icon: 'error',
        })
      }
    }
  })
}

const handleCancelTransaction = async (id: string) => {
  const result = await Swal.fire({
    title: t('transactions.confirm_cancel_title') || 'Annuler la transaction?',
    icon: 'warning',
    input: 'textarea',
    inputLabel: t('transactions.cancel_reason_label') || 'Raison (optionnel)',
    inputPlaceholder: t('transactions.cancel_reason_placeholder') || 'Ex: doublon, erreur de saisie...',
    inputAttributes: { maxlength: '1000', rows: '3' },
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: t('transactions.confirm_cancel_button') || 'Oui, annuler!',
    cancelButtonText: t('transactions.cancel') || 'Non',
  })

  if (result.isConfirmed) {
    try {
      await store.cancelTransaction(id, result.value || undefined)
      store.fetchStatistics()
      Swal.fire({
        title: t('transactions.success') || 'Succès!',
        text: t('transactions.cancel_success') || 'Transaction annulée avec succès.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error('Error cancelling transaction:', error)
      Swal.fire({
        title: t('transactions.error') || 'Erreur!',
        text: t('transactions.cancel_error') || "Échec de l'annulation.",
        icon: 'error',
      })
    }
  }
}

const handleCompleteTransaction = async (id: string) => {
  const result = await Swal.fire({
    title: t('transactions.confirm_complete_title') || 'Compléter la transaction?',
    icon: 'question',
    input: 'textarea',
    inputLabel: t('transactions.complete_note_label') || 'Note / Code externe (optionnel)',
    inputPlaceholder: t('transactions.complete_note_placeholder') || 'Ex: code Airtel Money, référence externe...',
    inputAttributes: { maxlength: '1000', rows: '3' },
    showCancelButton: true,
    confirmButtonColor: '#28a745',
    cancelButtonColor: '#3085d6',
    confirmButtonText: t('transactions.confirm_complete_button') || 'Oui, compléter!',
    cancelButtonText: t('transactions.cancel') || 'Annuler',
  })

  if (result.isConfirmed) {
    try {
      const response = await store.completeTransaction(id, result.value || undefined)

      // Recharger les statistiques
      store.fetchStatistics()

      // Show success message
      await Swal.fire({
        title: t('transactions.success') || 'Succès!',
        text: t('transactions.complete_success') || 'Transaction complétée avec succès.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      })

      // Extract transaction data from response (backend returns it with receipt data)
      const transactionData = response.data?.transaction || response.transaction

      // Afficher le reçu uniquement si "Impression automatique" est activé
      if (transactionData && autoPrintReceipt()) {
        receiptTransaction.value = transactionData
        showReceiptModal.value = true
      }
    } catch (error) {
      console.error('Error completing transaction:', error)
      Swal.fire({
        title: t('transactions.error') || 'Erreur!',
        text: t('transactions.complete_error') || 'Échec de la complétion.',
        icon: 'error',
      })
    }
  }
}

const handleShowStatistics = async () => {
  // Ouvrir le modal immédiatement
  showStatisticsModal.value = true

  try {
    // Toujours charger avec les filtres par défaut (devise + date du jour)
    const today = new Date().toISOString().split('T')[0]
    const defaultCurrencyId =
      currencyStore.defaultCurrency?.id || currencyStore.activeCurrencies[0]?.id

    if (defaultCurrencyId) {
      store.updateFilters({
        currency_id: defaultCurrencyId,
        start_date: today,
        end_date: today,
      })

      await store.fetchStatistics()
    }
  } catch (error) {
    console.error('Error fetching statistics:', error)
    showStatisticsModal.value = false
    Swal.fire({
      title: t('transactions.error') || 'Erreur!',
      text: t('transactions.stats_error') || 'Erreur lors du chargement des statistiques.',
      icon: 'error',
    })
  }
}

const handleStatisticsFilterChange = async (filters: any) => {
  // Vérifier qu'une devise est sélectionnée
  if (!filters.currencyId) {
    return
  }

  try {
    // Calculate date range based on period
    const dateFilters: any = {}

    if (filters.period !== 'custom') {
      const today = new Date()
      const startDate = new Date()

      switch (filters.period) {
        case 'today':
          dateFilters.start_date = today.toISOString().split('T')[0]
          dateFilters.end_date = today.toISOString().split('T')[0]
          break
        case 'yesterday':
          startDate.setDate(today.getDate() - 1)
          dateFilters.start_date = startDate.toISOString().split('T')[0]
          dateFilters.end_date = startDate.toISOString().split('T')[0]
          break
        case 'week':
          startDate.setDate(today.getDate() - today.getDay())
          dateFilters.start_date = startDate.toISOString().split('T')[0]
          dateFilters.end_date = today.toISOString().split('T')[0]
          break
        case 'month':
          startDate.setDate(1)
          dateFilters.start_date = startDate.toISOString().split('T')[0]
          dateFilters.end_date = today.toISOString().split('T')[0]
          break
        case 'last_month':
          // Premier jour du mois passé
          startDate.setMonth(today.getMonth() - 1, 1)
          dateFilters.start_date = startDate.toISOString().split('T')[0]
          // Dernier jour du mois passé
          const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
          dateFilters.end_date = lastDayOfLastMonth.toISOString().split('T')[0]
          break
        case 'year':
          startDate.setMonth(0, 1)
          dateFilters.start_date = startDate.toISOString().split('T')[0]
          dateFilters.end_date = today.toISOString().split('T')[0]
          break
      }
    } else {
      dateFilters.start_date = filters.startDate
      dateFilters.end_date = filters.endDate
    }

    // Add currency filter
    dateFilters.currency_id = filters.currencyId

    // Update store filters and fetch statistics
    store.updateFilters(dateFilters)
    await store.fetchStatistics()
  } catch (error) {
    console.error('Error fetching filtered statistics:', error)
    Swal.fire({
      title: t('transactions.error') || 'Erreur!',
      text: t('transactions.stats_error') || 'Erreur lors du chargement des statistiques.',
      icon: 'error',
    })
  }
}

const handleSearch = (query: string) => {
  store.updateFilters({ search: query })
  store.fetchTransactions()
}

const handleFilterChange = (filters: any) => {
  store.updateFilters(filters)
  store.fetchTransactions()
}

const handlePageChange = (page: number) => {
  store.fetchTransactions(page)
}

const handleRefresh = () => {
  store.fetchTransactions()
}

const handleCloseModal = () => {
  showModal.value = false
  store.setCurrentTransaction(null)
}

const handleSubmit = async (data: TransactionFormData) => {
  try {
    const response = await store.storeTransaction(data)
    showModal.value = false

    // Recharger les statistiques globales après sauvegarde
    store.updateFilters({
      currency_id: undefined,
      start_date: undefined,
      end_date: undefined,
    })
    store.fetchStatistics()

    await Swal.fire({
      title: t('transactions.success') || 'Succès!',
      text: isEditing.value
        ? t('transactions.update_success') || 'Transaction mise à jour avec succès.'
        : t('transactions.create_success') || 'Transaction créée avec succès.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    })

    // Afficher le reçu uniquement si "Impression automatique" est activé
    if (!isEditing.value && autoPrintReceipt()) {
      const transactionData = response?.data
      if (transactionData) {
        receiptTransaction.value = transactionData
        showReceiptModal.value = true
      }
    }
  } catch (error: any) {
    transactionFormModalRef.value?.setProcessing(false)
    console.error('Error saving transaction:', error)
    const errorMessage =
      error.response?.data?.message ||
      (isEditing.value
        ? t('transactions.update_error') || 'Échec de la mise à jour.'
        : t('transactions.create_error') || 'Échec de la création.')
    Swal.fire({
      title: t('transactions.error') || 'Erreur!',
      text: errorMessage,
      icon: 'error',
    })
  }
}
</script>

<style scoped>
/* Status Cards */
.status-card {
  position: relative;
  padding: 1.5rem;
  border-radius: 0.75rem;
  background: var(--vz-card-bg-custom);
  border: 1px solid var(--vz-border-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.status-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--status-color), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.status-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-color: var(--status-color);
}

.status-card:hover::before {
  opacity: 1;
}

/* Icon Wrapper */
.status-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  transition: all 0.3s ease;
  position: relative;
}

.status-card:hover .status-icon-wrapper {
  transform: scale(1.1);
}

.status-icon-warning {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 193, 7, 0.2));
  color: #ffc107;
}

.status-icon-info {
  background: linear-gradient(135deg, rgba(13, 202, 240, 0.1), rgba(13, 202, 240, 0.2));
  color: #0dcaf0;
}

.status-icon-success {
  background: linear-gradient(135deg, rgba(25, 135, 84, 0.1), rgba(25, 135, 84, 0.2));
  color: #198754;
}

.status-icon-secondary {
  background: linear-gradient(135deg, rgba(108, 117, 125, 0.1), rgba(108, 117, 125, 0.2));
  color: #6c757d;
}

.status-icon-danger {
  background: linear-gradient(135deg, rgba(220, 53, 69, 0.1), rgba(220, 53, 69, 0.2));
  color: #dc3545;
}

.status-icon-dark {
  background: linear-gradient(135deg, rgba(33, 37, 41, 0.1), rgba(33, 37, 41, 0.2));
  color: #495057;
}

/* Status Content */
.status-content {
  text-align: center;
  width: 100%;
}

.status-count {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: var(--vz-body-color);
  line-height: 1;
  transition: color 0.3s ease;
}

.status-label {
  font-size: 0.813rem;
  font-weight: 500;
  color: var(--vz-body-color-rgb);
  opacity: 0.7;
  text-transform: capitalize;
  letter-spacing: 0.3px;
}

/* Status Specific Colors */
.status-pending {
  --status-color: #ffc107;
}

.status-available {
  --status-color: #0dcaf0;
}

.status-completed {
  --status-color: #198754;
}

.status-cancelled {
  --status-color: #6c757d;
}

.status-failed {
  --status-color: #dc3545;
}

.status-expired {
  --status-color: #495057;
}

/* Hover Effects for Count */
.status-pending:hover .status-count {
  color: #ffc107;
}

.status-available:hover .status-count {
  color: #0dcaf0;
}

.status-completed:hover .status-count {
  color: #198754;
}

.status-cancelled:hover .status-count {
  color: #6c757d;
}

.status-failed:hover .status-count {
  color: #dc3545;
}

.status-expired:hover .status-count {
  color: #495057;
}

/* Responsive Adjustments */
@media (max-width: 1200px) {
  .status-icon-wrapper {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }

  .status-count {
    font-size: 1.75rem;
  }
}

@media (max-width: 768px) {
  .status-card {
    padding: 1.25rem;
  }

  .status-icon-wrapper {
    width: 44px;
    height: 44px;
    font-size: 18px;
  }

  .status-count {
    font-size: 1.5rem;
  }

  .status-label {
    font-size: 0.75rem;
  }
}
</style>
