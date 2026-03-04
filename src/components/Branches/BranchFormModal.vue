<template>
  <div
    v-if="show"
    class="modal fade show d-block"
    tabindex="-1"
    style="background-color: rgba(0, 0, 0, 0.5)"
    @click.self="handleCancel"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ isEditing ? t('branches.editBranch') : t('branches.addBranch') }}
          </h5>
          <button type="button" class="btn-close" @click="handleCancel"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">{{ t('branches.form.code') || 'Branch Code' }} *</label>
                <input
                  v-model="localForm.code"
                  type="text"
                  class="form-control"
                  style="text-transform: uppercase"
                  :placeholder="t('branches.form.codePlaceholder') || 'BR-001'"
                  required
                />
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label">{{ t('branches.form.name') || 'Branch Name' }} *</label>
                <input
                  v-model="localForm.name"
                  type="text"
                  class="form-control"
                  :placeholder="t('branches.form.namePlaceholder') || 'Main Branch'"
                  required
                />
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">{{ t('branches.form.country') || 'Country' }} *</label>
                <select v-model="localForm.country_id" class="form-select" required>
                  <option :value="null" disabled>
                    {{ t('branches.form.selectCountry') || 'Select a country' }}
                  </option>
                  <option v-for="country in countries" :key="country.id" :value="country.id">
                    {{ country.name }}
                  </option>
                </select>
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label">{{ t('branches.form.status') || 'Status' }}</label>
                <select v-model="localForm.status" class="form-select">
                  <option value="active">
                    {{ t('branches.status.active') || 'Active' }}
                  </option>
                  <option value="inactive">
                    {{ t('branches.status.inactive') || 'Inactive' }}
                  </option>
                </select>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">{{ t('branches.form.address') || 'Address' }}</label>
              <textarea
                v-model="localForm.address"
                class="form-control"
                rows="2"
                :placeholder="t('branches.form.addressPlaceholder') || 'Branch address'"
              ></textarea>
            </div>

            <div class="mb-3">
              <label class="form-label">{{
                t('branches.form.cashBalance') || 'Cash Balance'
              }}</label>
              <input
                v-model="localForm.cash_balance"
                type="number"
                step="0.01"
                min="0"
                class="form-control"
                :placeholder="t('branches.form.cashBalancePlaceholder') || '0.00'"
              />
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-light" @click="handleCancel" :disabled="processing">
            <i class="ti ti-x me-1"></i>
            {{ t('branches.form.cancel') }}
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="handleSubmit"
            :disabled="processing"
          >
            <span v-if="processing" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="ti ti-check me-1"></i>
            {{ isEditing ? t('branches.form.update') : t('branches.form.create') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, watch, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useCountryStore } from '@/stores/countries'
import { storeToRefs } from 'pinia'
import type { BranchFormData } from '@/types'

const { t } = useI18n()
const countryStore = useCountryStore()
const { country_list: countries } = storeToRefs(countryStore)

interface Props {
  show: boolean
  isEditing: boolean
  formData: BranchFormData
  processing: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'submit', data: BranchFormData): void
  (e: 'cancel'): void
}>()

const localForm = reactive<BranchFormData>({
  code: '',
  name: '',
  country_id: null,
  address: '',
  cash_balance: '',
  status: 'active',
})

// Load countries on mount
onMounted(async () => {
  if (!countries.value.length) {
    await countryStore.fetchCountries(1, '', 100)
  }
})

// Watch for form data changes from parent
watch(
  () => props.formData,
  (newData) => {
    localForm.code = newData.code
    localForm.name = newData.name
    localForm.country_id = newData.country_id
    localForm.address = newData.address || ''
    localForm.cash_balance = newData.cash_balance || ''
    localForm.status = newData.status || 'active'
  },
  { deep: true, immediate: true }
)

// Reset form when modal is closed
watch(
  () => props.show,
  (newVal) => {
    if (!newVal && !props.isEditing) {
      localForm.code = ''
      localForm.name = ''
      localForm.country_id = null
      localForm.address = ''
      localForm.cash_balance = ''
      localForm.status = 'active'
    }
  }
)

const handleSubmit = () => {
  const submitData: BranchFormData = {
    code: localForm.code.toUpperCase(),
    name: localForm.name,
    country_id: localForm.country_id,
    address: localForm.address || undefined,
    status: localForm.status,
  }

  if (localForm.cash_balance) {
    submitData.cash_balance = localForm.cash_balance
  }

  emit('submit', submitData)
}

const handleCancel = () => {
  emit('cancel')
}
</script>
