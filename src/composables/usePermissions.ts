import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export function usePermissions() {
  const authStore = useAuthStore()
  const user = computed(() => authStore.user)

  // ── Rôles ────────────────────────────────────────────────────────────────────
  const isAdmin = computed(() =>
    user.value?.roles?.some(r => r === 'admin' || r === 'super_admin') ?? false
  )

  const isSuperviseur = computed(() =>
    user.value?.roles?.includes('superviseur') ?? false
  )

  const isCaissier = computed(() =>
    user.value?.roles?.includes('caissier') ?? false
  )

  const isAgent = computed(() =>
    user.value?.roles?.includes('agent') ?? false
  )

  // ── CRUD générique — admin seulement ─────────────────────────────────────────
  const canCreate  = computed(() => isAdmin.value)
  const canEdit    = computed(() => isAdmin.value)
  const canDelete  = computed(() => isAdmin.value)

  // ── Transactions ─────────────────────────────────────────────────────────────
  // Agent effectue les transactions, caissier crée les ravitaillements
  const canCreateTransaction   = computed(() => isAdmin.value || isAgent.value || isCaissier.value)
  const canEditTransaction     = computed(() => isAdmin.value)
  // Caissier complète (ravitaillement → paiement sortant)
  const canCompleteTransaction = computed(() => isAdmin.value || isCaissier.value)
  // Superviseur peut annuler
  const canCancelTransaction   = computed(() => isAdmin.value || isSuperviseur.value)

  // ── Visibilité dashboard ──────────────────────────────────────────────────────
  // Filtre de branche : caissier en a besoin pour gérer les ravitaillements entre agences
  const canFilterBranch      = computed(() => isAdmin.value || isSuperviseur.value || isCaissier.value)
  // Classement "Par agence" — vue globale réservée admin/superviseur
  const canSeeBranchRanking  = computed(() => isAdmin.value || isSuperviseur.value)
  // Totaux système — caissier en a besoin pour connaître l'état global des liquidités
  const canSeeSystemTotals   = computed(() => isAdmin.value || isSuperviseur.value || isCaissier.value)
  // Tableau des soldes par agence
  const canSeeBranchBalances = computed(() => isAdmin.value || isSuperviseur.value || isCaissier.value)

  // ── Menu — configurations cachées pour caissier et agent ─────────────────────
  const canSeeConfigurations = computed(() => isAdmin.value)

  // ── Vérification générique de permission ─────────────────────────────────────
  const can = (permission: string): boolean => {
    if (!user.value) return false
    if (isAdmin.value) return true
    return user.value.permissions?.includes(permission) ?? false
  }

  return {
    isAdmin,
    isSuperviseur,
    isCaissier,
    isAgent,
    canCreate,
    canEdit,
    canDelete,
    canCreateTransaction,
    canEditTransaction,
    canCompleteTransaction,
    canCancelTransaction,
    canFilterBranch,
    canSeeBranchRanking,
    canSeeSystemTotals,
    canSeeBranchBalances,
    canSeeConfigurations,
    can,
  }
}
