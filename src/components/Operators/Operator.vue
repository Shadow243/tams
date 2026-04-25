<template>
  <td class="text-center">{{ index + 1 }}</td>
  <td>
    <div class="d-flex justify-content-start align-items-center gap-2">
      <div class="avatar avatar-sm">
        <img
          v-if="operator.logo_url"
          :src="operator.logo_url"
          :alt="operator.name"
          class="img-fluid rounded"
        />
        <div v-else class="avatar-title bg-soft-primary text-primary rounded fs-lg">
          {{ operator.name.charAt(0).toUpperCase() }}
        </div>
      </div>
      <div>
        <h5 class="text-nowrap mb-0 lh-base fs-base">
          <a href="#!" class="link-reset">{{ operator.name }}</a>
        </h5>
      </div>
    </div>
  </td>
  <td>{{ operator.country?.name || 'N/A' }}</td>
  <td>{{ formatDate(operator.created_at) }}</td>
  <td>
    <div class="d-flex align-items-center justify-content-center gap-1">
      <a
        v-if="canEdit"
        href="javascript:void(0);"
        @click="$emit('edit', operator)"
        class="btn btn-success btn-icon btn-sm"
        :title="t('operators.edit') || 'Edit'"
      >
        <i class="ti ti-edit fs-lg"></i>
      </a>
      <a
        v-if="canDelete"
        href="javascript:void(0);"
        @click="$emit('delete', operator.id)"
        class="btn btn-danger btn-icon btn-sm"
        :title="t('operators.delete') || 'Delete'"
      >
        <i class="ti ti-trash fs-lg"></i>
      </a>
    </div>
  </td>
</template>

<script lang="ts" setup>
import { useI18n } from '@/composables/useI18n'
import { usePermissions } from '@/composables/usePermissions'
import type { Operator } from '@/types'
const { canEdit, canDelete } = usePermissions()

const { t } = useI18n()

defineProps<{
  operator: Operator
  index: number
}>()

defineEmits<{
  (e: 'edit', operator: Operator): void
  (e: 'delete', operatorId: number): void
}>()

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}
</script>

<style lang="scss" scoped>
.avatar-sm {
  height: 2rem;
  width: 4rem;
}
</style>
