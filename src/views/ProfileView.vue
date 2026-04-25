<template>
  <div class="row">
    <div class="col-12">
      <!-- Page Header -->
      <div class="d-flex align-items-sm-center flex-sm-row flex-column my-3">
        <div class="flex-grow-1">
          <h4 class="fs-xl mb-1">
            <i class="ti ti-user-circle me-2"></i>
            {{ t('profile.page_title') || 'My Profile' }}
          </h4>
          <p class="text-muted mb-0">
            {{ t('profile.page_description') || 'Manage your account settings and preferences' }}
          </p>
        </div>
      </div>

      <div class="row">
        <!-- Profile Sidebar -->
        <div class="col-xl-3 col-lg-4">
          <div class="card">
            <div class="card-body text-center">
              <!-- Avatar -->
              <div class="position-relative d-inline-block mb-3">
                <img
                  :src="userAvatar"
                  :alt="user?.name"
                  class="rounded-circle avatar-xl img-thumbnail"
                />
                <button
                  class="btn btn-primary btn-sm position-absolute bottom-0 end-0 rounded-circle"
                  style="width: 32px; height: 32px; padding: 0"
                  @click="handleAvatarChange"
                  :disabled="uploadingAvatar"
                >
                  <span v-if="uploadingAvatar" class="spinner-border spinner-border-sm"></span>
                  <i v-else class="ti ti-camera"></i>
                </button>
                <input
                  ref="avatarInput"
                  type="file"
                  class="d-none"
                  accept="image/jpeg,image/png,image/jpg,image/gif"
                  @change="handleAvatarUpload"
                />
              </div>

              <!-- User Info -->
              <h5 class="mb-1">{{ user?.name }}</h5>
              <p class="text-muted mb-2">@{{ user?.username }}</p>
              <p class="text-muted small mb-3">
                <i class="ti ti-mail me-1"></i>
                {{ user?.email }}
              </p>

              <!-- Stats -->
              <div class="row text-center border-top pt-3">
                <div class="col-6">
                  <h4 class="mb-1 fw-semibold">{{ userTransactionsCount }}</h4>
                  <p class="text-muted small mb-0">Transactions</p>
                </div>
                <div class="col-6 border-start">
                  <h4 class="mb-1 fw-semibold">{{ memberSince }}</h4>
                  <p class="text-muted small mb-0">Member Since</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation -->
          <div class="card mt-3">
            <div class="list-group list-group-flush">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                class="list-group-item list-group-item-action d-flex align-items-center"
                :class="{ active: activeTab === tab.id }"
              >
                <i :class="`ti ${tab.icon} me-2 fs-5`"></i>
                <span>{{ tab.label }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="col-xl-9 col-lg-8">
          <!-- Overview Tab -->
          <div v-if="activeTab === 'overview'" class="card">
            <div class="card-body">
              <h5 class="card-title mb-4">
                <i class="ti ti-user me-2"></i>
                Profile Overview
              </h5>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted small">Full Name</label>
                  <p class="fw-semibold">{{ user?.name }}</p>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted small">Username</label>
                  <p class="fw-semibold">{{ user?.username }}</p>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted small">Email</label>
                  <p class="fw-semibold">{{ user?.email }}</p>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted small">Phone Number</label>
                  <p class="fw-semibold">{{ user?.phone_number || 'Not provided' }}</p>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted small">Gender</label>
                  <p class="fw-semibold text-capitalize">{{ user?.gender || 'Not specified' }}</p>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted small">Status</label>
                  <p>
                    <span class="badge" :class="user?.active ? 'bg-success' : 'bg-danger'">
                      {{ user?.active ? 'Active' : 'Inactive' }}
                    </span>
                  </p>
                </div>
              </div>

              <hr />

              <h6 class="mb-3">
                <i class="ti ti-shield-check me-2"></i>
                Permissions & Roles
              </h6>
              <div class="d-flex flex-wrap gap-2">
                <span
                  v-for="role in user?.roles"
                  :key="role"
                  class="badge bg-primary-subtle text-primary"
                >
                  {{ role }}
                </span>
                <span v-if="!user?.roles || user?.roles.length === 0" class="text-muted">
                  No roles assigned
                </span>
              </div>
            </div>
          </div>

          <!-- Edit Profile Tab -->
          <div v-if="activeTab === 'edit'" class="card">
            <div class="card-body">
              <h5 class="card-title mb-4">
                <i class="ti ti-edit me-2"></i>
                Edit Profile
              </h5>

              <form @submit.prevent="handleUpdateProfile">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="name" class="form-label">Full Name *</label>
                    <input
                      type="text"
                      class="form-control"
                      id="name"
                      v-model="profileForm.name"
                      required
                    />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="username" class="form-label">Username *</label>
                    <input
                      type="text"
                      class="form-control"
                      id="username"
                      v-model="profileForm.username"
                      required
                    />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="email" class="form-label">Email *</label>
                    <input
                      type="email"
                      class="form-control"
                      id="email"
                      v-model="profileForm.email"
                      required
                    />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="phone" class="form-label">Phone Number</label>
                    <input
                      type="tel"
                      class="form-control"
                      id="phone"
                      v-model="profileForm.phone_number"
                    />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="gender" class="form-label">Gender</label>
                    <select class="form-select" id="gender" v-model="profileForm.gender">
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div class="d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-secondary" @click="resetProfileForm">
                    Cancel
                  </button>
                  <button type="submit" class="btn btn-primary" :disabled="updating">
                    <span v-if="updating" class="spinner-border spinner-border-sm me-2"></span>
                    <i v-else class="ti ti-check me-2"></i>
                    Update Profile
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Change Password Tab -->
          <div v-if="activeTab === 'password'" class="card">
            <div class="card-body">
              <h5 class="card-title mb-4">
                <i class="ti ti-lock me-2"></i>
                Change Password
              </h5>

              <form @submit.prevent="handleChangePassword">
                <div class="mb-3">
                  <label for="current_password" class="form-label">Current Password *</label>
                  <input
                    type="password"
                    class="form-control"
                    id="current_password"
                    v-model="passwordForm.current_password"
                    required
                  />
                </div>
                <div class="mb-3">
                  <label for="new_password" class="form-label">New Password *</label>
                  <input
                    type="password"
                    class="form-control"
                    id="new_password"
                    v-model="passwordForm.new_password"
                    required
                  />
                  <div class="form-text">Password must be at least 8 characters long</div>
                </div>
                <div class="mb-3">
                  <label for="new_password_confirmation" class="form-label">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    class="form-control"
                    id="new_password_confirmation"
                    v-model="passwordForm.new_password_confirmation"
                    required
                  />
                </div>

                <div class="d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-secondary" @click="resetPasswordForm">
                    Cancel
                  </button>
                  <button type="submit" class="btn btn-primary" :disabled="changingPassword">
                    <span
                      v-if="changingPassword"
                      class="spinner-border spinner-border-sm me-2"
                    ></span>
                    <i v-else class="ti ti-key me-2"></i>
                    Change Password
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- My Transactions Tab -->
          <div v-if="activeTab === 'transactions'" class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="ti ti-receipt me-2"></i>
                My Transactions
              </h5>
            </div>
            <div class="card-body">
              <!-- Filters -->
              <div class="row g-3 mb-4">
                <div class="col-md-4">
                  <label class="form-label small">Status</label>
                  <select class="form-select" v-model="transactionFilters.status">
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label small">Start Date</label>
                  <input type="date" class="form-control" v-model="transactionFilters.start_date" />
                </div>
                <div class="col-md-4">
                  <label class="form-label small">End Date</label>
                  <input type="date" class="form-control" v-model="transactionFilters.end_date" />
                </div>
              </div>

              <!-- Transactions List -->
              <div v-if="loadingTransactions" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
              </div>

              <div v-else-if="userTransactions.length === 0" class="text-center py-5">
                <i class="ti ti-receipt-off fs-2xl text-muted mb-3 d-block"></i>
                <p class="text-muted">No transactions found</p>
              </div>

              <div v-else class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="transaction in userTransactions" :key="transaction.id">
                      <td>
                        <span class="fw-semibold">{{ transaction.reference }}</span>
                      </td>
                      <td>{{ transaction.transaction_type?.name }}</td>
                      <td class="fw-semibold">{{ formatCurrency(transaction.gross_amount) }}</td>
                      <td>
                        <span class="badge" :class="`bg-${getStatusColor(transaction.status)}`">
                          {{ transaction.status }}
                        </span>
                      </td>
                      <td>{{ formatDate(transaction.created_at) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from '@/composables/useI18n'
import { useUserAvatar } from '@/composables/useUserAvatar'
import { axiosInstance } from '@/plugins/axios'
import { appConfig } from '@/config/app'
import Swal from 'sweetalert2'
import type { Transaction } from '@/types'

const { t } = useI18n()
const authStore = useAuthStore()
const { userAvatar } = useUserAvatar()

const user = computed(() => authStore.user)

// Avatar upload
const avatarInput = ref<HTMLInputElement | null>(null)
const uploadingAvatar = ref(false)

// Tabs
const activeTab = ref('overview')
const tabs = [
  { id: 'overview', label: 'Overview', icon: 'ti-user' },
  { id: 'edit', label: 'Edit Profile', icon: 'ti-edit' },
  { id: 'password', label: 'Change Password', icon: 'ti-lock' },
  { id: 'transactions', label: 'My Transactions', icon: 'ti-receipt' },
]

// Profile Form
const profileForm = ref({
  name: '',
  username: '',
  email: '',
  phone_number: '',
  gender: '',
})

const updating = ref(false)

// Password Form
const passwordForm = ref({
  current_password: '',
  new_password: '',
  new_password_confirmation: '',
})

const changingPassword = ref(false)

// Transactions
const userTransactions = ref<Transaction[]>([])
const userTransactionsCount = ref(0)
const loadingTransactions = ref(false)
const transactionFilters = ref({
  status: '',
  start_date: '',
  end_date: '',
})

// Computed
const memberSince = computed(() => {
  if (!user.value?.created_at) return 'N/A'
  const date = new Date(user.value.created_at)
  return date.getFullYear().toString()
})

// Methods
const initProfileForm = () => {
  if (user.value) {
    profileForm.value = {
      name: user.value.name || '',
      username: user.value.username || '',
      email: user.value.email || '',
      phone_number: user.value.phone_number || '',
      gender: user.value.gender || '',
    }
  }
}

const resetProfileForm = () => {
  initProfileForm()
}

const resetPasswordForm = () => {
  passwordForm.value = {
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  }
}

const handleUpdateProfile = async () => {
  updating.value = true
  try {
    const response = await axiosInstance.put(`${appConfig.apiUrl}/user/profile`, profileForm.value)

    // Update user in store
    await authStore.fetchUser()

    Swal.fire({
      title: 'Success!',
      text: 'Profile updated successfully',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    })
  } catch (error: any) {
    Swal.fire({
      title: 'Error!',
      text: error.response?.data?.message || 'Failed to update profile',
      icon: 'error',
    })
  } finally {
    updating.value = false
  }
}

const handleChangePassword = async () => {
  if (passwordForm.value.new_password !== passwordForm.value.new_password_confirmation) {
    Swal.fire({
      title: 'Error!',
      text: 'New passwords do not match',
      icon: 'error',
    })
    return
  }

  changingPassword.value = true
  try {
    await axiosInstance.put(`${appConfig.apiUrl}/user/password`, {
      current_password: passwordForm.value.current_password,
      password: passwordForm.value.new_password,
      password_confirmation: passwordForm.value.new_password_confirmation,
    })

    resetPasswordForm()

    Swal.fire({
      title: 'Success!',
      text: 'Password changed successfully',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    })
  } catch (error: any) {
    Swal.fire({
      title: 'Error!',
      text: error.response?.data?.message || 'Failed to change password',
      icon: 'error',
    })
  } finally {
    changingPassword.value = false
  }
}

const handleAvatarChange = () => {
  // Trigger file input click
  avatarInput.value?.click()
}

const handleAvatarUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    Swal.fire({
      title: 'Error!',
      text: 'File size must be less than 5MB',
      icon: 'error',
    })
    return
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    Swal.fire({
      title: 'Error!',
      text: 'Only JPEG, PNG, JPG and GIF images are allowed',
      icon: 'error',
    })
    return
  }

  uploadingAvatar.value = true

  try {
    const formData = new FormData()
    formData.append('avatar', file)

    await axiosInstance.post(`${appConfig.apiUrl}/user/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    // Refresh user data to get new avatar
    await authStore.fetchUser()

    Swal.fire({
      title: 'Success!',
      text: 'Avatar updated successfully',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    })

    // Reset file input
    if (avatarInput.value) {
      avatarInput.value.value = ''
    }
  } catch (error: any) {
    Swal.fire({
      title: 'Error!',
      text: error.response?.data?.message || 'Failed to update avatar',
      icon: 'error',
    })
  } finally {
    uploadingAvatar.value = false
  }
}

const fetchUserTransactions = async () => {
  if (!user.value) return

  loadingTransactions.value = true
  try {
    const params: any = {
      user_id: user.value.id,
      per_page: 50,
    }

    if (transactionFilters.value.status) {
      params.status = transactionFilters.value.status
    }
    if (transactionFilters.value.start_date) {
      params.start_date = transactionFilters.value.start_date
    }
    if (transactionFilters.value.end_date) {
      params.end_date = transactionFilters.value.end_date
    }

    const response = await axiosInstance.get(`${appConfig.apiUrl}/transactions`, { params })
    userTransactions.value = response.data.data
    userTransactionsCount.value = response.data.meta?.total || response.data.data.length
  } catch (error) {
    console.error('Failed to fetch user transactions:', error)
  } finally {
    loadingTransactions.value = false
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'CDF',
    minimumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'warning',
    completed: 'success',
    cancelled: 'danger',
    failed: 'danger',
  }
  return colors[status] || 'secondary'
}

// Watchers
watch(
  transactionFilters,
  () => {
    if (activeTab.value === 'transactions') {
      fetchUserTransactions()
    }
  },
  { deep: true }
)

watch(activeTab, (newTab) => {
  if (newTab === 'transactions' && userTransactions.value.length === 0) {
    fetchUserTransactions()
  }
})

// Lifecycle
onMounted(() => {
  initProfileForm()
})
</script>

<style scoped lang="scss">
.list-group-item {
  border: none;
  border-radius: 0;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }

  &.active {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border-left: 4px solid #764ba2;

    i {
      color: white;
    }
  }
}

.avatar-xl {
  width: 100px;
  height: 100px;
  object-fit: cover;
}
</style>
