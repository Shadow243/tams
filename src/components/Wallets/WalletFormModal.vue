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
                <label for="branch_id" class="form-label">
                  {{ t('wallets.form.branch') || 'Branch' }}
                  <span class="text-danger">*</span>
                </label>
                <SearchableSelect
                  v-model="localForm.branch_id"
                  :options="branches"
                  option-label="name"
                  option-value="id"
                  :placeholder="t('wallets.form.selectBranch') || 'Select a branch'"
                  :disabled="processing"
                />
              </div>

              <div class="col-md-6 mb-3">
                <label for="operator_id" class="form-label">
                  {{ t('wallets.form.operator') || 'Operator' }}
                  <span class="text-danger">*</span>
                </label>
                <SearchableSelect
                  v-model="localForm.operator_id"
                  :options="operators"
                  option-label="name"
                  option-value="id"
                  :placeholder="t('wallets.form.selectOperator') || 'Select an operator'"
                  :disabled="processing"
                />
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
                <label for="currency_id" class="form-label">
                  {{ t('wallets.form.currency') || 'Currency' }}
                  <span class="text-danger">*</span>
                </label>
                <SearchableSelect
                  v-model="localForm.currency_id"
                  :options="currencies"
                  :option-label="(currency) => `${currency.code} - ${currency.name}`"
                  option-value="id"
                  :placeholder="t('wallets.form.selectCurrency') || 'Select a currency'"
                  :disabled="processing"
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
import { useCurrencyStore } from '@/stores/currencies'
import { storeToRefs } from 'pinia'
import type { WalletFormData } from '@/types'
import SearchableSelect from '@/components/Shared/SearchableSelect.vue'

const { t } = useI18n()
const branchStore = useBranchStore()
const operatorStore = useOperatorStore()
const currencyStore = useCurrencyStore()
const { branch_list: branches } = storeToRefs(branchStore)
const { operator_list: operators } = storeToRefs(operatorStore)
const { activeCurrencies: currencies } = storeToRefs(currencyStore)

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
  currency_id: null,
  status: 'active',
})

// Load branches, operators and currencies on mount
onMounted(async () => {
  if (!branches.value.length) {
    await branchStore.fetchBranches(1, '', 100)
  }
  if (!operators.value.length) {
    await operatorStore.fetchOperators(1, '', 100)
  }
  if (!currencies.value.length) {
    await currencyStore.fetchAllCurrencies()
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
    localForm.currency_id = newData.currency_id || null
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
      localForm.currency_id = null
      localForm.status = 'active'
    }
  }
)

const handleSubmit = () => {
  const submitData: WalletFormData = {
    branch_id: localForm.branch_id,
    operator_id: localForm.operator_id,
    wallet_number: localForm.wallet_number,
    currency_id: localForm.currency_id,
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
