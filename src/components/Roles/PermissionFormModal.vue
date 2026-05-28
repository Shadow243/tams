<template>
  <div :class="['modal', { show }]" :style="{ display: show ? 'block' : 'none' }" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i :class="`ti ${isEditing ? 'ti-edit' : 'ti-plus'} me-2`"></i>
            {{ isEditing ? t('permissions.edit') : t('permissions.add') }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')" :disabled="saving"></button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">{{ t('permissions.name') }} <span class="text-danger">*</span></label>
              <input
                v-model="form.name"
                type="text"
                class="form-control font-monospace"
                :class="{ 'is-invalid': errors.name }"
                placeholder="ex: lire_rapports"
                required
              />
              <div v-if="errors.name" class="invalid-feedback">{{ errors.name }}</div>
              <small class="text-muted">{{ t('permissions.name_hint') }}</small>
            </div>

            <div class="mb-3">
              <label class="form-label">{{ t('permissions.group') }} <span class="text-danger">*</span></label>
              <input
                v-model="form.group"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.group }"
                :list="`groups-list-${_uid}`"
                placeholder="ex: rapports"
                required
              />
              <datalist :id="`groups-list-${_uid}`">
                <option v-for="g in existingGroups" :key="g" :value="g" />
              </datalist>
              <div v-if="errors.group" class="invalid-feedback">{{ errors.group }}</div>
            </div>

            <div class="mb-3">
              <label class="form-label">{{ t('permissions.module') }} <span class="text-danger">*</span></label>
              <select v-model="form.module_name" class="form-select" :class="{ 'is-invalid': errors.module_name }" required>
                <option value="">{{ t('permissions.select_module') }}</option>
                <option v-for="m in existingModules" :key="m" :value="m">{{ m }}</option>
              </select>
              <div v-if="errors.module_name" class="invalid-feedback">{{ errors.module_name }}</div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-light" @click="$emit('close')" :disabled="saving">
              {{ t('common.cancel') }}
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving || !form.name.trim()">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
              {{ isEditing ? t('common.save') : t('common.create') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useRolesStore } from '@/stores/roles'
import type { Permission } from '@/types/roles'
import { showSuccessMessage, handleError } from '@/utils/notification'

const props = defineProps<{
  show: boolean
  permission: Permission | null
}>()

const emit = defineEmits<{
  close: []
  saved: [p: Permission]
}>()

const { t } = useI18n()
const store = useRolesStore()
const _uid = Math.random().toString(36).slice(2)

const saving = ref(false)
const errors = ref<Record<string, string>>({})
const isEditing = computed(() => !!props.permission)

const form = ref({ name: '', group: '', module_name: '' })

const existingGroups = computed(() => [...new Set(store.permissions.map((p) => p.group).filter(Boolean))] as string[])
const existingModules = computed(() => [...new Set(store.permissions.map((p) => p.module_name).filter(Boolean))] as string[])

watch(
  () => props.show,
  (val) => {
    if (val) {
      errors.value = {}
      form.value = props.permission
        ? { name: props.permission.name, group: props.permission.group ?? '', module_name: props.permission.module_name ?? '' }
        : { name: '', group: '', module_name: '' }
    }
  }
)

const handleSubmit = async () => {
  errors.value = {}
  saving.value = true
  try {
    let saved: Permission
    if (isEditing.value && props.permission) {
      saved = await store.updatePermission(props.permission.id, form.value)
      showSuccessMessage(t('permissions.updated'))
    } else {
      saved = await store.createPermission(form.value)
      showSuccessMessage(t('permissions.created'))
    }
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
