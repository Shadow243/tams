<template>
  <div
    :class="['modal', { show: show }]"
    :style="{ display: show ? 'block' : 'none' }"
    tabindex="-1"
    role="dialog"
  >
    <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{
              isEditing
                ? t('fee_rules.edit_fee_rule') || 'Modifier la règle de frais'
                : t('fee_rules.add_fee_rule') || 'Ajouter une règle de frais'
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
            <div class="row">
              <!-- Transaction Type -->
              <div class="col-md-6 mb-3">
                <label for="transaction_type_id" class="form-label">
                  {{ t('fee_rules.transaction_type') || "Type d'opération" }}
                  <span class="text-danger">*</span>
                </label>
                <select
                  class="form-select"
                  id="transaction_type_id"
                  v-model.number="localForm.transaction_type_id"
                  required
                  :disabled="processing"
                >
                  <option :value="null" disabled>
                    {{ t('fee_rules.select_transaction_type') || 'Sélectionnez un type' }}
                  </option>
                  <option v-for="type in transactionTypes" :key="type.id" :value="type.id">
                    {{ type.name }} ({{ type.code }})
                  </option>
                </select>
              </div>

              <!-- Operator -->
              <div class="col-md-6 mb-3">
                <label for="operator_id" class="form-label">
                  {{ t('fee_rules.operator') || 'Opérateur' }}
                  <small class="text-muted">({{ t('fee_rules.optional') || 'optionnel' }})</small>
                </label>
                <select
                  class="form-select"
                  id="operator_id"
                  v-model.number="localForm.operator_id"
                  :disabled="processing"
                >
                  <option :value="null">
                    {{ t('fee_rules.all_operators') || 'Tous les opérateurs' }}
                  </option>
                  <option v-for="operator in operators" :key="operator.id" :value="operator.id">
                    {{ operator.name }}
                  </option>
                </select>
              </div>

              <!-- Branch -->
              <div class="col-md-6 mb-3">
                <label for="branch_id" class="form-label">
                  {{ t('fee_rules.branch') || 'Agence' }}
                  <small class="text-muted">({{ t('fee_rules.optional') || 'optionnel' }})</small>
                </label>
                <select
                  class="form-select"
                  id="branch_id"
                  v-model.number="localForm.branch_id"
                  :disabled="processing"
                >
                  <option :value="null">
                    {{ t('fee_rules.all_branches') || 'Toutes les agences' }}
                  </option>
                  <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                    {{ branch.name }} ({{ branch.code }})
                  </option>
                </select>
              </div>

              <!-- Fee Mode -->
              <div class="col-md-6 mb-3">
                <label for="fee_mode" class="form-label">
                  {{ t('fee_rules.fee_mode') || 'Mode de frais' }}
                  <span class="text-danger">*</span>
                </label>
                <select
                  class="form-select"
                  id="fee_mode"
                  v-model="localForm.fee_mode"
                  required
                  :disabled="processing"
                >
                  <option value="fixed">{{ t('fee_rules.fixed') || 'Fixe' }}</option>
                  <option value="percentage">
                    {{ t('fee_rules.percentage') || 'Pourcentage' }}
                  </option>
                  <option value="negotiable">
                    {{ t('fee_rules.negotiable') || 'Négociable' }}
                  </option>
                </select>
              </div>

              <!-- Value -->
              <div class="col-md-6 mb-3" v-if="localForm.fee_mode !== 'negotiable'">
                <label for="value" class="form-label">
                  {{ t('fee_rules.value') || 'Valeur' }}
                  <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <input
                    type="number"
                    class="form-control"
                    id="value"
                    v-model.number="localForm.value"
                    :placeholder="
                      localForm.fee_mode === 'percentage'
                        ? t('fee_rules.percentage_placeholder') || 'Ex: 2.5'
                        : t('fee_rules.fixed_placeholder') || 'Ex: 500'
                    "
                    step="0.01"
                    min="0"
                    :required="localForm.fee_mode !== 'negotiable'"
                    :disabled="processing"
                  />
                  <span class="input-group-text" v-if="localForm.fee_mode === 'percentage'">%</span>
                </div>
                <small class="text-muted">
                  {{
                    localForm.fee_mode === 'percentage'
                      ? t('fee_rules.percentage_hint') || 'Pourcentage appliqué sur le montant'
                      : t('fee_rules.fixed_hint') || 'Montant fixe en devise locale'
                  }}
                </small>
              </div>

              <!-- Min Fee -->
              <div class="col-md-6 mb-3">
                <label for="min_fee" class="form-label">
                  {{ t('fee_rules.min_fee') || 'Frais minimum' }}
                  <small class="text-muted">({{ t('fee_rules.optional') || 'optionnel' }})</small>
                </label>
                <input
                  type="number"
                  class="form-control"
                  id="min_fee"
                  v-model.number="localForm.min_fee"
                  :placeholder="t('fee_rules.min_fee_placeholder') || 'Ex: 100'"
                  step="0.01"
                  min="0"
                  :disabled="processing"
                />
              </div>

              <!-- Max Fee -->
              <div class="col-md-6 mb-3">
                <label for="max_fee" class="form-label">
                  {{ t('fee_rules.max_fee') || 'Frais maximum' }}
                  <small class="text-muted">({{ t('fee_rules.optional') || 'optionnel' }})</small>
                </label>
                <input
                  type="number"
                  class="form-control"
                  id="max_fee"
                  v-model.number="localForm.max_fee"
                  :placeholder="t('fee_rules.max_fee_placeholder') || 'Ex: 5000'"
                  step="0.01"
                  min="0"
                  :disabled="processing"
                />
              </div>

              <!-- Is Active -->
              <div class="col-12 mb-3">
                <div class="form-check form-switch">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="is_active"
                    v-model="localForm.is_active"
                    :disabled="processing"
                  />
                  <label class="form-check-label" for="is_active">
                    {{ t('fee_rules.is_active_label') || 'Règle active' }}
                  </label>
                  <small class="text-muted d-block">
                    {{
                      t('fee_rules.is_active_hint') ||
                      'Seules les règles actives seront appliquées aux transactions'
                    }}
                  </small>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="closeModal"
              :disabled="processing"
            >
              {{ t('fee_rules.cancel') || 'Annuler' }}
            </button>
            <button type="submit" class="btn btn-primary" :disabled="processing">
              <span
                v-if="processing"
                class="spinner-border spinner-border-sm me-2"
                role="status"
              ></span>
              {{
                isEditing
                  ? t('fee_rules.update') || 'Mettre à jour'
                  : t('fee_rules.create') || 'Créer'
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
import type { FeeRuleFormData } from '@/types'

const { t } = useI18n()

interface Props {
  show: boolean
  formData: FeeRuleFormData
  isEditing?: boolean
  processing?: boolean
  transactionTypes?: any[]
  operators?: any[]
  branches?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  isEditing: false,
  processing: false,
  transactionTypes: () => [],
  operators: () => [],
  branches: () => [],
})

const emit = defineEmits<{
  close: []
  submit: [data: FeeRuleFormData]
}>()

const localForm = ref<FeeRuleFormData>({
  transaction_type_id: null,
  operator_id: null,
  branch_id: null,
  fee_mode: 'fixed',
  value: null,
  min_fee: null,
  max_fee: null,
  is_active: true,
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
        transaction_type_id: null,
        operator_id: null,
        branch_id: null,
        fee_mode: 'fixed',
        value: null,
        min_fee: null,
        max_fee: null,
        is_active: true,
      }
    }
  }
)

// Watch fee_mode to clear value if negotiable
watch(
  () => localForm.value.fee_mode,
  (newMode) => {
    if (newMode === 'negotiable') {
      localForm.value.value = null
    }
  }
)

const closeModal = () => {
  emit('close')
}

const handleSubmit = () => {
  emit('submit', { ...localForm.value })
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
