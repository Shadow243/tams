<template>
  <div
    :id="id"
    class="offcanvas offcanvas-end"
    :class="{ show: open }"
    tabindex="-1"
    :aria-labelledby="`${id}Label`"
    aria-modal="true"
    role="dialog"
    :style="{ visibility: open ? 'visible' : 'hidden' }"
  >
    <!-- Header -->
    <div class="offcanvas-header">
      <h5 :id="`${id}Label`">{{ title }}</h5>
      <button
        type="button"
        class="btn-close text-reset"
        data-bs-dismiss="offcanvas"
        aria-label="Close"
        @click="$emit('close')"
      ></button>
    </div>
    <!-- end offcanvas-header -->

    <!-- Content -->
    <div class="offcanvas-body">
      <slot />
    </div>
    <!-- end offcanvas-body -->
  </div>

  <!-- Backdrop -->
  <div
    v-if="open"
    class="offcanvas-backdrop fade"
    :class="{ show: open }"
    @click="$emit('close')"
  ></div>
</template>

<script lang="ts" setup>
import { watch } from 'vue'

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
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      document.body.classList.add('offcanvas-open')
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = '0px'
    } else {
      document.body.classList.remove('offcanvas-open')
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.offcanvas {
  z-index: 1045;
}

.offcanvas-backdrop {
  z-index: 1040;
}
</style>
