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
          <button @click="handleAddTransaction" type="button" class="btn btn-primary me-2">
            <i class="ti ti-plus me-1"></i> {{ t('transactions.add_transaction') }}
          </button>
          <button @click="handleShowStatistics" type="button" class="btn btn-info">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useHead } from '@vueuse/head'
import { useTransactionStore } from '@/stores/transactions'
import { useTransactionTypeStore } from '@/stores/transaction-types'
import { useBranchStore } from '@/stores/branches'
import { useWalletStore } from '@/stores/wallets'
import { useI18n } from '@/composables/useI18n'
import TransactionsList from '@/components/Transactions/TransactionsList.vue'
import TransactionFormModal from '@/components/Transactions/TransactionFormModal.vue'
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

const showModal = ref(false)
const isEditing = ref(false)
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
  Object.assign(formData, {
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
  })
  store.setCurrentTransaction(transaction)
  showModal.value = true
}

const handleViewTransaction = async (transaction: Transaction) => {
  try {
    const fullTransaction = await store.fetchTransaction(transaction.id)

    let html = `
      <div class="text-start">
        <p><strong>${t('transactions.reference')}:</strong> ${fullTransaction.reference}</p>
        <p><strong>${t('transactions.type')}:</strong> ${fullTransaction.transaction_type?.name}</p>
        <p><strong>${t('transactions.branch')}:</strong> ${fullTransaction.branch?.name}</p>
        ${
          fullTransaction.customer
            ? `<p><strong>${t('transactions.customer')}:</strong> ${
                fullTransaction.customer.full_name
              } (${fullTransaction.customer.phone})</p>`
            : ''
        }
        ${
          fullTransaction.customer_phone
            ? `<p><strong>${t('transactions.phone')}:</strong> ${
                fullTransaction.customer_phone
              }</p>`
            : ''
        }
        <hr>
        <p><strong>${t('transactions.gross_amount')}:</strong> ${formatCurrency(
      fullTransaction.gross_amount
    )}</p>
        <p><strong>${t('transactions.fee_amount')}:</strong> ${formatCurrency(
      fullTransaction.fee_amount
    )} (${fullTransaction.fee_mode_applied_label})</p>
        <p><strong>${t('transactions.net_amount')}:</strong> ${formatCurrency(
      fullTransaction.net_amount
    )}</p>
        <hr>
        <p><strong>${t('transactions.status')}:</strong> <span class="badge bg-${
      fullTransaction.status_color
    }">${fullTransaction.status_label}</span></p>
        ${
          fullTransaction.withdrawal_code
            ? `<p><strong>${t('transactions.withdrawal_code')}:</strong> ${
                fullTransaction.withdrawal_code
              }</p>`
            : ''
        }
        ${
          fullTransaction.expires_at
            ? `<p><strong>${t('transactions.expires_at')}:</strong> ${new Date(
                fullTransaction.expires_at
              ).toLocaleString()}</p>`
            : ''
        }
        <p><strong>${t('transactions.created_by')}:</strong> ${fullTransaction.user?.name}</p>
        <p><strong>${t('transactions.created_at')}:</strong> ${new Date(
      fullTransaction.created_at
    ).toLocaleString()}</p>
      </div>
    `

    Swal.fire({
      title: t('transactions.transaction_details') || 'Détails de la transaction',
      html: html,
      width: '600px',
      confirmButtonText: t('transactions.close') || 'Fermer',
    })
  } catch (error) {
    console.error('Error fetching transaction:', error)
  }
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
  try {
    await store.fetchStatistics()
    const stats = store.statistics

    if (stats) {
      Swal.fire({
        title: t('transactions.statistics') || 'Statistiques',
        html: `
          <div class="text-start">
            <h6>${t('transactions.total_transactions')}:</h6>
            <p class="lead">${stats.total_transactions}</p>
            <hr>
            <p><strong>${t('transactions.total_amount')}:</strong> ${formatCurrency(
          stats.total_amount
        )}</p>
            <p><strong>${t('transactions.total_fees')}:</strong> ${formatCurrency(
          stats.total_fees
        )}</p>
            <p><strong>${t('transactions.total_net')}:</strong> ${formatCurrency(
          stats.total_net
        )}</p>
            <hr>
            <h6>${t('transactions.by_status')}:</h6>
            <ul class="list-unstyled">
              <li><span class="badge bg-warning">${t('transactions.pending')}</span>: ${
          stats.by_status.pending
        }</li>
              <li><span class="badge bg-info">${t('transactions.available')}</span>: ${
          stats.by_status.available
        }</li>
              <li><span class="badge bg-success">${t('transactions.completed')}</span>: ${
          stats.by_status.completed
        }</li>
              <li><span class="badge bg-secondary">${t('transactions.cancelled')}</span>: ${
          stats.by_status.cancelled
        }</li>
              <li><span class="badge bg-danger">${t('transactions.failed')}</span>: ${
          stats.by_status.failed
        }</li>
              <li><span class="badge bg-dark">${t('transactions.expired')}</span>: ${
          stats.by_status.expired
        }</li>
            </ul>
          </div>
        `,
        width: '500px',
        confirmButtonText: t('transactions.close') || 'Fermer',
      })
    }
  } catch (error) {
    console.error('Error fetching statistics:', error)
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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
  }).format(amount)
}
</script>
