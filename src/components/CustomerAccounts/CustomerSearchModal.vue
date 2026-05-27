<template>
  <!-- Backdrop -->
  <div v-if="show" class="modal-backdrop fade show"></div>

  <!-- Modal -->
  <div v-if="show" class="modal fade show" tabindex="-1" role="dialog" @click.self="closeModal">
    <div class="modal-dialog modal-dialog-centered modal-lg" role="document" @click.stop>
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
                  :class="{ 'is-invalid': validationErrors.full_name }"
                  id="full_name"
                  v-model="newCustomer.full_name"
                  required
                />
                <div v-if="validationErrors.full_name" class="invalid-feedback">
                  {{ validationErrors.full_name[0] }}
                </div>
              </div>

              <div class="mb-3">
                <label for="phone" class="form-label">
                  {{ t('transactions.phone') || 'Téléphone' }}
                  <span class="text-danger">*</span>
                </label>
                <input
                  type="tel"
                  class="form-control"
                  :class="{
                    'is-invalid': validationErrors.phone || (newCustomer.phone && !isPhoneValid),
                    'is-valid': newCustomer.phone && isPhoneValid,
                  }"
                  id="phone"
                  v-model="newCustomer.phone"
                  :placeholder="t('transactions.phone_placeholder') || '243XXXXXXXXX'"
                  required
                  maxlength="15"
                  pattern="[0-9]{7,15}"
                  @input="validatePhone"
                />
                <div v-if="validationErrors.phone" class="invalid-feedback d-block">
                  {{ validationErrors.phone[0] }}
                </div>
                <div
                  v-else-if="newCustomer.phone && !isPhoneValid"
                  class="invalid-feedback d-block"
                >
                  ❌ {{ t('transactions.phone_format_error') || 'Numéro invalide (7 à 15 chiffres, sans + ni espaces)' }}
                </div>
                <div v-else-if="newCustomer.phone && isPhoneValid" class="valid-feedback d-block">
                  ✅ Format valide
                </div>
                <small class="form-text text-muted d-block mt-1">
                  <i class="ti ti-info-circle me-1"></i>
                  {{ t('transactions.phone_format_hint') || 'Indicatif pays + numéro, chiffres uniquement (ex: 243690123456, 255712345678)' }}
                </small>
              </div>

              <div class="mb-3">
                <label for="national_id" class="form-label">
                  {{ t('transactions.national_id') || "Numéro d'identité nationale" }}
                </label>
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': validationErrors.national_id }"
                  id="national_id"
                  v-model="newCustomer.national_id"
                />
                <div v-if="validationErrors.national_id" class="invalid-feedback">
                  {{ validationErrors.national_id[0] }}
                </div>
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
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { axiosInstance } from '@/plugins/axios'
import Swal from 'sweetalert2'
import { appConfig } from '@/config/app'

const { t } = useI18n()

interface Customer {
  id: string | number
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

const validationErrors = ref<Record<string, string[]>>({})

let debounceTimer: ReturnType<typeof setTimeout> | null = null

// Phone validation computed property
const isPhoneValid = computed(() => {
  const phone = newCustomer.value.phone
  if (!phone) return false
  return /^[0-9]{7,15}$/.test(phone)
})

// Real-time phone validation
const validatePhone = () => {
  // Clear validation errors when user types
  if (validationErrors.value.phone) {
    validationErrors.value.phone = []
  }
}

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      console.log('🔓 Modal opened, resetting state')
      resetModal()
    }
  }
)

const debouncedSearch = () => {
  console.log('⏱️ Debounced search triggered, query:', searchQuery.value)

  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(() => {
    console.log('🚀 Executing search after debounce...')
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
    console.log('🔍 Searching for customers:', searchQuery.value)
    console.log('🌐 API URL:', `${appConfig.apiUrl}/customers`)

    const response = await axiosInstance.get(`${appConfig.apiUrl}/customers`, {
      params: {
        search: searchQuery.value,
        per_page: 10,
      },
    })

    console.log('✅ Search response:', response)
    console.log('📊 Response data:', response.data)

    searchResults.value = response.data.data || []
    console.log('👥 Search results:', searchResults.value)
  } catch (error: any) {
    console.error('❌ Search error:', error)
    console.error('📋 Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    })
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
  validationErrors.value = {}

  try {
    console.log('👤 Creating customer:', newCustomer.value)
    console.log('🌐 API URL:', `${appConfig.apiUrl}/customers`)

    const response = await axiosInstance.post(`${appConfig.apiUrl}/customers`, newCustomer.value)

    console.log('✅ Customer created:', response.data)

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
    console.error('❌ Create customer error:', error)
    console.error('📋 Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    })

    // Handle validation errors (422)
    if (error.response?.status === 422 && error.response?.data?.errors) {
      validationErrors.value = error.response.data.errors

      Swal.fire({
        icon: 'error',
        title: t('transactions.validation_error') || 'Erreur de validation',
        html: Object.values(error.response.data.errors)
          .flat()
          .map((err: any) => `<p class="mb-1">• ${err}</p>`)
          .join(''),
      })
    } else {
      // Handle other errors
      Swal.fire({
        icon: 'error',
        title: t('transactions.error') || 'Erreur',
        text:
          error.response?.data?.message ||
          t('transactions.error_creating_customer') ||
          'Erreur lors de la création du client',
      })
    }
  } finally {
    creating.value = false
  }
}

const cancelCreate = () => {
  showingCreateForm.value = false
  validationErrors.value = {}
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
  validationErrors.value = {}
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
.modal-backdrop {
  z-index: 1055;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal {
  display: block !important;
  z-index: 1060;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  outline: 0;
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
