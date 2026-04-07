import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { axiosInstance } from '@/plugins/axios'
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

  // ── Computed ──────────────────────────────────────────────────────────────
  const unreadCount = computed(() => meta.value.unread_count)
  const hasUnread = computed(() => meta.value.unread_count > 0)

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

  /** Lightweight poll — updates only the badge counter */
  async function fetchUnreadCount() {
    try {
      const res = await axiosInstance.get(`${appConfig.apiUrl}/notifications/unread-count`)
      meta.value.unread_count = res.data.unread_count
    } catch {
      // silently ignore — background polling should never crash the app
    }
  }

  /** Mark a single notification as read */
  async function markAsRead(id: string) {
    await axiosInstance.post(`${appConfig.apiUrl}/notifications/${id}/mark-read`)
    const n = notifications.value.find((x) => x.id === id)
    if (n && !n.read_at) {
      n.read_at = new Date().toISOString()
      meta.value.unread_count = Math.max(0, meta.value.unread_count - 1)
    }
  }

  /** Mark all notifications as read */
  async function markAllAsRead() {
    await axiosInstance.post(`${appConfig.apiUrl}/notifications/mark-all-read`)
    notifications.value.forEach((n) => {
      if (!n.read_at) n.read_at = new Date().toISOString()
    })
    meta.value.unread_count = 0
  }

  /** Delete a single notification */
  async function remove(id: string) {
    await axiosInstance.delete(`${appConfig.apiUrl}/notifications/${id}`)
    const idx = notifications.value.findIndex((x) => x.id === id)
    if (idx !== -1) {
      const wasUnread = !notifications.value[idx]?.read_at
      notifications.value.splice(idx, 1)
      meta.value.total = Math.max(0, meta.value.total - 1)
      if (wasUnread) meta.value.unread_count = Math.max(0, meta.value.unread_count - 1)
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
    unreadCount,
    hasUnread,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    remove,
    clearRead,
  }
})
