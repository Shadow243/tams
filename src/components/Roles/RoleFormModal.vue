<template>
  <div :class="['modal', { show }]" :style="{ display: show ? 'block' : 'none' }" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i :class="`ti ${isEditing ? 'ti-edit' : 'ti-plus'} me-2`"></i>
            {{ isEditing ? t('roles.edit_role') : t('roles.add_role') }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')" :disabled="saving"></button>
        </div>

        <form id="role-form" @submit.prevent="handleSubmit" style="display: contents">
          <div class="modal-body">
            <!-- Role name & description -->
            <div class="row mb-4">
              <div class="col-md-6">
                <label class="form-label">{{ t('roles.name') }} <span class="text-danger">*</span></label>
                <input
                  v-model="form.name"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.name }"
                  :placeholder="t('roles.name_placeholder')"
                  required
                />
                <div v-if="errors.name" class="invalid-feedback">{{ errors.name }}</div>
              </div>
              <div class="col-md-6">
                <label class="form-label">{{ t('roles.description') }}</label>
                <input
                  v-model="form.description"
                  type="text"
                  class="form-control"
                  :placeholder="t('roles.description_placeholder')"
                />
              </div>
            </div>

            <!-- Permission matrix -->
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h6 class="mb-0 fw-semibold">
                <i class="ti ti-shield-check me-2 text-primary"></i>
                {{ t('roles.permissions') }}
                <span class="badge bg-primary ms-2">{{ selectedCount }}</span>
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

            <div v-if="permissionsLoading" class="text-center py-4">
              <span class="spinner-border spinner-border-sm text-primary me-2"></span>
              {{ t('common.loading') }}
            </div>

            <div v-else-if="permissionsGrouped.length === 0" class="text-muted text-center py-3">
              {{ t('roles.no_permissions') }}
            </div>

            <div v-else class="accordion" id="permissionsAccordion">
              <div
                v-for="(module, mi) in permissionsGrouped"
                :key="module.module_name"
                class="accordion-item mb-2 border"
              >
                <h2 class="accordion-header">
                  <button
                    type="button"
                    class="accordion-button py-2 fw-semibold"
                    :class="{ collapsed: mi !== 0 }"
                    data-bs-toggle="collapse"
                    :data-bs-target="`#module-${mi}`"
                  >
                    <i class="ti ti-folder me-2 text-warning"></i>
                    {{ module.module_name }}
                    <span class="badge bg-secondary ms-2 fw-normal">
                      {{ moduleSelectedCount(module) }} / {{ moduleTotalCount(module) }}
                    </span>
                    <button
                      type="button"
                      class="btn btn-xs btn-outline-primary ms-3 py-0 px-2"
                      style="font-size: 0.7rem"
                      @click.stop="toggleModule(module)"
                    >
                      {{ moduleSelectedCount(module) === moduleTotalCount(module) ? t('roles.deselect_all') : t('roles.select_all') }}
                    </button>
                  </button>
                </h2>
                <div
                  :id="`module-${mi}`"
                  class="accordion-collapse collapse"
                  :class="{ show: mi === 0 }"
                >
                  <div class="accordion-body pt-2 pb-3">
                    <div v-for="group in module.groups" :key="group.group" class="mb-3">
                      <div class="d-flex align-items-center mb-2">
                        <span class="badge bg-light text-dark border me-2">{{ group.group }}</span>
                        <button
                          type="button"
                          class="btn btn-xs btn-link p-0 text-decoration-none text-muted"
                          style="font-size: 0.75rem"
                          @click="toggleGroup(group)"
                        >
                          {{ groupSelectedCount(group) === group.permissions.length ? t('roles.deselect_all') : t('roles.select_all') }}
                        </button>
                      </div>
                      <div class="row g-2">
                        <div
                          v-for="perm in group.permissions"
                          :key="perm.id"
                          class="col-lg-3 col-md-4 col-sm-6"
                        >
                          <label class="d-flex align-items-center gap-2 p-2 rounded border cursor-pointer permission-item"
                            :class="{ 'border-primary bg-primary bg-opacity-10': form.permission_ids.includes(perm.id) }"
                          >
                            <input
                              type="checkbox"
                              class="form-check-input mt-0 flex-shrink-0"
                              :value="perm.id"
                              v-model="form.permission_ids"
                            />
                            <span class="small text-truncate" :title="perm.name">{{ perm.name }}</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </form>

        <div class="modal-footer">
          <button type="button" class="btn btn-light" @click="$emit('close')" :disabled="saving">
            {{ t('common.cancel') }}
          </button>
          <button type="submit" form="role-form" class="btn btn-primary" :disabled="saving || !form.name.trim()">
            <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
            {{ isEditing ? t('common.save') : t('common.create') }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useRolesStore } from '@/stores/roles'
import type { Role, PermissionModule, PermissionGroup } from '@/types/roles'
import { showSuccessMessage, handleError } from '@/utils/notification'

const props = defineProps<{
  show: boolean
  role: Role | null
}>()

const emit = defineEmits<{
  close: []
  saved: [role: Role]
}>()

const { t } = useI18n()
const store = useRolesStore()

const saving = ref(false)
const errors = ref<Record<string, string>>({})

const form = ref({
  name: '',
  description: '',
  permission_ids: [] as number[],
})

const permissionsGrouped = computed(() => store.permissionsGrouped)
const permissionsLoading = computed(() => store.permissionsLoading)
const isEditing = computed(() => !!props.role)
const selectedCount = computed(() => form.value.permission_ids.length)

watch(
  () => props.show,
  async (val) => {
    if (val) {
      errors.value = {}
      if (store.permissionsGrouped.length === 0) {
        await store.fetchPermissions()
      }
      if (props.role) {
        form.value = {
          name: props.role.name,
          description: props.role.description ?? '',
          permission_ids: props.role.permissions.map((p) => p.id),
        }
      } else {
        form.value = { name: '', description: '', permission_ids: [] }
      }
    }
  }
)

const moduleSelectedCount = (module: PermissionModule) =>
  module.groups.flatMap((g) => g.permissions).filter((p) => form.value.permission_ids.includes(p.id)).length

const moduleTotalCount = (module: PermissionModule) =>
  module.groups.flatMap((g) => g.permissions).length

const groupSelectedCount = (group: PermissionGroup) =>
  group.permissions.filter((p) => form.value.permission_ids.includes(p.id)).length

const toggleModule = (module: PermissionModule) => {
  const ids = module.groups.flatMap((g) => g.permissions.map((p) => p.id))
  const allSelected = ids.every((id) => form.value.permission_ids.includes(id))
  if (allSelected) {
    form.value.permission_ids = form.value.permission_ids.filter((id) => !ids.includes(id))
  } else {
    form.value.permission_ids = [...new Set([...form.value.permission_ids, ...ids])]
  }
}

const toggleGroup = (group: PermissionGroup) => {
  const ids = group.permissions.map((p) => p.id)
  const allSelected = ids.every((id) => form.value.permission_ids.includes(id))
  if (allSelected) {
    form.value.permission_ids = form.value.permission_ids.filter((id) => !ids.includes(id))
  } else {
    form.value.permission_ids = [...new Set([...form.value.permission_ids, ...ids])]
  }
}

const selectAll = () => {
  form.value.permission_ids = store.permissions.map((p) => p.id)
}

const deselectAll = () => {
  form.value.permission_ids = []
}

const handleSubmit = async () => {
  errors.value = {}
  saving.value = true
  try {
    let saved: Role
    if (isEditing.value && props.role) {
      saved = await store.updateRole(props.role.id, {
        name: form.value.name,
        description: form.value.description,
      })
      await store.syncRolePermissions(saved.id, form.value.permission_ids)
      saved = store.roles.find((r) => r.id === saved.id) ?? saved
    } else {
      saved = await store.createRole(form.value)
    }
    showSuccessMessage(isEditing.value ? t('roles.updated') : t('roles.created'))
    emit('saved', saved)
  } catch (e: any) {
    const data = e?.response?.data
    if (data?.errors) {
      Object.assign(errors.value, Object.fromEntries(Object.entries(data.errors).map(([k, v]: any) => [k, Array.isArray(v) ? v[0] : v])))
    } else {
      handleError(e)
    }
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
.cursor-pointer { cursor: pointer; }
</style>
