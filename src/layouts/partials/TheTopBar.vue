<template>
  <header class="app-topbar">
    <div class="container-fluid topbar-menu">
      <div class="d-flex align-items-center gap-2">
        <!-- Topbar Brand Logo -->
        <div class="logo-topbar">
          <!-- Logo light -->
          <a href="/" class="logo-light">
            <span class="logo-lg">
              <img :src="logoImg" alt="logo" style="width: 50px !important" />
            </span>
            <span class="logo-sm">
              <img :src="iconImage" alt="small logo" />
            </span>
          </a>

          <!-- Logo Dark -->
          <a href="/" class="logo-dark">
            <span class="logo-lg">
              <img :src="logoImg" alt="dark logo" style="width: 50px !important" />
            </span>
            <span class="logo-sm">
              <img :src="iconImage" alt="small logo" />
            </span>
          </a>
        </div>

        <!-- Sidebar Menu Toggle Button -->
        <button class="sidenav-toggle-button btn btn-primary btn-icon" @click="toggleSidebar">
          <i class="ti ti-menu-4"></i>
        </button>

        <!-- Horizontal Menu Toggle Button -->
        <button
          class="topnav-toggle-button px-2"
          data-bs-toggle="collapse"
          data-bs-target="#topnav-menu"
        >
          <i class="ti ti-menu-4"></i>
        </button>

        <div id="search-box-rounded" class="app-search d-none d-xl-flex">
          <input
            type="search"
            class="form-control rounded-pill topbar-search"
            name="search"
            placeholder="Quick Search..."
          />
          <i class="ti ti-search app-search-icon text-muted"></i>
        </div>
      </div>

      <div class="d-flex align-items-center gap-2">
        <div id="theme-dropdown" class="topbar-item d-none d-sm-flex">
          <div class="dropdown">
            <button
              class="topbar-link"
              data-bs-toggle="dropdown"
              type="button"
              aria-haspopup="false"
              aria-expanded="false"
            >
              <i class="ti ti-sun topbar-link-icon d-none" id="theme-icon-light"></i>
              <i class="ti ti-moon topbar-link-icon d-none" id="theme-icon-dark"></i>
              <i class="ti ti-sun-moon topbar-link-icon d-none" id="theme-icon-system"></i>
            </button>
            <div class="dropdown-menu dropdown-menu-end" data-thememode="dropdown">
              <label class="dropdown-item cursor-pointer">
                <input
                  class="form-check-input"
                  type="radio"
                  name="data-bs-theme"
                  value="light"
                  style="display: none"
                />
                <i class="ti ti-sun align-middle me-1 fs-16"></i>
                <span class="align-middle">Light</span>
              </label>
              <label class="dropdown-item cursor-pointer">
                <input
                  class="form-check-input"
                  type="radio"
                  name="data-bs-theme"
                  value="dark"
                  style="display: none"
                />
                <i class="ti ti-moon align-middle me-1 fs-16"></i>
                <span class="align-middle">Dark</span>
              </label>
              <label class="dropdown-item cursor-pointer">
                <input
                  class="form-check-input"
                  type="radio"
                  name="data-bs-theme"
                  value="system"
                  style="display: none"
                />
                <i class="ti ti-sun-moon align-middle me-1 fs-16"></i>
                <span class="align-middle">System</span>
              </label>
            </div>
            <!-- end dropdown-menu-->
          </div>
          <!-- end dropdown-->
        </div>
        <div id="notification-dropdown-people" class="topbar-item">
          <div class="dropdown">
            <button
              class="topbar-link dropdown-toggle drop-arrow-none"
              data-bs-toggle="dropdown"
              type="button"
              data-bs-auto-close="outside"
              aria-haspopup="false"
              aria-expanded="false"
              @click="openNotifications"
            >
              <i class="ti ti-bell topbar-link-icon animate-ring"></i>
              <span
                v-if="notifStore.hasUnread"
                class="badge text-bg-danger badge-circle topbar-badge"
              >
                {{ notifStore.unreadCount > 99 ? '99+' : notifStore.unreadCount }}
              </span>
            </button>

            <div class="dropdown-menu p-0 dropdown-menu-end dropdown-menu-lg">
              <div class="px-3 py-2 border-bottom">
                <div class="row align-items-center">
                  <div class="col">
                    <h6 class="m-0 fs-md fw-semibold">Notifications</h6>
                  </div>
                  <div class="col text-end">
                    <a href="javascript:void(0);" class="badge badge-soft-success badge-label py-1">
                      {{ notifStore.unreadCount }} Notification{{
                        notifStore.unreadCount !== 1 ? 's' : ''
                      }}
                    </a>
                  </div>
                </div>
              </div>

              <div style="max-height: 300px" data-simplebar="">
                <!-- Loading state -->
                <div v-if="notifStore.loading" class="text-center py-4 text-muted">
                  <div class="spinner-border spinner-border-sm" role="status"></div>
                </div>

                <!-- Empty state -->
                <div
                  v-else-if="notifStore.notifications.length === 0"
                  class="text-center py-4 text-muted"
                >
                  <i class="ti ti-bell-off fs-2xl d-block mb-2"></i>
                  <span class="fs-sm">No notifications</span>
                </div>

                <!-- Notification items -->
                <div
                  v-for="n in notifStore.notifications"
                  :key="n.id"
                  class="dropdown-item notification-item py-2 text-wrap"
                  :class="{
                    'bg-primary bg-opacity-10': !n.read_at,
                    'opacity-50': notifStore.isActioning(n.id),
                  }"
                  style="cursor: pointer"
                  @click="notifStore.markAsRead(n.id)"
                >
                  <span class="d-flex align-items-center gap-3">
                    <span class="flex-shrink-0 position-relative">
                      <span
                        class="avatar-md rounded-circle bg-light d-flex align-items-center justify-content-center"
                      >
                        <span
                          v-if="notifStore.isActioning(n.id)"
                          class="spinner-border spinner-border-sm text-secondary"
                          role="status"
                        ></span>
                        <i v-else :class="`ti ${n.data.icon} fs-4`"></i>
                      </span>
                      <span
                        v-if="!notifStore.isActioning(n.id)"
                        :class="`position-absolute rounded-pill bg-${n.data.color} notification-badge`"
                      >
                        <i :class="`ti ${n.data.icon} align-middle`"></i>
                        <span class="visually-hidden">notification</span>
                      </span>
                    </span>
                    <span class="flex-grow-1 text-muted">
                      <span class="fw-medium text-body">{{ n.data.title }}</span>
                      <br />
                      {{ n.data.body }}
                      <br />
                      <span class="fs-xs">{{ timeAgo(n.created_at) }}</span>
                    </span>
                    <button
                      type="button"
                      class="flex-shrink-0 text-muted btn btn-link p-0 position-absolute end-0 me-2 d-none noti-close-btn"
                      :disabled="notifStore.isActioning(n.id)"
                      @click.stop="notifStore.remove(n.id)"
                    >
                      <i class="ti ti-square-rounded-x fs-xxl"></i>
                    </button>
                  </span>
                </div>
              </div>

              <!-- All-->
              <a
                href="javascript:void(0);"
                class="dropdown-item text-center text-reset text-decoration-underline link-offset-2 fw-bold notify-item border-top border-light py-2"
                :class="{ 'pe-none opacity-50': notifStore.markingAll }"
                @click.prevent="notifStore.markAllAsRead()"
              >
                <span
                  v-if="notifStore.markingAll"
                  class="spinner-border spinner-border-sm me-1"
                  role="status"
                ></span>
                Mark all as read
              </a>
            </div>
            <!-- End dropdown-menu -->
          </div>
          <!-- end dropdown-->
        </div>

        <div id="fullscreen-toggler" class="topbar-item d-none d-md-flex">
          <button class="topbar-link" type="button" data-toggle="fullscreen">
            <i class="ti ti-maximize topbar-link-icon"></i>
            <i class="ti ti-minimize topbar-link-icon d-none"></i>
          </button>
        </div>

        <div id="monochrome-toggler" class="topbar-item d-none d-xl-flex">
          <button id="monochrome-mode" class="topbar-link" type="button" data-toggle="monochrome">
            <i class="ti ti-palette topbar-link-icon"></i>
          </button>
        </div>

        <div class="topbar-item d-none d-sm-flex">
          <button
            class="topbar-link btn-theme-setting"
            data-bs-toggle="offcanvas"
            data-bs-target="#theme-settings-offcanvas"
            type="button"
          >
            <i class="ti ti-settings topbar-link-icon"></i>
          </button>
        </div>

        <div id="language-selector-rounded" class="topbar-item">
          <div class="dropdown">
            <button
              class="topbar-link fw-bold"
              data-bs-toggle="dropdown"
              type="button"
              aria-haspopup="false"
              aria-expanded="false"
            >
              <img
                :src="currentLanguage.flag"
                alt="user-image"
                class="me-2"
                height="18"
                width="30"
                id="selected-language-image"
              />
              <span id="selected-language-code">{{ currentLanguage.code }}</span>
            </button>
            <div class="dropdown-menu dropdown-menu-end">
              <a
                v-for="lang in availableLanguages"
                :key="lang.locale"
                href="javascript:void(0);"
                class="dropdown-item"
                :class="{ active: currentLanguage.locale === lang.locale }"
                @click="switchLanguage(lang.locale)"
                :title="lang.name"
              >
                <img :src="lang.flag" :alt="lang.name" class="me-1" height="18" width="30" />
                <span class="align-middle">{{ lang.name }}</span>
              </a>
            </div>
          </div>
        </div>

        <div id="user-dropdown-detailed" class="topbar-item nav-user">
          <div class="dropdown">
            <a
              class="topbar-link dropdown-toggle drop-arrow-none px-2"
              data-bs-toggle="dropdown"
              href="#!"
              aria-haspopup="false"
              aria-expanded="false"
            >
              <img
                :src="userAvatar"
                width="32"
                class="rounded-circle me-lg-2 d-flex avatar-xl img-thumbnail"
                alt="user-image"
              />
              <div class="d-lg-flex align-items-center gap-1 d-none">
                <span>
                  <h5 class="my-0 lh-1 pro-username">{{ user?.name }}</h5>
                  <span class="fs-xs lh-1">{{ user?.username }}</span>
                </span>
                <i class="ti ti-chevron-down align-middle"></i>
              </div>
            </a>
            <div class="dropdown-menu dropdown-menu-end">
              <!-- Header -->
              <div class="dropdown-header noti-title">
                <h6 class="text-overflow m-0">Welcome back 👋!</h6>
              </div>

              <!-- My Profile -->
              <router-link to="/profile" class="dropdown-item">
                <i class="ti ti-user-circle me-1 fs-lg align-middle"></i>
                <span class="align-middle">Profile</span>
              </router-link>

              <!-- Notifications -->
              <a href="javascript:void(0);" class="dropdown-item">
                <i class="ti ti-bell-ringing me-1 fs-lg align-middle"></i>
                <span class="align-middle">Notifications</span>
              </a>

              <!-- Settings -->
              <router-link to="/settings" class="dropdown-item">
                <i class="ti ti-settings-2 me-1 fs-lg align-middle"></i>
                <span class="align-middle">Account Settings</span>
              </router-link>

              <!-- Divider -->
              <div class="dropdown-divider"></div>

              <!-- Lock -->
              <a href="javascript:void(0);" class="dropdown-item" @click="handleLockScreen">
                <i class="ti ti-lock me-1 fs-lg align-middle"></i>
                <span class="align-middle">Lock Screen</span>
              </a>

              <!-- Logout -->
              <a href="javascript:void(0);" class="dropdown-item fw-semibold" @click="handleLogout">
                <i class="ti ti-logout me-1 fs-lg align-middle"></i>
                <span class="align-middle">Log Out</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { logoImg, iconImage } from '@/utils/ui-utils'
import { useI18n } from '@/composables/useI18n'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import { useLockScreenStore } from '@/stores/lockscreen'
import { useUserAvatar } from '@/composables/useUserAvatar'
import { useSidebarToggle } from '@/composables/sidebar-toggle'
import {
  applyTheme,
  applyMonochromeMode,
  getSavedThemeConfig,
  updateThemeIcon,
  initializeThemeFromSettings,
} from '@/utils/theme'

const authStore = useAuthStore()
const user = computed(() => authStore.user)
const { userAvatar } = useUserAvatar()

const notifStore = useNotificationStore()
const lockStore = useLockScreenStore()

async function openNotifications() {
  if (notifStore.notifications.length === 0 || notifStore.hasUnread) {
    await notifStore.fetchNotifications()
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

// i18n
const { locale, changeLocale } = useI18n()

// Theme management
const currentTheme = ref('light')

// Monochrome management
const isMonochrome = ref(false)

// Language management
interface Language {
  locale: 'en-US' | 'fr-FR'
  code: string
  name: string
  flag: string
}

const availableLanguages: Language[] = [
  {
    locale: 'en-US',
    code: 'EN',
    name: 'English',
    flag: '/assets/images/flags/us.svg',
  },
  {
    locale: 'fr-FR',
    code: 'FR',
    name: 'Français',
    flag: '/assets/images/flags/fr.svg',
  },
]

const currentLanguage = computed(() => {
  return availableLanguages.find((lang) => lang.locale === locale.value) || availableLanguages[0]!
})

const switchLanguage = (newLocale: 'en-US' | 'fr-FR') => {
  changeLocale(newLocale)
}

// Logout handler
const handleLogout = async () => {
  try {
    await authStore.logout()
    // Redirect to login page
    window.location.href = '/login'
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

// Lock screen handler
const handleLockScreen = () => {
  lockStore.lock()
}

// Sidebar toggle
const { toggleSidebar } = useSidebarToggle()

// Change theme using centralized utility
const changeTheme = (theme: string) => {
  currentTheme.value = theme
  applyTheme(theme as any)
}

// Toggle monochrome mode using centralized utility
const toggleMonochrome = () => {
  isMonochrome.value = !isMonochrome.value
  applyMonochromeMode(isMonochrome.value)
}

onUnmounted(() => {
  notifStore.disconnect()
})

// Initialize theme on mount
onMounted(() => {
  // Connect to real-time notifications via Reverb
  notifStore.fetchUnreadCount()
  if (user.value?.id) {
    notifStore.connect(user.value.id)
  }

  try {
    // Initialize theme from user settings first
    initializeThemeFromSettings()

    // Get the applied theme configuration
    const config = getSavedThemeConfig()
    const theme = config.theme || 'light'
    const monochrome = config.monochrome || false
    const sidenavSize = config['sidenav-size'] || 'on-hover-active'

    // Update component state
    currentTheme.value = theme
    isMonochrome.value = monochrome
    updateThemeIcon(theme)

    // Initialize sidebar size (only on desktop)
    const html = document.documentElement
    const isMobile = window.innerWidth < 768

    if (!isMobile) {
      html.setAttribute('data-sidenav-size', sidenavSize)
      if (sidenavSize === 'on-hover') {
        document.body.classList.add('sidebar-enable')
      } else {
        document.body.classList.remove('sidebar-enable')
      }
    } else {
      // On mobile, ensure sidebar is closed by default
      html.classList.remove('sidebar-enable')
      document.body.style.overflow = ''
    }

    // Add click event listeners to theme options
    const themeDropdown = document.querySelector('[data-thememode="dropdown"]')
    if (themeDropdown) {
      const labels = themeDropdown.querySelectorAll('label.dropdown-item')
      labels.forEach((label) => {
        label.addEventListener('click', () => {
          const input = label.querySelector('input[type="radio"]') as HTMLInputElement
          if (input) {
            changeTheme(input.value)
          }
        })
      })
    }

    // Add click event listener to monochrome button
    const monochromeButton = document.getElementById('monochrome-mode')
    if (monochromeButton) {
      monochromeButton.addEventListener('click', toggleMonochrome)
    }

    // Listen for system theme changes when 'system' is selected
    if (theme === 'system') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (currentTheme.value === 'system') {
          // Re-apply theme to pick up system change
          applyTheme('system')
        }
      })
    }
  } catch (e) {
    console.warn('Unable to initialize theme:', e)
  }
})
</script>
<style scoped>
.logo-lg img {
  height: 50px !important;
}
</style>
