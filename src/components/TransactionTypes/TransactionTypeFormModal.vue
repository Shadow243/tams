<template>
  <div
    :class="['modal', { show: show }]"
    :style="{ display: show ? 'block' : 'none' }"
    tabindex="-1"
    role="dialog"
  >
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{
              isEditing
                ? t('transaction_types.edit_transaction_type')
                : t('transaction_types.add_transaction_type')
            }}
          </h5>
          <button
            type="button"
            class="btn-close"
            @click="closeModal"
            :disabled="processing"
          ></button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <!-- Code -->
            <div class="mb-3">
              <label for="code" class="form-label">
                {{ t('transaction_types.code') }} <span class="text-danger">*</span>
              </label>
              <input
                type="text"
                class="form-control"
                id="code"
                v-model="localForm.code"
                :placeholder="t('transaction_types.code')"
                required
                pattern="[a-z0-9_]+"
                :disabled="processing"
              />
              <small class="text-muted">{{
                t('transaction_types.code_hint') ||
                'Use only lowercase letters, numbers and underscores'
              }}</small>
            </div>

            <!-- Name -->
            <div class="mb-3">
              <label for="name" class="form-label">
                {{ t('transaction_types.name') }} <span class="text-danger">*</span>
              </label>
              <input
                type="text"
                class="form-control"
                id="name"
                v-model="localForm.name"
                :placeholder="t('transaction_types.name')"
                required
                maxlength="255"
                :disabled="processing"
              />
            </div>

            <!-- Description -->
            <div class="mb-3">
              <label for="description" class="form-label">
                {{ t('transaction_types.description') }}
              </label>
              <textarea
                class="form-control"
                id="description"
                v-model="localForm.description"
                :placeholder="t('transaction_types.description')"
                rows="3"
                maxlength="1000"
                :disabled="processing"
              ></textarea>
            </div>

            <!-- Balance Configuration -->
            <hr />
            <h6 class="fw-semibold mb-3">
              {{ t('transaction_types.balance_config') || 'Balance Configuration' }}
            </h6>
            <small class="text-muted d-block mb-3">
              {{
                t('transaction_types.balance_config_hint') ||
                'Define how balances are affected when this transaction is completed.'
              }}
            </small>

            <!-- Branch (source) -->
            <div class="row g-2 mb-3">
              <div class="col-12">
                <label class="form-label fw-semibold">{{
                  t('transaction_types.branch_source') || 'Source Branch'
                }}</label>
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted small">{{
                  t('transaction_types.effect') || 'Effect'
                }}</label>
                <select
                  v-model="localForm.branch_effect"
                  class="form-select"
                  :disabled="processing"
                >
                  <option value="none">{{ t('transaction_types.effect_none') || 'None' }}</option>
                  <option value="debit">
                    {{ t('transaction_types.effect_debit') || 'Debit (loses cash)' }}
                  </option>
                  <option value="credit">
                    {{ t('transaction_types.effect_credit') || 'Credit (gains cash)' }}
                  </option>
                </select>
              </div>
              <div class="col-md-6" v-if="localForm.branch_effect !== 'none'">
                <label class="form-label text-muted small">{{
                  t('transaction_types.amount') || 'Amount'
                }}</label>
                <select
                  v-model="localForm.branch_amount"
                  class="form-select"
                  :disabled="processing"
                >
                  <option value="gross">
                    {{ t('transaction_types.amount_gross') || 'Gross amount' }}
                  </option>
                  <option value="net">
                    {{ t('transaction_types.amount_net') || 'Net amount (after fees)' }}
                  </option>
                  <option value="fee">{{ t('transaction_types.amount_fee') || 'Fee only' }}</option>
                </select>
              </div>
            </div>

            <!-- Wallet -->
            <div class="row g-2 mb-3">
              <div class="col-12">
                <label class="form-label fw-semibold">{{
                  t('transaction_types.wallet') || 'Wallet'
                }}</label>
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted small">{{
                  t('transaction_types.effect') || 'Effect'
                }}</label>
                <select
                  v-model="localForm.wallet_effect"
                  class="form-select"
                  :disabled="processing"
                >
                  <option value="none">{{ t('transaction_types.effect_none') || 'None' }}</option>
                  <option value="debit">
                    {{ t('transaction_types.effect_debit') || 'Debit (loses balance)' }}
                  </option>
                  <option value="credit">
                    {{ t('transaction_types.effect_credit') || 'Credit (gains balance)' }}
                  </option>
                </select>
              </div>
              <div class="col-md-6" v-if="localForm.wallet_effect !== 'none'">
                <label class="form-label text-muted small">{{
                  t('transaction_types.amount') || 'Amount'
                }}</label>
                <select
                  v-model="localForm.wallet_amount"
                  class="form-select"
                  :disabled="processing"
                >
                  <option value="gross">
                    {{ t('transaction_types.amount_gross') || 'Gross amount' }}
                  </option>
                  <option value="net">
                    {{ t('transaction_types.amount_net') || 'Net amount (after fees)' }}
                  </option>
                  <option value="fee">{{ t('transaction_types.amount_fee') || 'Fee only' }}</option>
                </select>
              </div>
            </div>

            <!-- Destination Wallet -->
            <div class="row g-2 mb-3">
              <div class="col-12">
                <label class="form-label fw-semibold">{{
                  t('transaction_types.wallet_destination') || 'Wallet destination'
                }}</label>
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted small">{{
                  t('transaction_types.effect') || 'Effect'
                }}</label>
                <select
                  v-model="localForm.dest_wallet_effect"
                  class="form-select"
                  :disabled="processing"
                >
                  <option value="none">{{ t('transaction_types.effect_none') || 'None' }}</option>
                  <option value="debit">
                    {{ t('transaction_types.effect_debit') || 'Debit (loses balance)' }}
                  </option>
                  <option value="credit">
                    {{ t('transaction_types.effect_credit') || 'Credit (gains balance)' }}
                  </option>
                </select>
              </div>
              <div class="col-md-6" v-if="localForm.dest_wallet_effect !== 'none'">
                <label class="form-label text-muted small">{{
                  t('transaction_types.amount') || 'Amount'
                }}</label>
                <select
                  v-model="localForm.dest_wallet_amount"
                  class="form-select"
                  :disabled="processing"
                >
                  <option value="gross">
                    {{ t('transaction_types.amount_gross') || 'Gross amount' }}
                  </option>
                  <option value="net">
                    {{ t('transaction_types.amount_net') || 'Net amount (after fees)' }}
                  </option>
                  <option value="fee">{{ t('transaction_types.amount_fee') || 'Fee only' }}</option>
                </select>
              </div>
            </div>

            <!-- Customer TAMS Account -->
            <div class="row g-2 mb-3">
              <div class="col-12">
                <label class="form-label fw-semibold">
                  {{ t('transaction_types.customer_account') || 'Compte client TAMS' }}
                </label>
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted small">{{
                  t('transaction_types.effect') || 'Effect'
                }}</label>
                <select
                  v-model="localForm.customer_account_effect"
                  class="form-select"
                  :disabled="processing"
                >
                  <option value="none">{{ t('transaction_types.effect_none') || 'None' }}</option>
                  <option value="debit">
                    {{ t('transaction_types.effect_debit') || 'Debit (loses balance)' }}
                  </option>
                  <option value="credit">
                    {{ t('transaction_types.effect_credit') || 'Credit (gains balance)' }}
                  </option>
                </select>
              </div>
              <div class="col-md-6" v-if="localForm.customer_account_effect !== 'none'">
                <label class="form-label text-muted small">{{
                  t('transaction_types.amount') || 'Amount'
                }}</label>
                <select
                  v-model="localForm.customer_account_amount"
                  class="form-select"
                  :disabled="processing"
                >
                  <option value="gross">
                    {{ t('transaction_types.amount_gross') || 'Gross amount' }}
                  </option>
                  <option value="net">
                    {{ t('transaction_types.amount_net') || 'Net amount (after fees)' }}
                  </option>
                  <option value="fee">{{ t('transaction_types.amount_fee') || 'Fee only' }}</option>
                </select>
              </div>
            </div>

            <!-- Destination Branch -->
            <div class="row g-2 mb-2">
              <div class="col-12">
                <label class="form-label fw-semibold">{{
                  t('transaction_types.branch_destination') || 'Destination Branch'
                }}</label>
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted small">{{
                  t('transaction_types.effect') || 'Effect'
                }}</label>
                <select
                  v-model="localForm.dest_branch_effect"
                  class="form-select"
                  :disabled="processing"
                >
                  <option value="none">{{ t('transaction_types.effect_none') || 'None' }}</option>
                  <option value="debit">
                    {{ t('transaction_types.effect_debit') || 'Debit (loses cash)' }}
                  </option>
                  <option value="credit">
                    {{ t('transaction_types.effect_credit') || 'Credit (gains cash)' }}
                  </option>
                </select>
              </div>
              <div class="col-md-6" v-if="localForm.dest_branch_effect !== 'none'">
                <label class="form-label text-muted small">{{
                  t('transaction_types.amount') || 'Amount'
                }}</label>
                <select
                  v-model="localForm.dest_branch_amount"
                  class="form-select"
                  :disabled="processing"
                >
                  <option value="gross">
                    {{ t('transaction_types.amount_gross') || 'Gross amount' }}
                  </option>
                  <option value="net">
                    {{ t('transaction_types.amount_net') || 'Net amount (after fees)' }}
                  </option>
                  <option value="fee">{{ t('transaction_types.amount_fee') || 'Fee only' }}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="closeModal"
              :disabled="processing"
            >
              {{ t('transaction_types.cancel') || 'Cancel' }}
            </button>
            <button type="submit" class="btn btn-primary" :disabled="processing">
              <span
                v-if="processing"
                class="spinner-border spinner-border-sm me-2"
                role="status"
              ></span>
              {{
                isEditing
                  ? t('transaction_types.update') || 'Update'
                  : t('transaction_types.create') || 'Create'
              }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Backdrop -->
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue'
import { useI18n } from '@/composables/useI18n'
import type { TransactionTypeFormData } from '@/types'

const { t } = useI18n()

interface Props {
  show: boolean
  formData: TransactionTypeFormData
  isEditing?: boolean
  processing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isEditing: false,
  processing: false,
})

const emit = defineEmits<{
  close: []
  submit: [data: TransactionTypeFormData]
}>()

const localForm = ref<TransactionTypeFormData>({
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
  customer_account_effect: 'none',
  customer_account_amount: 'gross',
})

// Sync formData prop → localForm whenever any property changes.
// watchEffect tracks every reactive property accessed inside, so it
// re-runs reliably when the parent mutates individual fields of a
// reactive formData object (deep watch on a reactive ref is unreliable).
watchEffect(() => {
  localForm.value = { ...props.formData }
})

// Watch show prop to reset form when closed
watch(
  () => props.show,
  (newShow) => {
    if (!newShow) {
      localForm.value = {
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
        customer_account_effect: 'none',
        customer_account_amount: 'gross',
      }
    }
  }
)

const closeModal = () => {
  emit('close')
}

const handleSubmit = () => {
  emit('submit', {
    code: localForm.value.code.toLowerCase().trim(),
    name: localForm.value.name.trim(),
    description: localForm.value.description.trim(),
    branch_effect: localForm.value.branch_effect,
    branch_amount: localForm.value.branch_amount,
    wallet_effect: localForm.value.wallet_effect,
    wallet_amount: localForm.value.wallet_amount,
    dest_wallet_effect: localForm.value.dest_wallet_effect,
    dest_wallet_amount: localForm.value.dest_wallet_amount,
    dest_branch_effect: localForm.value.dest_branch_effect,
    dest_branch_amount: localForm.value.dest_branch_amount,
    customer_account_effect: localForm.value.customer_account_effect,
    customer_account_amount: localForm.value.customer_account_amount,
  })
}
</script>

<style scoped>
.modal.show {
  display: block;
}

.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
