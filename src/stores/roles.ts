import { defineStore } from 'pinia'
import { axiosInstance } from '@/plugins/axios'
import { appConfig } from '@/config/app'
import type { Role, Permission, PermissionModule } from '@/types/roles'
import { handleError } from '@/utils/notification'

export const useRolesStore = defineStore('roles', {
  state: () => ({
    roles: [] as Role[],
    permissions: [] as Permission[],
    permissionsGrouped: [] as PermissionModule[],
    loading: false,
    permissionsLoading: false,
  }),

  actions: {
    async fetchRoles() {
      this.loading = true
      try {
        const res = await axiosInstance.get(`${appConfig.apiUrl}/roles`)
        this.roles = res.data.data
      } catch (e) {
        handleError(e)
      } finally {
        this.loading = false
      }
    },

    async fetchPermissions() {
      this.permissionsLoading = true
      try {
        const res = await axiosInstance.get(`${appConfig.apiUrl}/permissions`)
        this.permissions = res.data.data
        this.permissionsGrouped = res.data.grouped
      } catch (e) {
        handleError(e)
      } finally {
        this.permissionsLoading = false
      }
    },

    async createRole(data: { name: string; description: string; permission_ids: number[] }) {
      const res = await axiosInstance.post(`${appConfig.apiUrl}/roles`, data)
      this.roles.push(res.data.data)
      return res.data.data as Role
    },

    async updateRole(id: number, data: { name: string; description: string }) {
      const res = await axiosInstance.put(`${appConfig.apiUrl}/roles/${id}`, data)
      const idx = this.roles.findIndex((r) => r.id === id)
      if (idx !== -1) this.roles[idx] = res.data.data
      return res.data.data as Role
    },

    async deleteRole(id: number) {
      await axiosInstance.delete(`${appConfig.apiUrl}/roles/${id}`)
      this.roles = this.roles.filter((r) => r.id !== id)
    },

    async syncRolePermissions(roleId: number, permissionIds: number[]) {
      const res = await axiosInstance.put(`${appConfig.apiUrl}/roles/${roleId}/permissions`, {
        permission_ids: permissionIds,
      })
      const idx = this.roles.findIndex((r) => r.id === roleId)
      if (idx !== -1) this.roles[idx] = res.data.data
      return res.data.data as Role
    },

    async createPermission(data: { name: string; group: string; module_name: string }) {
      const res = await axiosInstance.post(`${appConfig.apiUrl}/permissions`, data)
      await this.fetchPermissions()
      return res.data.data as Permission
    },

    async updatePermission(id: number, data: { name: string; group: string; module_name: string }) {
      const res = await axiosInstance.put(`${appConfig.apiUrl}/permissions/${id}`, data)
      await this.fetchPermissions()
      return res.data.data as Permission
    },

    async deletePermission(id: number) {
      await axiosInstance.delete(`${appConfig.apiUrl}/permissions/${id}`)
      await this.fetchPermissions()
    },

    async getUserPermissions(userId: number) {
      const res = await axiosInstance.get(`${appConfig.apiUrl}/users/${userId}/permissions`)
      return res.data as { direct_permissions: Permission[]; role_permissions: Permission[] }
    },

    async syncUserPermissions(userId: number, permissionIds: number[]) {
      const res = await axiosInstance.put(`${appConfig.apiUrl}/users/${userId}/permissions`, {
        permission_ids: permissionIds,
      })
      return res.data.direct_permissions as Permission[]
    },
  },
})
