<template>
  <div class="file-input-wrapper">
    <label :for="id" class="sr-only">{{ label }}</label>
    <input
      type="file"
      :id="id"
      :name="name"
      :accept="accept"
      class="form-control"
      @change="onFileChange"
    />
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'update:file', file: File | null): void
}>()

const props = defineProps<{
  label?: string
  name?: string
  id?: string
  accept?: string
}>()

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] || null
  emit('update:file', file)
}
</script>
