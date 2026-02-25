<template>
  <div class="card">
    <div class="card-header">
      <h5 class="card-title mb-0">
        {{ isEditing ? t('countries.editCountry') : t('countries.addCountry') }}
      </h5>
    </div>
    <div class="card-body">
      <form @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label class="form-label">{{ t('countries.form.name') || 'Country Name' }} *</label>
          <input
            v-model="localForm.name"
            type="text"
            class="form-control"
            :placeholder="t('countries.form.name') || 'Country Name'"
            required
          />
        </div>

        <div class="mb-3">
          <label class="form-label">{{ t('countries.form.code') || 'Country Code' }} *</label>
          <input
            v-model="localForm.code"
            type="text"
            class="form-control"
            maxlength="3"
            style="text-transform: uppercase"
            :placeholder="t('countries.form.code') || 'Code'"
            required
          />
          <small class="text-muted">{{
            t('countries.form.codeHelper') || 'ISO 3166-1 alpha-2 or alpha-3 code (e.g., US, USA)'
          }}</small>
        </div>

        <div class="d-flex gap-2">
          <button type="submit" class="btn btn-primary flex-grow-1" :disabled="processing">
            <span v-if="processing" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="ti ti-check me-1"></i>
            {{ isEditing ? t('countries.form.update') : t('countries.form.create') }}
          </button>
          <button
            v-if="isEditing"
            type="button"
            @click="handleCancel"
            class="btn btn-light"
            :disabled="processing"
          >
            <i class="ti ti-x me-1"></i>
            {{ t('countries.form.cancel') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, watch } from 'vue'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

interface Props {
  isEditing: boolean
  formData: {
    name: string
    code: string
  }
  processing: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'submit', data: { name: string; code: string }): void
  (e: 'cancel'): void
}>()

const localForm = reactive({
  name: '',
  code: '',
})

// Watch for form data changes from parent
watch(
  () => props.formData,
  (newData) => {
    localForm.name = newData.name
    localForm.code = newData.code
  },
  { deep: true, immediate: true }
)

const handleSubmit = () => {
  emit('submit', {
    name: localForm.name,
    code: localForm.code.toUpperCase(),
  })
}

const handleCancel = () => {
  emit('cancel')
}
</script>
