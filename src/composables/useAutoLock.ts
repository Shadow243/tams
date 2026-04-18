import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useLockScreenStore } from '@/stores/lockscreen'
import { useUserSettings } from '@/composables/useUserSettings'

export function useAutoLock() {
  const authStore = useAuthStore()
  const lockStore = useLockScreenStore()
  const { settings: userSettings } = useUserSettings()

  let inactivityTimer: ReturnType<typeof setTimeout> | null = null
  let autoLockMinutes = ref(0)

  // Events that indicate user activity
  const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']

  const resetInactivityTimer = () => {
    // Don't track if screen is already locked
    if (lockStore.isScreenLocked) {
      return
    }

    // Clear existing timer
    if (inactivityTimer) {
      clearTimeout(inactivityTimer)
    }

    // Get auto-lock setting with safety checks
    const lockMinutes = userSettings.value?.security?.autoLockMinutes ?? 0
    autoLockMinutes.value = lockMinutes

    // If auto-lock is disabled (0), don't set a timer
    if (lockMinutes === 0) {
      return
    }

    // Set new timer
    const lockTimeMs = lockMinutes * 60 * 1000 // Convert minutes to milliseconds
    inactivityTimer = setTimeout(() => {
      lockScreen()
    }, lockTimeMs)
  }

  const lockScreen = () => {
    // Lock the screen using the lock store
    if (authStore.isAuthenticated && !lockStore.isScreenLocked) {
      lockStore.lock()
    }
  }

  const startTracking = () => {
    // Don't start if not authenticated or screen is locked
    if (!authStore.isAuthenticated || lockStore.isScreenLocked) {
      return
    }

    // Add event listeners for activity
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer, true)
    })

    // Start the initial timer
    resetInactivityTimer()
  }

  const stopTracking = () => {
    // Remove event listeners
    activityEvents.forEach((event) => {
      window.removeEventListener(event, resetInactivityTimer, true)
    })

    // Clear timer
    if (inactivityTimer) {
      clearTimeout(inactivityTimer)
      inactivityTimer = null
    }
  }

  // Watch for changes in auto-lock settings
  watch(
    () => userSettings.value?.security?.autoLockMinutes,
    (newValue) => {
      autoLockMinutes.value = newValue ?? 0
      // Restart tracking with new settings
      stopTracking()
      if (authStore.isAuthenticated && !lockStore.isScreenLocked) {
        startTracking()
      }
    }
  )

  // Watch for authentication status
  watch(
    () => authStore.isAuthenticated,
    (isAuthenticated) => {
      if (isAuthenticated && !lockStore.isScreenLocked) {
        startTracking()
      } else {
        stopTracking()
      }
    },
    { immediate: true }
  )

  // Watch for lock screen status
  watch(
    () => lockStore.isScreenLocked,
    (isLocked) => {
      if (isLocked) {
        stopTracking()
      } else if (authStore.isAuthenticated) {
        startTracking()
      }
    }
  )

  onMounted(() => {
    if (authStore.isAuthenticated && !lockStore.isScreenLocked) {
      startTracking()
    }
  })

  onUnmounted(() => {
    stopTracking()
  })

  return {
    autoLockMinutes,
    resetInactivityTimer,
    startTracking,
    stopTracking,
    lockScreen,
  }
}
