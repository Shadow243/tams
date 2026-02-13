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
                    <button class="topnav-toggle-button px-2" data-bs-toggle="collapse" data-bs-target="#topnav-menu">
                        <i class="ti ti-menu-4"></i>
                    </button>

                    <div id="search-box-rounded" class="app-search d-none d-xl-flex">
                        <input type="search" class="form-control rounded-pill topbar-search" name="search"
                            placeholder="Quick Search..." />
                        <i class="ti ti-search app-search-icon text-muted"></i>
                    </div>
                </div>

                <div class="d-flex align-items-center gap-2">
                    <div id="theme-dropdown" class="topbar-item d-none d-sm-flex">
                        <div class="dropdown">
                            <button class="topbar-link" data-bs-toggle="dropdown" type="button" aria-haspopup="false"
                                aria-expanded="false">
                                <i class="ti ti-sun topbar-link-icon d-none" id="theme-icon-light"></i>
                                <i class="ti ti-moon topbar-link-icon d-none" id="theme-icon-dark"></i>
                                <i class="ti ti-sun-moon topbar-link-icon d-none" id="theme-icon-system"></i>
                            </button>
                            <div class="dropdown-menu dropdown-menu-end" data-thememode="dropdown">
                                <label class="dropdown-item cursor-pointer">
                                    <input class="form-check-input" type="radio" name="data-bs-theme" value="light"
                                        style="display: none" />
                                    <i class="ti ti-sun align-middle me-1 fs-16"></i>
                                    <span class="align-middle">Light</span>
                                </label>
                                <label class="dropdown-item cursor-pointer">
                                    <input class="form-check-input" type="radio" name="data-bs-theme" value="dark"
                                        style="display: none" />
                                    <i class="ti ti-moon align-middle me-1 fs-16"></i>
                                    <span class="align-middle">Dark</span>
                                </label>
                                <label class="dropdown-item cursor-pointer">
                                    <input class="form-check-input" type="radio" name="data-bs-theme" value="system"
                                        style="display: none" />
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
                            <button class="topbar-link dropdown-toggle drop-arrow-none" data-bs-toggle="dropdown"
                                type="button" data-bs-auto-close="outside" aria-haspopup="false" aria-expanded="false">
                                <i class="ti ti-bell topbar-link-icon animate-ring"></i>
                                <span class="badge text-bg-danger badge-circle topbar-badge">5</span>
                            </button>

                            <div class="dropdown-menu p-0 dropdown-menu-end dropdown-menu-lg">
                                <div class="px-3 py-2 border-bottom">
                                    <div class="row align-items-center">
                                        <div class="col">
                                            <h6 class="m-0 fs-md fw-semibold">Notifications</h6>
                                        </div>
                                        <div class="col text-end">
                                            <a href="#!" class="badge badge-soft-success badge-label py-1">07
                                                Notifications</a>
                                        </div>
                                    </div>
                                </div>

                                <div style="max-height: 300px" data-simplebar="">
                                    <!-- Notification 1 -->
                                    <div class="dropdown-item notification-item py-2 text-wrap" id="message-1">
                                        <span class="d-flex align-items-center gap-3">
                                            <span class="flex-shrink-0 position-relative">
                                                <img :src="avatarImage"
                                                    class="avatar-md rounded-circle" alt="User Avatar" />
                                                <span
                                                    class="position-absolute rounded-pill bg-success notification-badge">
                                                    <i class="ti ti-bell align-middle"></i>
                                                    <span class="visually-hidden">unread notification</span>
                                                </span>
                                            </span>
                                            <span class="flex-grow-1 text-muted">
                                                <span class="fw-medium text-body">Emily Johnson</span>
                                                commented on a task in
                                                <span class="fw-medium text-body">Design Sprint</span>
                                                <br />
                                                <span class="fs-xs">12 minutes ago</span>
                                            </span>
                                            <button type="button"
                                                class="flex-shrink-0 text-muted btn btn-link p-0 position-absolute end-0 me-2 d-none noti-close-btn"
                                                data-dismissible="#message-1">
                                                <i class="ti ti-square-rounded-x fs-xxl"></i>
                                            </button>
                                        </span>
                                    </div>

                                    <!-- Notification 2 -->
                                    <div class="dropdown-item notification-item py-2 text-wrap" id="message-2">
                                        <span class="d-flex align-items-center gap-3">
                                            <span class="flex-shrink-0 position-relative">
                                                <img :src="avatarImage"
                                                    class="avatar-md rounded-circle" alt="User Avatar" />
                                                <span class="position-absolute rounded-pill bg-info notification-badge">
                                                    <i class="ti ti-cloud-upload align-middle"></i>
                                                    <span class="visually-hidden">upload notification</span>
                                                </span>
                                            </span>
                                            <span class="flex-grow-1 text-muted">
                                                <span class="fw-medium text-body">Michael Lee</span>
                                                uploaded files to
                                                <span class="fw-medium text-body">Marketing Assets</span>
                                                <br />
                                                <span class="fs-xs">25 minutes ago</span>
                                            </span>
                                            <button type="button"
                                                class="flex-shrink-0 text-muted btn btn-link p-0 position-absolute end-0 me-2 d-none noti-close-btn"
                                                data-dismissible="#message-2">
                                                <i class="ti ti-square-rounded-x fs-xxl"></i>
                                            </button>
                                        </span>
                                    </div>

                                    <!-- Notification 3 - Server CPU Alert -->
                                    <div class="dropdown-item notification-item py-2 text-wrap" id="message-6">
                                        <span class="d-flex align-items-center gap-3">
                                            <span class="flex-shrink-0 position-relative">
                                                <span
                                                    class="avatar-md rounded-circle bg-light d-flex align-items-center justify-content-center">
                                                    <i class="ti ti-database fs-4"></i>
                                                </span>
                                                <span
                                                    class="position-absolute rounded-pill bg-danger notification-badge">
                                                    <i class="ti ti-alert-circle align-middle"></i>
                                                    <span class="visually-hidden">server alert</span>
                                                </span>
                                            </span>
                                            <span class="flex-grow-1 text-muted">
                                                <span class="fw-medium text-body">Server #3</span>
                                                CPU usage exceeded 90%
                                                <br />
                                                <span class="fs-xs">Just now</span>
                                            </span>
                                            <button type="button"
                                                class="flex-shrink-0 text-muted btn btn-link p-0 position-absolute end-0 me-2 d-none noti-close-btn"
                                                data-dismissible="#message-6">
                                                <i class="ti ti-square-rounded-x fs-xxl"></i>
                                            </button>
                                        </span>
                                    </div>

                                    <!-- Notification 4 -->
                                    <div class="dropdown-item notification-item py-2 text-wrap" id="message-3">
                                        <span class="d-flex align-items-center gap-3">
                                            <span class="flex-shrink-0 position-relative">
                                                <img :src="avatarImage"
                                                    class="avatar-md rounded-circle" alt="User Avatar" />
                                                <span
                                                    class="position-absolute rounded-pill bg-warning notification-badge">
                                                    <i class="ti ti-alert-triangle align-middle"></i>
                                                    <span class="visually-hidden">alert</span>
                                                </span>
                                            </span>
                                            <span class="flex-grow-1 text-muted">
                                                <span class="fw-medium text-body">Sophia Ray</span>
                                                flagged an issue in
                                                <span class="fw-medium text-body">Bug Tracker</span>
                                                <br />
                                                <span class="fs-xs">40 minutes ago</span>
                                            </span>
                                            <button type="button"
                                                class="flex-shrink-0 text-muted btn btn-link p-0 position-absolute end-0 me-2 d-none noti-close-btn"
                                                data-dismissible="#message-3">
                                                <i class="ti ti-square-rounded-x fs-xxl"></i>
                                            </button>
                                        </span>
                                    </div>

                                    <!-- Notification 5 -->
                                    <div class="dropdown-item notification-item py-2 text-wrap" id="message-4">
                                        <span class="d-flex align-items-center gap-3">
                                            <span class="flex-shrink-0 position-relative">
                                                <img :src="avatarImage"
                                                    class="avatar-md rounded-circle" alt="User Avatar" />
                                                <span
                                                    class="position-absolute rounded-pill bg-primary notification-badge">
                                                    <i class="ti ti-calendar-event align-middle"></i>
                                                    <span class="visually-hidden">event notification</span>
                                                </span>
                                            </span>
                                            <span class="flex-grow-1 text-muted">
                                                <span class="fw-medium text-body">David Kim</span>
                                                scheduled a meeting for
                                                <span class="fw-medium text-body">UX Review</span>
                                                <br />
                                                <span class="fs-xs">1 hour ago</span>
                                            </span>
                                            <button type="button"
                                                class="flex-shrink-0 text-muted btn btn-link p-0 position-absolute end-0 me-2 d-none noti-close-btn"
                                                data-dismissible="#message-4">
                                                <i class="ti ti-square-rounded-x fs-xxl"></i>
                                            </button>
                                        </span>
                                    </div>

                                    <!-- Notification 6 -->
                                    <div class="dropdown-item notification-item py-2 text-wrap" id="message-5">
                                        <span class="d-flex align-items-center gap-3">
                                            <span class="flex-shrink-0 position-relative">
                                                <img :src="avatarImage"
                                                    class="avatar-md rounded-circle" alt="User Avatar" />
                                                <span
                                                    class="position-absolute rounded-pill bg-secondary notification-badge">
                                                    <i class="ti ti-edit align-middle"></i>
                                                    <span class="visually-hidden">edit</span>
                                                </span>
                                            </span>
                                            <span class="flex-grow-1 text-muted">
                                                <span class="fw-medium text-body">Isabella White</span>
                                                updated the document in
                                                <span class="fw-medium text-body">Product Specs</span>
                                                <br />
                                                <span class="fs-xs">2 hours ago</span>
                                            </span>
                                            <button type="button"
                                                class="flex-shrink-0 text-muted btn btn-link p-0 position-absolute end-0 me-2 d-none noti-close-btn"
                                                data-dismissible="#message-5">
                                                <i class="ti ti-square-rounded-x fs-xxl"></i>
                                            </button>
                                        </span>
                                    </div>

                                    <!-- Notification 7 - Deployment Success -->
                                    <div class="dropdown-item notification-item py-2 text-wrap" id="message-7">
                                        <span class="d-flex align-items-center gap-3">
                                            <span class="flex-shrink-0 position-relative">
                                                <span
                                                    class="avatar-md rounded-circle bg-light d-flex align-items-center justify-content-center">
                                                    <i class="ti ti-rocket fs-4"></i>
                                                </span>
                                                <span
                                                    class="position-absolute rounded-pill bg-success notification-badge">
                                                    <i class="ti ti-check align-middle"></i>
                                                    <span class="visually-hidden">deployment</span>
                                                </span>
                                            </span>
                                            <span class="flex-grow-1 text-muted">
                                                <span class="fw-medium text-body">Production Server</span>
                                                deployment completed successfully
                                                <br />
                                                <span class="fs-xs">30 minutes ago</span>
                                            </span>
                                            <button type="button"
                                                class="flex-shrink-0 text-muted btn btn-link p-0 position-absolute end-0 me-2 d-none noti-close-btn"
                                                data-dismissible="#message-7">
                                                <i class="ti ti-square-rounded-x fs-xxl"></i>
                                            </button>
                                        </span>
                                    </div>
                                </div>

                                <!-- All-->
                                <a href="javascript:void(0);"
                                    class="dropdown-item text-center text-reset text-decoration-underline link-offset-2 fw-bold notify-item border-top border-light py-2">Read
                                    All Messages</a>
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
                        <button class="topbar-link btn-theme-setting" data-bs-toggle="offcanvas"
                            data-bs-target="#theme-settings-offcanvas" type="button">
                            <i class="ti ti-settings topbar-link-icon"></i>
                        </button>
                    </div>

                    <div id="language-selector-rounded" class="topbar-item">
                        <div class="dropdown">
                            <button class="topbar-link fw-bold" data-bs-toggle="dropdown" type="button"
                                aria-haspopup="false" aria-expanded="false">
                                <img :src="currentLanguage.flag" alt="user-image" class="me-2"
                                    height="18" width="30" id="selected-language-image" />
                                <span id="selected-language-code">{{ currentLanguage.code }}</span>
                            </button>
                            <div class="dropdown-menu dropdown-menu-end">
                                <a v-for="lang in availableLanguages" :key="lang.locale"
                                    href="javascript:void(0);" 
                                    class="dropdown-item" 
                                    :class="{ 'active': currentLanguage.locale === lang.locale }"
                                    @click="switchLanguage(lang.locale)"
                                    :title="lang.name">
                                    <img :src="lang.flag" :alt="lang.name" class="me-1"
                                        height="18" width="30" />
                                    <span class="align-middle">{{ lang.name }}</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div id="user-dropdown-detailed" class="topbar-item nav-user">
                        <div class="dropdown">
                            <a class="topbar-link dropdown-toggle drop-arrow-none px-2" data-bs-toggle="dropdown"
                                href="#!" aria-haspopup="false" aria-expanded="false">
                                <img :src="avatarImage" width="32"
                                    class="rounded-circle me-lg-2 d-flex" alt="user-image" />
                                <div class="d-lg-flex align-items-center gap-1 d-none">
                                    <span>
                                        <h5 class="my-0 lh-1 pro-username">{{ user.name }}</h5>
                                        <span class="fs-xs lh-1">{{ user.username }}</span>
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
                                <a href="#!" class="dropdown-item">
                                    <i class="ti ti-user-circle me-1 fs-lg align-middle"></i>
                                    <span class="align-middle">Profile</span>
                                </a>

                                <!-- Notifications -->
                                <a href="javascript:void(0);" class="dropdown-item">
                                    <i class="ti ti-bell-ringing me-1 fs-lg align-middle"></i>
                                    <span class="align-middle">Notifications</span>
                                </a>

                                <!-- Settings -->
                                <a href="javascript:void(0);" class="dropdown-item">
                                    <i class="ti ti-settings-2 me-1 fs-lg align-middle"></i>
                                    <span class="align-middle">Account Settings</span>
                                </a>

                                <!-- Divider -->
                                <div class="dropdown-divider"></div>

                                <!-- Lock -->
                                <a href="" class="dropdown-item">
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
import { ref, onMounted, computed } from 'vue'
import { logoImg, avatarImage, iconImage } from '@/utils/ui-utils'
import { useI18n } from '@/composables/useI18n'
import { useAuthStore } from '@/stores/auth'
import { useSidebarToggle } from '@/composables/sidebar-toggle'

const authStore = useAuthStore()
const user = computed(() => authStore.user)

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
        flag: '/assets/images/flags/us.svg'
    },
    {
        locale: 'fr-FR',
        code: 'FR',
        name: 'Français',
        flag: '/assets/images/flags/fr.svg'
    }
]

const currentLanguage = computed(() => {
    return availableLanguages.find(lang => lang.locale === locale.value) || availableLanguages[0]
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

// Sidebar toggle
const { toggleSidebar } = useSidebarToggle()

// Get system theme preference
const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Update theme icon visibility
const updateThemeIcon = (theme: string) => {
    const lightIcon = document.getElementById('theme-icon-light')
    const darkIcon = document.getElementById('theme-icon-dark')
    const systemIcon = document.getElementById('theme-icon-system')
    
    // Hide all icons first
    lightIcon?.classList.add('d-none')
    darkIcon?.classList.add('d-none')
    systemIcon?.classList.add('d-none')
    
    // Show the appropriate icon
    if (theme === 'light') {
        lightIcon?.classList.remove('d-none')
    } else if (theme === 'dark') {
        darkIcon?.classList.remove('d-none')
    } else if (theme === 'system') {
        systemIcon?.classList.remove('d-none')
    }
}

// Change theme
const changeTheme = (theme: string) => {
    currentTheme.value = theme
    
    // Get window config
    const config = (window as any).config || {}
    config.theme = theme
    
    // Apply theme to HTML element
    const html = document.documentElement
    const actualTheme = theme === 'system' ? getSystemTheme() : theme
    html.setAttribute('data-bs-theme', actualTheme)
    
    // Save to sessionStorage
    sessionStorage.setItem('__THEME_CONFIG__', JSON.stringify(config))
    
    // Update icon
    updateThemeIcon(theme)
    
    // Update radio buttons
    const radios = document.querySelectorAll('input[name="data-bs-theme"]')
    radios.forEach((radio: any) => {
        radio.checked = radio.value === theme
    })
}

// Toggle monochrome mode
const toggleMonochrome = () => {
    isMonochrome.value = !isMonochrome.value
    
    // Get window config
    const config = (window as any).config || {}
    config.monochrome = isMonochrome.value
    
    // Apply monochrome class to HTML element
    const html = document.documentElement
    if (isMonochrome.value) {
        html.classList.add('monochrome')
    } else {
        html.classList.remove('monochrome')
    }
    
    // Save to sessionStorage
    sessionStorage.setItem('__THEME_CONFIG__', JSON.stringify(config))
}

// Initialize theme on mount
onMounted(() => {
    try {
        // Get saved theme from config
        const savedConfig = sessionStorage.getItem('__THEME_CONFIG__')
        let theme = 'light'
        let monochrome = false
        let sidenavSize = 'on-hover-active'
        
        if (savedConfig) {
            const config = JSON.parse(savedConfig)
            theme = config.theme || 'light'
            monochrome = config.monochrome || false
            sidenavSize = config['sidenav-size'] || 'on-hover-active'
        } else if ((window as any).config) {
            theme = (window as any).config.theme || 'light'
            monochrome = (window as any).config.monochrome || false
            sidenavSize = (window as any).config['sidenav-size'] || 'on-hover-active'
        }
        
        // Initialize theme
        currentTheme.value = theme
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
        
        // Initialize monochrome
        isMonochrome.value = monochrome
        if (monochrome) {
            document.documentElement.classList.add('monochrome')
        }
        
        // Set the correct radio button as checked
        const radios = document.querySelectorAll('input[name="data-bs-theme"]')
        radios.forEach((radio: any) => {
            radio.checked = radio.value === theme
        })
        
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
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (currentTheme.value === 'system') {
                    document.documentElement.setAttribute('data-bs-theme', e.matches ? 'dark' : 'light')
                }
            })
        }
    } catch (e) {
        console.warn('Unable to initialize theme:', e)
    }
})
</script>
<style scoped>
.logo-lg img{
    height: 50px !important;
}
</style>