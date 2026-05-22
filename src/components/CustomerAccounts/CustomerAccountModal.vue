<template>
  <div
    class="modal fade"
    :id="modalId"
    tabindex="-1"
    aria-labelledby="customerAccountModalLabel"
    aria-hidden="true"
    ref="modalRef"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="customerAccountModalLabel">
            <i class="ti ti-pig-money me-2"></i>
            {{ isEditMode ? 'Modifier le Compte Client' : 'Nouveau Compte Client VIP' }}
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <!-- Customer Selection -->
            <div class="mb-3">
              <label class="form-label required">Client</label>
              <div class="input-group">
                <input
                  type="text"
                  class="form-control"
                  :value="selectedCustomerDisplay"
                  placeholder="Cliquez pour rechercher un client..."
                  :disabled="isEditMode"
                  readonly
                  required
                />
                <button
                  v-if="!isEditMode"
                  type="button"
                  class="btn btn-outline-primary"
                  @click="showCustomerSearch = true"
                >
                  <i class="ti ti-user-search"></i>
                  Rechercher
                </button>
              </div>
              <small v-if="!selectedCustomer && !isEditMode" class="text-danger">
                Veuillez sélectionner un client
              </small>
              <small v-else-if="selectedCustomer" class="text-success">
                <i class="ti ti-check me-1"></i>
                Client sélectionné
              </small>
            </div>

            <!-- Currency Selection -->
            <div class="mb-3">
              <label class="form-label required">Devise</label>
              <select v-model="form.currency_id" class="form-select" required>
                <option value="">Sélectionner une devise</option>
                <option v-for="currency in currencies" :key="currency.id" :value="currency.id">
                  {{ currency.code }} - {{ currency.name }}
                </option>
              </select>
            </div>

            <!-- Branch Selection (optional — VIP clients operate in all branches) -->
            <div class="mb-3">
              <label class="form-label">
                Agence
                <small class="text-muted ms-1">(optionnel)</small>
              </label>
              <select v-model="form.branch_id" class="form-select">
                <option :value="null">Toutes les agences</option>
                <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                  {{ branch.name }}
                </option>
              </select>
              <div class="form-text">
                <i class="ti ti-info-circle me-1"></i>
                Un client VIP peut effectuer des opérations dans n'importe quelle agence
              </div>
            </div>

            <!-- Credit Limit -->
            <div class="mb-3">
              <label class="form-label required">Limite de Crédit</label>
              <input
                v-model.number="form.credit_limit"
                type="number"
                class="form-control"
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
              <small class="text-muted">
                Montant maximum que le client peut emprunter (découvert autorisé)
              </small>
            </div>

            <!-- Initial Deposit (only for new accounts) -->
            <div v-if="!isEditMode" class="mb-3">
              <label class="form-label">Dépôt Initial</label>
              <input
                v-model.number="form.initial_deposit"
                type="number"
                class="form-control"
                placeholder="0"
                min="0"
                step="0.01"
              />
              <small class="text-muted"> Montant du premier dépôt (optionnel) </small>
            </div>

            <!-- VIP Status -->
            <div class="mb-3">
              <div class="form-check form-switch">
                <input
                  v-model="form.is_vip"
                  class="form-check-input"
                  type="checkbox"
                  id="isVipSwitch"
                />
                <label class="form-check-label" for="isVipSwitch">
                  <i class="ti ti-crown me-1"></i>
                  Compte VIP
                </label>
              </div>
            </div>

            <!-- Notes -->
            <div class="mb-3">
              <label class="form-label">Notes</label>
              <textarea
                v-model="form.notes"
                class="form-control"
                rows="3"
                placeholder="Notes ou remarques..."
              ></textarea>
            </div>

            <!-- Status (only for edit mode) -->
            <div v-if="isEditMode" class="mb-3">
              <label class="form-label">Statut</label>
              <select v-model="form.status" class="form-select">
                <option value="active">Actif</option>
                <option value="suspended">Suspendu</option>
                <option value="closed">Fermé</option>
              </select>
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
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="ti ti-check me-1"></i>
              {{ isEditMode ? 'Mettre à jour' : 'Créer le compte' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Customer Search Modal - Teleported to body to avoid z-index issues -->
  <Teleport to="body">
    <CustomerSearchModal
      :show="showCustomerSearch"
      @close="showCustomerSearch = false"
      @select="handleCustomerSelect"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { CustomerAccount, CustomerAccountFormData } from '@/types'
import { useCurrencyStore } from '@/stores/currencies'
import { useBranchStore } from '@/stores/branches'
import { useCustomerAccountStore } from '@/stores/customer-accounts'
import CustomerSearchModal from './CustomerSearchModal.vue'

const currencyStore = useCurrencyStore()
const branchStore = useBranchStore()
const customerAccountStore = useCustomerAccountStore()

const props = defineProps<{
  modalId: string
  account?: CustomerAccount | null
}>()

const emit = defineEmits<{
  (e: 'saved', account: CustomerAccount): void
}>()

const modalRef = ref<HTMLElement>()
const loading = ref(false)
const showCustomerSearch = ref(false)
const selectedCustomer = ref<any>(null)

const currencies = computed(() => currencyStore.currency_list || [])
const branches = computed(() => branchStore.branch_list || [])


// Remove focus from modal elements before closing (fixes aria-hidden warning)
onMounted(() => {
  const modalElement = modalRef.value
  if (modalElement) {
    modalElement.addEventListener('hide.bs.modal', () => {
      const focusedElement = document.activeElement as HTMLElement
      if (modalElement.contains(focusedElement)) {
        focusedElement.blur()
      }
    })
  }
})

const isEditMode = computed(() => !!props.account)
const selectedCustomerDisplay = computed(() => {
  if (selectedCustomer.value) {
    return `${selectedCustomer.value.full_name} - ${selectedCustomer.value.phone}`
  }
  return ''
})

const makeDefaultForm = () => ({
  customer_id: 0,
  currency_id: 0,
  branch_id: null as number | null,
  credit_limit: 0,
  initial_deposit: 0,
  is_vip: true,
  notes: '',
  status: 'active' as 'active' | 'suspended' | 'closed',
})

const form = ref(makeDefaultForm())

// Watch for account changes
watch(
  () => props.account,
  (newAccount) => {
    if (newAccount) {
      form.value = {
        customer_id: newAccount.customer_id || 0,
        currency_id: newAccount.currency_id || 0,
        branch_id: newAccount.branch_id || 0,
        credit_limit: newAccount.credit_limit || 0,
        initial_deposit: 0,
        is_vip: newAccount.is_vip ?? true,
        notes: newAccount.notes || '',
        status: newAccount.status || 'active',
      }
      // Set selected customer
      if (newAccount.customer) {
        selectedCustomer.value = newAccount.customer
      }
    } else {
      form.value = makeDefaultForm()
      selectedCustomer.value = null
    }
  },
  { immediate: true }
)

// Deactivate Bootstrap's focus trap when CustomerSearchModal is open so the user
// can interact with the search input (Bootstrap traps focus within its modal dialog).
watch(showCustomerSearch, (isShowing) => {
  if (!modalRef.value) return
  const bsModal = (window as any).bootstrap?.Modal?.getInstance(modalRef.value)
  if (bsModal?._focustrap) {
    isShowing ? bsModal._focustrap.deactivate() : bsModal._focustrap.activate()
  }
})

const handleCustomerSelect = (customer: any) => {
  selectedCustomer.value = customer
  form.value.customer_id = Number(customer.id)
  showCustomerSearch.value = false
}

const handleSubmit = async () => {
  if (!selectedCustomer.value && !isEditMode.value) {
    alert('Veuillez sélectionner un client')
    return
  }

  loading.value = true

  try {
    // Prepare data for API
    const accountData: CustomerAccountFormData = {
      customer_id: form.value.customer_id,
      currency_id: form.value.currency_id,
      branch_id: form.value.branch_id,
      credit_limit: form.value.credit_limit,
      initial_deposit: form.value.initial_deposit,
      is_vip: form.value.is_vip,
      notes: form.value.notes,
      status: form.value.status,
    }

    // Set current account for update if in edit mode
    if (isEditMode.value && props.account) {
      customerAccountStore.setCurrentAccount(props.account)
    }

    // Call API to save account
    const success = await customerAccountStore.storeAccount(accountData)

    if (success) {
      // Close modal
      const modalElement = modalRef.value
      if (modalElement && (window as any).bootstrap) {
        const modalInstance = (window as any).bootstrap.Modal.getInstance(modalElement)
        if (modalInstance) {
          modalInstance.hide()
        }
      }

      // Emit saved event
      emit('saved', customerAccountStore.currentAccount!)

      // Reset form
      if (!isEditMode.value) {
        form.value = makeDefaultForm()
        selectedCustomer.value = null
      }

      // Clear current account in store
      customerAccountStore.setCurrentAccount(null)
    }
  } catch (error) {
    console.error('Error saving account:', error)
  } finally {
    loading.value = false
  }
}

// Load data on component mount
onMounted(async () => {
  try {
    await Promise.all([currencyStore.fetchCurrencies(1), branchStore.fetchBranches(1)])
  } catch (error) {
    console.error('Error loading form data:', error)
  }
})
</script>

<style scoped lang="scss">
.required::after {
  content: ' *';
  color: var(--bs-danger);
}

.form-check-label i {
  color: var(--bs-warning);
}
</style>
