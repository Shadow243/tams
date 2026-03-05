<template>
  <div
    :class="['modal', { show: show }]"
    :style="{ display: show ? 'block' : 'none' }"
    tabindex="-1"
    role="dialog"
  >
    <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header bg-info text-white">
          <h5 class="modal-title">
            <i class="ti ti-shield-check me-2"></i>
            {{ t('transactions.verify_withdrawal') || 'Vérifier un Code de Retrait' }}
          </h5>
          <button
            type="button"
            class="btn-close btn-close-white"
            @click="closeModal"
            :disabled="processing"
          ></button>
        </div>

        <div class="modal-body">
          <!-- Code Input -->
          <div v-if="!verifiedTransaction" class="text-center py-4">
            <div class="mb-4">
              <i class="ti ti-qrcode display-1 text-info"></i>
            </div>

            <div class="row justify-content-center">
              <div class="col-md-8">
                <label for="withdrawal_code" class="form-label fs-5">
                  {{ t('transactions.enter_withdrawal_code') || 'Entrez le code de retrait' }}
                </label>
                <div class="input-group input-group-lg mb-3">
                  <span class="input-group-text">
                    <i class="ti ti-key"></i>
                  </span>
                  <input
                    type="text"
                    class="form-control text-center fs-3 fw-bold"
                    id="withdrawal_code"
                    v-model="withdrawalCode"
                    maxlength="6"
                    pattern="[0-9]{6}"
                    placeholder="000000"
                    :disabled="processing"
                    @input="formatCode"
                    @keyup.enter="verifyCode"
                    autofocus
                  />
                </div>
                <button
                  class="btn btn-info btn-lg w-100"
                  @click="verifyCode"
                  :disabled="processing || withdrawalCode.length !== 6"
                >
                  <span v-if="processing" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="ti ti-search me-2"></i>
                  {{ t('transactions.verify') || 'Vérifier' }}
                </button>
              </div>
            </div>

            <div v-if="errorMessage" class="alert alert-danger mt-4" role="alert">
              <i class="ti ti-alert-circle me-2"></i>
              {{ errorMessage }}
            </div>
          </div>

          <!-- Transaction Details -->
          <div v-else>
            <div class="alert alert-success">
              <i class="ti ti-check-circle me-2"></i>
              {{ t('transactions.valid_code') || 'Code valide ! Transaction trouvée' }}
            </div>

            <div class="card mb-3">
              <div class="card-body">
                <h6 class="card-subtitle mb-3 text-muted">
                  {{ t('transactions.transaction_info') || 'Informations de la transaction' }}
                </h6>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="text-muted small">{{ t('transactions.reference') }}</label>
                    <div class="fw-bold">{{ verifiedTransaction.reference }}</div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="text-muted small">{{ t('transactions.withdrawal_code') }}</label>
                    <div class="fw-bold fs-4 text-primary">
                      {{ verifiedTransaction.withdrawal_code }}
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="text-muted small">{{ t('transactions.transaction_type') }}</label>
                    <div>{{ verifiedTransaction.transaction_type?.name }}</div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="text-muted small">{{ t('transactions.branch') }}</label>
                    <div>{{ verifiedTransaction.branch?.name }}</div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="text-muted small">{{ t('transactions.customer') }}</label>
                    <div>
                      <div v-if="verifiedTransaction.customer">
                        {{ verifiedTransaction.customer.full_name }}
                      </div>
                      <div v-else-if="verifiedTransaction.customer_phone">
                        {{ verifiedTransaction.customer_phone }}
                      </div>
                      <div v-else class="text-muted">-</div>
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="text-muted small">{{ t('transactions.created_at') }}</label>
                    <div>{{ formatDate(verifiedTransaction.created_at) }}</div>
                  </div>
                </div>

                <hr />

                <div class="row">
                  <div class="col-md-4">
                    <label class="text-muted small">{{ t('transactions.gross_amount') }}</label>
                    <div class="fs-5 fw-bold">
                      {{ formatCurrency(verifiedTransaction.gross_amount) }}
                    </div>
                  </div>
                  <div class="col-md-4">
                    <label class="text-muted small">{{ t('transactions.fee_amount') }}</label>
                    <div class="fs-5">{{ formatCurrency(verifiedTransaction.fee_amount) }}</div>
                  </div>
                  <div class="col-md-4">
                    <label class="text-muted small">{{ t('transactions.net_amount') }}</label>
                    <div class="fs-4 fw-bold text-success">
                      {{ formatCurrency(verifiedTransaction.net_amount) }}
                    </div>
                  </div>
                </div>

                <div v-if="verifiedTransaction.expires_at" class="alert alert-warning mt-3 mb-0">
                  <i class="ti ti-clock me-2"></i>
                  {{ t('transactions.expires_at') }}:
                  {{ formatDate(verifiedTransaction.expires_at) }}
                </div>
              </div>
            </div>

            <!-- Confirmation Section -->
            <div class="card border-success">
              <div class="card-body">
                <h6 class="card-title text-success">
                  <i class="ti ti-hand-stop me-2"></i>
                  {{ t('transactions.payment_confirmation') || 'Confirmation de paiement' }}
                </h6>
                <p class="mb-3">
                  {{
                    t('transactions.confirm_payment_text') ||
                    'Confirmez que vous avez remis le montant au client'
                  }}
                </p>

                <div class="form-check mb-3">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="confirm_payment"
                    v-model="paymentConfirmed"
                  />
                  <label class="form-check-label fw-bold" for="confirm_payment">
                    {{ t('transactions.i_confirm_payment') || 'Je confirme avoir remis' }}
                    <span class="text-success fs-5">{{
                      formatCurrency(verifiedTransaction.net_amount)
                    }}</span>
                    {{ t('transactions.to_customer') || 'au client' }}
                  </label>
                </div>

                <button
                  class="btn btn-success btn-lg w-100"
                  @click="completePayment"
                  :disabled="!paymentConfirmed || processing"
                >
                  <span v-if="processing" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="ti ti-check me-2"></i>
                  {{ t('transactions.complete_payment') || 'Valider le Paiement' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            @click="resetModal"
            :disabled="processing"
          >
            {{
              verifiedTransaction
                ? t('transactions.verify_another') || 'Vérifier un autre code'
                : t('transactions.cancel') || 'Annuler'
            }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Backdrop -->
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from '@/composables/useI18n'
import type { Transaction } from '@/types'

const { t } = useI18n()

interface Props {
  show: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  verified: [transaction: Transaction]
  completed: [transaction: Transaction]
}>()

const withdrawalCode = ref('')
const verifiedTransaction = ref<Transaction | null>(null)
const paymentConfirmed = ref(false)
const processing = ref(false)
const errorMessage = ref('')

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      resetModal()
    }
  }
)

const formatCode = (event: Event) => {
  const input = event.target as HTMLInputElement
  withdrawalCode.value = input.value.replace(/\D/g, '').slice(0, 6)
}

const verifyCode = async () => {
  if (withdrawalCode.value.length !== 6) {
    errorMessage.value = t('transactions.invalid_code_length') || 'Le code doit contenir 6 chiffres'
    return
  }

  processing.value = true
  errorMessage.value = ''

  try {
    emit('verified', { withdrawal_code: withdrawalCode.value } as any)
    // La transaction vérifiée sera passée via setVerifiedTransaction
  } catch (error: any) {
    errorMessage.value =
      error.response?.data?.message ||
      t('transactions.invalid_withdrawal_code') ||
      'Code invalide ou expiré'
    withdrawalCode.value = ''
  } finally {
    processing.value = false
  }
}

const completePayment = () => {
  if (!verifiedTransaction.value || !paymentConfirmed.value) return

  processing.value = true
  emit('completed', verifiedTransaction.value)
}

const setVerifiedTransaction = (transaction: Transaction) => {
  verifiedTransaction.value = transaction
  processing.value = false
}

const setProcessing = (value: boolean) => {
  processing.value = value
}

const resetModal = () => {
  withdrawalCode.value = ''
  verifiedTransaction.value = null
  paymentConfirmed.value = false
  errorMessage.value = ''
  processing.value = false
}

const closeModal = () => {
  emit('close')
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

defineExpose({
  setVerifiedTransaction,
  setProcessing,
  resetModal,
})
</script>

<style scoped>
.modal.show {
  display: block;
}

.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

input[type='text']::-webkit-outer-spin-button,
input[type='text']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
