<template>
  <div class="card">
    <div class="card-header">
      <h5 class="card-title mb-0">
        {{ isEditing ? t('operators.editOperator') : t('operators.addOperator') }}
      </h5>
    </div>
    <div class="card-body">
      <form @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label class="form-label">{{ t('operators.form.name') || 'Operator Name' }} *</label>
          <input
            v-model="localForm.name"
            type="text"
            class="form-control"
            :placeholder="t('operators.form.name') || 'Operator Name'"
            required
          />
        </div>

        <div class="mb-3">
          <label class="form-label">{{ t('operators.form.country') || 'Country' }} *</label>
          <select v-model="localForm.country_id" class="form-select" required>
            <option :value="null">
              {{ t('operators.form.selectCountry') || 'Select Country' }}
            </option>
            <option v-for="country in countries" :key="country.id" :value="country.id">
              {{ country.name }}
            </option>
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label">{{ t('operators.form.logo') || 'Logo' }}</label>
          <input
            ref="fileInput"
            type="file"
            class="form-control"
            accept="image/jpeg,image/jpg,image/png,image/svg+xml"
            @change="handleFileChange"
          />
          <small class="text-muted">{{
            t('operators.form.logoHelper') || 'Max 2MB. Supported formats: JPEG, JPG, PNG, SVG'
          }}</small>
        </div>

        <!-- Logo Preview -->
        <div v-if="logoPreview || formData.logo_url" class="mb-3">
          <label class="form-label">{{ t('operators.form.logoPreview') || 'Logo Preview' }}</label>
          <div class="position-relative d-inline-block">
            <img
              :src="logoPreview || formData.logo_url || undefined"
              alt="Logo preview"
              class="img-thumbnail"
              style="max-width: 150px; max-height: 150px; object-fit: contain"
            />
            <button
              v-if="logoPreview || (formData.logo_url && !isEditing)"
              type="button"
              @click="removeLogo"
              class="btn btn-danger btn-sm position-absolute top-0 end-0"
              style="margin: -8px"
            >
              <i class="ti ti-x"></i>
            </button>
          </div>
        </div>

        <div class="d-flex gap-2">
          <button type="submit" class="btn btn-primary flex-grow-1" :disabled="processing">
            <span v-if="processing" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="ti ti-check me-1"></i>
            {{ isEditing ? t('operators.form.update') : t('operators.form.create') }}
          </button>
          <button
            v-if="isEditing"
            type="button"
            @click="handleCancel"
            class="btn btn-light"
            :disabled="processing"
          >
            <i class="ti ti-x me-1"></i>
            {{ t('operators.form.cancel') }}
          </button>
        </div>
      </form>
    </div>

    <!-- Image Resize Modal -->
    <ImageCropModal
      :show="showCropModal"
      :image-src="tempImageSrc"
      :file-name="tempFileName"
      :file-type="tempFileType"
      :original-file="tempOriginalFile"
      @save="handleImageSave"
      @use-original="handleUseOriginal"
      @cancel="handleImageCancel"
    />
  </div>
</template>

<script lang="ts" setup>
import { reactive, watch, ref, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import ImageCropModal from '@/components/Shared/ImageCropModal.vue'
import type { Country } from '@/types'

const { t } = useI18n()

interface Props {
  isEditing: boolean
  formData: {
    name: string
    country_id: number | null
    logo_url?: string | null
  }
  processing: boolean
  countries: Country[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'submit', data: { name: string; country_id: number | null; logo: File | null }): void
  (e: 'cancel'): void
}>()

const localForm = reactive({
  name: '',
  country_id: null as number | null,
  logo: null as File | null,
})

const logoPreview = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

// Image crop modal state
const showCropModal = ref(false)
const tempImageSrc = ref('')
const tempFileName = ref('')
const tempFileType = ref('')
const tempOriginalFile = ref<File | null>(null)

// Watch for form data changes from parent
watch(
  () => props.formData,
  (newData) => {
    localForm.name = newData.name
    localForm.country_id = newData.country_id
    // Reset logo preview when editing starts
    if (props.isEditing && newData.logo_url) {
      logoPreview.value = null
    }
  },
  { deep: true, immediate: true }
)

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      alert(t('operators.form.logoSizeError') || 'Logo size must not exceed 2MB')
      if (fileInput.value) {
        fileInput.value.value = ''
      }
      return
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      alert(t('operators.form.logoTypeError') || 'Only JPEG, JPG, PNG, and SVG files are allowed')
      if (fileInput.value) {
        fileInput.value.value = ''
      }
      return
    }

    // For SVG files, skip resize modal (can't resize SVG in canvas)
    if (file.type === 'image/svg+xml') {
      localForm.logo = file

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        logoPreview.value = e.target?.result as string
      }
      reader.readAsDataURL(file)
    } else {
      // For other image types, show resize modal
      tempFileName.value = file.name
      tempFileType.value = file.type
      tempOriginalFile.value = file

      const reader = new FileReader()
      reader.onload = (e) => {
        tempImageSrc.value = e.target?.result as string
        showCropModal.value = true
      }
      reader.readAsDataURL(file)
    }
  }
}

const handleImageSave = (file: File) => {
  localForm.logo = file

  // Create preview from the resized file
  const reader = new FileReader()
  reader.onload = (e) => {
    logoPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)

  // Close modal
  showCropModal.value = false
}

const handleUseOriginal = (file: File) => {
  localForm.logo = file

  // Create preview from the original file
  const reader = new FileReader()
  reader.onload = (e) => {
    logoPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)

  // Close modal
  showCropModal.value = false
}

const handleImageCancel = () => {
  showCropModal.value = false
  tempImageSrc.value = ''
  tempFileName.value = ''
  tempFileType.value = ''
  tempOriginalFile.value = null

  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const removeLogo = () => {
  localForm.logo = null
  logoPreview.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleSubmit = () => {
  if (!localForm.country_id) {
    alert(t('operators.form.countryRequired') || 'Please select a country')
    return
  }

  emit('submit', {
    name: localForm.name,
    country_id: localForm.country_id,
    logo: localForm.logo,
  })
}

const handleCancel = () => {
  emit('cancel')
}

onMounted(() => {
  // Reset logo when component mounts
  logoPreview.value = null
  localForm.logo = null
})
</script>
