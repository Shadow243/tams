import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { avatarImage as defaultAvatar } from '@/utils/ui-utils'

/**
 * Composable to get the current user's avatar with reactive updates
 */
export function useUserAvatar() {
  const authStore = useAuthStore()

  const userAvatar = computed(() => {
    const avatarUrl = authStore.user?.avatar?.full
    
    if (!avatarUrl) {
      return defaultAvatar
    }
    
    // Add user's updated_at timestamp to force reload when avatar changes
    // This bypasses browser cache without constantly reloading
    const timestamp = authStore.user?.updated_at 
      ? new Date(authStore.user.updated_at).getTime() 
      : Date.now()
    const separator = avatarUrl.includes('?') ? '&' : '?'
    return `${avatarUrl}${separator}v=${timestamp}`
  })

  return {
    userAvatar
  }
}
