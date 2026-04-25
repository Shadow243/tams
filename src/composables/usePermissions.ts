import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export function usePermissions() {
  const authStore = useAuthStore()
  const user = computed(() => authStore.user)

  const isAdmin = computed(() =>
    user.value?.roles?.some(r => r === 'admin' || r === 'super_admin') ?? false
  )

  const isCaissier = computed(() =>
    user.value?.roles?.includes('caissier') ?? false
  )

  // Generic CRUD — admin only
  const canCreate  = computed(() => isAdmin.value)
  const canEdit    = computed(() => isAdmin.value)
  const canDelete  = computed(() => isAdmin.value)

  // Transactions — caissier peut créer/compléter mais pas éditer
  const canCreateTransaction   = computed(() => isAdmin.value || isCaissier.value)
  const canEditTransaction     = computed(() => isAdmin.value)
  const canCompleteTransaction = computed(() => isAdmin.value || isCaissier.value)
  const canCancelTransaction   = computed(() => isAdmin.value || isCaissier.value)

  // Menu — caissier voit Accueil + Applications (pas Configurations)
  const canSeeConfigurations = computed(() => isAdmin.value)

  return {
    isAdmin,
    isCaissier,
    canCreate,
    canEdit,
    canDelete,
    canCreateTransaction,
    canEditTransaction,
    canCompleteTransaction,
    canCancelTransaction,
    canSeeConfigurations,
  }
}
