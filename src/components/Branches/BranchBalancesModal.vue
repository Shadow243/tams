<template>
  <div
    v-if="show"
    class="modal fade show d-block"
    tabindex="-1"
    style="background-color: rgba(0, 0, 0, 0.5)"
    @click.self="handleCancel"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="ti ti-wallet me-2"></i>
            {{ t('branches.balances.title') }} - {{ branch?.name }}
          </h5>
          <button type="button" class="btn-close" @click="handleCancel"></button>
        </div>

        <div class="modal-body">
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">{{ t('common.loading') }}</span>
            </div>
          </div>

          <!-- Balances Form -->
          <div v-else>
            <p class="text-muted mb-4">
              {{ t('branches.balances.description') }}
            </p>

            <form @submit.prevent="handleSubmit">
              <div class="row g-3">
                <div v-for="currency in activeCurrencies" :key="currency.code" class="col-md-6">
                  <div class="card shadow-sm">
                    <div class="card-body">
                      <div class="d-flex align-items-center mb-2">
                        <div class="flex-grow-1">
                          <h6 class="mb-0">
                            {{ currency.name }}
                            <span class="badge bg-light text-dark ms-2">{{ currency.code }}</span>
                          </h6>
                        </div>
                        <div class="text-end">
                          <span class="fs-4">{{ currency.symbol }}</span>
                        </div>
                      </div>

                      <div class="input-group">
                        <span class="input-group-text">{{ currency.symbol }}</span>
                        <input
                          v-model.number="balances[currency.code]"
                          type="number"
                          step="0.01"
                          min="0"
                          class="form-control"
                          :placeholder="`0.00`"
                        />
                      </div>

                      <!-- Current Balance Display -->
                      <div v-if="currentBalances[currency.code] !== undefined" class="mt-2">
                        <small class="text-muted">
                          {{ t('branches.balances.current') }}:
                          <strong>{{
                            formatCurrency(currentBalances[currency.code] ?? 0, currency.code)
                          }}</strong>
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Summary -->
              <div v-if="hasBalances" class="alert alert-info mt-4">
                <i class="ti ti-info-circle me-2"></i>
                {{ t('branches.balances.summary') }}:
                <ul class="mb-0 mt-2">
                  <li v-for="(amount, code) in nonZeroBalances" :key="code">
                    <strong>{{ code }}</strong
                    >: {{ formatNumber(amount) }}
                  </li>
                </ul>
              </div>

              <!-- Actions -->
              <div class="d-flex justify-content-end gap-2 mt-4">
                <button
                  type="button"
                  class="btn btn-secondary"
                  @click="handleCancel"
                  :disabled="processing"
                >
                  {{ t('common.cancel') }}
                </button>
                <button type="submit" class="btn btn-primary" :disabled="processing || !hasChanges">
                  <span v-if="processing" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="ti ti-device-floppy me-2"></i>
                  {{ t('common.save') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useCurrencyStore } from '@/stores/currencies'
import { useBranchBalances } from '@/composables/useBranchBalances'
import { useFormat } from '@/plugins/format'
import type { Branch } from '@/types'

interface Props {
  show: boolean
  branch: Branch | null
}

interface Emits {
  (e: 'cancel'): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const format = useFormat()
const currencyStore = useCurrencyStore()
const { fetchBalances, updateBalances, loading, processing } = useBranchBalances()

// Local state
const balances = ref<Record<string, number>>({})
const currentBalances = ref<Record<string, number>>({})

// Computed
const activeCurrencies = computed(() => currencyStore.activeCurrencies || [])

const hasBalances = computed(() => Object.values(balances.value).some((amount) => amount > 0))

const nonZeroBalances = computed(() => {
  const result: Record<string, number> = {}
  for (const [code, amount] of Object.entries(balances.value)) {
    if (amount > 0) {
      result[code] = amount
    }
  }
  return result
})

const hasChanges = computed(() => {
  return Object.entries(balances.value).some(([code, amount]) => {
    return amount !== (currentBalances.value[code] || 0)
  })
})

// Methods
const formatCurrency = (amount: number, currencyCode: string) => {
  return format.currency(amount, currencyCode, { decimals: 2 })
}

const formatNumber = (amount: number) => {
  return format.number(amount, 2)
}

const loadBalances = async () => {
  if (!props.branch?.id) return

  try {
    const data = await fetchBalances(props.branch.id)
    console.log('Balances data received:', data)

    // Initialize balances object
    const newBalances: Record<string, number> = {}
    const newCurrentBalances: Record<string, number> = {}

    // Set existing balances
    if (data && data.balances && Array.isArray(data.balances)) {
      data.balances.forEach((b: any) => {
        newBalances[b.currency_code] = b.cash_balance
        newCurrentBalances[b.currency_code] = b.cash_balance
      })
    }

    // Initialize all active currencies with 0 if not present
    activeCurrencies.value.forEach((currency) => {
      if (!(currency.code in newBalances)) {
        newBalances[currency.code] = 0
      }
    })

    balances.value = newBalances
    currentBalances.value = newCurrentBalances
  } catch (error) {
    console.error('Failed to load balances:', error)
  }
}

const handleSubmit = async () => {
  if (!props.branch?.id) return

  // Prepare balances array
  const balancesArray = Object.entries(balances.value).map(([code, amount]) => ({
    currency_code: code,
    amount: amount || 0,
  }))

  try {
    await updateBalances(props.branch.id, balancesArray)
    emit('success')
  } catch (error) {
    console.error('Failed to update balances:', error)
  }
}

const handleCancel = () => {
  emit('cancel')
}

// Watch for modal show
watch(
  () => props.show,
  async (newValue) => {
    if (newValue && props.branch) {
      // Ensure currencies are loaded
      if (currencyStore.allCurrencies.length === 0) {
        await currencyStore.fetchAllCurrencies()
      }
      loadBalances()
    }
  }
)
</script>

<style scoped>
.modal.show {
  display: block;
}

.card {
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-2px);
}
</style>
