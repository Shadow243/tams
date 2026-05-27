<template>
  <div class="customer-accounts-page">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-1">
          <i class="ti ti-wallet me-2"></i>
          {{ t('accounts.vip_accounts') || 'Comptes Clients VIP' }}
        </h1>
        <p class="text-muted mb-0">
          {{ t('accounts.manage_vip_accounts') || 'Gérer les comptes clients avec crédit' }}
        </p>
      </div>
      <button class="btn btn-primary" @click="openCreateModal" v-if="can('creer_clients')">
        <i class="ti ti-plus me-2"></i>
        {{ t('accounts.new_account') || 'Nouveau Compte' }}
      </button>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <input
              type="text"
              class="form-control"
              :placeholder="t('common.search') || 'Rechercher...'"
              v-model="filters.search"
              @input="debouncedSearch"
            />
          </div>
          <div class="col-md-2">
            <select class="form-select" v-model="filters.status" @change="applyFilters">
              <option value="">{{ t('common.all_statuses') || 'Tous les statuts' }}</option>
              <option value="active">{{ t('accounts.active') || 'Actif' }}</option>
              <option value="suspended">{{ t('accounts.suspended') || 'Suspendu' }}</option>
              <option value="closed">{{ t('accounts.closed') || 'Fermé' }}</option>
            </select>
          </div>
          <div class="col-md-2">
            <select class="form-select" v-model="filters.is_vip" @change="applyFilters">
              <option :value="null">{{ t('accounts.all_types') || 'Tous les types' }}</option>
              <option :value="true">{{ t('accounts.vip_only') || 'VIP uniquement' }}</option>
              <option :value="false">
                {{ t('accounts.standard_only') || 'Standard uniquement' }}
              </option>
            </select>
          </div>
          <div class="col-md-2">
            <div class="form-check">
              <input
                class="form-check-input"
                type="checkbox"
                id="inDebtFilter"
                v-model="filters.in_debt"
                @change="applyFilters"
              />
              <label class="form-check-label" for="inDebtFilter">
                {{ t('accounts.show_debts') || 'Comptes en dette' }}
              </label>
            </div>
          </div>
          <div class="col-md-2 text-end">
            <button class="btn btn-secondary" @click="resetFilters">
              <i class="ti ti-refresh me-2"></i>
              {{ t('common.reset') || 'Réinitialiser' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Accounts Table -->
    <div class="card">
      <div class="card-body">
        <div v-if="isLoading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
        </div>

        <div v-else-if="accountList.length === 0" class="text-center py-5 text-muted">
          <i class="ti ti-wallet" style="font-size: 4rem; opacity: 0.3"></i>
          <p class="mt-3">{{ t('accounts.no_accounts') || 'Aucun compte trouvé' }}</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>{{ t('accounts.account_number') || 'N° Compte' }}</th>
                <th>{{ t('accounts.branch') || 'Agence' }}</th>
                <th>{{ t('accounts.balance') || 'Solde' }}</th>
                <th>{{ t('accounts.credit_limit') || 'Crédit disponible' }}</th>
                <th>{{ t('common.status') || 'Statut' }}</th>
                <th class="text-end">{{ t('common.actions') || 'Actions' }}</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="group in groupedAccounts" :key="group.customerId">
                <!-- Customer group header -->
                <tr class="customer-group-header">
                  <td colspan="6">
                    <div class="d-flex align-items-center gap-2">
                      <i class="ti ti-user-circle text-primary"></i>
                      <strong>{{ group.customerName }}</strong>
                      <small class="text-muted">{{ group.customerPhone }}</small>
                      <span class="badge bg-light text-secondary border ms-1">
                        {{ group.accounts.length }}
                        {{ group.accounts.length > 1 ? 'comptes' : 'compte' }}
                      </span>
                    </div>
                  </td>
                </tr>
                <!-- Account rows for this customer -->
                <tr v-for="account in group.accounts" :key="account.id" class="account-row">
                  <td class="ps-4">
                    <strong>{{ account.account_number }}</strong>
                    <span class="badge bg-light text-secondary border ms-2">{{
                      account.currency?.code
                    }}</span>
                    <span v-if="account.is_vip" class="badge bg-warning text-dark ms-1">VIP</span>
                  </td>
                  <td>{{ account.branch?.name }}</td>
                  <td>
                    <span
                      :class="{
                        'text-danger fw-semibold': account.is_in_debt,
                        'text-success': !account.is_in_debt,
                      }"
                    >
                      {{ formatCurrency(account.balance, account.currency?.code) }}
                    </span>
                  </td>
                  <td>{{ formatCurrency(account.credit_limit, account.currency?.code) }}</td>
                  <td>
                    <span :class="`badge bg-${account.status_color}`">
                      {{ account.status_label }}
                    </span>
                  </td>
                  <td class="text-end">
                    <div class="btn-group btn-group-sm" role="group">
                      <button
                        class="btn btn-outline-primary"
                        @click="viewAccount(account)"
                        :title="t('common.view') || 'Voir'"
                      >
                        <i class="ti ti-eye"></i>
                      </button>
                      <button
                        class="btn btn-outline-success"
                        @click="openDepositModal(account)"
                        :title="t('accounts.deposit') || 'Dépôt'"
                        v-if="can('creer_transactions')"
                      >
                        <i class="ti ti-arrow-down"></i>
                      </button>
                      <button
                        class="btn btn-outline-warning"
                        @click="openWithdrawModal(account)"
                        :title="t('accounts.withdraw') || 'Retrait'"
                        v-if="can('creer_transactions')"
                      >
                        <i class="ti ti-arrow-up"></i>
                      </button>
                      <button
                        class="btn btn-outline-info"
                        @click="viewStatement(account)"
                        :title="t('accounts.statement') || 'Relevé'"
                      >
                        <i class="ti ti-file-text"></i>
                      </button>
                    </div>

                    <!-- Dropdown for more actions -->
                    <div class="btn-group btn-group-sm ms-1" role="group">
                      <button
                        type="button"
                        class="btn btn-outline-secondary dropdown-toggle"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <i class="ti ti-dots"></i>
                      </button>
                      <ul class="dropdown-menu dropdown-menu-end">
                        <li>
                          <a
                            class="dropdown-item"
                            href="#"
                            @click.prevent="openInterestSettings(account)"
                          >
                            <i class="ti ti-percentage me-2"></i>
                            Paramètres d'intérêts
                          </a>
                        </li>
                        <li v-if="can('editer_clients')">
                          <a class="dropdown-item" href="#" @click.prevent="editAccount(account)">
                            <i class="ti ti-edit me-2"></i>
                            Modifier
                          </a>
                        </li>
                        <li v-if="can('creer_transactions')">
                          <hr class="dropdown-divider" />
                        </li>
                        <li v-if="can('creer_transactions')">
                          <a
                            class="dropdown-item"
                            href="#"
                            @click.prevent="applyInterestNow(account)"
                          >
                            <i class="ti ti-calculator me-2"></i>
                            Appliquer intérêts maintenant
                          </a>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="accounts && accounts.last_page > 1" class="d-flex justify-content-center mt-4">
          <nav>
            <ul class="pagination">
              <li class="page-item" :class="{ disabled: accounts.current_page === 1 }">
                <button class="page-link" @click="changePage(accounts.current_page - 1)">
                  {{ t('common.previous') || 'Précédent' }}
                </button>
              </li>
              <li
                v-for="page in visiblePages"
                :key="page"
                class="page-item"
                :class="{ active: page === accounts.current_page }"
              >
                <button class="page-link" @click="changePage(page)">{{ page }}</button>
              </li>
              <li
                class="page-item"
                :class="{ disabled: accounts.current_page === accounts.last_page }"
              >
                <button class="page-link" @click="changePage(accounts.current_page + 1)">
                  {{ t('common.next') || 'Suivant' }}
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <CustomerAccountModal
      modal-id="customerAccountModal"
      :account="selectedAccount"
      @saved="handleAccountSaved"
    />

    <AccountOperationModal
      modal-id="accountOperationModal"
      :account="selectedAccount"
      :operation-type="operationType"
      @operation-completed="handleOperationSuccess"
    />

    <AccountStatementModal modal-id="accountStatementModal" :account="selectedAccount" />

    <InterestSettingsModal
      modal-id="interestSettingsModal"
      :account="selectedAccount"
      @saved="handleInterestSettingsSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCustomerAccountStore } from '@/stores/customer-accounts'
import { useI18n } from '@/composables/useI18n'
import { usePermissions } from '@/composables/usePermissions'
import debounce from 'lodash.debounce'
import CustomerAccountModal from './CustomerAccountModal.vue'
import AccountOperationModal from './AccountOperationModal.vue'
import AccountStatementModal from './AccountStatementModal.vue'
import InterestSettingsModal from './InterestSettingsModal.vue'
import type { CustomerAccount } from '@/types'

const { t } = useI18n()
const { can } = usePermissions()
const router = useRouter()
const accountStore = useCustomerAccountStore()

const isLoading = computed(() => accountStore.isLoading)
const accounts = computed(() => accountStore.accounts)
const accountList = computed(() => accountStore.account_list)

const groupedAccounts = computed(() => {
  const map = new Map<
    number,
    { customerId: number; customerName: string; customerPhone: string; accounts: CustomerAccount[] }
  >()
  for (const account of accountList.value) {
    const id = account.customer?.id ?? account.customer_id
    if (!map.has(id)) {
      map.set(id, {
        customerId: id,
        customerName: account.customer?.full_name ?? '—',
        customerPhone: account.customer?.phone ?? '',
        accounts: [],
      })
    }
    map.get(id)!.accounts.push(account)
  }
  return Array.from(map.values())
})

const filters = ref({
  search: '',
  status: '',
  is_vip: null as boolean | null,
  in_debt: false,
})

const showAccountModal = ref(false)
const showOperationModal = ref(false)
const showStatementModal = ref(false)
const selectedAccount = ref<CustomerAccount | null>(null)
const operationType = ref<'deposit' | 'withdraw'>('deposit')

const currentPage = ref(1)

const visiblePages = computed(() => {
  if (!accounts.value) return []
  const pages = []
  const total = accounts.value.last_page
  const current = accounts.value.current_page

  for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
    pages.push(i)
  }
  return pages
})

const debouncedSearch = debounce(() => {
  applyFilters()
}, 500)

const applyFilters = () => {
  accountStore.filters.search = filters.value.search
  accountStore.filters.status = filters.value.status as any
  accountStore.filters.is_vip = filters.value.is_vip
  accountStore.filters.in_debt = filters.value.in_debt
  currentPage.value = 1
  fetchAccounts()
}

const resetFilters = () => {
  filters.value = {
    search: '',
    status: '',
    is_vip: null,
    in_debt: false,
  }
  accountStore.resetFilters()
  fetchAccounts()
}

const fetchAccounts = async () => {
  await accountStore.fetchAccounts(currentPage.value)
}

const changePage = (page: number) => {
  currentPage.value = page
  fetchAccounts()
}

const openCreateModal = () => {
  selectedAccount.value = null
  accountStore.setCurrentAccount(null)
  if ((window as any).bootstrap) {
    const modal = new (window as any).bootstrap.Modal(
      document.getElementById('customerAccountModal')
    )
    modal.show()
  }
}

const viewAccount = (account: CustomerAccount) => {
  router.push({ name: 'customer-account-details', params: { id: account.uuid } })
}

const openDepositModal = (account: CustomerAccount) => {
  selectedAccount.value = account
  operationType.value = 'deposit'
  if ((window as any).bootstrap) {
    const modal = new (window as any).bootstrap.Modal(
      document.getElementById('accountOperationModal')
    )
    modal.show()
  }
}

const openWithdrawModal = (account: CustomerAccount) => {
  selectedAccount.value = account
  operationType.value = 'withdraw'
  if ((window as any).bootstrap) {
    const modal = new (window as any).bootstrap.Modal(
      document.getElementById('accountOperationModal')
    )
    modal.show()
  }
}

const viewStatement = (account: CustomerAccount) => {
  selectedAccount.value = account
  if ((window as any).bootstrap) {
    const modal = new (window as any).bootstrap.Modal(
      document.getElementById('accountStatementModal')
    )
    modal.show()
  }
}

const openInterestSettings = (account: CustomerAccount) => {
  selectedAccount.value = account
  if ((window as any).bootstrap) {
    const modal = new (window as any).bootstrap.Modal(
      document.getElementById('interestSettingsModal')
    )
    modal.show()
  }
}

const editAccount = (account: CustomerAccount) => {
  selectedAccount.value = account
  accountStore.setCurrentAccount(account)
  if ((window as any).bootstrap) {
    const modal = new (window as any).bootstrap.Modal(
      document.getElementById('customerAccountModal')
    )
    modal.show()
  }
}

const applyInterestNow = async (account: CustomerAccount) => {
  if (
    !confirm(
      `Voulez-vous vraiment appliquer les intérêts maintenant pour le compte ${account.account_number} ?`
    )
  ) {
    return
  }

  const success = await accountStore.applyInterest(account.uuid)
  if (success) {
    fetchAccounts()
  }
}

const handleAccountSaved = () => {
  fetchAccounts()
}

const handleOperationSuccess = () => {
  fetchAccounts()
}

const handleInterestSettingsSaved = () => {
  fetchAccounts()
}

const formatCurrency = (amount: number, currencyCode?: string) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currencyCode || 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

onMounted(() => {
  fetchAccounts()
})
</script>

<style scoped>
.customer-accounts-page {
  padding: 1.5rem;
}

.table th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  color: #6c757d;
}

.customer-group-header td {
  background-color: var(--theme-topbar-bg);
  border-top: 2px solid var(--vz-border-color, #dee2e6);
  padding-top: 0.6rem;
  padding-bottom: 0.6rem;
}

.account-row td {
  border-top: none;
}
</style>
