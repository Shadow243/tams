<template>
  <div
    :id="id"
    class="modal fade"
    :class="{ show: open }"
    tabindex="-1"
    :aria-labelledby="`${id}Label`"
    aria-modal="true"
    role="dialog"
    :style="modalStyle"
  >
    <div class="modal-dialog" :class="sizeClass">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header">
          <h5 class="modal-title" :id="`${id}Label`">
            {{ title }}
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
            @click="$emit('close')"
          ></button>
        </div>

        <!-- Body -->
        <div class="modal-body" :style="bodyStyle">
          <slot />
        </div>

        <!-- Footer (optional) -->
        <div v-if="$slots.footer" class="modal-footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>

  <!-- Backdrop -->
  <div
    v-if="open"
    class="modal-backdrop fade"
    :class="{ show: open }"
    @click="$emit('close')"
  ></div>
</template>

<script lang="ts" setup>
import { watch, computed } from 'vue'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  open: {
    type: Boolean,
    required: false,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['sm', 'md', 'lg', 'xl', '2xl', 'full'].includes(value),
  },
  maxHeight: {
    type: String,
    default: 'calc(100vh - 200px)',
  },
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

const sizeClass = computed(() => {
  const sizes: Record<string, string> = {
    sm: 'modal-sm',
    md: '',
    lg: 'modal-lg',
    xl: 'modal-xl',
    '2xl': 'modal-xl',
    full: 'modal-fullscreen',
  }
  return sizes[props.size] || ''
})

const modalStyle = computed(() => ({
  display: props.open ? 'block' : 'none',
  paddingLeft: '0px',
}))

const bodyStyle = computed(() => ({
  maxHeight: props.maxHeight,
  overflowY: 'auto' as const,
}))

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      document.body.classList.add('modal-open')
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = '0px'
    } else {
      document.body.classList.remove('modal-open')
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.modal {
  z-index: 1055;
}

.modal-backdrop {
  z-index: 1050;
}
</style>
