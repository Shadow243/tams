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
            <i :class="`ti ${isEditing ? 'ti-edit' : 'ti-plus'} me-2`"></i>
            {{
              isEditing
                ? t('currencies.edit_currency') || 'Modifier la Devise'
                : t('currencies.add_currency') || 'Nouvelle Devise'
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
              <!-- Code -->
              <div class="col-md-6 mb-3">
                <label for="code" class="form-label">
                  {{ t('currencies.form.code') || 'Code ISO' }}
                  <span class="text-danger">*</span>
                </label>
                <input
                  type="text"
                  class="form-control text-uppercase"
                  id="code"
                  v-model="localForm.code"
                  :placeholder="t('currencies.form.code_placeholder') || 'USD'"
                  required
                  maxlength="3"
                  :disabled="processing || isEditing"
                  @input="localForm.code = localForm.code.toUpperCase()"
                />
                <small class="text-muted">
                  {{ t('currencies.form.code_hint') || 'Code ISO à 3 lettres' }}
                </small>
              </div>

              <!-- Name -->
              <div class="col-md-6 mb-3">
                <label for="name" class="form-label">
                  {{ t('currencies.form.name') || 'Nom' }}
                  <span class="text-danger">*</span>
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="name"
                  v-model="localForm.name"
                  :placeholder="t('currencies.form.name_placeholder') || 'Dollar Américain'"
                  required
                  maxlength="100"
                  :disabled="processing"
                />
              </div>

              <!-- Symbol -->
              <div class="col-md-6 mb-3">
                <label for="symbol" class="form-label">
                  {{ t('currencies.form.symbol') || 'Symbole' }}
                  <span class="text-danger">*</span>
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="symbol"
                  v-model="localForm.symbol"
                  :placeholder="t('currencies.form.symbol_placeholder') || '$'"
                  required
                  maxlength="10"
                  :disabled="processing"
                />
              </div>

              <!-- Country -->
              <div class="col-md-6 mb-3">
                <label for="country_id" class="form-label">
                  {{ t('currencies.form.country') || 'Pays' }}
                </label>
                <SearchableSelect
                  v-model="localForm.country_id"
                  :options="countries"
                  option-label="name"
                  option-value="id"
                  :placeholder="t('currencies.form.country_placeholder') || 'Sélectionnez un pays'"
                  :disabled="processing || loadingCountries"
                  :clearable="true"
                />
                <small class="text-muted">
                  {{
                    t('currencies.form.country_hint') || "Pays d'origine de la devise (optionnel)"
                  }}
                </small>
              </div>

              <!-- Decimal Places -->
              <div class="col-md-6 mb-3">
                <label for="decimal_places" class="form-label">
                  {{ t('currencies.form.decimal_places') || 'Décimales' }}
                  <span class="text-danger">*</span>
                </label>
                <input
                  type="number"
                  class="form-control"
                  id="decimal_places"
                  v-model.number="localForm.decimal_places"
                  :placeholder="'2'"
                  required
                  min="0"
                  max="4"
                  step="1"
                  :disabled="processing"
                />
                <small class="text-muted">
                  {{
                    t('currencies.form.decimal_places_hint') ||
                    'Nombre de chiffres après la virgule (0-4)'
                  }}
                </small>
              </div>

              <!-- Exchange Rate -->
              <div class="col-md-6 mb-3">
                <label for="exchange_rate" class="form-label">
                  {{ t('currencies.form.exchange_rate') || 'Taux de Change' }}
                  <span class="text-danger">*</span>
                </label>
                <input
                  type="number"
                  class="form-control"
                  id="exchange_rate"
                  v-model.number="localForm.exchange_rate"
                  :placeholder="'1.0'"
                  required
                  min="0.000001"
                  step="0.000001"
                  :disabled="processing"
                />
                <small class="text-muted">
                  {{
                    t('currencies.form.exchange_rate_hint') ||
                    'Taux de change par rapport à la devise de base'
                  }}
                </small>
              </div>

              <!-- Status Switches -->
              <div class="col-md-6 mb-3">
                <div class="form-check form-switch">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="is_active"
                    v-model="localForm.is_active"
                    :disabled="processing"
                  />
                  <label class="form-check-label" for="is_active">
                    {{ t('currencies.form.is_active') || 'Actif' }}
                  </label>
                </div>
                <small class="text-muted d-block mt-1">
                  {{
                    t('currencies.form.is_active_hint') ||
                    'La devise est disponible pour les transactions'
                  }}
                </small>
              </div>

              <div class="col-md-6 mb-3">
                <div class="form-check form-switch">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="is_default"
                    v-model="localForm.is_default"
                    :disabled="processing"
                  />
                  <label class="form-check-label" for="is_default">
                    {{ t('currencies.form.is_default') || 'Par Défaut' }}
                  </label>
                </div>
                <small class="text-muted d-block mt-1">
                  {{
                    t('currencies.form.is_default_hint') ||
                    'Définir comme devise par défaut du système'
                  }}
                </small>
              </div>
            </div>

            <!-- Validation Errors -->
            <div v-if="validationErrors.length > 0" class="alert alert-danger">
              <strong>{{ t('common.validation_error') || 'Erreur de validation' }}:</strong>
              <ul class="mb-0 mt-2">
                <li v-for="(error, index) in validationErrors" :key="index">{{ error }}</li>
              </ul>
            </div>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="closeModal"
              :disabled="processing"
            >
              {{ t('currencies.form.cancel') || 'Annuler' }}
            </button>
            <button type="submit" class="btn btn-primary" :disabled="processing || !isFormValid">
              <span v-if="processing" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else :class="`ti ${isEditing ? 'ti-device-floppy' : 'ti-check'} me-2`"></i>
              {{
                isEditing
                  ? t('currencies.form.update') || 'Mettre à jour'
                  : t('currencies.form.create') || 'Créer'
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
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useCountryStore } from '@/stores/countries'
import { storeToRefs } from 'pinia'
import { axiosInstance } from '@/plugins/axios'
import { appConfig } from '@/config/app'
import SearchableSelect from '@/components/Shared/SearchableSelect.vue'

const { t } = useI18n()
const countryStore = useCountryStore()
const { country_list: countries } = storeToRefs(countryStore)
const loadingCountries = computed(() => countryStore.loading)

interface CurrencyFormData {
  code: string
  name: string
  symbol: string
  country_id: number | null
  decimal_places: number
  exchange_rate: number
  is_active: boolean
  is_default: boolean
}

interface Props {
  show: boolean
  currency?: CurrencyFormData | null
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  currency: null,
})

const emit = defineEmits<{
  close: []
  success: []
}>()

const localForm = ref<CurrencyFormData>({
  code: '',
  name: '',
  symbol: '',
  country_id: null,
  decimal_places: 2,
  exchange_rate: 1.0,
  is_active: true,
  is_default: false,
})

const processing = ref(false)
const validationErrors = ref<string[]>([])

onMounted(async () => {
  if (!countries.value.length) {
    await countryStore.fetchCountries(1, '', 200)
  }
})

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      if (props.currency) {
        localForm.value = { ...props.currency }
      } else {
        localForm.value = {
          code: '',
          name: '',
          symbol: '',
          country_id: null,
          decimal_places: 2,
          exchange_rate: 1.0,
          is_active: true,
          is_default: false,
        }
      }
      validationErrors.value = []
    }
  }
)

const isEditing = computed(() => !!props.currency?.code)

const isFormValid = computed(() => {
  return (
    localForm.value.code.length === 3 &&
    localForm.value.name.trim() !== '' &&
    localForm.value.symbol.trim() !== '' &&
    localForm.value.decimal_places >= 0 &&
    localForm.value.decimal_places <= 4 &&
    localForm.value.exchange_rate > 0
  )
})

const handleSubmit = async () => {
  if (!isFormValid.value) return

  processing.value = true
  validationErrors.value = []

  try {
    const url = isEditing.value
      ? `${appConfig.apiUrl}/currencies/${localForm.value.code}`
      : `${appConfig.apiUrl}/currencies`

    const method = isEditing.value ? 'put' : 'post'

    await axiosInstance[method](url, localForm.value)

    emit('success')
    closeModal()
  } catch (error: any) {
    if (error.response?.status === 422) {
      const errors = error.response.data.errors
      validationErrors.value = Object.values(errors).flat() as string[]
    } else {
      validationErrors.value = [
        error.response?.data?.message || t('currencies.create_error') || 'Une erreur est survenue',
      ]
    }
  } finally {
    processing.value = false
  }
}

const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
.modal.show {
  display: block;
}

.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

.text-uppercase {
  text-transform: uppercase;
}
</style>
