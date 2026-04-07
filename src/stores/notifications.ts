import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { axiosInstance } from '@/plugins/axios'
import { echo } from '@/plugins/echo'
import { appConfig } from '@/config/app'
import type { AppNotification, NotificationsMeta } from '@/types'

export const useNotificationStore = defineStore('notifications', () => {
  // ── State ─────────────────────────────────────────────────────────────────
  const notifications = ref<AppNotification[]>([])
  const meta = ref<NotificationsMeta>({
    unread_count: 0,
    total: 0,
    current_page: 1,
    last_page: 1,
    per_page: 20,
  })
  const loading = ref(false)
  /** IDs of notifications currently being actioned (mark-read or delete) */
  const actioningIds = ref<Set<string>>(new Set())
  /** True while mark-all-read is in flight */
  const markingAll = ref(false)
  let echoChannel: ReturnType<typeof echo.private> | null = null

  // ── Computed ──────────────────────────────────────────────────────────────
  const unreadCount = computed(() => meta.value.unread_count)
  const hasUnread = computed(() => meta.value.unread_count > 0)
  const isActioning = (id: string) => actioningIds.value.has(id)

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Fetch paginated notifications */
  async function fetchNotifications(page = 1, unreadOnly = false) {
    loading.value = true
    try {
      const params: Record<string, string | number> = { page, per_page: meta.value.per_page }
      if (unreadOnly) params.unread_only = 1

      const res = await axiosInstance.get(`${appConfig.apiUrl}/notifications`, { params })
      notifications.value = res.data.data
      meta.value = res.data.meta
    } finally {
      loading.value = false
    }
  }

  /** Lightweight fetch — updates only the badge counter (fallback / initial load) */
  async function fetchUnreadCount() {
    try {
      const res = await axiosInstance.get(`${appConfig.apiUrl}/notifications/unread-count`)
      meta.value.unread_count = res.data.unread_count
    } catch {
      // silently ignore
    }
  }

  /**
   * Subscribe to the authenticated user's private Echo channel.
   * Real-time notifications arrive instantly; we prepend them to the list
   * and increment the badge without an extra API call.
   */
  function connect(userId: number) {
    if (echoChannel) return // already connected

    echoChannel = echo.private(`App.Models.User.${userId}`)

    echoChannel.notification((payload: Record<string, unknown>) => {
      // Build an AppNotification from the broadcast payload
      const incoming: AppNotification = {
        id: payload.id as string,
        type: payload.type as string,
        notifiable_type: 'App\\Models\\User',
        notifiable_id: userId,
        data: {
          type: (payload.notification_type ?? '') as string,
          title: (payload.title ?? '') as string,
          body: (payload.body ?? '') as string,
          icon: (payload.icon ?? 'ti-bell') as string,
          color: (payload.color ?? 'primary') as string,
          resource_type: (payload.resource_type ?? 'transaction') as string,
          resource_id: (payload.resource_id ?? '') as string,
          reference: (payload.reference ?? '') as string,
          amount: (payload.amount ?? 0) as number,
          currency_code: (payload.currency_code ?? '') as string,
          status: (payload.status ?? '') as string,
          branch_id: (payload.branch_id ?? null) as number,
        },
        read_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      notifications.value.unshift(incoming)
      meta.value.unread_count++
      meta.value.total++
    })
  }

  /** Unsubscribe — call on logout or component unmount */
  function disconnect() {
    if (!echoChannel) return
    echo.leave(`App.Models.User.${(echoChannel as any).name?.replace('private-App.Models.User.', '')}`)
    echoChannel = null
  }

  /** Mark a single notification as read */
  async function markAsRead(id: string) {
    if (actioningIds.value.has(id)) return
    actioningIds.value = new Set([...actioningIds.value, id])
    try {
      await axiosInstance.post(`${appConfig.apiUrl}/notifications/${id}/mark-read`)
      const n = notifications.value.find((x) => x.id === id)
      if (n && !n.read_at) {
        n.read_at = new Date().toISOString()
        meta.value.unread_count = Math.max(0, meta.value.unread_count - 1)
      }
    } finally {
      const next = new Set(actioningIds.value)
      next.delete(id)
      actioningIds.value = next
    }
  }

  /** Mark all notifications as read */
  async function markAllAsRead() {
    if (markingAll.value) return
    markingAll.value = true
    try {
      await axiosInstance.post(`${appConfig.apiUrl}/notifications/mark-all-read`)
      notifications.value.forEach((n) => {
        if (!n.read_at) n.read_at = new Date().toISOString()
      })
      meta.value.unread_count = 0
    } finally {
      markingAll.value = false
    }
  }

  /** Delete a single notification */
  async function remove(id: string) {
    if (actioningIds.value.has(id)) return
    actioningIds.value = new Set([...actioningIds.value, id])
    try {
      await axiosInstance.delete(`${appConfig.apiUrl}/notifications/${id}`)
      const idx = notifications.value.findIndex((x) => x.id === id)
      if (idx !== -1) {
        const wasUnread = !notifications.value[idx]?.read_at
        notifications.value.splice(idx, 1)
        meta.value.total = Math.max(0, meta.value.total - 1)
        if (wasUnread) meta.value.unread_count = Math.max(0, meta.value.unread_count - 1)
      }
    } finally {
      const next = new Set(actioningIds.value)
      next.delete(id)
      actioningIds.value = next
    }
  }

  /** Delete all read notifications */
  async function clearRead() {
    await axiosInstance.delete(`${appConfig.apiUrl}/notifications/clear-read`)
    notifications.value = notifications.value.filter((n) => !n.read_at)
    meta.value.total = notifications.value.length
  }

  return {
    notifications,
    meta,
    loading,
    markingAll,
    isActioning,
    unreadCount,
    hasUnread,
    fetchNotifications,
    fetchUnreadCount,
    connect,
    disconnect,
    markAsRead,
    markAllAsRead,
    remove,
    clearRead,
  }
})
