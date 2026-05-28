<template>
  <div
    class="modal fade"
    :id="modalId"
    tabindex="-1"
    aria-labelledby="accountStatementModalLabel"
    aria-hidden="true"
    ref="modalRef"
  >
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title" id="accountStatementModalLabel">
            <i class="ti ti-file-text me-2"></i>
            Relevé de Compte
          </h5>
          <button
            type="button"
            class="btn-close btn-close-white"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>

        <div class="modal-body">
          <!-- Account Info Header -->
          <div v-if="account" class="card mb-3">
            <div class="card-body">
              <div class="row align-items-center">
                <div class="col-md-6">
                  <h5 class="mb-1">{{ account.customer?.name }}</h5>
                  <p class="mb-0 text-muted">
                    <small>{{ account.account_number }}</small>
                  </p>
                </div>
                <div class="col-md-6 text-end">
                  <div class="h4 mb-0" :class="balanceClass">
                    {{ formatCurrency(account.balance) }}
                  </div>
                  <small class="text-muted">Solde actuel</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Filters -->
          <div class="card mb-3">
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label">Date de début</label>
                  <input v-model="filters.startDate" type="date" class="form-control" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Date de fin</label>
                  <input v-model="filters.endDate" type="date" class="form-control" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Type</label>
                  <select v-model="filters.type" class="form-select">
                    <option value="">Tous</option>
                    <option value="deposit">Dépôts</option>
                    <option value="withdrawal">Retraits</option>
                    <option value="interest_debit">Intérêts débiteurs</option>
                    <option value="interest_credit">Intérêts créditeurs</option>
                    <option value="adjustment">Ajustements</option>
                  </select>
                </div>
              </div>
              <div class="mt-3">
                <button
                  @click="fetchTransactions"
                  class="btn btn-primary btn-sm me-2"
                  :disabled="loading"
                >
                  <i class="ti ti-search me-1"></i>
                  Rechercher
                </button>
                <button @click="resetFilters" class="btn btn-secondary btn-sm">
                  <i class="ti ti-refresh me-1"></i>
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>

          <!-- Transactions Table -->
          <div class="table-responsive">
            <table class="table table-hover table-sm">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Référence</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Effectué par</th>
                  <th>Agence</th>
                  <th class="text-end">Débit</th>
                  <th class="text-end">Crédit</th>
                  <th class="text-end">Solde</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading">
                  <td colspan="9" class="text-center py-4">
                    <div class="spinner-border spinner-border-sm me-2"></div>
                    Chargement...
                  </td>
                </tr>
                <tr v-else-if="transactions.length === 0">
                  <td colspan="9" class="text-center py-4 text-muted">
                    <i class="ti ti-inbox me-2"></i>
                    Aucune transaction trouvée
                  </td>
                </tr>
                <tr v-else v-for="transaction in transactions" :key="transaction.id">
                  <td>
                    <small>{{ formatDate(transaction.created_at) }}</small>
                  </td>
                  <td>
                    <small class="font-monospace">{{ transaction.reference }}</small>
                  </td>
                  <td>
                    <span class="badge" :class="getTypeBadgeClass(transaction.type)">
                      {{ getTypeLabel(transaction.type) }}
                    </span>
                  </td>
                  <td>
                    <small>{{ transaction.description || '-' }}</small>
                  </td>
                  <td>
                    <small v-if="transaction.user">
                      <i class="ti ti-user-circle me-1 text-muted"></i>
                      {{ transaction.user.name || transaction.user.username }}
                    </small>
                    <span v-else class="text-muted">—</span>
                  </td>
                  <td>
                    <small v-if="transaction.branch">
                      <i class="ti ti-building me-1 text-muted"></i>
                      {{ transaction.branch.code }}
                    </small>
                    <span v-else class="text-muted">—</span>
                  </td>
                  <td class="text-end text-danger">
                    <span v-if="isDebit(transaction.type)">
                      {{ formatAmount(transaction.amount) }}
                    </span>
                  </td>
                  <td class="text-end text-success">
                    <span v-if="!isDebit(transaction.type)">
                      {{ formatAmount(transaction.amount) }}
                    </span>
                  </td>
                  <td class="text-end">
                    <strong :class="getBalanceClass(transaction.balance_after)">
                      {{ formatAmount(transaction.balance_after) }}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            <i class="ti ti-x me-1"></i>
            Fermer
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="exportStatement"
            :disabled="loading || transactions.length === 0"
          >
            <i class="ti ti-download me-1"></i>
            Exporter PDF
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { CustomerAccount, AccountTransaction } from '@/types'
import { useCustomerAccountStore } from '@/stores/customer-accounts'

const customerAccountStore = useCustomerAccountStore()

const props = defineProps<{
  modalId: string
  account: CustomerAccount | null
}>()

const modalRef = ref<HTMLElement>()
const loading = ref(false)

const transactions = computed(() => customerAccountStore.transactions)

const filters = ref({
  startDate: '',
  endDate: '',
  type: '',
})

const balanceClass = computed(() => {
  if (!props.account) return ''
  return props.account.balance < 0 ? 'text-danger' : 'text-success'
})

const formatCurrency = (value: number) => {
  const symbol = props.account?.currency?.symbol || 'XAF'
  return `${value.toFixed(2)} ${symbol}`
}

const formatAmount = (value: number) => {
  return value.toFixed(2)
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

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    deposit: 'Dépôt',
    withdrawal: 'Retrait',
    interest_debit: 'Intérêts débiteurs',
    interest_credit: 'Intérêts créditeurs',
    adjustment: 'Ajustement',
    transfer_in: 'Transfert entrant',
    transfer_out: 'Transfert sortant',
  }
  return labels[type] || type
}

const getTypeBadgeClass = (type: string) => {
  const classes: Record<string, string> = {
    deposit: 'bg-success',
    withdrawal: 'bg-primary',
    interest_debit: 'bg-danger',
    interest_credit: 'bg-success',
    adjustment: 'bg-warning',
    transfer_in: 'bg-info',
    transfer_out: 'bg-secondary',
  }
  return classes[type] || 'bg-secondary'
}

const isDebit = (type: string) => {
  return ['withdrawal', 'interest_debit', 'transfer_out'].includes(type)
}

const getBalanceClass = (balance: number) => {
  return balance < 0 ? 'text-danger' : 'text-success'
}

const fetchTransactions = async () => {
  if (!props.account) return

  loading.value = true

  try {
    // Call API to fetch transactions
    await customerAccountStore.fetchTransactions(
      props.account.uuid,
      filters.value.startDate || undefined,
      filters.value.endDate || undefined
    )
  } catch (error) {
    console.error('Error fetching transactions:', error)
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.value = {
    startDate: '',
    endDate: '',
    type: '',
  }
  fetchTransactions()
}

const exportStatement = () => {
  alert('Export PDF - Fonctionnalité à implémenter')
}

// Fetch transactions when account changes
watch(
  () => props.account,
  (newAccount) => {
    if (newAccount) {
      fetchTransactions()
    }
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.font-monospace {
  font-family: 'Courier New', monospace;
}

.table-sm {
  font-size: 0.875rem;

  th {
    font-weight: 600;
    background-color: var(--bs-light);
  }
}
</style>
