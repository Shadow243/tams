<template>
  <div class="p-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="d-flex align-items-center gap-3">
        <button class="btn btn-sm btn-outline-secondary" @click="router.back()">
          <i class="ti ti-arrow-left me-1"></i>
          Retour
        </button>
        <div>
          <h1 class="h4 mb-0">
            <i class="ti ti-pig-money me-2"></i>
            {{ account?.account_number }}
            <span v-if="account?.is_vip" class="badge bg-warning text-dark ms-2">VIP</span>
          </h1>
          <p class="text-muted mb-0 small">{{ account?.customer?.full_name }}</p>
        </div>
      </div>
      <div class="d-flex gap-2" v-if="account">
        <button class="btn btn-success btn-sm" @click="openDeposit" v-if="can('creer_transactions')">
          <i class="ti ti-arrow-down me-1"></i>Dépôt
        </button>
        <button class="btn btn-primary btn-sm" @click="openWithdraw" v-if="can('creer_transactions')">
          <i class="ti ti-arrow-up me-1"></i>Retrait
        </button>
        <button class="btn btn-outline-secondary btn-sm" @click="openInterestSettings">
          <i class="ti ti-percentage me-1"></i>Intérêts
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <template v-else-if="account">
      <!-- Info Cards -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="text-muted small mb-1">Solde</div>
              <div class="h4 mb-0" :class="account.is_in_debt ? 'text-danger' : 'text-success'">
                {{ formatCurrency(account.balance, account.currency?.code) }}
              </div>
              <small v-if="account.is_in_debt" class="text-danger">
                <i class="ti ti-alert-triangle me-1"></i>En dette
              </small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="text-muted small mb-1">Crédit disponible</div>
              <div class="h4 mb-0">{{ formatCurrency(account.credit_limit, account.currency?.code) }}</div>
              <small class="text-muted">Disponible: {{ formatCurrency(account.available_balance, account.currency?.code) }}</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="text-muted small mb-1">Statut</div>
              <span :class="`badge bg-${account.status_color} fs-6`">{{ account.status_label }}</span>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="text-muted small mb-1">Client</div>
              <div class="fw-semibold">{{ account.customer?.full_name }}</div>
              <small class="text-muted">{{ account.customer?.phone }}</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Transactions -->
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h6 class="mb-0"><i class="ti ti-history me-2"></i>Historique des opérations</h6>
          <span class="badge bg-secondary">{{ transactions.length }} opération(s)</span>
        </div>
        <div class="card-body p-0">
          <div v-if="loadingTransactions" class="text-center py-4">
            <div class="spinner-border spinner-border-sm text-primary"></div>
          </div>
          <div v-else-if="transactions.length === 0" class="text-center py-5 text-muted">
            <i class="ti ti-inbox" style="font-size:2.5rem;opacity:.3"></i>
            <p class="mt-2">Aucune opération</p>
          </div>
          <div v-else class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Montant</th>
                  <th>Solde avant</th>
                  <th>Solde après</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tx in transactions" :key="tx.id">
                  <td class="text-nowrap">
                    <small>{{ formatDate(tx.created_at) }}</small>
                  </td>
                  <td>
                    <span :class="`badge bg-${tx.type === 'deposit' ? 'success' : tx.type === 'withdrawal' ? 'danger' : 'info'}`">
                      {{ tx.type_label || tx.type }}
                    </span>
                  </td>
                  <td :class="tx.type === 'deposit' ? 'text-success fw-semibold' : 'text-danger fw-semibold'">
                    {{ tx.type === 'deposit' ? '+' : '-' }}{{ formatCurrency(tx.amount, account.currency?.code) }}
                  </td>
                  <td>{{ formatCurrency(tx.balance_before, account.currency?.code) }}</td>
                  <td :class="tx.balance_after < 0 ? 'text-danger' : ''">
                    {{ formatCurrency(tx.balance_after, account.currency?.code) }}
                  </td>
                  <td><small class="text-muted">{{ tx.description || '—' }}</small></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

    <!-- Modals -->
    <template v-if="account">
      <AccountOperationModal
        modal-id="detailOperationModal"
        :account="account"
        :operation-type="operationType"
        @operation-completed="refresh"
      />
      <InterestSettingsModal
        modal-id="detailInterestModal"
        :account="account"
        @saved="refresh"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCustomerAccountStore } from '@/stores/customer-accounts'
import { usePermissions } from '@/composables/usePermissions'
import AccountOperationModal from '@/components/CustomerAccounts/AccountOperationModal.vue'
import InterestSettingsModal from '@/components/CustomerAccounts/InterestSettingsModal.vue'
import type { CustomerAccount } from '@/types'

const route = useRoute()
const router = useRouter()
const store = useCustomerAccountStore()
const { can } = usePermissions()

const account = ref<CustomerAccount | null>(null)
const transactions = ref<any[]>([])
const loading = ref(false)
const loadingTransactions = ref(false)
const operationType = ref<'deposit' | 'withdraw'>('deposit')

const fetchAccount = async () => {
  loading.value = true
  account.value = await store.fetchAccount(route.params.id as string)
  loading.value = false
}

const fetchTransactions = async () => {
  if (!account.value) return
  loadingTransactions.value = true
  try {
    await store.fetchTransactions(account.value.uuid)
    transactions.value = store.transactions
  } finally {
    loadingTransactions.value = false
  }
}

const refresh = async () => {
  await fetchAccount()
  await fetchTransactions()
}

const openDeposit = () => {
  operationType.value = 'deposit'
  const el = document.getElementById('detailOperationModal')
  if (el && (window as any).bootstrap) {
    new (window as any).bootstrap.Modal(el).show()
  }
}

const openWithdraw = () => {
  operationType.value = 'withdraw'
  const el = document.getElementById('detailOperationModal')
  if (el && (window as any).bootstrap) {
    new (window as any).bootstrap.Modal(el).show()
  }
}

const openInterestSettings = () => {
  const el = document.getElementById('detailInterestModal')
  if (el && (window as any).bootstrap) {
    new (window as any).bootstrap.Modal(el).show()
  }
}

const formatCurrency = (amount: number, code = 'XAF') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: code, minimumFractionDigits: 0 }).format(amount)

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(date))

onMounted(async () => {
  await fetchAccount()
  await fetchTransactions()
})
</script>
