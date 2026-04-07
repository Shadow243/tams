export interface AppNotification {
  id: string
  type: string
  notifiable_type: string
  notifiable_id: number
  data: {
    type: string
    title: string
    body: string
    icon: string
    color: string
    resource_type: string
    resource_id: string
    reference: string
    amount: number
    currency_code: string
    status: string
    branch_id: number
  }
  read_at: string | null
  created_at: string
  updated_at: string
}

export interface NotificationsMeta {
  unread_count: number
  total: number
  current_page: number
  last_page: number
  per_page: number
}
