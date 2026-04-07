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
          <button @click.prevent="handleAddTransaction" type="button" class="btn btn-primary me-2">
            <i class="ti ti-plus me-1"></i> {{ t('transactions.add_transaction') }}
          </button>
          <button @click.prevent="handleShowStatistics" type="button" class="btn btn-info">
            <i class="ti ti-chart-bar me-1"></i> {{ t('transactions.statistics') }}
          </button>
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
      :show="showModal"
      :form-data="formData"
      :is-editing="isEditing"
      :processing="store.processing"
      :transaction-types="transactionTypeStore.transactionType_list"
      :branches="branchStore.branch_list"
      :wallets="walletStore.wallet_list"
      @close="handleCloseModal"
      @submit="handleSubmit"
    />

    <TransactionDetailsModal
      :show="showDetailsModal"
      :transaction="selectedTransaction"
      :loading="isLoadingDetails"
      @close="handleCloseDetailsModal"
      @edit="handleEditFromDetails"
    />

    <TransactionStatisticsModal
      :show="showStatisticsModal"
      :statistics="store.statistics"
      :loading="isLoadingStatistics"
      @close="showStatisticsModal = false"
      @filter-change="handleStatisticsFilterChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useHead } from '@vueuse/head'
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
import type { TransactionFormData, Transaction } from '@/types'
import Swal from 'sweetalert2'

const { t } = useI18n()

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

const showModal = ref(false)
const showDetailsModal = ref(false)
const showStatisticsModal = ref(false)
const isEditing = ref(false)
const selectedTransaction = ref<Transaction | null>(null)
const isLoadingDetails = ref(false)
const isLoadingStatistics = ref(false)
const formData = ref<TransactionFormData>({
  transaction_type_id: null,
  branch_id: null,
  destination_branch_id: null,
  customer_id: null,
  wallet_id: null,
  customer_phone: null,
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
  ])
})

const handleAddTransaction = () => {
  isEditing.value = false
  formData.value = {
    transaction_type_id: null,
    branch_id: null,
    destination_branch_id: null,
    customer_id: null,
    wallet_id: null,
    customer_phone: null,
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

  // Show modal immediately with loading state
  showDetailsModal.value = true
  isLoadingDetails.value = true
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
  } finally {
    isLoadingDetails.value = false
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

const handleCancelTransaction = (id: string) => {
  Swal.fire({
    title: t('transactions.confirm_cancel_title') || 'Annuler la transaction?',
    text: t('transactions.confirm_cancel_text') || 'Cette action ne peut pas être annulée!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#orange',
    cancelButtonColor: '#3085d6',
    confirmButtonText: t('transactions.confirm_cancel_button') || 'Oui, annuler!',
    cancelButtonText: t('transactions.cancel') || 'Non',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await store.cancelTransaction(id)
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
  })
}

const handleCompleteTransaction = (id: string) => {
  Swal.fire({
    title: t('transactions.confirm_complete_title') || 'Compléter la transaction?',
    text:
      t('transactions.confirm_complete_text') ||
      'Cette action marquera la transaction comme complétée.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#28a745',
    cancelButtonColor: '#3085d6',
    confirmButtonText: t('transactions.confirm_complete_button') || 'Oui, compléter!',
    cancelButtonText: t('transactions.cancel') || 'Annuler',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await store.completeTransaction(id)
        Swal.fire({
          title: t('transactions.success') || 'Succès!',
          text: t('transactions.complete_success') || 'Transaction complétée avec succès.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (error) {
        console.error('Error completing transaction:', error)
        Swal.fire({
          title: t('transactions.error') || 'Erreur!',
          text: t('transactions.complete_error') || 'Échec de la complétion.',
          icon: 'error',
        })
      }
    }
  })
}

const handleShowStatistics = async () => {
  // Show modal immediately with loading state
  showStatisticsModal.value = true
  isLoadingStatistics.value = true

  try {
    // Set default filters: default currency and today's date
    const today = new Date().toISOString().split('T')[0]
    const defaultCurrencyId =
      currencyStore.defaultCurrency?.id || currencyStore.activeCurrencies[0]?.id

    store.updateFilters({
      currency_id: defaultCurrencyId,
      start_date: today,
      end_date: today,
    })

    await store.fetchStatistics()
  } catch (error) {
    console.error('Error fetching statistics:', error)
    showStatisticsModal.value = false
    Swal.fire({
      title: t('transactions.error') || 'Erreur!',
      text: t('transactions.stats_error') || 'Erreur lors du chargement des statistiques.',
      icon: 'error',
    })
  } finally {
    isLoadingStatistics.value = false
  }
}

const handleStatisticsFilterChange = async (filters: any) => {
  // Vérifier qu'une devise est sélectionnée
  if (!filters.currencyId) {
    return
  }

  isLoadingStatistics.value = true

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
  } finally {
    isLoadingStatistics.value = false
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
    await store.storeTransaction(data)
    showModal.value = false
    Swal.fire({
      title: t('transactions.success') || 'Succès!',
      text: isEditing.value
        ? t('transactions.update_success') || 'Transaction mise à jour avec succès.'
        : t('transactions.create_success') || 'Transaction créée avec succès.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    })
  } catch (error: any) {
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
