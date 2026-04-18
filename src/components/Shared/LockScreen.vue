<template>
  <Transition name="lockscreen">
    <div v-if="lockStore.isScreenLocked" class="lockscreen-overlay" :data-theme="currentTheme">
      <div class="lockscreen-container">
        <!-- Background Pattern -->
        <div class="lockscreen-pattern"></div>

        <!-- Lock Screen Content -->
        <div class="lockscreen-content">
          <!-- Time Display -->
          <div class="lockscreen-time">
            <div class="time">{{ currentTime }}</div>
            <div class="date">{{ currentDate }}</div>
          </div>

          <!-- User Card -->
          <div class="lockscreen-card">
            <div class="user-avatar-wrapper">
              <div class="avatar-ring"></div>
              <img :src="userAvatar" :alt="user?.name" class="user-avatar" />
              <div class="lock-icon-badge">
                <i class="ti ti-lock"></i>
              </div>
            </div>

            <div class="user-info">
              <h3 class="user-name">{{ user?.name }}</h3>
              <p class="user-role">{{ user?.username }}</p>
              <p class="lock-message">
                <i class="ti ti-clock me-1"></i>
                Locked {{ lockStore.lockDuration }} ago
              </p>
            </div>

            <!-- Unlock Form -->
            <form @submit.prevent="handleUnlock" class="unlock-form">
              <div class="form-floating">
                <input
                  v-model="password"
                  type="password"
                  class="form-control"
                  :class="{
                    'is-invalid': showError,
                    'is-valid': showSuccess,
                  }"
                  id="unlock-password"
                  placeholder="Password"
                  :disabled="!lockStore.canAttemptUnlock || unlocking"
                  autofocus
                  autocomplete="current-password"
                />
                <label for="unlock-password">
                  <i class="ti ti-key me-1"></i>
                  Enter your password
                </label>
              </div>

              <!-- Error/Success Messages -->
              <div v-if="showError" class="alert alert-danger alert-sm mt-3 mb-0">
                <i class="ti ti-alert-circle me-1"></i>
                {{ errorMessage }}
                <span v-if="lockStore.canAttemptUnlock" class="d-block mt-1 small">
                  {{ lockStore.remainingAttempts }} attempt{{
                    lockStore.remainingAttempts !== 1 ? 's' : ''
                  }}
                  remaining
                </span>
              </div>

              <div v-if="lockStore.isBlocked" class="alert alert-danger alert-sm mt-3 mb-0">
                <i class="ti ti-ban me-1"></i>
                Too many failed attempts! You will be logged out in 30 seconds.
              </div>

              <!-- Actions -->
              <div class="unlock-actions">
                <button
                  type="submit"
                  class="btn btn-primary btn-lg w-100"
                  :disabled="!password || unlocking || !lockStore.canAttemptUnlock"
                >
                  <span v-if="unlocking" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="ti ti-lock-open me-2"></i>
                  {{ unlocking ? 'Unlocking...' : 'Unlock' }}
                </button>

                <button
                  type="button"
                  class="btn btn-outline-danger btn-lg w-100 mt-2"
                  @click="handleLogout"
                  :disabled="unlocking"
                >
                  <i class="ti ti-logout me-2"></i>
                  Logout
                </button>
              </div>
            </form>

            <!-- Additional Info -->
            <div class="lockscreen-footer">
              <p class="text-muted small mb-0">
                <i class="ti ti-shield-lock me-1"></i>
                Your session is secure
              </p>
            </div>
          </div>
        </div>

        <!-- Decorative Elements -->
        <div class="decorative-circle circle-1"></div>
        <div class="decorative-circle circle-2"></div>
        <div class="decorative-circle circle-3"></div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useLockScreenStore } from '@/stores/lockscreen'
import { useAuthStore } from '@/stores/auth'
import { useUserAvatar } from '@/composables/useUserAvatar'

const lockStore = useLockScreenStore()
const authStore = useAuthStore()
const { userAvatar } = useUserAvatar()

const user = computed(() => authStore.user)
const password = ref('')
const unlocking = ref(false)
const showError = ref(false)
const showSuccess = ref(false)
const errorMessage = ref('')

// Current theme detection
const currentTheme = ref<'light' | 'dark'>('dark')

const updateTheme = () => {
  const htmlTheme = document.documentElement.getAttribute('data-bs-theme')
  currentTheme.value = (htmlTheme === 'light' ? 'light' : 'dark') as 'light' | 'dark'
}

// Current time and date
const currentTime = ref('')
const currentDate = ref('')

let timeInterval: NodeJS.Timeout | null = null
let themeObserver: MutationObserver | null = null

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  currentDate.value = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const handleUnlock = async () => {
  if (!password.value || unlocking.value || !lockStore.canAttemptUnlock) return

  unlocking.value = true
  showError.value = false
  showSuccess.value = false
  errorMessage.value = ''

  try {
    const success = await lockStore.attemptUnlock(password.value)

    if (success) {
      showSuccess.value = true
      password.value = ''
      // Unlock happens in the store
    } else {
      showError.value = true
      errorMessage.value = 'Invalid password. Please try again.'
      password.value = ''
    }
  } catch (error: any) {
    showError.value = true
    errorMessage.value = error.message || 'Failed to unlock. Please try again.'
  } finally {
    unlocking.value = false
  }
}

const handleLogout = async () => {
  if (confirm('Are you sure you want to logout?')) {
    try {
      await authStore.logout()
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
}

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)

  // Initialize theme
  updateTheme()

  // Watch for theme changes
  themeObserver = new MutationObserver(() => {
    updateTheme()
  })

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-bs-theme'],
  })

  // Restore lock state if page was refreshed
  lockStore.restoreState()
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
  if (themeObserver) {
    themeObserver.disconnect()
  }
})
</script>

<style scoped lang="scss">
.lockscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: background 0.3s ease;

  // Light theme
  &[data-theme='light'] {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

    .lockscreen-time {
      color: white;
    }

    .lockscreen-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .user-info {
      .user-name {
        color: #1a1a1a;
      }

      .user-role {
        color: #666;
      }

      .lock-message {
        color: #999;
      }
    }

    .form-control {
      background: white;
      color: #1a1a1a;
      border-color: #e0e0e0;

      &:focus {
        background: white;
        color: #1a1a1a;
      }
    }

    .form-floating label {
      color: #666;
    }

    .user-avatar {
      border-color: white;
    }

    .lock-icon-badge {
      border-color: white;
    }

    .lockscreen-footer {
      border-top-color: #e0e0e0;
    }

    .decorative-circle {
      background: rgba(255, 255, 255, 0.1);
    }
  }

  // Dark theme
  &[data-theme='dark'] {
    background: linear-gradient(135deg, #1a1d29 0%, #2d1b3d 100%);

    .lockscreen-time {
      color: #e0e0e0;
    }

    .lockscreen-card {
      background: rgba(30, 34, 48, 0.95);
      backdrop-filter: blur(20px);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
    }

    .user-info {
      .user-name {
        color: #e0e0e0;
      }

      .user-role {
        color: #a0a0a0;
      }

      .lock-message {
        color: #808080;
      }
    }

    .form-control {
      background: rgba(255, 255, 255, 0.05);
      color: #e0e0e0;
      border-color: rgba(255, 255, 255, 0.1);

      &:focus {
        background: rgba(255, 255, 255, 0.08);
        color: #e0e0e0;
        border-color: #667eea;
      }

      &::placeholder {
        color: rgba(255, 255, 255, 0.4);
      }
    }

    .form-floating label {
      color: rgba(255, 255, 255, 0.6);
    }

    .user-avatar {
      border-color: rgba(255, 255, 255, 0.2);
    }

    .lock-icon-badge {
      border-color: rgba(255, 255, 255, 0.2);
    }

    .lockscreen-footer {
      border-top-color: rgba(255, 255, 255, 0.1);

      .text-muted {
        color: rgba(255, 255, 255, 0.5) !important;
      }
    }

    .decorative-circle {
      background: rgba(102, 126, 234, 0.08);
    }
  }
}

.lockscreen-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lockscreen-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(
      circle at 20% 50%,
      rgba(255, 255, 255, 0.05) 0%,
      transparent 50%
    ),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 40% 90%, rgba(255, 255, 255, 0.03) 0%, transparent 50%);
  pointer-events: none;
}

.lockscreen-content {
  position: relative;
  z-index: 1;
  text-align: center;
  animation: fadeInUp 0.6s ease-out;
}

.lockscreen-time {
  margin-bottom: 3rem;

  .time {
    font-size: 5rem;
    font-weight: 300;
    letter-spacing: 0.05em;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    animation: pulse 2s ease-in-out infinite;
  }

  .date {
    font-size: 1.25rem;
    font-weight: 300;
    opacity: 0.9;
    margin-top: 0.5rem;
  }
}

.lockscreen-card {
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 3.5rem 3rem;
  max-width: 550px;
  width: 100%;
  margin: 0 auto;
  animation: scaleIn 0.5s ease-out;
}

.user-avatar-wrapper {
  position: relative;
  width: 140px;
  height: 140px;
  margin: 0 auto 1.5rem;

  .avatar-ring {
    position: absolute;
    inset: -8px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    animation: rotate 3s linear infinite;
  }

  .user-avatar {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }

  .lock-icon-badge {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
    border: 3px solid;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
}

.user-info {
  margin-bottom: 2rem;

  .user-name {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .user-role {
    margin-bottom: 0.5rem;
  }

  .lock-message {
    font-size: 0.875rem;
    margin: 0;
  }
}

.unlock-form {
  .form-floating {
    .form-control {
      border-radius: 12px;
      border: 2px solid;
      padding: 1rem 1.5rem;
      font-size: 1rem;
      transition: all 0.3s ease;

      &:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
      }

      &.is-invalid {
        border-color: #dc3545;

        &:focus {
          box-shadow: 0 0 0 4px rgba(220, 53, 69, 0.1);
        }
      }
    }

    label {
      padding: 1rem 1.5rem;
    }
  }
}

.alert-sm {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  border-radius: 10px;
  border: none;
}

.unlock-actions {
  margin-top: 1.5rem;

  .btn {
    border-radius: 12px;
    padding: 0.875rem 1.5rem;
    font-weight: 500;
    font-size: 1rem;
    transition: all 0.3s ease;

    &.btn-primary {
      background: linear-gradient(135deg, #667eea, #764ba2);
      border: none;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
      }

      &:disabled {
        opacity: 0.6;
      }
    }

    &.btn-outline-danger {
      border: 2px solid #dc3545;
      color: #dc3545;

      &:hover:not(:disabled) {
        background: #dc3545;
        color: white;
        transform: translateY(-2px);
      }
    }
  }
}

.lockscreen-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid;
}

// Decorative Circles
.decorative-circle {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;

  &.circle-1 {
    width: 300px;
    height: 300px;
    top: -150px;
    left: -150px;
    animation: float 6s ease-in-out infinite;
  }

  &.circle-2 {
    width: 200px;
    height: 200px;
    bottom: -100px;
    right: -100px;
    animation: float 8s ease-in-out infinite reverse;
  }

  &.circle-3 {
    width: 150px;
    height: 150px;
    top: 50%;
    right: 5%;
    animation: float 7s ease-in-out infinite;
  }
}

// Animations
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) translateX(0);
  }
  50% {
    transform: translateY(-20px) translateX(20px);
  }
}

// Transitions
.lockscreen-enter-active,
.lockscreen-leave-active {
  transition: opacity 0.3s ease;
}

.lockscreen-enter-from,
.lockscreen-leave-to {
  opacity: 0;
}

// Responsive
@media (max-width: 768px) {
  .lockscreen-time {
    .time {
      font-size: 3rem;
    }

    .date {
      font-size: 1rem;
    }
  }

  .lockscreen-card {
    margin: 1rem;
    padding: 2.5rem 2rem;
    max-width: 95%;
  }

  .user-avatar-wrapper {
    width: 110px;
    height: 110px;
  }
}
</style>

<style lang="scss">
// Global styles for body when lockscreen is active
body.lockscreen-active {
  overflow: hidden !important;
  height: 100vh;
  position: fixed;
  width: 100%;
}
</style>
