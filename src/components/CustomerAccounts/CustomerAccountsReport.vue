<template>
  <div class="card mt-4">
    <div class="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
      <h5 class="mb-0">
        <i class="ti ti-pig-money me-2 text-warning"></i>
        Comptes Clients VIP
      </h5>
      <div class="d-flex gap-2 flex-wrap align-items-center">
        <input type="date" v-model="startDate" @change="load" class="form-control form-control-sm" style="max-width:140px" />
        <span class="text-muted small">—</span>
        <input type="date" v-model="endDate" @change="load" class="form-control form-control-sm" style="max-width:140px" />
        <select v-model="branchFilter" @change="load" class="form-select form-select-sm" style="max-width:160px">
          <option :value="null">Toutes les agences</option>
          <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
        <button class="btn btn-sm btn-outline-secondary" @click="load" :disabled="loading">
          <i class="ti ti-refresh" :class="{ spin: loading }"></i>
        </button>
      </div>
    </div>

    <div class="card-body">
      <!-- Skeleton loader -->
      <template v-if="loading">
        <!-- KPI row skeleton -->
        <div class="row g-3 mb-4">
          <div v-for="i in 6" :key="i" class="col-6 col-md-4 col-xl-2">
            <div class="card border-0 h-100">
              <div class="card-body p-3 placeholder-glow text-center">
                <span class="placeholder col-5 d-block mb-2" style="height:2rem;border-radius:6px"></span>
                <span class="placeholder col-8" style="height:.75rem;border-radius:4px"></span>
              </div>
            </div>
          </div>
        </div>
        <!-- Summary cards skeleton -->
        <div class="row g-3 mb-4">
          <div v-for="i in 3" :key="'s'+i" class="col-md-4">
            <div class="card h-100">
              <div class="card-body placeholder-glow">
                <span class="placeholder col-4 d-block mb-2" style="height:.65rem"></span>
                <span class="placeholder col-7 d-block mb-1" style="height:1.5rem"></span>
                <span class="placeholder col-5" style="height:.65rem"></span>
              </div>
            </div>
          </div>
        </div>
        <!-- Tables skeleton -->
        <div class="row g-3">
          <div v-for="i in 2" :key="'t'+i" class="col-lg-6">
            <div class="card h-100">
              <div class="card-header placeholder-glow">
                <span class="placeholder col-4" style="height:.75rem"></span>
              </div>
              <div class="card-body placeholder-glow d-flex flex-column gap-2 pt-2">
                <span v-for="j in 4" :key="j" class="placeholder col-12" style="height:1.8rem;border-radius:4px"></span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-else-if="report">
        <!-- ── KPI Row ─────────────────────────────────────────────── -->
        <div class="row g-3 mb-4">
          <div class="col-6 col-md-4 col-xl-2">
            <div class="card border-0 bg-primary-subtle h-100">
              <div class="card-body p-3 text-center">
                <div class="h4 mb-1 text-primary">{{ report.accounts.total }}</div>
                <div class="small text-muted">Comptes total</div>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-4 col-xl-2">
            <div class="card border-0 bg-success-subtle h-100">
              <div class="card-body p-3 text-center">
                <div class="h4 mb-1 text-success">{{ report.accounts.active }}</div>
                <div class="small text-muted">Actifs</div>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-4 col-xl-2">
            <div class="card border-0 bg-warning-subtle h-100">
              <div class="card-body p-3 text-center">
                <div class="h4 mb-1 text-warning">{{ report.accounts.vip }}</div>
                <div class="small text-muted">VIP</div>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-4 col-xl-2">
            <div class="card border-0 bg-danger-subtle h-100">
              <div class="card-body p-3 text-center">
                <div class="h4 mb-1 text-danger">{{ report.accounts.in_debt }}</div>
                <div class="small text-muted">En dette</div>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-4 col-xl-2">
            <div class="card border-0 bg-info-subtle h-100">
              <div class="card-body p-3 text-center">
                <div class="h5 mb-1 text-info">{{ fmt(report.transactions.total_deposits) }}</div>
                <div class="small text-muted">Dépôts ({{ report.transactions.count_deposits }})</div>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-4 col-xl-2">
            <div class="card border-0 bg-secondary-subtle h-100">
              <div class="card-body p-3 text-center">
                <div class="h5 mb-1">{{ fmt(report.transactions.total_withdrawals) }}</div>
                <div class="small text-muted">Retraits ({{ report.transactions.count_withdrawals }})</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Flux net + soldes ──────────────────────────────────── -->
        <div class="row g-3 mb-4">
          <div class="col-md-4">
            <div class="card border-start border-4 border-success h-100">
              <div class="card-body">
                <div class="text-muted small mb-1">Flux net (période)</div>
                <div class="h5 mb-0" :class="report.transactions.net_flow >= 0 ? 'text-success' : 'text-danger'">
                  {{ fmt(report.transactions.net_flow) }}
                </div>
                <small class="text-muted">Dépôts − Retraits</small>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card border-start border-4 border-primary h-100">
              <div class="card-body">
                <div class="text-muted small mb-1">Solde total des comptes</div>
                <div class="h5 mb-0" :class="report.accounts.total_balance >= 0 ? 'text-success' : 'text-danger'">
                  {{ fmt(report.accounts.total_balance) }}
                </div>
                <small class="text-muted">Crédit accordé: {{ fmt(report.accounts.total_credit_limit) }}</small>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card border-start border-4 border-danger h-100">
              <div class="card-body">
                <div class="text-muted small mb-1">Dettes totales</div>
                <div class="h5 mb-0 text-danger">{{ fmt(report.accounts.total_debt) }}</div>
                <small class="text-muted">{{ report.accounts.in_debt }} comptes concernés</small>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-3">
          <!-- ── Par agence ────────────────────────────────────────── -->
          <div class="col-lg-6">
            <div class="card h-100">
              <div class="card-header bg-transparent">
                <h6 class="mb-0"><i class="ti ti-building-bank me-2"></i>Activité par agence</h6>
              </div>
              <div class="card-body p-0">
                <div v-if="report.by_branch.length === 0" class="text-center py-4 text-muted small">
                  Aucune opération sur la période
                </div>
                <table v-else class="table table-sm table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Agence</th>
                      <th class="text-end text-success">Dépôts</th>
                      <th class="text-end text-danger">Retraits</th>
                      <th class="text-end">Ops</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in report.by_branch" :key="row.branch_id ?? 'none'">
                      <td>
                        <span class="fw-semibold">{{ row.branch_name }}</span>
                        <small class="text-muted ms-1">{{ row.branch_code }}</small>
                      </td>
                      <td class="text-end text-success">{{ fmt(row.total_deposits) }}</td>
                      <td class="text-end text-danger">{{ fmt(row.total_withdrawals) }}</td>
                      <td class="text-end"><span class="badge bg-secondary">{{ row.total_operations }}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- ── Top comptes ──────────────────────────────────────── -->
          <div class="col-lg-6">
            <div class="card h-100">
              <div class="card-header bg-transparent">
                <h6 class="mb-0"><i class="ti ti-trophy me-2 text-warning"></i>Top 5 comptes (volume)</h6>
              </div>
              <div class="card-body p-0">
                <div v-if="report.top_accounts.length === 0" class="text-center py-4 text-muted small">
                  Aucune opération sur la période
                </div>
                <table v-else class="table table-sm table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>#</th>
                      <th>Client</th>
                      <th class="text-end">Volume</th>
                      <th class="text-end">Solde</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, i) in report.top_accounts" :key="i">
                      <td>
                        <span class="badge" :class="i === 0 ? 'bg-warning text-dark' : i === 1 ? 'bg-secondary' : 'bg-light text-dark'">
                          {{ i + 1 }}
                        </span>
                      </td>
                      <td>
                        <div class="fw-semibold small">{{ row.customer_name }}</div>
                        <small class="text-muted">{{ row.account_number }}</small>
                      </td>
                      <td class="text-end small">{{ fmt(row.volume) }} <span class="text-muted">{{ row.currency }}</span></td>
                      <td class="text-end small" :class="row.balance < 0 ? 'text-danger' : 'text-success'">{{ fmt(row.balance) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- ── Activité quotidienne ──────────────────────────────── -->
          <div class="col-12" v-if="report.daily.length > 1">
            <div class="card">
              <div class="card-header bg-transparent">
                <h6 class="mb-0"><i class="ti ti-chart-bar me-2"></i>Activité quotidienne</h6>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-sm table-hover mb-0">
                    <thead class="table-light">
                      <tr>
                        <th>Date</th>
                        <th class="text-end text-success">Dépôts</th>
                        <th class="text-end text-danger">Retraits</th>
                        <th class="text-end">Opérations</th>
                        <th class="text-end">Flux net</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="day in report.daily" :key="day.date">
                        <td>{{ formatDate(day.date) }}</td>
                        <td class="text-end text-success">{{ fmt(day.deposits) }}</td>
                        <td class="text-end text-danger">{{ fmt(day.withdrawals) }}</td>
                        <td class="text-end"><span class="badge bg-secondary">{{ day.operations }}</span></td>
                        <td class="text-end" :class="(day.deposits - day.withdrawals) >= 0 ? 'text-success' : 'text-danger'">
                          {{ fmt(day.deposits - day.withdrawals) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCustomerAccountStore } from '@/stores/customer-accounts'
import { useBranchStore } from '@/stores/branches'

const accountStore = useCustomerAccountStore()
const branchStore  = useBranchStore()
const branches     = computed(() => branchStore.branch_list)

const loading      = ref(false)
const report       = ref<any>(null)
const branchFilter = ref<number | null>(null)

const today        = new Date().toISOString().slice(0, 10)
const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)
const startDate    = ref(firstOfMonth)
const endDate      = ref(today)

const load = async () => {
  loading.value = true
  report.value  = await accountStore.fetchDashboardReport({
    start_date: startDate.value,
    end_date:   endDate.value,
    branch_id:  branchFilter.value,
  })
  loading.value = false
}

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n ?? 0)

const formatDate = (d: string) =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short' }).format(new Date(d))

onMounted(load)
</script>

<style scoped>
.spin { animation: spin 1s linear infinite; display: inline-block; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
