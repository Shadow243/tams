<template>
  <button
    type="submit"
    :disabled="isProcessing || Boolean($attrs.disabled)"
    :class="[
      'btn btn-primary fw-bold py-2',
      isProcessing ? 'disabled' : '',
      full ? `btn-${color}` : `btn-outline-${color}`,
    ]"
    v-bind="$attrs"
  >
    <template v-if="isProcessing">
      <!-- <span
        class="animate-spin inline-block size-4 border-[3px] border-current border-t-transparent text-white rounded-full"
        role="status"
        aria-label="loading"
      >
        <span class="sr-only">Loading...</span>
      </span> -->
      <div class="spinner-border text-danger spinner-border-sm mx-2" role="status"></div>
      <span class=""> Patientez...</span>
    </template>
    <template v-else>
      <slot />
    </template>
  </button>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

export default defineComponent({
  name: 'BaseSubmit',
  props: {
    full: { type: Boolean, default: false },
    color: { type: String, default: 'primary' },
    processing: { type: Boolean, default: false },
    form: { type: Object as () => { processing?: boolean } | null, default: null },
  },
  setup(props) {
    const isProcessing = computed(() => {
      return props.processing || props.form?.processing === true
    })
    return { isProcessing }
  },
})
</script>
<style scoped>
.ml {
  margin-left: 0.5rem;
}
.pl {
  padding-left: 0.5rem;
}
</style>
