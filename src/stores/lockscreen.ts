import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

export const useLockScreenStore = defineStore('lockscreen', () => {
  // State
  const isLocked = ref(false)
  const lockedAt = ref<Date | null>(null)
  const unlockAttempts = ref(0)
  const maxAttempts = 5
  const lockTimeout = ref<NodeJS.Timeout | null>(null)

  // Reactive clock — updated every second so lockDuration stays live
  const now = ref(new Date())
  let clockInterval: ReturnType<typeof setInterval> | null = null

  function startClock() {
    if (clockInterval) return
    clockInterval = setInterval(() => { now.value = new Date() }, 1000)
  }

  function stopClock() {
    if (clockInterval) {
      clearInterval(clockInterval)
      clockInterval = null
    }
  }

  // Getters
  const isScreenLocked = computed(() => isLocked.value)
  const canAttemptUnlock = computed(() => unlockAttempts.value < maxAttempts)
  const remainingAttempts = computed(() => Math.max(0, maxAttempts - unlockAttempts.value))
  const isBlocked = computed(() => unlockAttempts.value >= maxAttempts)

  const lockDuration = computed(() => {
    if (!lockedAt.value) return '0s'
    const diff = now.value.getTime() - lockedAt.value.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  })

  // Actions
  function lock() {
    isLocked.value = true
    lockedAt.value = new Date()
    unlockAttempts.value = 0
    startClock()

    document.body.classList.add('lockscreen-active')

    sessionStorage.setItem('__LOCKSCREEN_ACTIVE__', 'true')
    sessionStorage.setItem('__LOCKSCREEN_TIME__', lockedAt.value.toISOString())
  }

  function unlock() {
    isLocked.value = false
    lockedAt.value = null
    unlockAttempts.value = 0
    stopClock()

    document.body.classList.remove('lockscreen-active')

    sessionStorage.removeItem('__LOCKSCREEN_ACTIVE__')
    sessionStorage.removeItem('__LOCKSCREEN_TIME__')

    if (lockTimeout.value) {
      clearTimeout(lockTimeout.value)
      lockTimeout.value = null
    }
  }

  async function attemptUnlock(password: string): Promise<boolean> {
    if (!canAttemptUnlock.value) {
      return false
    }

    const authStore = useAuthStore()
    
    try {
      // Validate password with backend
      const isValid = await authStore.validatePassword(password)
      
      if (isValid) {
        unlock()
        return true
      } else {
        unlockAttempts.value++
        
        // If max attempts reached, force logout after delay
        if (unlockAttempts.value >= maxAttempts) {
          lockTimeout.value = setTimeout(() => {
            authStore.logout()
            window.location.href = '/login'
          }, 30000) // 30 seconds
        }
        
        return false
      }
    } catch (error) {
      unlockAttempts.value++
      console.error('Unlock failed:', error)
      return false
    }
  }

  function restoreState() {
    const wasLocked = sessionStorage.getItem('__LOCKSCREEN_ACTIVE__')
    const lockTime = sessionStorage.getItem('__LOCKSCREEN_TIME__')

    if (wasLocked === 'true' && lockTime) {
      isLocked.value = true
      lockedAt.value = new Date(lockTime)
      document.body.classList.add('lockscreen-active')
      startClock()
    }
  }

  function reset() {
    unlock()
  }

  return {
    // State
    isLocked,
    lockedAt,
    unlockAttempts,
    
    // Getters
    isScreenLocked,
    canAttemptUnlock,
    remainingAttempts,
    isBlocked,
    lockDuration,
    
    // Actions
    lock,
    unlock,
    attemptUnlock,
    restoreState,
    reset,
  }
})
