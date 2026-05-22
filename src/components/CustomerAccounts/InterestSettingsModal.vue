<template>
  <div
    class="modal fade"
    :id="modalId"
    tabindex="-1"
    aria-labelledby="interestSettingsModalLabel"
    aria-hidden="true"
    ref="modalRef"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-info text-white">
          <h5 class="modal-title" id="interestSettingsModalLabel">
            <i class="ti ti-percentage me-2"></i>
            Paramètres d'Intérêts
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
            <div v-if="account" class="alert alert-info mb-4">
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
                  <small>Solde actuel</small>
                </div>
              </div>
            </div>

            <!-- Interest Type -->
            <div class="mb-3">
              <label class="form-label required">Type d'intérêt</label>
              <div class="row">
                <div class="col-md-6">
                  <div class="form-check">
                    <input
                      v-model="form.interest_type"
                      class="form-check-input"
                      type="radio"
                      name="interestType"
                      id="interestTypePercentage"
                      value="percentage"
                    />
                    <label class="form-check-label" for="interestTypePercentage">
                      <i class="ti ti-percentage me-1"></i>
                      Pourcentage
                    </label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-check">
                    <input
                      v-model="form.interest_type"
                      class="form-check-input"
                      type="radio"
                      name="interestType"
                      id="interestTypeFixed"
                      value="fixed"
                    />
                    <label class="form-check-label" for="interestTypeFixed">
                      <i class="ti ti-coin me-1"></i>
                      Montant fixe
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Interest Rate (for percentage) -->
            <div v-if="form.interest_type === 'percentage'" class="mb-3">
              <label class="form-label required">Taux d'intérêt (%)</label>
              <div class="input-group">
                <input
                  v-model.number="form.interest_rate"
                  type="number"
                  class="form-control"
                  placeholder="5.0"
                  min="0"
                  max="100"
                  step="0.01"
                  required
                />
                <span class="input-group-text">%</span>
              </div>
              <small class="text-muted"> Exemple: 5% de 10,000 = 500 d'intérêts </small>
            </div>

            <!-- Fixed Amount (for fixed) -->
            <div v-if="form.interest_type === 'fixed'" class="mb-3">
              <label class="form-label required">Montant fixe</label>
              <div class="input-group">
                <span class="input-group-text">
                  {{ account?.currency?.symbol || 'XAF' }}
                </span>
                <input
                  v-model.number="form.fixed_amount"
                  type="number"
                  class="form-control"
                  placeholder="1000"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <small class="text-muted"> Ce montant sera appliqué quelle que soit la dette </small>
            </div>

            <!-- Application Period -->
            <div class="mb-3">
              <label class="form-label required">Période d'application</label>
              <select v-model="form.application_period" class="form-select" required>
                <option value="">Sélectionner une période</option>
                <option value="daily">Quotidien</option>
                <option value="weekly">Hebdomadaire</option>
                <option value="monthly">Mensuel</option>
                <option value="quarterly">Trimestriel</option>
                <option value="yearly">Annuel</option>
              </select>
            </div>

            <!-- Application Rules -->
            <div class="mb-3">
              <label class="form-label">Règles d'application</label>

              <div class="form-check mb-2">
                <input
                  v-model="form.apply_on_negative_balance"
                  class="form-check-input"
                  type="checkbox"
                  id="applyOnNegativeBalance"
                />
                <label class="form-check-label" for="applyOnNegativeBalance">
                  <i class="ti ti-alert-triangle text-danger me-1"></i>
                  Appliquer sur solde négatif (dette)
                </label>
              </div>

              <div class="form-check">
                <input
                  v-model="form.apply_on_positive_balance"
                  class="form-check-input"
                  type="checkbox"
                  id="applyOnPositiveBalance"
                />
                <label class="form-check-label" for="applyOnPositiveBalance">
                  <i class="ti ti-currency-dollar text-success me-1"></i>
                  Appliquer sur solde positif (épargne)
                </label>
              </div>

              <small class="text-muted d-block mt-2">
                <i class="ti ti-info-circle me-1"></i>
                Selon la logique métier, les intérêts sont généralement appliqués uniquement sur les
                dettes
              </small>
            </div>

            <!-- Active Switch -->
            <div class="mb-3">
              <div class="form-check form-switch">
                <input
                  v-model="form.is_active"
                  class="form-check-input"
                  type="checkbox"
                  id="isActiveSwitch"
                />
                <label class="form-check-label" for="isActiveSwitch">
                  <i class="ti ti-power me-1"></i>
                  <strong>Activer les intérêts</strong>
                </label>
              </div>
            </div>

            <!-- Simulation Result -->
            <div v-if="simulation" class="alert alert-success">
              <h6 class="alert-heading">
                <i class="ti ti-calculator me-2"></i>
                Simulation
              </h6>
              <div class="row">
                <div class="col-md-6">
                  <small class="text-muted d-block">Montant d'intérêt</small>
                  <strong class="h5 text-danger">
                    {{ formatCurrency(simulation.interest_amount) }}
                  </strong>
                </div>
                <div class="col-md-6">
                  <small class="text-muted d-block">Nouveau solde</small>
                  <strong class="h5" :class="getBalanceClass(simulation.new_balance)">
                    {{ formatCurrency(simulation.new_balance) }}
                  </strong>
                </div>
              </div>
              <hr />
              <small class="text-muted">
                <i class="ti ti-info-circle me-1"></i>
                {{ simulation.message }}
              </small>
            </div>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-outline-info"
              @click="simulateInterest"
              :disabled="loading || !canSimulate"
            >
              <i class="ti ti-calculator me-1"></i>
              Simuler
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
              :disabled="loading"
            >
              <i class="ti ti-x me-1"></i>
              Annuler
            </button>
            <button type="submit" class="btn btn-info" :disabled="loading || !isFormValid">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="ti ti-check me-1"></i>
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { CustomerAccount, AccountInterestSetting, InterestSimulation } from '@/types'
import { useCustomerAccountStore } from '@/stores/customer-accounts'

const customerAccountStore = useCustomerAccountStore()

const props = defineProps<{
  modalId: string
  account: CustomerAccount | null
}>()

const emit = defineEmits<{
  (e: 'saved'): void
}>()

const modalRef = ref<HTMLElement>()
const loading = ref(false)
const simulation = ref<InterestSimulation | null>(null)

const defaultForm = {
  interest_type: 'percentage' as 'percentage' | 'fixed',
  interest_rate: 5.0,
  fixed_amount: 0,
  application_period: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly',
  apply_on_negative_balance: true,
  apply_on_positive_balance: false,
  is_active: true,
}

const form = ref({ ...defaultForm })

const balanceClass = computed(() => {
  if (!props.account) return ''
  return props.account.balance < 0 ? 'text-danger' : 'text-success'
})

const isFormValid = computed(() => {
  if (!form.value.application_period) return false
  if (form.value.interest_type === 'percentage' && !form.value.interest_rate) return false
  if (form.value.interest_type === 'fixed' && !form.value.fixed_amount) return false
  return true
})

const canSimulate = computed(() => {
  return isFormValid.value && props.account
})

const formatCurrency = (value: number) => {
  const symbol = props.account?.currency?.symbol || 'XAF'
  return `${value.toFixed(2)} ${symbol}`
}

const getBalanceClass = (balance: number) => {
  return balance < 0 ? 'text-danger' : 'text-success'
}

// Watch for account changes to load settings
watch(
  () => props.account,
  (newAccount) => {
    simulation.value = null

    if (newAccount?.interest_setting) {
      const settings = newAccount.interest_setting
      form.value = {
        interest_type: settings.interest_type,
        interest_rate: settings.interest_rate || 5.0,
        fixed_amount: settings.fixed_amount || 0,
        application_period: settings.application_period,
        apply_on_negative_balance: settings.apply_on_negative_balance ?? true,
        apply_on_positive_balance: settings.apply_on_positive_balance ?? false,
        is_active: settings.is_active ?? true,
      }
    } else {
      form.value = { ...defaultForm }
    }
  },
  { immediate: true }
)

const simulateInterest = async () => {
  if (!props.account) return

  loading.value = true

  try {
    const result = await customerAccountStore.simulateInterest(props.account.uuid)
    if (result) {
      simulation.value = result
    }
  } catch (error) {
    console.error('Error simulating interest:', error)
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!props.account || !isFormValid.value) return

  loading.value = true

  try {
    const success = await customerAccountStore.saveInterestSettings(props.account.uuid, form.value)

    if (success) {
      // Close modal
      const modalElement = modalRef.value
      if (modalElement && (window as any).bootstrap) {
        const modalInstance = (window as any).bootstrap.Modal.getInstance(modalElement)
        if (modalInstance) {
          modalInstance.hide()
        }
      }

      // Emit event
      emit('saved')

      // Reset simulation
      simulation.value = null
    }
  } catch (error) {
    console.error('Error saving interest settings:', error)
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

.form-check-label {
  cursor: pointer;
}

.alert-heading {
  margin-bottom: 1rem;
}
</style>
