export interface Permission {
  id: number
  name: string
  group: string | null
  module_name: string | null
  guard_name: string
  created_at: string
  updated_at: string
}

export interface PermissionGroup {
  group: string
  permissions: Permission[]
}

export interface PermissionModule {
  module_name: string
  groups: PermissionGroup[]
}

export interface Role {
  id: number
  name: string
  description: string | null
  guard_name: string
  permissions: Permission[]
  users_count?: number
  created_at: string
  updated_at: string
}

export interface RoleFormData {
  name: string
  description: string
  permission_ids: number[]
}

export interface PermissionFormData {
  name: string
  group: string
  module_name: string
}
