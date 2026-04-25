<template>
  <div class="row">
    <div class="col-12">
      <div class="d-flex align-items-sm-center flex-sm-row flex-column my-3">
        <div class="flex-grow-1">
          <h4 class="fs-xl mb-1">{{ t('transaction_types.page_title') }}</h4>
          <p class="text-muted mb-0">{{ t('transaction_types.page_description') }}</p>
        </div>
      </div>

      <div class="row">
        <div class="col-12">
          <TransactionTypesList
            :transaction-types="store.transactionType_list"
            :meta="meta"
            :loading="store.loading"
            @add="handleAddTransactionType"
            @edit="handleEditTransactionType"
            @delete="handleDeleteTransactionType"
            @search="handleSearch"
            @page-change="handlePageChange"
            @per-page-change="handlePerPageChange"
          />
        </div>
      </div>
      <!-- end row-->

      <!-- Transaction Type Form Modal -->
      <TransactionTypeFormModal
        :show="showModal"
        :form-data="formData"
        :is-editing="isEditing"
        :processing="store.processing"
        @close="showModal = false"
        @submit="handleSubmitTransactionType"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useHead } from '@vueuse/head'
import { useTransactionTypeStore } from '@/stores/transaction-types'
import { useI18n } from '@/composables/useI18n'
import TransactionTypesList from '@/components/TransactionTypes/TransactionTypesList.vue'
import TransactionTypeFormModal from '@/components/TransactionTypes/TransactionTypeFormModal.vue'
import type { TransactionTypeFormData } from '@/types'
import Swal from 'sweetalert2'

const { t } = useI18n()
const store = useTransactionTypeStore()

useHead({
  title: computed(() => t('transaction_types.page_title')),
})

const showModal = ref(false)
const isEditing = ref(false)
const formData = reactive<TransactionTypeFormData>({
  code: '',
  name: '',
  description: '',
  branch_effect: 'none',
  branch_amount: 'gross',
  wallet_effect: 'none',
  wallet_amount: 'gross',
  dest_wallet_effect: 'none',
  dest_wallet_amount: 'gross',
  dest_branch_effect: 'none',
  dest_branch_amount: 'gross',
})

const meta = computed(() => store.transactionTypes?.meta || null)

onMounted(() => {
  store.fetchTransactionTypes()
})

const handleAddTransactionType = () => {
  isEditing.value = false
  formData.code = ''
  formData.name = ''
  formData.description = ''
  formData.branch_effect = 'none'
  formData.branch_amount = 'gross'
  formData.wallet_effect = 'none'
  formData.wallet_amount = 'gross'
  formData.dest_wallet_effect = 'none'
  formData.dest_wallet_amount = 'gross'
  formData.dest_branch_effect = 'none'
  formData.dest_branch_amount = 'gross'
  store.setCurrentTransactionType(null)
  showModal.value = true
}

const handleEditTransactionType = (transactionType: any) => {
  isEditing.value = true
  formData.code = transactionType.code
  formData.name = transactionType.name
  formData.description = transactionType.description || ''
  formData.branch_effect = transactionType.branch_effect ?? 'none'
  formData.branch_amount = transactionType.branch_amount ?? 'gross'
  formData.wallet_effect = transactionType.wallet_effect ?? 'none'
  formData.wallet_amount = transactionType.wallet_amount ?? 'gross'
  formData.dest_wallet_effect = transactionType.dest_wallet_effect ?? 'none'
  formData.dest_wallet_amount = transactionType.dest_wallet_amount ?? 'gross'
  formData.dest_branch_effect = transactionType.dest_branch_effect ?? 'none'
  formData.dest_branch_amount = transactionType.dest_branch_amount ?? 'gross'
  store.setCurrentTransactionType(transactionType)
  showModal.value = true
}

const handleDeleteTransactionType = (id: number) => {
  Swal.fire({
    title: t('transaction_types.confirm_delete_title') || 'Are you sure?',
    text: t('transaction_types.confirm_delete_text') || 'This action cannot be undone!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: t('transaction_types.confirm_delete_button') || 'Yes, delete it!',
    cancelButtonText: t('transaction_types.cancel') || 'Cancel',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await store.deleteTransactionType(id)
        Swal.fire({
          title: t('transaction_types.deleted') || 'Deleted!',
          text: t('transaction_types.deleted_success') || 'Transaction type has been deleted.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (error) {
        console.error('Error deleting transaction type:', error)
        Swal.fire({
          title: t('transaction_types.error') || 'Error!',
          text: t('transaction_types.delete_error') || 'Failed to delete transaction type.',
          icon: 'error',
        })
      }
    }
  })
}

const handleSearch = (query: string) => {
  store.filters.search = query
  store.fetchTransactionTypes()
}

const handlePageChange = (page: number) => {
  // Implement page change logic if needed
  store.fetchTransactionTypes()
}

const handlePerPageChange = (perPage: number) => {
  store.filters.perPage = perPage
  store.fetchTransactionTypes()
}

const handleSubmitTransactionType = async (data: TransactionTypeFormData) => {
  try {
    await store.storeTransactionType(data)
    showModal.value = false
    Swal.fire({
      title: t('transaction_types.success') || 'Success!',
      text: isEditing.value
        ? t('transaction_types.updated_success') || 'Transaction type updated successfully.'
        : t('transaction_types.created_success') || 'Transaction type created successfully.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    })
  } catch (error) {
    console.error('Error saving transaction type:', error)
    Swal.fire({
      title: t('transaction_types.error') || 'Error!',
      text: t('transaction_types.save_error') || 'Failed to save transaction type.',
      icon: 'error',
    })
  }
}
</script>
