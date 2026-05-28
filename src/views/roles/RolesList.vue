<template>
  <div class="row">
    <div class="col-12">
      <!-- Page header -->
      <div class="d-flex align-items-sm-center flex-sm-row flex-column my-3">
        <div class="flex-grow-1">
          <h4 class="fs-xl mb-1">{{ t('roles.page_title') }}</h4>
          <p class="text-muted mb-0">{{ t('roles.page_description') }}</p>
        </div>
      </div>

      <!-- Tabs -->
      <ul class="nav nav-tabs mb-3">
        <li class="nav-item">
          <button class="nav-link" :class="{ active: activeTab === 'roles' }" @click="activeTab = 'roles'">
            <i class="ti ti-shield me-1"></i>{{ t('roles.tab_roles') }}
            <span class="badge bg-secondary ms-1">{{ store.roles.length }}</span>
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" :class="{ active: activeTab === 'permissions' }" @click="switchToPermissions">
            <i class="ti ti-key me-1"></i>{{ t('roles.tab_permissions') }}
            <span class="badge bg-secondary ms-1">{{ store.permissions.length }}</span>
          </button>
        </li>
      </ul>

      <!-- ── Roles tab ── -->
      <div v-if="activeTab === 'roles'" class="card">
        <div class="card-header border-light justify-content-between">
          <div class="d-flex gap-2 flex-wrap">
            <div class="app-search">
              <input
                v-model="roleSearch"
                type="search"
                class="form-control"
                :placeholder="t('common.search') + '...'"
              />
              <i class="ti ti-search app-search-icon text-muted"></i>
            </div>
          </div>
          <div class="d-flex align-items-center gap-2">
            <button type="button" @click="store.fetchRoles()" class="btn btn-primary" :title="t('common.refresh')">
              <i class="ti ti-refresh"></i>
            </button>
            <button @click="openRoleForm(null)" class="btn btn-success">
              <i class="ti ti-plus me-1"></i>{{ t('roles.add_role') }}
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-custom table-centered table-hover w-100 mb-0">
            <thead class="bg-light bg-opacity-25 thead-sm">
              <tr class="text-uppercase fs-xxs">
                <th style="width: 4%">#</th>
                <th>{{ t('roles.name') }}</th>
                <th>{{ t('roles.description') }}</th>
                <th class="text-center">{{ t('roles.permissions_count') }}</th>
                <th class="text-center">{{ t('roles.users_count') }}</th>
                <th class="text-center">{{ t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody v-if="store.loading">
              <tr>
                <td colspan="6" class="text-center py-5">
                  <div class="d-flex justify-content-center align-items-center">
                    <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
            <tbody v-else-if="filteredRoles.length === 0">
              <tr>
                <td colspan="6" class="text-center py-5">
                  <i class="ti ti-shield-off fs-48 d-block mb-2 text-muted"></i>
                  <span class="text-muted">{{ t('roles.no_roles') }}</span>
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr v-for="(role, index) in filteredRoles" :key="role.id">
                <td>{{ index + 1 }}</td>
                <td>
                  <span class="fw-semibold">{{ role.name }}</span>
                </td>
                <td class="text-muted">{{ role.description || '—' }}</td>
                <td class="text-center">
                  <span class="badge badge-soft-primary">{{ role.permissions.length }}</span>
                </td>
                <td class="text-center">
                  <span class="badge badge-soft-secondary">{{ role.users_count ?? 0 }}</span>
                </td>
                <td>
                  <div class="d-flex align-items-center justify-content-center gap-1">
                    <a
                      href="javascript:void(0);"
                      @click="openRoleForm(role)"
                      class="btn btn-success btn-icon btn-sm"
                      :title="t('common.edit')"
                    >
                      <i class="ti ti-edit fs-lg"></i>
                    </a>
                    <a
                      href="javascript:void(0);"
                      @click="confirmDeleteRole(role)"
                      class="btn btn-danger btn-icon btn-sm"
                      :class="{ disabled: (role.users_count ?? 0) > 0 }"
                      :title="t('common.delete')"
                    >
                      <i class="ti ti-trash fs-lg"></i>
                    </a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card-footer border-0">
          <div class="text-muted">
            <span class="fw-semibold">{{ filteredRoles.length }}</span> {{ t('roles.tab_roles').toLowerCase() }}
          </div>
        </div>
      </div>

      <!-- ── Permissions tab ── -->
      <div v-if="activeTab === 'permissions'" class="card">
        <div class="card-header border-light justify-content-between">
          <div class="d-flex gap-2 flex-wrap">
            <div class="app-search">
              <input
                v-model="permSearch"
                type="search"
                class="form-control"
                :placeholder="t('common.search') + '...'"
              />
              <i class="ti ti-search app-search-icon text-muted"></i>
            </div>
            <div class="app-search">
              <select v-model="permModuleFilter" class="form-select form-control my-1 my-md-0">
                <option value="">{{ t('permissions.all_modules') }}</option>
                <option v-for="m in allModules" :key="m" :value="m">{{ m }}</option>
              </select>
              <i class="ti ti-folder app-search-icon text-muted"></i>
            </div>
          </div>
          <div class="d-flex align-items-center gap-2">
            <button type="button" @click="store.fetchPermissions()" class="btn btn-primary" :title="t('common.refresh')">
              <i class="ti ti-refresh"></i>
            </button>
            <button @click="openPermissionForm(null)" class="btn btn-success">
              <i class="ti ti-plus me-1"></i>{{ t('permissions.add') }}
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-custom table-centered table-hover w-100 mb-0">
            <thead class="bg-light bg-opacity-25 thead-sm">
              <tr class="text-uppercase fs-xxs">
                <th style="width: 4%">#</th>
                <th>{{ t('permissions.name') }}</th>
                <th>{{ t('permissions.group') }}</th>
                <th>{{ t('permissions.module') }}</th>
                <th class="text-center">{{ t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody v-if="store.permissionsLoading">
              <tr>
                <td colspan="5" class="text-center py-5">
                  <div class="d-flex justify-content-center align-items-center">
                    <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
            <tbody v-else-if="filteredPermissions.length === 0">
              <tr>
                <td colspan="5" class="text-center py-5">
                  <i class="ti ti-key-off fs-48 d-block mb-2 text-muted"></i>
                  <span class="text-muted">{{ t('permissions.no_permissions') }}</span>
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr v-for="(perm, index) in filteredPermissions" :key="perm.id">
                <td>{{ index + 1 }}</td>
                <td class="font-monospace small">{{ perm.name }}</td>
                <td>
                  <span class="badge badge-soft-info">{{ perm.group }}</span>
                </td>
                <td>
                  <span class="badge badge-soft-warning">{{ perm.module_name }}</span>
                </td>
                <td>
                  <div class="d-flex align-items-center justify-content-center gap-1">
                    <a
                      href="javascript:void(0);"
                      @click="openPermissionForm(perm)"
                      class="btn btn-success btn-icon btn-sm"
                      :title="t('common.edit')"
                    >
                      <i class="ti ti-edit fs-lg"></i>
                    </a>
                    <a
                      href="javascript:void(0);"
                      @click="confirmDeletePermission(perm)"
                      class="btn btn-danger btn-icon btn-sm"
                      :title="t('common.delete')"
                    >
                      <i class="ti ti-trash fs-lg"></i>
                    </a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card-footer border-0">
          <div class="text-muted">
            <span class="fw-semibold">{{ filteredPermissions.length }}</span> / {{ store.permissions.length }} {{ t('roles.tab_permissions').toLowerCase() }}
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Role form modal -->
  <RoleFormModal
    :show="showRoleModal"
    :role="selectedRole"
    @close="showRoleModal = false"
    @saved="onRoleSaved"
  />

  <!-- Permission form modal -->
  <PermissionFormModal
    :show="showPermModal"
    :permission="selectedPermission"
    @close="showPermModal = false"
    @saved="onPermissionSaved"
  />

  <!-- Delete confirm -->
  <div v-if="deleteTarget" class="modal show d-block" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title text-danger">
            <i class="ti ti-alert-triangle me-2"></i>{{ t('common.confirm_delete') }}
          </h5>
        </div>
        <div class="modal-body pt-1">
          <p class="mb-0">{{ deleteTarget.message }}</p>
        </div>
        <div class="modal-footer border-0 pt-0">
          <button class="btn btn-light btn-sm" @click="deleteTarget = null">{{ t('common.cancel') }}</button>
          <button class="btn btn-danger btn-sm" :disabled="deleting" @click="executeDelete">
            <span v-if="deleting" class="spinner-border spinner-border-sm me-1"></span>
            {{ t('common.delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="deleteTarget" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useRolesStore } from '@/stores/roles'
import type { Role, Permission } from '@/types/roles'
import RoleFormModal from '@/components/Roles/RoleFormModal.vue'
import PermissionFormModal from '@/components/Roles/PermissionFormModal.vue'
import { showSuccessMessage, handleError } from '@/utils/notification'

const { t } = useI18n()
const store = useRolesStore()

const activeTab = ref<'roles' | 'permissions'>('roles')

const showRoleModal = ref(false)
const selectedRole = ref<Role | null>(null)

const showPermModal = ref(false)
const selectedPermission = ref<Permission | null>(null)

const deleteTarget = ref<{ type: 'role' | 'permission'; id: number; message: string } | null>(null)
const deleting = ref(false)

const roleSearch = ref('')
const permSearch = ref('')
const permModuleFilter = ref('')

const allModules = computed(() =>
  [...new Set(store.permissions.map((p: Permission) => p.module_name).filter(Boolean))] as string[]
)

const filteredRoles = computed(() => {
  if (!roleSearch.value.trim()) return store.roles
  const q = roleSearch.value.toLowerCase()
  return store.roles.filter(
    (r: Role) => r.name.toLowerCase().includes(q) || (r.description ?? '').toLowerCase().includes(q)
  )
})

const filteredPermissions = computed(() => {
  let list = store.permissions
  if (permModuleFilter.value) list = list.filter((p) => p.module_name === permModuleFilter.value)
  if (permSearch.value.trim()) {
    const q = permSearch.value.toLowerCase()
    list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.group ?? '').toLowerCase().includes(q))
  }
  return list
})

onMounted(() => store.fetchRoles())

const switchToPermissions = async () => {
  activeTab.value = 'permissions'
  if (store.permissions.length === 0) await store.fetchPermissions()
}

const openRoleForm = (role: Role | null) => {
  selectedRole.value = role
  showRoleModal.value = true
}

const openPermissionForm = (perm: Permission | null) => {
  selectedPermission.value = perm
  showPermModal.value = true
}

const onRoleSaved = () => {
  showRoleModal.value = false
}

const onPermissionSaved = () => {
  showPermModal.value = false
}

const confirmDeleteRole = (role: Role) => {
  if ((role.users_count ?? 0) > 0) return
  deleteTarget.value = {
    type: 'role',
    id: role.id,
    message: t('roles.confirm_delete', { name: role.name }),
  }
}

const confirmDeletePermission = (perm: Permission) => {
  deleteTarget.value = {
    type: 'permission',
    id: perm.id,
    message: t('permissions.confirm_delete', { name: perm.name }),
  }
}

const executeDelete = async () => {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    if (deleteTarget.value.type === 'role') {
      await store.deleteRole(deleteTarget.value.id)
      showSuccessMessage(t('roles.deleted'))
    } else {
      await store.deletePermission(deleteTarget.value.id)
      showSuccessMessage(t('permissions.deleted'))
    }
    deleteTarget.value = null
  } catch (e) {
    handleError(e)
  } finally {
    deleting.value = false
  }
}
</script>
