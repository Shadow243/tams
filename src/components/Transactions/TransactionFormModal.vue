<template>
  <div
    :class="['modal', { show: show }]"
    :style="{ display: show ? 'block' : 'none' }"
    tabindex="-1"
    role="dialog"
  >
    <div class="modal-dialog modal-dialog-centered modal-xl" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i :class="`ti ${isEditing ? 'ti-edit' : 'ti-plus'} me-2`"></i>
            {{
              isEditing
                ? t('transactions.edit_transaction') || 'Modifier la transaction'
                : t('transactions.add_transaction') || 'Nouvelle transaction'
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
            <!-- Transaction Type & Branch -->
            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="transaction_type_id" class="form-label">
                  {{ t('transactions.transaction_type') || "Type d'opération" }}
                  <span class="text-danger">*</span>
                </label>
                <SearchableSelect
                  v-model="localForm.transaction_type_id"
                  :options="transactionTypes"
                  :option-label="(type) => `${type.name} (${type.code})`"
                  option-value="id"
                  :placeholder="t('transactions.select_type') || 'Sélectionnez un type'"
                  :disabled="processing"
                  @change="onTransactionTypeChange"
                />
              </div>

              <div class="col-md-6 mb-3">
                <label for="branch_id" class="form-label">
                  {{ t('transactions.branch') || 'Agence' }}
                  <span class="text-danger">*</span>
                  <span v-if="!canSelectBranch" class="badge bg-info ms-2">
                    <i class="ti ti-lock me-1"></i>{{ t('transactions.auto_from_user') || 'Automatique' }}
                  </span>
                </label>
                <SearchableSelect
                  v-if="canSelectBranch"
                  v-model="localForm.branch_id"
                  :options="branches"
                  :option-label="(branch) => `${branch.name} (${branch.code})`"
                  option-value="id"
                  :placeholder="t('transactions.select_branch') || 'Sélectionnez une agence'"
                  :disabled="processing"
                  @change="calculateAutomaticFee"
                />
                <input
                  v-else
                  type="text"
                  class="form-control bg-light"
                  :value="lockedBranchName"
                  readonly
                />
                <div v-if="!canSelectBranch" class="form-text">
                  <i class="ti ti-info-circle me-1"></i>
                  {{ t('transactions.branch_from_user') || "Agence de l'utilisateur connecté" }}
                </div>
              </div>
            </div>

            <!-- Customer Information -->
            <div v-if="showCustomerSection" class="card mb-3">
              <div class="card-header bg-light">
                <h6 class="mb-0">
                  <i class="ti ti-user me-2"></i>
                  {{ t('transactions.customer_info') || 'Informations client' }}
                </h6>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-12 mb-3">
                    <label class="form-label">
                      {{ t('transactions.customer') || 'Client' }}
                    </label>
                    <div class="input-group">
                      <input
                        type="text"
                        class="form-control"
                        :value="selectedCustomerDisplay"
                        readonly
                        :placeholder="
                          t('transactions.no_customer_selected') || 'Aucun client sélectionné'
                        "
                      />
                      <button
                        type="button"
                        class="btn btn-outline-primary"
                        @click="showCustomerSearch = true"
                        :disabled="processing"
                      >
                        <i class="ti ti-search me-1"></i>
                        {{ t('transactions.search_customer') || 'Rechercher' }}
                      </button>
                      <button
                        v-if="selectedCustomer"
                        type="button"
                        class="btn btn-outline-danger"
                        @click="clearCustomer"
                        :disabled="processing"
                      >
                        <i class="ti ti-x"></i>
                      </button>
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="customer_phone" class="form-label">
                      {{ t('transactions.customer_phone') || 'Téléphone client' }}
                    </label>
                    <input
                      type="tel"
                      class="form-control"
                      id="customer_phone"
                      v-model="localForm.customer_phone"
                      :placeholder="t('transactions.customer_phone_placeholder') || '237XXXXXXXXX'"
                      :disabled="processing || !!selectedCustomer"
                      maxlength="15"
                    />
                    <small class="text-muted">
                      {{ t('transactions.customer_phone_hint') || 'Format: 237XXXXXXXXX' }}
                    </small>
                  </div>

                  <div v-if="showWalletField" class="col-md-6 mb-3">
                    <label for="wallet_id" class="form-label">
                      {{ t('transactions.wallet') || 'Portefeuille' }}
                      <span class="text-danger">*</span>
                    </label>
                    <SearchableSelect
                      v-model="localForm.wallet_id"
                      :options="availableWallets"
                      :option-label="
                        (wallet) =>
                          `${wallet.wallet_number} - ${wallet.operator?.name || 'N/A'} (${
                            wallet.currency?.code || 'N/A'
                          })`
                      "
                      option-value="id"
                      :placeholder="
                        t('transactions.select_wallet') || 'Sélectionnez un portefeuille'
                      "
                      :disabled="processing || !localForm.branch_id"
                      :clearable="true"
                    />
                    <small v-if="!localForm.branch_id" class="text-muted">
                      <i class="ti ti-info-circle me-1"></i>
                      {{
                        t('transactions.select_branch_first') || "Sélectionnez d'abord une agence"
                      }}
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Customer TAMS Account (shown when transaction type requires it) -->
            <div v-if="requiresCustomerAccount" class="card mb-3 border-warning">
              <div class="card-header bg-warning bg-opacity-10">
                <h6 class="mb-0 text-warning">
                  <i class="ti ti-pig-money me-2"></i>
                  {{ t('transactions.customer_account') || 'Compte client TAMS' }}
                  <span class="text-danger ms-1">*</span>
                </h6>
              </div>
              <div class="card-body">
                <div v-if="!localForm.customer_id" class="text-muted small">
                  <i class="ti ti-info-circle me-1"></i>
                  {{ t('transactions.select_customer_first') || 'Sélectionnez d\'abord un client' }}
                </div>
                <div v-else>
                  <label class="form-label">
                    {{ t('transactions.select_account') || 'Compte à utiliser' }}
                  </label>
                  <div v-if="loadingCustomerAccounts" class="text-center py-2">
                    <span class="spinner-border spinner-border-sm text-warning"></span>
                  </div>
                  <SearchableSelect
                    v-else
                    v-model="localForm.customer_account_id"
                    :options="customerAccounts"
                    :option-label="(a) => `${a.account_number} — ${a.currency?.code || ''} (solde: ${a.balance})`"
                    option-value="id"
                    :placeholder="t('transactions.select_account') || 'Sélectionnez un compte'"
                    :disabled="processing"
                    :clearable="true"
                  />
                  <small v-if="customerAccounts.length === 0 && !loadingCustomerAccounts" class="text-danger">
                    <i class="ti ti-alert-circle me-1"></i>
                    {{ t('transactions.no_account_found') || 'Aucun compte trouvé pour ce client' }}
                  </small>
                </div>
              </div>
            </div>

            <!-- Destination Customer — visible uniquement si le type le requiert -->
            <div v-if="showDestCustomerSection" class="card mb-3" :class="requiresDestCustomer ? 'border-danger' : 'border-info'">
              <div class="card-header" :class="requiresDestCustomer ? 'bg-danger bg-opacity-10' : 'bg-info bg-opacity-10'">
                <h6 class="mb-0" :class="requiresDestCustomer ? 'text-danger' : 'text-info'">
                  <i class="ti ti-user-check me-2"></i>
                  {{ t('transactions.dest_customer_info') || 'Bénéficiaire' }}
                  <span v-if="requiresDestCustomer" class="text-danger ms-1">*</span>
                  <small v-else class="text-muted ms-2">({{ t('transactions.optional') || 'optionnel' }})</small>
                </h6>
              </div>
              <!-- Alerte si le bénéficiaire est requis et absent -->
              <div v-if="requiresDestCustomer && !localForm.dest_customer_id" class="alert alert-danger alert-sm mb-0 py-2 px-3 rounded-0 border-0 border-bottom">
                <i class="ti ti-alert-circle me-1"></i>
                {{ t('transactions.dest_customer_required') || 'Ce type de transaction nécessite un bénéficiaire avant de pouvoir soumettre.' }}
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-12 mb-2">
                    <label class="form-label">
                      {{ t('transactions.dest_customer') || 'Client bénéficiaire' }}
                    </label>
                    <div class="input-group">
                      <input
                        type="text"
                        class="form-control"
                        :value="selectedDestCustomerDisplay"
                        readonly
                        :placeholder="t('transactions.no_dest_customer_selected') || 'Aucun bénéficiaire sélectionné'"
                      />
                      <button
                        type="button"
                        class="btn btn-outline-info"
                        @click="showDestCustomerSearch = true"
                        :disabled="processing"
                      >
                        <i class="ti ti-search me-1"></i>
                        {{ t('transactions.search_customer') || 'Rechercher' }}
                      </button>
                      <button
                        v-if="selectedDestCustomer"
                        type="button"
                        class="btn btn-outline-danger"
                        @click="clearDestCustomer"
                        :disabled="processing"
                      >
                        <i class="ti ti-x"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Amount & Fees -->
            <div class="card mb-3">
              <div class="card-header bg-light">
                <div class="d-flex justify-content-between align-items-center">
                  <h6 class="mb-0">
                    <i class="ti ti-currency-dollar me-2"></i>
                    {{ t('transactions.amount_fees') || 'Montants et frais' }}
                  </h6>
                  <div class="form-check form-switch">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="auto_calculate_fee"
                      v-model="autoCalculateFee"
                      @change="toggleAutoCalculate"
                    />
                    <label class="form-check-label" for="auto_calculate_fee">
                      {{ t('transactions.auto_calculate_fee') || 'Calcul automatique des frais' }}
                    </label>
                  </div>
                </div>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-12 mb-3">
                    <label for="currency_code" class="form-label">
                      {{ t('transactions.currency') || 'Devise' }}
                      <span class="text-danger">*</span>
                    </label>
                    <SearchableSelect
                      v-model="localForm.currency_code"
                      :options="activeCurrencies"
                      :option-label="
                        (currency) => `${currency.name} (${currency.code}) - ${currency.symbol}`
                      "
                      option-value="code"
                      :placeholder="t('transactions.select_currency') || 'Sélectionnez une devise'"
                      :disabled="processing || loadingCurrencies || !!localForm.wallet_id"
                      @change="onCurrencyChange"
                    />
                    <small v-if="localForm.wallet_id" class="text-muted">
                      <i class="ti ti-info-circle me-1"></i>
                      {{
                        t('transactions.currency_from_wallet') ||
                        'Devise définie par le portefeuille sélectionné'
                      }}
                    </small>
                    <small v-if="loadingCurrencies" class="text-info">
                      <span class="spinner-border spinner-border-sm me-1"></span>
                      {{ t('common.loading') || 'Chargement...' }}
                    </small>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-4 mb-3">
                    <label for="gross_amount" class="form-label">
                      {{ t('transactions.gross_amount') || 'Montant brut' }}
                      <span class="text-danger">*</span>
                    </label>
                    <div class="input-group">
                      <input
                        type="number"
                        class="form-control"
                        id="gross_amount"
                        v-model.number="localForm.gross_amount"
                        required
                        min="0"
                        step="any"
                        :disabled="processing"
                        @input="onAmountChange"
                      />
                      <span class="input-group-text">{{ selectedCurrencySymbol }}</span>
                    </div>
                  </div>

                  <div class="col-md-4 mb-3">
                    <label for="fee_amount" class="form-label">
                      {{ t('transactions.fee_amount') || 'Frais' }}
                      <span class="text-danger">*</span>
                    </label>
                    <div class="input-group">
                      <input
                        type="number"
                        class="form-control"
                        id="fee_amount"
                        v-model.number="localForm.fee_amount"
                        required
                        min="0"
                        step="any"
                        :disabled="processing || autoCalculateFee"
                        :readonly="autoCalculateFee"
                      />
                      <span class="input-group-text">{{ selectedCurrencySymbol }}</span>
                    </div>
                    <small v-if="calculatingFee" class="text-info">
                      <span class="spinner-border spinner-border-sm me-1"></span>
                      {{ t('transactions.calculating') || 'Calcul en cours...' }}
                    </small>
                  </div>

                  <div class="col-md-4 mb-3">
                    <label class="form-label">
                      {{ t('transactions.net_amount') || 'Montant net' }}
                    </label>
                    <div class="input-group">
                      <input
                        type="text"
                        class="form-control fw-bold text-success"
                        :value="formatAmount(netAmount)"
                        readonly
                      />
                      <span class="input-group-text">{{ selectedCurrencySymbol }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Withdrawal Code & Destination (for specific transaction types) -->
            <div class="row">
              <div v-if="showDestBranchField" class="col-md-6 mb-3">
                <label for="destination_branch_id" class="form-label">
                  {{ t('transactions.destination_branch') || 'Agence de destination' }}
                  <span class="text-danger">*</span>
                </label>
                <select
                  class="form-select"
                  id="destination_branch_id"
                  v-model.number="localForm.destination_branch_id"
                  :disabled="processing"
                >
                  <option :value="null">
                    {{ t('transactions.select_destination_branch') || 'Sélectionnez une agence' }}
                  </option>
                  <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                    {{ branch.name }} ({{ branch.code }})
                  </option>
                </select>
              </div>

              <div v-if="showDestWalletField" class="col-md-6 mb-3">
                <label class="form-label">
                  {{ t('transactions.dest_wallet') || 'Wallet destination' }}
                  <span class="text-danger">*</span>
                </label>
                <SearchableSelect
                  v-model="localForm.dest_wallet_id"
                  :options="availableDestWallets"
                  :option-label="
                    (w) =>
                      `${w.wallet_number} - ${w.operator?.name || 'N/A'} (${
                        w.currency?.code || 'N/A'
                      })`
                  "
                  option-value="id"
                  :placeholder="t('transactions.select_wallet') || 'Sélectionnez un wallet'"
                  :disabled="processing || !localForm.destination_branch_id"
                  :clearable="true"
                />
                <small v-if="!localForm.destination_branch_id" class="text-muted">
                  <i class="ti ti-info-circle me-1"></i>
                  {{
                    t('transactions.select_dest_branch_first') ||
                    "Sélectionnez d'abord une agence destination"
                  }}
                </small>
              </div>

              <div class="col-md-6 mb-3">
                <label for="withdrawal_code" class="form-label">
                  {{ t('transactions.withdrawal_code') || 'Code de retrait' }}
                  <small class="text-muted"
                    >({{ t('transactions.optional') || 'optionnel' }})</small
                  >
                </label>
                <div class="input-group">
                  <input
                    type="text"
                    class="form-control font-monospace"
                    id="withdrawal_code"
                    v-model="localForm.withdrawal_code"
                    maxlength="6"
                    pattern="[0-9]{6}"
                    :placeholder="t('transactions.withdrawal_code_placeholder') || '000000'"
                    :disabled="processing"
                  />
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="generateWithdrawalCode"
                    :disabled="processing"
                  >
                    <i class="ti ti-refresh"></i>
                    {{ t('transactions.generate') || 'Générer' }}
                  </button>
                </div>
              </div>

              <div v-if="localForm.withdrawal_code" class="col-md-6 mb-3">
                <label for="expires_at" class="form-label">
                  {{ t('transactions.expires_at') || "Date d'expiration" }}
                  <span class="text-danger">*</span>
                </label>
                <input
                  type="datetime-local"
                  class="form-control"
                  id="expires_at"
                  v-model="localForm.expires_at"
                  :min="minExpirationDate"
                  required
                  :disabled="processing"
                />
              </div>

              <!-- Status (only for edit mode) -->
              <div v-if="isEditing" class="col-md-6 mb-3">
                <label for="status" class="form-label">
                  {{ t('transactions.status') || 'Statut' }}
                </label>
                <select
                  class="form-select"
                  id="status"
                  v-model="localForm.status"
                  :disabled="processing"
                >
                  <option value="pending">
                    {{ t('transactions.status_pending') || 'En attente' }}
                  </option>
                  <option value="available">
                    {{ t('transactions.status_available') || 'Disponible' }}
                  </option>
                  <option value="completed">
                    {{ t('transactions.status_completed') || 'Complétée' }}
                  </option>
                  <option value="cancelled">
                    {{ t('transactions.status_cancelled') || 'Annulée' }}
                  </option>
                  <option value="failed">{{ t('transactions.status_failed') || 'Échouée' }}</option>
                </select>
              </div>
            </div>

            <!-- Description -->
            <div class="mb-3">
              <label for="description" class="form-label">
                <i class="ti ti-notes me-1"></i>
                {{ t('transactions.description') || 'Note / Description' }}
                <small class="text-muted">({{ t('transactions.optional') || 'optionnel' }})</small>
              </label>
              <textarea
                id="description"
                class="form-control"
                v-model="localForm.description"
                rows="2"
                maxlength="1000"
                :placeholder="t('transactions.description_placeholder') || 'Ex: code Airtel Money, référence externe, motif...'"
                :disabled="processing"
              ></textarea>
              <div class="form-text text-end">
                {{ (localForm.description || '').length }} / 1000
              </div>
            </div>

            <!-- Preview Card -->
            <div v-if="showPreview" class="card border-info">
              <div class="card-body">
                <h6 class="card-title text-info">
                  <i class="ti ti-eye me-2"></i>
                  {{ t('transactions.preview') || 'Aperçu' }}
                </h6>
                <div class="row">
                  <div class="col-md-4">
                    <small class="text-muted">{{ t('transactions.gross_amount') }}</small>
                    <div class="fs-5">{{ formatCurrency(localForm.gross_amount || 0) }}</div>
                  </div>
                  <div class="col-md-4">
                    <small class="text-muted">{{ t('transactions.fee_amount') }}</small>
                    <div class="fs-5 text-danger">
                      - {{ formatCurrency(localForm.fee_amount || 0) }}
                    </div>
                  </div>
                  <div class="col-md-4">
                    <small class="text-muted">{{ t('transactions.net_amount') }}</small>
                    <div class="fs-4 fw-bold text-success">{{ formatCurrency(netAmount) }}</div>
                  </div>
                </div>
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
              {{ t('transactions.cancel') || 'Annuler' }}
            </button>
            <button type="submit" class="btn btn-primary" :disabled="processing || !isFormValid">
              <span v-if="processing" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else :class="`ti ${isEditing ? 'ti-device-floppy' : 'ti-check'} me-2`"></i>
              {{
                isEditing
                  ? t('transactions.update') || 'Mettre à jour'
                  : t('transactions.create') || 'Créer'
              }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Backdrop -->
  <div v-if="show" class="modal-backdrop fade show"></div>

  <!-- Customer Search Modal -->
  <CustomerSearchModal
    :show="showCustomerSearch"
    @close="showCustomerSearch = false"
    @select="onCustomerSelected"
  />

  <!-- Destination Customer Search Modal -->
  <CustomerSearchModal
    :show="showDestCustomerSearch"
    @close="showDestCustomerSearch = false"
    @select="onDestCustomerSelected"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useAuthStore } from '@/stores/auth'
import { useCurrencyStore } from '@/stores/currencies'
import { axiosInstance } from '@/plugins/axios'
import { appConfig } from '@/config/app'
import type { TransactionFormData } from '@/types'
import CustomerSearchModal from './CustomerSearchModal.vue'
import SearchableSelect from '@/components/Shared/SearchableSelect.vue'

const { t } = useI18n()
const authStore = useAuthStore()
const currencyStore = useCurrencyStore()

interface Props {
  show: boolean
  formData?: TransactionFormData
  transactionTypes: any[]
  branches: any[]
  wallets: any[]
  processing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  formData: () => ({
    transaction_type_id: null,
    branch_id: null,
    customer_id: null,
    dest_customer_id: null,
    customer_phone: '',
    wallet_id: null,
    dest_wallet_id: null,
    customer_account_id: null,
    currency_code: 'CDF',
    gross_amount: 0,
    fee_amount: 0,
    fee_mode_applied: null,
    fee_rule_id: null,
    parent_transaction_id: null,
    destination_branch_id: null,
    withdrawal_code: '',
    expires_at: '',
    status: 'pending',
    description: null,
  }),
  transactionTypes: () => [],
  branches: () => [],
  wallets: () => [],
  processing: false,
})

const emit = defineEmits<{
  close: []
  submit: [data: TransactionFormData]
}>()

const localForm = ref<TransactionFormData>({ ...props.formData })
const processing = ref(false)
const autoCalculateFee = ref(true)
const calculatingFee = ref(false)
const showCustomerSearch = ref(false)
const selectedCustomer = ref<any>(null)
const showDestCustomerSearch = ref(false)
const selectedDestCustomer = ref<any>(null)
const showPreview = ref(false)
const loadingCurrencies = ref(false)
const customerAccounts = ref<any[]>([])
const loadingCustomerAccounts = ref(false)

let feeCalculationTimeout: ReturnType<typeof setTimeout> | null = null

// Check if user can manually select branch (admin or supervisor)
const canSelectBranch = computed(() => {
  if (!authStore.user) return false
  const roles = authStore.user.roles || []
  if (roles.includes('admin') || roles.includes('superviseur')) return true
  // Only allow free selection if explicitly no branch assigned (not just loading)
  return authStore.user.branch_id === null
})

// Branch fetched once on mount for locked display (agents)
const agentBranch = ref<any>(null)
const agentBranchLoading = ref(false)

const lockedBranchName = computed(() => {
  if (agentBranchLoading.value) return '...'
  if (agentBranch.value) return `${agentBranch.value.name} (${agentBranch.value.code})`
  return authStore.user?.branch_id ? String(authStore.user.branch_id) : ''
})

onMounted(async () => {
  const userBranchId = authStore.user?.branch_id
  if (userBranchId && !canSelectBranch.value) {
    localForm.value.branch_id = Number(userBranchId)
    // Fetch branch name once for the locked display
    agentBranchLoading.value = true
    try {
      const { data } = await axiosInstance.get(`${appConfig.apiUrl}/branches/${userBranchId}`)
      agentBranch.value = data?.data ?? data
    } catch {
      // lockedBranchName falls back to the ID string
    } finally {
      agentBranchLoading.value = false
    }
  }

  // Load currencies if not already loaded
  if (currencyStore.allCurrencies.length === 0) {
    loadingCurrencies.value = true
    try {
      await currencyStore.fetchAllCurrencies()
      if (!localForm.value.currency_code && currencyStore.defaultCurrency) {
        localForm.value.currency_code = currencyStore.defaultCurrency.code
      }
    } catch (error) {
      console.error('Error loading currencies:', error)
    } finally {
      loadingCurrencies.value = false
    }
  } else if (!localForm.value.currency_code && currencyStore.defaultCurrency) {
    localForm.value.currency_code = currencyStore.defaultCurrency.code
  }
})

// When formData is reset from outside, re-apply the agent's branch_id
watch(
  () => props.formData,
  (newData) => {
    if (newData) {
      localForm.value = { ...newData }
      if (authStore.user?.branch_id && !canSelectBranch.value) {
        localForm.value.branch_id = Number(authStore.user.branch_id)
      }
      showPreview.value = false
    }
  },
  { deep: true }
)

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      localForm.value = { ...props.formData }
      // Always lock branch_id for agents
      if (authStore.user?.branch_id && !canSelectBranch.value) {
        localForm.value.branch_id = Number(authStore.user.branch_id)
      }
      // Set default currency if not set
      if (!localForm.value.currency_code && currencyStore.defaultCurrency) {
        localForm.value.currency_code = currencyStore.defaultCurrency.code
      }
      selectedCustomer.value = null
      selectedDestCustomer.value = null
      showPreview.value = false
    }
  }
)

// Auto-fill currency when wallet is selected
watch(
  () => localForm.value.wallet_id,
  (newWalletId) => {
    if (newWalletId) {
      const selectedWallet = props.wallets.find((w) => w.id === newWalletId)
      if (selectedWallet?.currency?.code) {
        localForm.value.currency_code = selectedWallet.currency.code
      }
      // Recalculate fees when wallet changes (operator changes)
      if (autoCalculateFee.value) {
        calculateAutomaticFee()
      }
    }
  }
)

// Reset wallet when branch changes
watch(
  () => localForm.value.branch_id,
  (newBranchId, oldBranchId) => {
    if (oldBranchId !== undefined && newBranchId !== oldBranchId && localForm.value.wallet_id) {
      const selectedWallet = props.wallets.find((w) => w.id === localForm.value.wallet_id)
      if (selectedWallet && Number(selectedWallet.branch_id) !== Number(newBranchId)) {
        localForm.value.wallet_id = null
      }
    }
  }
)

// Reset dest_wallet when destination branch changes
watch(
  () => localForm.value.destination_branch_id,
  (newId, oldId) => {
    if (oldId !== undefined && newId !== oldId) {
      localForm.value.dest_wallet_id = null
    }
  }
)

const isEditing = computed(() => !!localForm.value.id)

// Selected transaction type object
const selectedTransactionType = computed(() =>
  props.transactionTypes.find((t) => t.id === localForm.value.transaction_type_id) ?? null
)

// Whether the selected type requires a customer TAMS account
const requiresCustomerAccount = computed(() =>
  (selectedTransactionType.value?.customer_account_effect ?? 'none') !== 'none'
)

// Whether the selected type requires a destination customer (receiver) before submit
const requiresDestCustomer = computed(() =>
  selectedTransactionType.value?.requires_dest_customer === true
)

// Dynamic field visibility based on selected transaction type
const showCustomerSection = computed(() => {
  if (!selectedTransactionType.value) return true
  return selectedTransactionType.value.requires_customer !== false
})

const showDestCustomerSection = computed(() => {
  if (!selectedTransactionType.value) return true
  return selectedTransactionType.value.requires_dest_customer === true
})

const showWalletField = computed(() => {
  if (!selectedTransactionType.value) return true
  return selectedTransactionType.value.wallet_effect !== 'none'
})

const showDestBranchField = computed(() => {
  if (!selectedTransactionType.value) return true
  const t = selectedTransactionType.value
  return t.dest_branch_effect !== 'none' || t.dest_wallet_effect !== 'none'
})

const showDestWalletField = computed(() => {
  if (!selectedTransactionType.value) return true
  return selectedTransactionType.value.dest_wallet_effect !== 'none'
})

// Filter wallets by selected branch
const availableWallets = computed(() => {
  if (!localForm.value.branch_id) return []
  const id = Number(localForm.value.branch_id)
  return props.wallets.filter((w) => Number(w.branch_id) === id)
})

const availableDestWallets = computed(() => {
  if (!localForm.value.destination_branch_id) return []
  const id = Number(localForm.value.destination_branch_id)
  return props.wallets.filter((w) => Number(w.branch_id) === id)
})

const activeCurrencies = computed(() => currencyStore.activeCurrencies)

const selectedCurrency = computed(() => {
  if (!localForm.value.currency_code) return null
  return currencyStore.getCurrencyByCode(localForm.value.currency_code)
})

const selectedCurrencySymbol = computed(() => {
  return selectedCurrency.value?.symbol || 'CDF'
})

const netAmount = computed(() => {
  return (localForm.value.gross_amount || 0) - (localForm.value.fee_amount || 0)
})

const minExpirationDate = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
})

const selectedCustomerDisplay = computed(() => {
  if (selectedCustomer.value) {
    return `${selectedCustomer.value.full_name} (${selectedCustomer.value.phone})`
  }
  return ''
})

const selectedDestCustomerDisplay = computed(() => {
  if (selectedDestCustomer.value) {
    return `${selectedDestCustomer.value.full_name} (${selectedDestCustomer.value.phone})`
  }
  return ''
})

const isFormValid = computed(() => {
  return (
    localForm.value.transaction_type_id &&
    localForm.value.branch_id &&
    (localForm.value.gross_amount ?? 0) > 0 &&
    (localForm.value.fee_amount ?? 0) >= 0 &&
    (!localForm.value.withdrawal_code || localForm.value.expires_at) &&
    (!requiresDestCustomer.value || !!localForm.value.dest_customer_id)
  )
})

const onTransactionTypeChange = () => {
  const type = selectedTransactionType.value

  // Reset fields that are no longer relevant for the new type
  if (type) {
    if (type.wallet_effect === 'none') {
      localForm.value.wallet_id = null
    }
    if (type.dest_branch_effect === 'none' && type.dest_wallet_effect === 'none') {
      localForm.value.destination_branch_id = null
      localForm.value.dest_wallet_id = null
    } else if (type.dest_wallet_effect === 'none') {
      localForm.value.dest_wallet_id = null
    }
    if (!type.requires_customer) {
      localForm.value.customer_id = null
      localForm.value.customer_phone = ''
      selectedCustomer.value = null
    }
    if (!type.requires_dest_customer) {
      localForm.value.dest_customer_id = null
      selectedDestCustomer.value = null
    }
  }

  calculateAutomaticFee()
  showPreview.value = true
}

const onCurrencyChange = () => {
  showPreview.value = true
  if (autoCalculateFee.value) {
    calculateAutomaticFee()
  }
}

const onAmountChange = () => {
  if (autoCalculateFee.value) {
    calculateAutomaticFee()
  }
  showPreview.value = true
}

const toggleAutoCalculate = () => {
  if (autoCalculateFee.value) {
    calculateAutomaticFee()
  }
}

const calculateAutomaticFee = async () => {
  if (!autoCalculateFee.value) return
  if (
    !localForm.value.transaction_type_id ||
    !localForm.value.branch_id ||
    !localForm.value.gross_amount
  ) {
    return
  }

  if (feeCalculationTimeout) {
    clearTimeout(feeCalculationTimeout)
  }

  feeCalculationTimeout = setTimeout(async () => {
    calculatingFee.value = true

    try {
      // Get operator_id from selected wallet if available
      let operatorId = null
      if (localForm.value.wallet_id) {
        const selectedWallet = props.wallets.find((w) => w.id === localForm.value.wallet_id)
        operatorId = selectedWallet?.operator_id || null
      }

      const response = await axiosInstance.get(`${appConfig.apiUrl}/fee-rules/applicable`, {
        params: {
          transaction_type_id: localForm.value.transaction_type_id,
          branch_id: localForm.value.branch_id,
          operator_id: operatorId,
          amount: localForm.value.gross_amount,
        },
      })
      console.log('Fee calculation API response:', response.data)

      if (response.data && response.data.calculated_fee !== undefined) {
        localForm.value.fee_amount = response.data.calculated_fee || 0
        console.log('API fee response:', response.data)
        console.log('Frais calculé (fee_amount):', localForm.value.fee_amount)
      }
    } catch (error) {
      console.error('Error calculating fee:', error)
    } finally {
      calculatingFee.value = false
    }
  }, 500)
}

const generateWithdrawalCode = () => {
  localForm.value.withdrawal_code = Math.floor(100000 + Math.random() * 900000).toString()

  // Set default expiration to 7 days from now
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)
  expiresAt.setMinutes(expiresAt.getMinutes() - expiresAt.getTimezoneOffset())
  localForm.value.expires_at = expiresAt.toISOString().slice(0, 16)
}

const loadCustomerAccounts = async (customerId: string | number) => {
  loadingCustomerAccounts.value = true
  customerAccounts.value = []
  localForm.value.customer_account_id = null
  try {
    const res = await axiosInstance.get(`${appConfig.apiUrl}/customer-accounts/customer/${customerId}`)
    customerAccounts.value = res.data.data || []
  } catch {
    customerAccounts.value = []
  } finally {
    loadingCustomerAccounts.value = false
  }
}

// Load customer accounts when type requires it and customer changes
watch(
  [() => localForm.value.customer_id, requiresCustomerAccount],
  ([customerId, needed]) => {
    if (needed && customerId) {
      loadCustomerAccounts(customerId)
    } else {
      customerAccounts.value = []
      localForm.value.customer_account_id = null
    }
  }
)

// Reset customer_account_id when type no longer requires it
watch(requiresCustomerAccount, (needed) => {
  if (!needed) {
    localForm.value.customer_account_id = null
    customerAccounts.value = []
  }
})

const onCustomerSelected = (customer: any) => {
  selectedCustomer.value = customer
  localForm.value.customer_id = customer.id
  localForm.value.customer_phone = customer.phone
}

const clearCustomer = () => {
  selectedCustomer.value = null
  localForm.value.customer_id = null
  localForm.value.customer_phone = ''
}

const onDestCustomerSelected = (customer: any) => {
  selectedDestCustomer.value = customer
  localForm.value.dest_customer_id = customer.id
}

const clearDestCustomer = () => {
  selectedDestCustomer.value = null
  localForm.value.dest_customer_id = null
}

const handleSubmit = () => {
  if (!isFormValid.value) return

  // Add currency_id to the form before submit
  const selectedCurrencyObj = currencyStore.getCurrencyByCode(localForm.value.currency_code)
  if (selectedCurrencyObj && selectedCurrencyObj.id) {
    localForm.value.currency_id = selectedCurrencyObj.id
  } else {
    localForm.value.currency_id = null
  }

  processing.value = true
  emit('submit', localForm.value)
}

const closeModal = () => {
  emit('close')
}

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('fr-FR').format(amount)
}

const formatCurrency = (amount: number) => {
  const currencyCode = localForm.value.currency_code || 'CDF'
  return currencyStore.formatAmount(amount, currencyCode)
}

defineExpose({
  setProcessing: (value: boolean) => {
    processing.value = value
  },
})
</script>

<style scoped>
.modal.show {
  display: block;
}

.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

.font-monospace {
  font-family: 'Courier New', monospace;
  font-size: 1.1em;
  letter-spacing: 0.1em;
}
</style>
