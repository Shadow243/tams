<template>
  <div
    class="modal fade"
    :id="modalId"
    tabindex="-1"
    aria-labelledby="accountOperationModalLabel"
    aria-hidden="true"
    ref="modalRef"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header" :class="headerClass">
          <h5 class="modal-title" id="accountOperationModalLabel">
            <i :class="iconClass" class="me-2"></i>
            {{ modalTitle }}
          </h5>
          <button
            type="button"
            class="btn-close btn-close-white"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <!-- Account Info -->
            <div v-if="account" class="alert alert-info mb-3">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{{ account.customer?.name }}</strong>
                  <br />
                  <small>{{ account.account_number }}</small>
                </div>
                <div class="text-end">
                  <div class="h5 mb-0" :class="balanceClass">
                    {{ formatCurrency(account.balance) }}
                  </div>
                  <small class="text-muted">Solde actuel</small>
                </div>
              </div>

              <!-- Available Balance for Withdrawals -->
              <div v-if="operationType === 'withdraw'" class="mt-2 pt-2 border-top">
                <div class="d-flex justify-content-between">
                  <small>Disponible (avec crédit):</small>
                  <strong class="text-success">
                    {{ formatCurrency(availableBalance) }}
                  </strong>
                </div>
              </div>
            </div>

            <!-- Amount Input -->
            <div class="mb-3">
              <label class="form-label required">Montant</label>
              <div class="input-group input-group-lg">
                <span class="input-group-text">
                  {{ account?.currency?.symbol || '$' }}
                </span>
                <input
                  v-model.number="form.amount"
                  type="number"
                  class="form-control"
                  :placeholder="`0.00`"
                  min="0.01"
                  step="0.01"
                  required
                  autofocus
                />
              </div>
              <small v-if="form.amount > 0" class="text-muted">
                Nouveau solde: {{ formatCurrency(projectedBalance) }}
              </small>
            </div>

            <!-- Description -->
            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea
                v-model="form.description"
                class="form-control"
                rows="2"
                placeholder="Motif de l'opération..."
              ></textarea>
            </div>

            <!-- Branch -->
            <div class="mb-3">
              <label class="form-label">
                Agence
                <span v-if="!canSelectBranch" class="badge bg-info ms-2">Automatique</span>
              </label>
              <select
                v-if="canSelectBranch"
                v-model="form.branch_id"
                class="form-select"
              >
                <option :value="null">— Sélectionner une agence —</option>
                <option v-for="b in branches" :key="b.id" :value="b.id">
                  {{ b.name }} ({{ b.code }})
                </option>
              </select>
              <input
                v-else
                type="text"
                class="form-control"
                :value="branches.find(b => b.id === form.branch_id)?.name || 'Agence de l\'utilisateur'"
                readonly
                disabled
              />
            </div>

            <!-- Warning for Debt -->
            <div v-if="operationType === 'withdraw' && willCreateDebt" class="alert alert-warning">
              <i class="ti ti-alert-triangle me-2"></i>
              <strong>Attention:</strong> Ce retrait créera une dette de
              <strong>{{ formatCurrency(Math.abs(projectedBalance)) }}</strong>
            </div>

            <!-- Error if Insufficient Balance -->
            <div
              v-if="operationType === 'withdraw' && hasInsufficientBalance"
              class="alert alert-danger"
            >
              <i class="ti ti-ban me-2"></i>
              <strong>Solde insuffisant:</strong> Le montant dépasse le crédit disponible
            </div>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
              :disabled="loading"
            >
              <i class="ti ti-x me-1"></i>
              Annuler
            </button>
            <button
              type="submit"
              class="btn"
              :class="buttonClass"
              :disabled="loading || hasInsufficientBalance || !form.amount"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else :class="iconClass" class="me-1"></i>
              {{ buttonText }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { CustomerAccount, AccountOperationData } from '@/types'
import { useCustomerAccountStore } from '@/stores/customer-accounts'
import { useAuthStore } from '@/stores/auth'
import { useBranchStore } from '@/stores/branches'

const customerAccountStore = useCustomerAccountStore()
const authStore = useAuthStore()
const branchStore = useBranchStore()

const props = defineProps<{
  modalId: string
  account: CustomerAccount | null
  operationType: 'deposit' | 'withdraw'
}>()

const emit = defineEmits<{
  (e: 'operation-completed', data: { type: string; amount: number }): void
}>()

const modalRef = ref<HTMLElement>()
const loading = ref(false)

const form = ref({
  amount: 0,
  description: '',
  branch_id: null as number | null,
})

const branches = computed(() => branchStore.branch_list || [])

const canSelectBranch = computed(() => {
  const roles = authStore.user?.roles || []
  return roles.includes('admin') || roles.includes('superviseur') || !authStore.user?.branch_id
})

const modalTitle = computed(() => {
  return props.operationType === 'deposit' ? 'Dépôt' : 'Retrait'
})

const headerClass = computed(() => {
  return props.operationType === 'deposit' ? 'bg-success text-white' : 'bg-primary text-white'
})

const iconClass = computed(() => {
  return props.operationType === 'deposit' ? 'ti ti-arrow-down' : 'ti ti-arrow-up'
})

const buttonClass = computed(() => {
  return props.operationType === 'deposit' ? 'btn-success' : 'btn-primary'
})

const buttonText = computed(() => {
  return props.operationType === 'deposit' ? 'Déposer' : 'Retirer'
})

const balanceClass = computed(() => {
  if (!props.account) return ''
  return props.account.balance < 0 ? 'text-danger' : 'text-success'
})

const availableBalance = computed(() => {
  if (!props.account) return 0
  return props.account.balance + (props.account.credit_limit || 0)
})

const projectedBalance = computed(() => {
  if (!props.account) return 0
  if (props.operationType === 'deposit') {
    return props.account.balance + form.value.amount
  } else {
    return props.account.balance - form.value.amount
  }
})

const willCreateDebt = computed(() => {
  return props.operationType === 'withdraw' && projectedBalance.value < 0
})

const hasInsufficientBalance = computed(() => {
  return props.operationType === 'withdraw' && form.value.amount > availableBalance.value
})

const formatCurrency = (value: number) => {
  const symbol = props.account?.currency?.symbol || 'XAF'
  return `${value.toFixed(2)} ${symbol}`
}

onMounted(() => {
  if (canSelectBranch.value && branches.value.length === 0) {
    branchStore.fetchBranches(1)
  }
})

// Reset form when modal closes
watch(
  () => props.account,
  () => {
    form.value = {
      amount: 0,
      description: '',
      branch_id: authStore.user?.branch_id ?? null,
    }
  }
)

const handleSubmit = async () => {
  if (!props.account || !form.value.amount) return

  loading.value = true

  try {
    // Prepare operation data
    const operationData: AccountOperationData = {
      amount: form.value.amount,
      description: form.value.description || undefined,
      branch_id: form.value.branch_id,
    }

    // Call API
    let transaction
    if (props.operationType === 'deposit') {
      transaction = await customerAccountStore.deposit(props.account.uuid, operationData)
    } else {
      transaction = await customerAccountStore.withdraw(props.account.uuid, operationData)
    }

    if (transaction) {
      // Close modal
      const modalElement = modalRef.value
      if (modalElement && (window as any).bootstrap) {
        const modalInstance = (window as any).bootstrap.Modal.getInstance(modalElement)
        if (modalInstance) {
          modalInstance.hide()
        }
      }

      // Emit event
      emit('operation-completed', {
        type: props.operationType,
        amount: form.value.amount,
      })

      // Reset form
      form.value = {
        amount: 0,
        description: '',
        branch_id: null,
      }
    }
  } catch (error) {
    console.error('Error performing operation:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.required::after {
  content: ' *';
  color: var(--bs-danger);
}

.input-group-lg .form-control {
  font-size: 1.5rem;
  font-weight: 600;
}
</style>
