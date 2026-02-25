<template>
  <div class="card">
    <div class="card-header border-light justify-content-between">
      <div class="d-flex gap-2">
        <div class="app-search">
          <input
            v-model="searchQuery"
            type="search"
            class="form-control"
            :placeholder="t('users.searchPlaceholder') || 'Search users...'"
          />
          <i class="ti ti-search app-search-icon text-muted"></i>
        </div>
        <button
          v-show="selectedUsers.length > 0"
          @click="handleBulkDelete"
          type="button"
          class="btn btn-danger"
        >
          <i class="ti ti-trash me-1"></i>
          {{ t('users.deleteSelected') || 'Delete Selected' }} ({{ selectedUsers.length }})
        </button>
      </div>

      <div class="d-flex align-items-center gap-2">
        <span class="me-2 fw-semibold">{{ t('users.filterBy') || 'Filter By' }}:</span>

        <!-- Status Filter -->
        <div class="app-search">
          <select v-model="statusFilter" class="form-select form-control my-1 my-md-0">
            <option value="">{{ t('users.status') || 'Status' }}</option>
            <option value="1">{{ t('users.statusActive') || 'Active' }}</option>
            <option value="0">{{ t('users.statusInactive') || 'Inactive' }}</option>
          </select>
          <i class="ti ti-user-check app-search-icon text-muted"></i>
        </div>

        <!-- Records Per Page -->
        <div>
          <select v-model="perPage" class="form-select form-control my-1 my-md-0">
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>

        <button type="button" @click="refreshTable" class="btn btn-primary" title="Refresh">
          <i class="ti ti-refresh"></i>
        </button>

        <!-- Export Dropdown -->
        <div class="dropdown">
          <button
            class="btn btn-success dropdown-toggle"
            type="button"
            id="exportDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            :disabled="isExportingPDF"
          >
            <span v-if="isExportingPDF" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="ti ti-download me-1"></i>
            {{
              isExportingPDF
                ? t('users.exporting') || 'Exporting...'
                : t('users.export') || 'Export'
            }}
          </button>
          <ul class="dropdown-menu" aria-labelledby="exportDropdown">
            <li>
              <a class="dropdown-item" href="#" @click.prevent="exportCSV">
                <i class="ti ti-file-spreadsheet me-2"></i>
                {{ t('users.exportCSV') || 'Export CSV' }}
              </a>
            </li>
            <li>
              <a
                class="dropdown-item"
                href="#"
                @click.prevent="exportPDF"
                :class="{ disabled: isExportingPDF }"
              >
                <span v-if="isExportingPDF" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="ti ti-file-type-pdf me-2"></i>
                {{ t('users.exportPDF') || 'Export PDF' }}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-custom table-centered table-select table-hover w-100 mb-0">
        <thead class="bg-light bg-opacity-25 thead-sm">
          <tr class="text-uppercase fs-xxs">
            <th scope="col" style="width: 1%">
              <input
                v-model="selectAll"
                class="form-check-input form-check-input-light fs-14 mt-0"
                type="checkbox"
                id="checkAll"
              />
            </th>
            <th style="cursor: pointer">
              {{ t('users.table.name') || 'Name' }}
            </th>
            <th style="cursor: pointer">
              {{ t('users.table.username') || 'Username' }}
            </th>
            <th style="cursor: pointer">
              {{ t('users.table.email') || 'Email' }}
            </th>
            <th style="cursor: pointer">
              {{ t('users.table.phone') || 'Phone' }}
            </th>
            <th style="cursor: pointer">
              {{ t('users.table.gender') || 'Gender' }}
            </th>
            <th style="cursor: pointer">
              {{ t('users.table.status') || 'Status' }}
            </th>
            <th class="text-center">{{ t('users.table.actions') || 'Actions' }}</th>
          </tr>
        </thead>
        <!-- end table-head -->
        <tbody v-if="loading">
          <tr>
            <td colspan="8" class="text-center py-5">
              <div class="d-flex justify-content-center align-items-center">
                <div
                  class="spinner-border text-primary"
                  role="status"
                  style="width: 3rem; height: 3rem"
                >
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
        <tbody v-else-if="!users.length">
          <tr>
            <td colspan="8" class="text-center py-5">
              <span class="text-muted">{{ t('users.noResults') || 'No users found' }}</span>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr v-for="user in users" :key="user.id">
            <User
              :user="user"
              :selected="selectedUsers.includes(user.id)"
              @edit="editUser"
              @delete="deleteUser"
              @toggle-select="toggleUserSelection"
            />
          </tr>
        </tbody>
        <!-- end table-body -->
      </table>
      <!-- end table -->
    </div>
    <div class="card-footer border-0">
      <div class="d-flex justify-content-between align-items-center">
        <div class="text-muted">
          {{ t('users.showing') || 'Showing' }} <span class="fw-semibold">{{ from }}</span>
          {{ t('users.to') || 'to' }} <span class="fw-semibold">{{ to }}</span>
          {{ t('users.of') || 'of' }} <span class="fw-semibold">{{ total }}</span>
          {{ t('users.users') || 'users' }}
        </div>
        <div>
          <ul class="pagination pagination-sm pagination-boxed mb-0 justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a href="#" class="page-link" @click.prevent="goToPrevious"
                ><svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M15 6l-6 6l6 6"></path></svg
              ></a>
            </li>
            <li
              v-for="page in visiblePages"
              :key="page"
              class="page-item"
              :class="{ active: page === currentPage }"
            >
              <a href="#" class="page-link" @click.prevent="emit('page-change', page)">{{
                page
              }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === lastPage }">
              <a href="#" class="page-link" @click.prevent="goToNext"
                ><svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M9 6l6 6l-6 6"></path></svg
              ></a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- User Form Modal -->
  <BaseModal
    id="userFormModal"
    :open="showModal"
    :title="isEditing ? t('users.editUser') || 'Edit User' : t('users.addUser') || 'Add User'"
    size="lg"
    @close="closeModal"
  >
    <form @submit.prevent="submitForm">
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">{{ t('users.form.name') || 'Full Name' }} *</label>
          <input v-model="form.name" type="text" class="form-control" required />
        </div>

        <div class="col-md-6">
          <label class="form-label">{{ t('users.form.username') || 'Username' }} *</label>
          <input v-model="form.username" type="text" class="form-control" required />
        </div>

        <div class="col-md-6">
          <label class="form-label">{{ t('users.form.email') || 'Email' }} *</label>
          <input v-model="form.email" type="email" class="form-control" required />
        </div>

        <div class="col-md-6">
          <label class="form-label">{{ t('users.form.phone') || 'Phone' }} *</label>
          <input v-model="form.phone" type="tel" class="form-control" required />
        </div>

        <div class="col-md-6">
          <label class="form-label">{{ t('users.form.gender') || 'Gender' }}</label>
          <select v-model="form.gender" class="form-select">
            <option value="">{{ t('users.form.selectGender') || 'Select Gender' }}</option>
            <option value="male">{{ t('users.form.male') || 'Male' }}</option>
            <option value="female">{{ t('users.form.female') || 'Female' }}</option>
          </select>
        </div>

        <div class="col-md-6">
          <label class="form-label">{{ t('users.form.countryCode') || 'Country Code' }}</label>
          <input v-model="form.country_code" type="text" class="form-control" placeholder="+1" />
        </div>

        <div class="col-12" v-if="isEditing && !showPasswordFields">
          <button
            type="button"
            @click="showPasswordFields = true"
            class="btn btn-sm btn-outline-primary"
          >
            {{ t('users.form.changePassword') || 'Change Password' }}
          </button>
        </div>

        <div class="col-md-6" v-if="!isEditing || showPasswordFields">
          <label class="form-label">{{ t('users.form.password') || 'Password' }} *</label>
          <input
            v-model="form.password"
            type="password"
            class="form-control"
            :required="!isEditing"
          />
        </div>

        <div class="col-md-6" v-if="!isEditing || showPasswordFields">
          <label class="form-label"
            >{{ t('users.form.confirmPassword') || 'Confirm Password' }} *</label
          >
          <input
            v-model="form.password_confirmation"
            type="password"
            class="form-control"
            :required="!isEditing"
          />
        </div>

        <div class="col-md-4">
          <div class="form-check">
            <input
              v-model="form.is_email_verified"
              type="checkbox"
              class="form-check-input"
              id="emailVerifiedCheck"
            />
            <label class="form-check-label" for="emailVerifiedCheck">
              {{ t('users.form.emailVerified') || 'Email Verified' }}
            </label>
          </div>
        </div>

        <div class="col-md-4">
          <div class="form-check">
            <input
              v-model="form.is_active"
              type="checkbox"
              class="form-check-input"
              id="isActiveCheck"
            />
            <label class="form-check-label" for="isActiveCheck">
              {{ t('users.form.active') || 'Active' }}
            </label>
          </div>
        </div>
      </div>
    </form>

    <template #footer>
      <button type="button" @click="closeModal" class="btn btn-light">
        {{ t('users.form.cancel') || 'Cancel' }}
      </button>
      <button type="button" @click="submitForm" class="btn btn-primary" :disabled="isProcessing">
        <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1"></span>
        {{ isEditing ? t('users.form.update') || 'Update' : t('users.form.create') || 'Create' }}
      </button>
    </template>
  </BaseModal>
</template>

<script lang="ts" setup>
import { computed, ref, watch, reactive, nextTick, type PropType } from 'vue'
// import { debounce } from 'lodash-es'
import debounce from 'lodash.debounce'
import type { UsersResponse, UserList } from '@/types'
import { useI18n } from '@/composables/useI18n'
import { useUserStore } from '@/stores/users'
import User from '@/components/Users/User.vue'
import BaseModal from '@/components/Shared/BaseModal.vue'
import { confirmDialog } from '@/utils/notification'
import { axiosInstance } from '@/plugins/axios'
import { appConfig } from '@/config/app'

const { t } = useI18n()
const userStore = useUserStore()

// Données du formulaire
const form = reactive({
  name: '',
  username: '',
  email: '',
  phone: '',
  gender: '',
  country_code: '',
  password: '',
  password_confirmation: '',
  is_email_verified: false,
  is_active: true,
})

// États du formulaire
const isEditing = ref(false)
const showPasswordFields = ref(false)

// Contrôle du modal interne
const showModal = ref(false)

// Getters du store
const isProcessing = computed(() => userStore.isProcessing)

// Réinitialiser le formulaire
const resetForm = () => {
  Object.assign(form, {
    name: '',
    username: '',
    email: '',
    phone: '',
    gender: '',
    country_code: '',
    password: '',
    password_confirmation: '',
    is_email_verified: false,
    is_active: true,
  })
  isEditing.value = false
  showPasswordFields.value = false
  userStore.setCurrentUser(null)
}

// Soumettre le formulaire
const submitForm = async () => {
  // Validation des mots de passe
  if (!isEditing.value || showPasswordFields.value) {
    if (form.password !== form.password_confirmation) {
      alert('Les mots de passe ne correspondent pas')
      return
    }
  }

  // Préparer les données
  const formData: any = { ...form }

  // Convertir le genre pour l'API (male/female -> M/F)
  if (formData.gender) {
    formData.gender = convertGenderForAPI(formData.gender)
  }

  // Supprimer les mots de passe si en mode édition et non modifiés
  if (isEditing.value && !showPasswordFields.value) {
    delete (formData as any).password
    delete (formData as any).password_confirmation
  }

  // Convertir les booléens
  formData.is_email_verified = Boolean(formData.is_email_verified)
  formData.is_active = Boolean(formData.is_active)

  const success = await userStore.storeUser(formData)

  if (success) {
    closeModal()
    emit('refresh')
  }
}

// Fermer le modal
const closeModal = () => {
  showModal.value = false
  setTimeout(() => {
    resetForm()
  }, 300)
}

// Expose addNewUser pour accès depuis parent
const addNewUser = () => {
  resetForm()
  isEditing.value = false
  showModal.value = true
}

defineExpose({
  addNewUser,
})

// Normaliser la valeur du genre pour correspondre aux options du select
const normalizeGender = (gender: string | null | undefined): string => {
  if (!gender) return ''

  const genderStr = String(gender).trim().toUpperCase()

  // Mapping des valeurs API (M/F) vers nos valeurs de formulaire
  const genderMap: Record<string, string> = {
    M: 'male',
    F: 'female',
    MALE: 'male',
    FEMALE: 'female',
    HOMME: 'male',
    FEMME: 'female',
    MAN: 'male',
    WOMAN: 'female',
    '1': 'male',
    '2': 'female',
  }

  return genderMap[genderStr] || ''
}

// Convertir la valeur du genre pour l'API (formulaire vers API)
const convertGenderForAPI = (gender: string): string => {
  const genderMap: Record<string, string> = {
    male: 'M',
    female: 'F',
  }

  return genderMap[gender] || ''
}

// Éditer un utilisateur
const editUser = async (user: any) => {
  // Debug temporaire - à supprimer une fois que ça marche
  console.log('User data received:', user)
  console.log('user.gender:', user.gender)
  console.log('user.active:', user.active, typeof user.active)
  console.log('user.email_verified_at:', user.email_verified_at)

  const normalizedGender = normalizeGender(user.gender)
  console.log('Normalized gender:', normalizedGender)

  // Marquer comme édition en premier
  isEditing.value = true
  showPasswordFields.value = false
  userStore.setCurrentUser(user)

  // Remplir le formulaire avec les données de l'utilisateur
  form.name = user.name || ''
  form.username = user.username || ''
  form.email = user.email || ''
  form.phone = user.phone_number || user.phone || ''
  form.gender = normalizedGender
  form.country_code = user.country_code || ''
  form.password = ''
  form.password_confirmation = ''
  // Convertir les valeurs en booléens - vérifier si les dates existent ET ne sont pas null
  form.is_email_verified = !!(user.email_verified_at || user.is_email_verified)
  form.is_active = user.active === 1 || user.active === true || user.is_active === true

  console.log('Form after assignment:', {
    gender: form.gender,
    is_email_verified: form.is_email_verified,
    is_active: form.is_active,
  })

  // Ouvrir le modal après un court délai pour s'assurer que le formulaire est mis à jour
  await nextTick()
  showModal.value = true
}

// Supprimer un utilisateur
const deleteUser = async (userId: number) => {
  confirmDialog(
    async (confirmed) => {
      if (confirmed) {
        const success = await userStore.deleteUser(userId)
        if (success) {
          emit('refresh')
        }
      }
    },
    {
      message: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
      title: 'Confirmation de suppression',
      type: 'danger',
      yes: 'Oui, supprimer',
      no: 'Annuler',
    }
  )
}

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'search', query: string): void
  (e: 'refresh'): void
  (e: 'status-change', status: string): void
  (e: 'per-page-change', perPage: number): void
}>()

const props = defineProps({
  users: {
    type: Array as PropType<UserList>,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  meta: {
    type: Object as PropType<UsersResponse['meta']>,
    required: true,
  },
})

const searchQuery = ref('')
const statusFilter = ref('')
const perPage = ref(20)
const selectedUsers = ref<number[]>([])
const isExportingPDF = ref(false)

const from = computed(() => props.meta?.from ?? 0)
const to = computed(() => props.meta?.to ?? 0)
const total = computed(() => props.meta?.total ?? 0)
const currentPage = computed(() => props.meta?.current_page ?? 1)
const lastPage = computed(() => props.meta?.last_page ?? 1)

// Checkbox selection
const selectAll = computed({
  get: () => props.users.length > 0 && selectedUsers.value.length === props.users.length,
  set: (value: boolean) => {
    if (value) {
      selectedUsers.value = props.users.map((user: any) => user.id)
    } else {
      selectedUsers.value = []
    }
  },
})

const toggleUserSelection = (userId: number) => {
  const index = selectedUsers.value.indexOf(userId)
  if (index > -1) {
    selectedUsers.value.splice(index, 1)
  } else {
    selectedUsers.value.push(userId)
  }
}

const handleBulkDelete = async () => {
  if (selectedUsers.value.length === 0) return

  const count = selectedUsers.value.length
  confirmDialog(
    async (confirmed) => {
      if (confirmed) {
        const success = await userStore.bulkDeleteUsers(selectedUsers.value)
        if (success) {
          selectedUsers.value = []
          emit('refresh')
        }
      }
    },
    {
      message: `Êtes-vous sûr de vouloir supprimer ${count} utilisateur(s) ?`,
      title: 'Confirmation de suppression multiple',
      type: 'danger',
      yes: 'Oui, supprimer',
      no: 'Annuler',
    }
  )
}

// Compute visible pages for pagination
const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(lastPage.value, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

const goToPrevious = () => {
  if (currentPage.value > 1) emit('page-change', currentPage.value - 1)
}
const goToNext = () => {
  if (currentPage.value < lastPage.value) emit('page-change', currentPage.value + 1)
}

const refreshTable = () => {
  emit('refresh')
}

// Export to CSV
const exportCSV = () => {
  // Prepare data for CSV
  const headers = [
    t('users.table.name'),
    t('users.table.username'),
    t('users.table.email'),
    t('users.table.phone'),
    t('users.table.gender'),
    t('users.table.status'),
  ]

  const rows = props.users.map((user: any) => [
    user.name || '',
    user.username || '',
    user.email || '',
    user.phone_number || '',
    user.gender || '',
    user.active ? 'Active' : 'Inactive',
  ])

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Export to PDF via API
const exportPDF = async () => {
  if (isExportingPDF.value) return

  try {
    isExportingPDF.value = true

    // Build query parameters based on current filters
    const params: any = {}
    if (searchQuery.value) params.search = searchQuery.value
    if (statusFilter.value) params.active = statusFilter.value

    // Call API endpoint
    const response = await axiosInstance.get(`${appConfig.apiUrl}/users/export/pdf`, {
      params,
      responseType: 'blob',
    })

    // Create blob and download
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.pdf`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('PDF export error:', error)
    alert("Erreur lors de l'export PDF")
  } finally {
    isExportingPDF.value = false
  }
}

watch(
  searchQuery,
  debounce((val: string) => {
    if (val.trim()) {
      emit('search', val.trim())
    } else {
      emit('search', '')
    }
  }, 500)
)

watch(statusFilter, (val: string) => {
  emit('status-change', val)
})

watch(perPage, (val: number) => {
  emit('per-page-change', val)
})
</script>
