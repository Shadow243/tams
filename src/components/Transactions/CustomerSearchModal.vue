<template>
  <div
    :class="['modal', { show: show }]"
    :style="{ display: show ? 'block' : 'none' }"
    tabindex="-1"
    role="dialog"
  >
    <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="ti ti-user-search me-2"></i>
            {{ t('transactions.search_customer') || 'Rechercher un Client' }}
          </h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>

        <div class="modal-body">
          <!-- Search Input -->
          <div class="mb-4">
            <label for="search" class="form-label">
              {{ t('transactions.search_by_phone_or_name') || 'Rechercher par téléphone ou nom' }}
            </label>
            <div class="input-group">
              <span class="input-group-text">
                <i class="ti ti-search"></i>
              </span>
              <input
                type="text"
                class="form-control"
                id="search"
                v-model="searchQuery"
                :placeholder="t('transactions.enter_phone_or_name') || 'Numéro de téléphone ou nom'"
                @input="debouncedSearch"
                autofocus
              />
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="searching" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">{{ t('common.loading') || 'Chargement...' }}</span>
            </div>
          </div>

          <!-- Search Results -->
          <div v-else-if="searchResults.length > 0">
            <h6 class="mb-3">
              {{ t('transactions.search_results') || 'Résultats de recherche' }}
              ({{ searchResults.length }})
            </h6>
            <div class="list-group">
              <button
                v-for="customer in searchResults"
                :key="customer.id"
                type="button"
                class="list-group-item list-group-item-action"
                @click="selectCustomer(customer)"
              >
                <div class="d-flex w-100 justify-content-between align-items-center">
                  <div>
                    <h6 class="mb-1">{{ customer.full_name }}</h6>
                    <p class="mb-1 text-muted small">
                      <i class="ti ti-phone me-1"></i>
                      {{ customer.phone }}
                    </p>
                    <p v-if="customer.national_id" class="mb-0 text-muted small">
                      <i class="ti ti-id me-1"></i>
                      {{ customer.national_id }}
                    </p>
                  </div>
                  <div>
                    <span class="badge bg-info">
                      {{ customer.transactions_count || 0 }}
                      {{ t('transactions.transactions') || 'transactions' }}
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- No Results -->
          <div v-else-if="searchQuery && !searching" class="text-center py-4">
            <i class="ti ti-user-exclamation display-1 text-muted mb-3"></i>
            <p class="text-muted">
              {{ t('transactions.no_customer_found') || 'Aucun client trouvé' }}
            </p>
            <button class="btn btn-primary" @click="showCreateForm">
              <i class="ti ti-user-plus me-2"></i>
              {{ t('transactions.create_new_customer') || 'Créer un nouveau client' }}
            </button>
          </div>

          <!-- Create New Customer Form -->
          <div v-if="showingCreateForm" class="border-top pt-4 mt-4">
            <h6 class="mb-3">
              <i class="ti ti-user-plus me-2"></i>
              {{ t('transactions.new_customer') || 'Nouveau Client' }}
            </h6>

            <form @submit.prevent="createCustomer">
              <div class="mb-3">
                <label for="full_name" class="form-label">
                  {{ t('transactions.full_name') || 'Nom complet' }}
                  <span class="text-danger">*</span>
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="full_name"
                  v-model="newCustomer.full_name"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="phone" class="form-label">
                  {{ t('transactions.phone') || 'Téléphone' }}
                  <span class="text-danger">*</span>
                </label>
                <input
                  type="tel"
                  class="form-control"
                  id="phone"
                  v-model="newCustomer.phone"
                  :placeholder="t('transactions.phone_placeholder') || '237XXXXXXXXX'"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="national_id" class="form-label">
                  {{ t('transactions.national_id') || "Numéro d'identité nationale" }}
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="national_id"
                  v-model="newCustomer.national_id"
                />
              </div>

              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary" :disabled="creating">
                  <span v-if="creating" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="ti ti-check me-2"></i>
                  {{ t('transactions.create') || 'Créer' }}
                </button>
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="cancelCreate"
                  :disabled="creating"
                >
                  {{ t('transactions.cancel') || 'Annuler' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Initial State -->
          <div v-else-if="!searchQuery" class="text-center py-4 text-muted">
            <i class="ti ti-user-search display-1 mb-3"></i>
            <p>
              {{ t('transactions.start_typing_to_search') || 'Commencez à taper pour rechercher' }}
            </p>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">
            {{ t('transactions.close') || 'Fermer' }}
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
import axiosInstance from '@/plugins/axios'
import Swal from 'sweetalert2'

const { t } = useI18n()

interface Customer {
  id: string
  full_name: string
  phone: string
  national_id?: string | null
  transactions_count?: number
}

interface Props {
  show: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  select: [customer: Customer]
}>()

const searchQuery = ref('')
const searchResults = ref<Customer[]>([])
const searching = ref(false)
const showingCreateForm = ref(false)
const creating = ref(false)

const newCustomer = ref({
  full_name: '',
  phone: '',
  national_id: '',
})

let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      resetModal()
    }
  }
)

const debouncedSearch = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(() => {
    performSearch()
  }, 500)
}

const performSearch = async () => {
  if (!searchQuery.value || searchQuery.value.length < 3) {
    searchResults.value = []
    return
  }

  searching.value = true

  try {
    const response = await axiosInstance.get('/customers', {
      params: {
        search: searchQuery.value,
        per_page: 10,
      },
    })

    searchResults.value = response.data.data || []
  } catch (error) {
    console.error('Error searching customers:', error)
    searchResults.value = []
  } finally {
    searching.value = false
  }
}

const selectCustomer = (customer: Customer) => {
  emit('select', customer)
  closeModal()
}

const showCreateForm = () => {
  showingCreateForm.value = true
  // Pre-fill phone if it looks like a phone number
  if (searchQuery.value && /^\d+$/.test(searchQuery.value)) {
    newCustomer.value.phone = searchQuery.value
  }
}

const createCustomer = async () => {
  creating.value = true

  try {
    const response = await axiosInstance.post('/customers', newCustomer.value)

    await Swal.fire({
      icon: 'success',
      title: t('transactions.success') || 'Succès',
      text: t('transactions.customer_created_successfully') || 'Client créé avec succès',
      timer: 2000,
      showConfirmButton: false,
    })

    emit('select', response.data.data)
    closeModal()
  } catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: t('transactions.error') || 'Erreur',
      text:
        error.response?.data?.message ||
        t('transactions.error_creating_customer') ||
        'Erreur lors de la création du client',
    })
  } finally {
    creating.value = false
  }
}

const cancelCreate = () => {
  showingCreateForm.value = false
  newCustomer.value = {
    full_name: '',
    phone: '',
    national_id: '',
  }
}

const resetModal = () => {
  searchQuery.value = ''
  searchResults.value = []
  searching.value = false
  showingCreateForm.value = false
  creating.value = false
  newCustomer.value = {
    full_name: '',
    phone: '',
    national_id: '',
  }
}

const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
.modal.show {
  display: block;
}

.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

.list-group-item {
  cursor: pointer;
  transition: all 0.2s;
}

.list-group-item:hover {
  background-color: #f8f9fa;
  transform: translateX(5px);
}
</style>
