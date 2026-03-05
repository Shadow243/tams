<template>
  <div class="row">
    <div class="col-12">
      <div class="d-flex align-items-sm-center flex-sm-row flex-column my-3">
        <div class="flex-grow-1">
          <h4 class="fs-xl mb-1">
            {{ t('fee_rules.page_title') || 'Règles de frais' }}
          </h4>
          <p class="text-muted mb-0">
            {{
              t('fee_rules.page_description') || 'Gérer les règles de frais pour les transactions'
            }}
          </p>
        </div>
      </div>

      <div class="row">
        <div class="col-12">
          <FeeRulesList
            :fee-rules="store.feeRule_list"
            :meta="meta"
            :loading="store.loading"
            @add="handleAddFeeRule"
            @edit="handleEditFeeRule"
            @delete="handleDeleteFeeRule"
            @toggle-status="handleToggleStatus"
            @search="handleSearch"
            @filter-change="handleFilterChange"
            @page-change="handlePageChange"
            @per-page-change="handlePerPageChange"
          />
        </div>
      </div>
      <!-- end row-->

      <!-- Fee Rule Form Modal -->
      <FeeRuleFormModal
        :show="showModal"
        :form-data="formData"
        :is-editing="isEditing"
        :processing="store.processing"
        :transaction-types="transactionTypes"
        :operators="operators"
        :branches="branches"
        @close="showModal = false"
        @submit="handleSubmitFeeRule"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useHead } from '@vueuse/head'
import { useFeeRuleStore } from '@/stores/fee-rules'
import { useTransactionTypeStore } from '@/stores/transaction-types'
import { useOperatorStore } from '@/stores/operators'
import { useBranchStore } from '@/stores/branches'
import { useI18n } from '@/composables/useI18n'
import FeeRulesList from '@/components/FeeRules/FeeRulesList.vue'
import FeeRuleFormModal from '@/components/FeeRules/FeeRuleFormModal.vue'
import type { FeeRuleFormData } from '@/types'
import Swal from 'sweetalert2'

const { t } = useI18n()
const store = useFeeRuleStore()
const transactionTypeStore = useTransactionTypeStore()
const operatorStore = useOperatorStore()
const branchStore = useBranchStore()

useHead({
  title: computed(() => t('fee_rules.page_title') || 'Règles de frais'),
})

const showModal = ref(false)
const isEditing = ref(false)
const formData = reactive<FeeRuleFormData>({
  transaction_type_id: null,
  operator_id: null,
  branch_id: null,
  fee_mode: 'fixed',
  value: null,
  min_fee: null,
  max_fee: null,
  is_active: true,
})

const meta = computed(() => store.feeRules?.meta || null)
const transactionTypes = computed(() => transactionTypeStore.transactionType_list)
const operators = computed(() => operatorStore.operator_list)
const branches = computed(() => branchStore.branch_list)

onMounted(async () => {
  // Load fee rules
  await store.fetchFeeRules()
  // Load related data for dropdowns
  await Promise.all([
    transactionTypeStore.fetchTransactionTypes(),
    operatorStore.fetchOperators(),
    branchStore.fetchBranches(),
  ])
})

const handleAddFeeRule = () => {
  isEditing.value = false
  formData.transaction_type_id = null
  formData.operator_id = null
  formData.branch_id = null
  formData.fee_mode = 'fixed'
  formData.value = null
  formData.min_fee = null
  formData.max_fee = null
  formData.is_active = true
  store.setCurrentFeeRule(null)
  showModal.value = true
}

const handleEditFeeRule = (feeRule: any) => {
  isEditing.value = true
  Object.assign(formData, {
    transaction_type_id: feeRule.transaction_type_id,
    operator_id: feeRule.operator_id,
    branch_id: feeRule.branch_id,
    fee_mode: feeRule.fee_mode,
    value: feeRule.value,
    min_fee: feeRule.min_fee,
    max_fee: feeRule.max_fee,
    is_active: feeRule.is_active,
  })
  store.setCurrentFeeRule(feeRule)
  showModal.value = true
}

const handleDeleteFeeRule = (id: number) => {
  Swal.fire({
    title: t('fee_rules.confirm_delete_title') || 'Êtes-vous sûr?',
    text: t('fee_rules.confirm_delete_text') || 'Cette action ne peut pas être annulée!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: t('fee_rules.confirm_delete_button') || 'Oui, supprimer!',
    cancelButtonText: t('fee_rules.cancel') || 'Annuler',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await store.deleteFeeRule(id)
        Swal.fire({
          title: t('fee_rules.deleted') || 'Supprimé!',
          text: t('fee_rules.deleted_success') || 'La règle de frais a été supprimée.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (error) {
        console.error('Error deleting fee rule:', error)
        Swal.fire({
          title: t('fee_rules.error') || 'Erreur!',
          text: t('fee_rules.delete_error') || 'Échec de la suppression de la règle de frais.',
          icon: 'error',
        })
      }
    }
  })
}

const handleToggleStatus = async (id: number) => {
  try {
    await store.toggleFeeRuleStatus(id)
    Swal.fire({
      title: t('fee_rules.success') || 'Succès!',
      text: t('fee_rules.status_updated_success') || 'Le statut de la règle a été modifié.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    })
  } catch (error) {
    console.error('Error toggling fee rule status:', error)
    Swal.fire({
      title: t('fee_rules.error') || 'Erreur!',
      text: t('fee_rules.status_update_error') || 'Échec de la modification du statut.',
      icon: 'error',
    })
  }
}

const handleSearch = (query: string) => {
  store.filters.search = query
  store.fetchFeeRules()
}

const handleFilterChange = (filters: any) => {
  if (filters.fee_mode !== undefined) {
    store.filters.fee_mode = filters.fee_mode
  }
  if (filters.is_active !== undefined) {
    store.filters.is_active = filters.is_active
  }
  store.fetchFeeRules()
}

const handlePageChange = (page: number) => {
  // Implement page change logic if needed
  store.fetchFeeRules()
}

const handlePerPageChange = (perPage: number) => {
  store.filters.perPage = perPage
  store.fetchFeeRules()
}

const handleSubmitFeeRule = async (data: FeeRuleFormData) => {
  try {
    await store.storeFeeRule(data)
    showModal.value = false
    Swal.fire({
      title: t('fee_rules.success') || 'Succès!',
      text: isEditing.value
        ? t('fee_rules.updated_success') || 'Règle de frais modifiée avec succès.'
        : t('fee_rules.created_success') || 'Règle de frais créée avec succès.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    })
  } catch (error: any) {
    console.error('Error saving fee rule:', error)

    // Extract error message from response
    const errorMsg =
      error?.response?.data?.message ||
      t('fee_rules.save_error') ||
      "Échec de l'enregistrement de la règle de frais."

    Swal.fire({
      title: t('fee_rules.error') || 'Erreur!',
      text: errorMsg,
      icon: 'error',
    })
  }
}
</script>
