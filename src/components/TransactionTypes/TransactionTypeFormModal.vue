<template>
  <div
    :class="['modal', { show: show }]"
    :style="{ display: show ? 'block' : 'none' }"
    tabindex="-1"
    role="dialog"
  >
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{
              isEditing
                ? t('transaction_types.edit_transaction_type')
                : t('transaction_types.add_transaction_type')
            }}
          </h5>
          <button
            type="button"
            class="btn-close"
            @click="closeModal"
            :disabled="processing"
          ></button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <!-- Code -->
            <div class="mb-3">
              <label for="code" class="form-label">
                {{ t('transaction_types.code') }} <span class="text-danger">*</span>
              </label>
              <input
                type="text"
                class="form-control"
                id="code"
                v-model="localForm.code"
                :placeholder="t('transaction_types.code')"
                required
                pattern="[a-z0-9_]+"
                :disabled="processing"
              />
              <small class="text-muted">{{
                t('transaction_types.code_hint') ||
                'Use only lowercase letters, numbers and underscores'
              }}</small>
            </div>

            <!-- Name -->
            <div class="mb-3">
              <label for="name" class="form-label">
                {{ t('transaction_types.name') }} <span class="text-danger">*</span>
              </label>
              <input
                type="text"
                class="form-control"
                id="name"
                v-model="localForm.name"
                :placeholder="t('transaction_types.name')"
                required
                maxlength="255"
                :disabled="processing"
              />
            </div>

            <!-- Description -->
            <div class="mb-3">
              <label for="description" class="form-label">
                {{ t('transaction_types.description') }}
              </label>
              <textarea
                class="form-control"
                id="description"
                v-model="localForm.description"
                :placeholder="t('transaction_types.description')"
                rows="3"
                maxlength="1000"
                :disabled="processing"
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="closeModal"
              :disabled="processing"
            >
              {{ t('transaction_types.cancel') || 'Cancel' }}
            </button>
            <button type="submit" class="btn btn-primary" :disabled="processing">
              <span
                v-if="processing"
                class="spinner-border spinner-border-sm me-2"
                role="status"
              ></span>
              {{
                isEditing
                  ? t('transaction_types.update') || 'Update'
                  : t('transaction_types.create') || 'Create'
              }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Backdrop -->
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from '@/composables/useI18n'
import type { TransactionTypeFormData } from '@/types'

const { t } = useI18n()

interface Props {
  show: boolean
  formData: TransactionTypeFormData
  isEditing?: boolean
  processing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isEditing: false,
  processing: false,
})

const emit = defineEmits<{
  close: []
  submit: [data: TransactionTypeFormData]
}>()

const localForm = ref<TransactionTypeFormData>({
  code: '',
  name: '',
  description: '',
})

// Watch formData prop to update local form
watch(
  () => props.formData,
  (newData) => {
    localForm.value = { ...newData }
  },
  { deep: true, immediate: true }
)

// Watch show prop to reset form when closed
watch(
  () => props.show,
  (newShow) => {
    if (!newShow) {
      localForm.value = {
        code: '',
        name: '',
        description: '',
      }
    }
  }
)

const closeModal = () => {
  emit('close')
}

const handleSubmit = () => {
  emit('submit', {
    code: localForm.value.code.toLowerCase().trim(),
    name: localForm.value.name.trim(),
    description: localForm.value.description.trim(),
  })
}
</script>

<style scoped>
.modal.show {
  display: block;
}

.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
