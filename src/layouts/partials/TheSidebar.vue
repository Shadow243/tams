<template>
  <div class="sidenav-menu">
    <!-- Brand Logo -->
    <a href="" class="logo">
      <span class="logo logo-light">
        <span class="logo-lg"><img :src="logoImg" alt="logo" /></span>
        <span class="logo-sm"><img :src="iconImage" alt="small logo" /></span>
      </span>

      <span class="logo logo-dark">
        <span class="logo-lg"><img :src="logoImg" alt="dark logo" /></span>
        <span class="logo-sm"><img :src="iconImage" alt="small logo" /></span>
      </span>
    </a>

    <!-- Sidebar Hover Menu Toggle Button -->
    <button class="button-on-hover" @click="toggleSidebar">
      <span class="btn-on-hover-icon"></span>
    </button>

    <!-- Full Sidebar Menu Close Button -->
    <button class="button-close-offcanvas">
      <i class="ti ti-menu-4 align-middle"></i>
    </button>

    <div class="scrollbar" data-simplebar="">
      <div
        id="user-profile-settings"
        class="sidenav-user"
        style="background: url(assets/images/user-bg-pattern.svg)"
      >
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <a href="#!" class="link-reset">
              <img :src="userAvatar" alt="user-image" class="rounded-circle mb-2 avatar-md" />
              <span class="sidenav-user-name fw-bold">{{ user?.name || 'User' }}</span>
              <span class="fs-12 fw-semibold" data-lang="user-role">{{ user?.email || '' }}</span>
            </a>
          </div>
          <div>
            <a
              class="dropdown-toggle drop-arrow-none link-reset sidenav-user-set-icon"
              data-bs-toggle="dropdown"
              data-bs-offset="0,12"
              href="#!"
              aria-haspopup="false"
              aria-expanded="false"
            >
              <i class="ti ti-settings fs-24 align-middle ms-1"></i>
            </a>

            <div class="dropdown-menu">
              <!-- Header -->
              <div class="dropdown-header noti-title">
                <h6 class="text-overflow m-0">Welcome back!</h6>
              </div>

              <!-- My Profile -->
              <a href="#!" class="dropdown-item">
                <i class="ti ti-user-circle me-1 fs-lg align-middle"></i>
                <span class="align-middle">{{ t('sidebar.profile') || 'Mon Profil' }}</span>
              </a>

              <!-- Settings -->
              <a href="javascript:void(0);" class="dropdown-item">
                <i class="ti ti-settings-2 me-1 fs-lg align-middle"></i>
                <span class="align-middle">{{ t('sidebar.account_settings') || 'Paramètres du compte' }}</span>
              </a>

              <!-- Lock -->
              <a href="auth-lock-screen.html" class="dropdown-item">
                <i class="ti ti-lock me-1 fs-lg align-middle"></i>
                <span class="align-middle">{{ t('sidebar.lock_screen') || 'Verrouiller' }}</span>
              </a>

              <!-- Logout -->
              <a href="javascript:void(0);" class="dropdown-item text-danger fw-semibold">
                <i class="ti ti-logout me-1 fs-lg align-middle"></i>
                <span class="align-middle">{{ t('auth.logout') || 'Déconnexion' }}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!--- Sidenav Menu -->
      <div id="sidenav-menu">
        <MenuList :items="appRoutes" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { logoImg, iconImage } from '@/utils/ui-utils'
import { useSidebarToggle } from '@/composables/sidebar-toggle'
import { useI18n } from '@/composables/useI18n'
import { useAuthStore } from '@/stores/auth'
import { useUserAvatar } from '@/composables/useUserAvatar'
import { usePermissions } from '@/composables/usePermissions'
import MenuList from '@/components/Menu/MenuList.vue'

const { t } = useI18n()
const authStore = useAuthStore()
const { userAvatar } = useUserAvatar()
const user = computed(() => authStore.user)
const { canSeeConfigurations } = usePermissions()

// Sidebar toggle
const { toggleSidebar } = useSidebarToggle()

// Make appRoutes reactive so it updates when language changes or role changes
const appRoutes = computed(() => {
  const routes: any[] = [
    { label: t('sidebar.dashboard'), type: 'header' },
    { icon: 'home', label: t('sidebar.home'), route: 'home', type: 'menu' },
    { label: t('sidebar.apps'), type: 'header' },
    { icon: 'receipt-2',      label: t('sidebar.transactions'),      route: 'transactions.list',      type: 'menu' },
    { icon: 'device-desktop', label: t('sidebar.operators'),         route: 'operators.list',         type: 'menu' },
    { icon: 'building-store', label: t('sidebar.branches'),          route: 'branches.list',          type: 'menu' },
    { icon: 'wallet',         label: t('sidebar.wallets'),           route: 'wallets.list',           type: 'menu' },
    { icon: 'arrows-exchange',label: t('sidebar.transaction_types'), route: 'transaction-types.list', type: 'menu' },
  ]

  if (canSeeConfigurations.value) {
    routes.push(
      { label: t('sidebar.params'), type: 'header' },
      { icon: 'receipt',          label: t('sidebar.fee_rules'),  route: 'fee-rules.list',   type: 'menu' },
      { icon: 'currency-dollar',  label: t('sidebar.currencies'), route: 'currencies.list',  type: 'menu' },
      { icon: 'globe',            label: t('sidebar.countries'),  route: 'countries.list',   type: 'menu' },
      { icon: 'users',            label: t('sidebar.users'),      route: 'users.list',       type: 'menu' },
    )
  }

  return routes
})
</script>