<template>
  <td class="text-center">{{ index + 1 }}</td>
  <td>
    <div class="d-flex justify-content-start align-items-center gap-2">
      <div>
        <h5 class="text-nowrap mb-0 lh-base fs-base">
          <a href="#!" class="link-reset">{{ country.name }}</a>
        </h5>
      </div>
    </div>
  </td>
  <td>{{ country.code }}</td>
  <td>{{ formatDate(country.created_at) }}</td>
  <td>
    <div class="d-flex align-items-center justify-content-center gap-1">
      <a
        href="javascript:void(0);"
        @click="$emit('edit', country)"
        class="btn btn-success btn-icon btn-sm"
        :title="t('countries.edit') || 'Edit'"
      >
        <i class="ti ti-edit fs-lg"></i>
      </a>
      <a
        href="javascript:void(0);"
        @click="$emit('delete', country.id)"
        class="btn btn-danger btn-icon btn-sm"
        :title="t('countries.delete') || 'Delete'"
      >
        <i class="ti ti-trash fs-lg"></i>
      </a>
    </div>
  </td>
</template>

<script lang="ts" setup>
import { useI18n } from '@/composables/useI18n'
import type { Country } from '@/types'

const { t } = useI18n()

defineProps<{
  country: Country
  index: number
}>()

defineEmits<{
  (e: 'edit', country: Country): void
  (e: 'delete', countryId: number): void
}>()

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}
</script>
