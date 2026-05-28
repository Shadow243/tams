<template>
  <div class="row">
    <div class="col-12">
      <!-- Header -->
      <div class="d-flex align-items-sm-center flex-sm-row flex-column my-3">
        <div class="flex-grow-1">
          <div class="d-flex align-items-center gap-2 mb-1">
            <button class="btn btn-sm btn-outline-secondary" @click="$router.push({ name: 'users.list' })">
              <i class="ti ti-arrow-left"></i>
            </button>
            <h4 class="fs-xl mb-0">{{ t('users.permissions.title') }}</h4>
          </div>
          <p v-if="user" class="text-muted mb-0">
            {{ user.name }} — <span class="text-primary">{{ user.roles?.[0] || t('users.permissions.no_role') }}</span>
          </p>
        </div>
        <div class="text-end mt-3 mt-sm-0">
          <button class="btn btn-primary" :disabled="saving" @click="savePermissions">
            <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="ti ti-device-floppy me-1"></i>
            {{ t('common.save') }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="text-center py-5">
        <span class="spinner-border text-primary"></span>
      </div>

      <template v-else>
        <!-- Role permissions info -->
        <div class="card mb-4">
          <div class="card-header bg-light">
            <h6 class="mb-0">
              <i class="ti ti-shield me-2 text-info"></i>
              {{ t('users.permissions.role_permissions') }}
              <span class="badge bg-info ms-2">{{ rolePermissions.length }}</span>
            </h6>
          </div>
          <div class="card-body">
            <p class="text-muted small mb-2">{{ t('users.permissions.role_permissions_desc') }}</p>
            <div v-if="rolePermissions.length === 0" class="text-muted">{{ t('users.permissions.none') }}</div>
            <div v-else class="d-flex flex-wrap gap-1">
              <span
                v-for="perm in rolePermissions"
                :key="perm.id"
                class="badge bg-info bg-opacity-15 text-info border border-info border-opacity-25 font-monospace"
                style="font-size: 0.72rem"
              >{{ perm.name }}</span>
            </div>
          </div>
        </div>

        <!-- Direct permissions matrix -->
        <div class="card">
          <div class="card-header">
            <div class="d-flex align-items-center justify-content-between">
              <h6 class="mb-0">
                <i class="ti ti-key me-2 text-warning"></i>
                {{ t('users.permissions.direct_permissions') }}
                <span class="badge bg-warning text-dark ms-2">{{ selectedDirectIds.length }}</span>
              </h6>
              <div class="d-flex gap-2">
                <button type="button" class="btn btn-sm btn-outline-primary" @click="selectAll">
                  {{ t('roles.select_all') }}
                </button>
                <button type="button" class="btn btn-sm btn-outline-secondary" @click="deselectAll">
                  {{ t('roles.deselect_all') }}
                </button>
              </div>
            </div>
            <p class="text-muted small mb-0 mt-1">{{ t('users.permissions.direct_desc') }}</p>
          </div>
          <div class="card-body">
            <div v-if="permissionsLoading" class="text-center py-4">
              <span class="spinner-border spinner-border-sm text-primary"></span>
            </div>
            <div v-else class="accordion" id="userPermAccordion">
              <div
                v-for="(module, mi) in permissionsGrouped"
                :key="module.module_name"
                class="accordion-item mb-2 border"
              >
                <h2 class="accordion-header">
                  <button
                    type="button"
                    class="accordion-button py-2 fw-semibold collapsed"
                    data-bs-toggle="collapse"
                    :data-bs-target="`#uperm-module-${mi}`"
                  >
                    <i class="ti ti-folder me-2 text-warning"></i>
                    {{ module.module_name }}
                    <span class="badge bg-secondary ms-2 fw-normal">
                      {{ moduleSelectedCount(module) }} / {{ moduleTotalCount(module) }}
                    </span>
                  </button>
                </h2>
                <div :id="`uperm-module-${mi}`" class="accordion-collapse collapse">
                  <div class="accordion-body pt-2 pb-3">
                    <div v-for="group in module.groups" :key="group.group" class="mb-3">
                      <span class="badge bg-light text-dark border me-2 mb-2">{{ group.group }}</span>
                      <div class="row g-2">
                        <div
                          v-for="perm in group.permissions"
                          :key="perm.id"
                          class="col-lg-3 col-md-4 col-sm-6"
                        >
                          <label
                            class="d-flex align-items-center gap-2 p-2 rounded border permission-item"
                            :class="{
                              'border-info bg-info bg-opacity-10': rolePermissionIds.has(perm.id) && !selectedDirectIds.includes(perm.id),
                              'border-warning bg-warning bg-opacity-10': selectedDirectIds.includes(perm.id),
                            }"
                          >
                            <input
                              type="checkbox"
                              class="form-check-input mt-0 flex-shrink-0"
                              :value="perm.id"
                              v-model="selectedDirectIds"
                            />
                            <span class="small text-truncate" :title="perm.name">{{ perm.name }}</span>
                            <i
                              v-if="rolePermissionIds.has(perm.id)"
                              class="ti ti-shield ms-auto flex-shrink-0 text-info small"
                              :title="t('users.permissions.from_role')"
                            ></i>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/composables/useI18n'
import { useRolesStore } from '@/stores/roles'
import { axiosInstance } from '@/plugins/axios'
import { appConfig } from '@/config/app'
import type { Permission, PermissionModule } from '@/types/roles'
import type { User } from '@/types/auth'
import { showSuccessMessage, handleError } from '@/utils/notification'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useRolesStore()

const userId = computed(() => Number(route.params.id))
const user = ref<User | null>(null)
const loading = ref(true)
const saving = ref(false)
const rolePermissions = ref<Permission[]>([])
const selectedDirectIds = ref<number[]>([])

const permissionsGrouped = computed(() => store.permissionsGrouped)
const permissionsLoading = computed(() => store.permissionsLoading)
const rolePermissionIds = computed(() => new Set(rolePermissions.value.map((p) => p.id)))

const moduleSelectedCount = (module: PermissionModule) =>
  module.groups.flatMap((g) => g.permissions).filter((p) => selectedDirectIds.value.includes(p.id)).length

const moduleTotalCount = (module: PermissionModule) =>
  module.groups.flatMap((g) => g.permissions).length

const selectAll = () => {
  selectedDirectIds.value = store.permissions.map((p: Permission) => p.id)
}

const deselectAll = () => {
  selectedDirectIds.value = []
}

onMounted(async () => {
  try {
    const [userRes, permsData] = await Promise.all([
      axiosInstance.get(`${appConfig.apiUrl}/users/${userId.value}`),
      store.fetchPermissions(),
    ])
    user.value = userRes.data?.data ?? userRes.data

    const directData = await store.getUserPermissions(userId.value)
    rolePermissions.value = directData.role_permissions
    selectedDirectIds.value = directData.direct_permissions.map((p: Permission) => p.id)
  } catch (e) {
    handleError(e)
  } finally {
    loading.value = false
  }
})

const savePermissions = async () => {
  saving.value = true
  try {
    await store.syncUserPermissions(userId.value, selectedDirectIds.value)
    showSuccessMessage(t('users.permissions.saved'))
  } catch (e) {
    handleError(e)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.permission-item {
  cursor: pointer;
  transition: all 0.15s;
  font-size: 0.8rem;
  min-height: 2.2rem;
}
.permission-item:hover {
  background-color: rgba(0, 120, 212, 0.05);
}
</style>
