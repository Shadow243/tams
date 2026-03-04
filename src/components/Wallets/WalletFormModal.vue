<template>
  <div
    v-if="show"
    class="modal fade show d-block"
    tabindex="-1"
    style="background-color: rgba(0, 0, 0, 0.5)"
    @click.self="handleCancel"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ isEditing ? t('wallets.editWallet') : t('wallets.addWallet') }}
          </h5>
          <button type="button" class="btn-close" @click="handleCancel"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">{{ t('wallets.form.branch') || 'Branch' }} *</label>
                <select v-model="localForm.branch_id" class="form-select" required>
                  <option :value="null" disabled>
                    {{ t('wallets.form.selectBranch') || 'Select a branch' }}
                  </option>
                  <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                    {{ branch.name }}
                  </option>
                </select>
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label">{{ t('wallets.form.operator') || 'Operator' }} *</label>
                <select v-model="localForm.operator_id" class="form-select" required>
                  <option :value="null" disabled>
                    {{ t('wallets.form.selectOperator') || 'Select an operator' }}
                  </option>
                  <option v-for="operator in operators" :key="operator.id" :value="operator.id">
                    {{ operator.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label"
                  >{{ t('wallets.form.wallet_number') || 'Wallet Number' }} *</label
                >
                <input
                  v-model="localForm.wallet_number"
                  type="text"
                  class="form-control"
                  :placeholder="t('wallets.form.wallet_numberPlaceholder') || '1234567890'"
                  required
                />
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label">{{ t('wallets.form.status') || 'Status' }}</label>
                <select v-model="localForm.status" class="form-select">
                  <option value="active">
                    {{ t('wallets.status.active') || 'Active' }}
                  </option>
                  <option value="inactive">
                    {{ t('wallets.status.inactive') || 'Inactive' }}
                  </option>
                </select>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">{{ t('wallets.form.balance') || 'Balance' }}</label>
                <input
                  v-model="localForm.balance"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-control"
                  :placeholder="t('wallets.form.balancePlaceholder') || '0.00'"
                />
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label">{{ t('wallets.form.currency') || 'Currency' }}</label>
                <input
                  v-model="localForm.currency"
                  type="text"
                  class="form-control"
                  style="text-transform: uppercase"
                  maxlength="10"
                  :placeholder="t('wallets.form.currencyPlaceholder') || 'USD'"
                />
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-light" @click="handleCancel" :disabled="processing">
            <i class="ti ti-x me-1"></i>
            {{ t('wallets.form.cancel') }}
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="handleSubmit"
            :disabled="processing"
          >
            <span v-if="processing" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="ti ti-check me-1"></i>
            {{ isEditing ? t('wallets.form.update') : t('wallets.form.create') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, watch, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useBranchStore } from '@/stores/branches'
import { useOperatorStore } from '@/stores/operators'
import { storeToRefs } from 'pinia'
import type { WalletFormData } from '@/types'

const { t } = useI18n()
const branchStore = useBranchStore()
const operatorStore = useOperatorStore()
const { branch_list: branches } = storeToRefs(branchStore)
const { operator_list: operators } = storeToRefs(operatorStore)

interface Props {
  show: boolean
  isEditing: boolean
  formData: WalletFormData
  processing: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'submit', data: WalletFormData): void
  (e: 'cancel'): void
}>()

const localForm = reactive<WalletFormData>({
  branch_id: null,
  operator_id: null,
  wallet_number: '',
  balance: '',
  currency: 'USD',
  status: 'active',
})

// Load branches and operators on mount
onMounted(async () => {
  if (!branches.value.length) {
    await branchStore.fetchBranches(1, '', 100)
  }
  if (!operators.value.length) {
    await operatorStore.fetchOperators(1, '', 100)
  }
})

// Watch for form data changes from parent
watch(
  () => props.formData,
  (newData) => {
    localForm.branch_id = newData.branch_id
    localForm.operator_id = newData.operator_id
    localForm.wallet_number = newData.wallet_number
    localForm.balance = newData.balance || ''
    localForm.currency = newData.currency || 'USD'
    localForm.status = newData.status || 'active'
  },
  { deep: true, immediate: true }
)

// Reset form when modal is closed
watch(
  () => props.show,
  (newVal) => {
    if (!newVal && !props.isEditing) {
      localForm.branch_id = null
      localForm.operator_id = null
      localForm.wallet_number = ''
      localForm.balance = ''
      localForm.currency = 'USD'
      localForm.status = 'active'
    }
  }
)

const handleSubmit = () => {
  const submitData: WalletFormData = {
    branch_id: localForm.branch_id,
    operator_id: localForm.operator_id,
    wallet_number: localForm.wallet_number,
    currency: localForm.currency?.toUpperCase() || 'USD',
    status: localForm.status,
  }

  if (localForm.balance) {
    submitData.balance = localForm.balance
  }

  emit('submit', submitData)
}

const handleCancel = () => {
  emit('cancel')
}
</script>
