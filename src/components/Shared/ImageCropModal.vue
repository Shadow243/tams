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
          <h5 class="modal-title">{{ t('common.resizeImage') || 'Resize Image' }}</h5>
          <button type="button" class="btn-close" @click="handleCancel"></button>
        </div>
        <div class="modal-body">
          <!-- Image Preview -->
          <div class="mb-3">
            <div class="position-relative d-inline-block" style="max-width: 100%">
              <img
                ref="imageRef"
                :src="imageSrc"
                alt="Image to resize"
                class="img-fluid"
                style="max-height: 400px; display: block; margin: 0 auto"
              />
            </div>
          </div>

          <!-- Resize Controls -->
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">{{ t('common.width') || 'Width' }} (px)</label>
              <input
                v-model.number="dimensions.width"
                type="number"
                class="form-control"
                min="10"
                :max="originalDimensions.width"
                @input="updateHeight"
              />
            </div>
            <div class="col-md-6">
              <label class="form-label">{{ t('common.height') || 'Height' }} (px)</label>
              <input
                v-model.number="dimensions.height"
                type="number"
                class="form-control"
                min="10"
                :max="originalDimensions.height"
                @input="updateWidth"
              />
            </div>
            <div class="col-12">
              <div class="form-check">
                <input
                  v-model="maintainAspectRatio"
                  class="form-check-input"
                  type="checkbox"
                  id="aspectRatio"
                />
                <label class="form-check-label" for="aspectRatio">
                  {{ t('common.maintainAspectRatio') || 'Maintain aspect ratio' }}
                </label>
              </div>
            </div>
            <div class="col-12">
              <small class="text-muted">
                {{ t('common.originalSize') || 'Original size' }}: {{ originalDimensions.width }} x
                {{ originalDimensions.height }}px
              </small>
            </div>
          </div>

          <!-- Quality Control for JPEG/JPG -->
          <div v-if="isJpeg" class="mt-3">
            <label class="form-label">{{ t('common.quality') || 'Quality' }}: {{ quality }}%</label>
            <input
              v-model.number="quality"
              type="range"
              class="form-range"
              min="10"
              max="100"
              step="5"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-light" @click="handleCancel">
            <i class="ti ti-x me-1"></i>
            {{ t('common.cancel') || 'Cancel' }}
          </button>
          <button type="button" class="btn btn-secondary" @click="handleUseOriginal">
            <i class="ti ti-photo me-1"></i>
            {{ t('common.useOriginal') || 'Use Original' }}
          </button>
          <button type="button" class="btn btn-primary" @click="handleSave">
            <i class="ti ti-check me-1"></i>
            {{
              dimensionsChanged
                ? t('common.saveResized') || 'Save Resized'
                : t('common.save') || 'Save'
            }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

interface Props {
  show: boolean
  imageSrc: string
  fileName: string
  fileType: string
  originalFile: File | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'save', file: File): void
  (e: 'cancel'): void
  (e: 'useOriginal', file: File): void
}>()

const imageRef = ref<HTMLImageElement | null>(null)
const dimensions = ref({ width: 0, height: 0 })
const originalDimensions = ref({ width: 0, height: 0 })
const maintainAspectRatio = ref(true)
const quality = ref(90)
const aspectRatio = ref(1)
const isJpeg = ref(false)
const dimensionsChanged = ref(false)

watch(
  () => props.show,
  (newVal) => {
    if (newVal && props.imageSrc) {
      loadImage()
    }
  }
)

watch(
  () => props.fileType,
  (newType) => {
    isJpeg.value = newType === 'image/jpeg' || newType === 'image/jpg'
  }
)

const loadImage = () => {
  if (!imageRef.value) {
    setTimeout(loadImage, 100)
    return
  }

  const img = imageRef.value
  img.onload = () => {
    originalDimensions.value = {
      width: img.naturalWidth,
      height: img.naturalHeight,
    }
    dimensions.value = {
      width: img.naturalWidth,
      height: img.naturalHeight,
    }
    aspectRatio.value = img.naturalWidth / img.naturalHeight
  }
}

const updateHeight = () => {
  if (maintainAspectRatio.value) {
    dimensions.value.height = Math.round(dimensions.value.width / aspectRatio.value)
  }
  checkDimensionsChanged()
}

const updateWidth = () => {
  if (maintainAspectRatio.value) {
    dimensions.value.width = Math.round(dimensions.value.height * aspectRatio.value)
  }
  checkDimensionsChanged()
}

const checkDimensionsChanged = () => {
  dimensionsChanged.value =
    dimensions.value.width !== originalDimensions.value.width ||
    dimensions.value.height !== originalDimensions.value.height
}

const handleSave = () => {
  if (!imageRef.value) return

  const canvas = document.createElement('canvas')
  canvas.width = dimensions.value.width
  canvas.height = dimensions.value.height

  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.drawImage(imageRef.value, 0, 0, dimensions.value.width, dimensions.value.height)

    // Convert canvas to blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], props.fileName, {
            type: props.fileType,
            lastModified: Date.now(),
          })
          emit('save', file)
        }
      },
      props.fileType,
      isJpeg.value ? quality.value / 100 : undefined
    )
  }
}

const handleUseOriginal = () => {
  if (props.originalFile) {
    emit('useOriginal', props.originalFile)
  }
}

const handleCancel = () => {
  emit('cancel')
}

onMounted(() => {
  if (props.show && props.imageSrc) {
    loadImage()
  }
  isJpeg.value = props.fileType === 'image/jpeg' || props.fileType === 'image/jpg'
})
</script>

<style scoped>
.modal.show {
  display: block;
}
</style>
