<template>
  <div class="searchable-select" ref="containerRef">
    <div class="input-group">
      <input
        type="text"
        class="form-control"
        :class="{ 'is-invalid': error }"
        v-model="searchQuery"
        @focus="showDropdown"
        @input="onSearch"
        :placeholder="placeholder"
        :disabled="disabled"
        autocomplete="off"
      />
      <button
        v-if="modelValue && clearable"
        type="button"
        class="btn btn-outline-secondary"
        @click="clearSelection"
        :disabled="disabled"
      >
        <i class="ti ti-x"></i>
      </button>
      <button
        type="button"
        class="btn btn-outline-secondary dropdown-toggle"
        @click="toggleDropdown"
        :disabled="disabled"
      >
        <i class="ti ti-chevron-down"></i>
      </button>
    </div>
    <div v-if="error" class="invalid-feedback d-block">
      {{ error }}
    </div>

    <!-- Dropdown -->
    <div v-show="isOpen && !disabled" class="searchable-select-dropdown" :class="{ show: isOpen }">
      <div v-if="filteredOptions.length === 0" class="dropdown-item text-muted">
        {{ noResultsText || t('common.no_results') || 'Aucun résultat' }}
      </div>
      <button
        v-for="option in filteredOptions"
        :key="getOptionValue(option)"
        type="button"
        class="dropdown-item"
        :class="{ active: isSelected(option) }"
        @click="selectOption(option)"
      >
        <i v-if="isSelected(option)" class="ti ti-check me-2"></i>
        {{ getOptionLabel(option) }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

interface Props {
  modelValue: any
  options: any[]
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  error?: string
  optionLabel?: string | ((option: any) => string)
  optionValue?: string | ((option: any) => any)
  noResultsText?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Sélectionnez une option',
  disabled: false,
  clearable: true,
  error: '',
  optionLabel: 'name',
  optionValue: 'id',
  noResultsText: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
  change: [value: any]
}>()

const searchQuery = ref('')
const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const getOptionLabel = (option: any): string => {
  if (typeof props.optionLabel === 'function') {
    return props.optionLabel(option)
  }
  return option[props.optionLabel]
}

const getOptionValue = (option: any): any => {
  if (typeof props.optionValue === 'function') {
    return props.optionValue(option)
  }
  return option[props.optionValue]
}

const selectedOption = computed(() => {
  if (!props.modelValue) return null
  return props.options.find((opt) => getOptionValue(opt) === props.modelValue)
})

const filteredOptions = computed(() => {
  if (!searchQuery.value) {
    return props.options
  }

  const query = searchQuery.value.toLowerCase()
  return props.options.filter((option) => {
    const label = getOptionLabel(option).toLowerCase()
    return label.includes(query)
  })
})

const isSelected = (option: any): boolean => {
  return getOptionValue(option) === props.modelValue
}

const selectOption = (option: any): void => {
  const value = getOptionValue(option)
  emit('update:modelValue', value)
  emit('change', value)
  searchQuery.value = getOptionLabel(option)
  isOpen.value = false
}

const clearSelection = (): void => {
  emit('update:modelValue', null)
  emit('change', null)
  searchQuery.value = ''
}

const showDropdown = (): void => {
  if (!props.disabled) {
    isOpen.value = true
  }
}

const toggleDropdown = (): void => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

const onSearch = (): void => {
  isOpen.value = true
}

const handleClickOutside = (event: MouseEvent): void => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

// Update search query when modelValue changes
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && selectedOption.value) {
      searchQuery.value = getOptionLabel(selectedOption.value)
    } else {
      searchQuery.value = ''
    }
  },
  { immediate: true }
)

// Re-evaluate label when options load asynchronously (e.g. currencies fetched after modal opens)
watch(
  () => props.options,
  () => {
    if (props.modelValue && selectedOption.value) {
      searchQuery.value = getOptionLabel(selectedOption.value)
    }
  }
)

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.searchable-select {
  position: relative;
}

.searchable-select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1050;
  max-height: 300px;
  overflow-y: auto;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  margin-top: 0.125rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.searchable-select-dropdown.show {
  display: block;
}

.searchable-select-dropdown .dropdown-item {
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  clear: both;
  font-weight: 400;
  color: #212529;
  text-align: inherit;
  white-space: nowrap;
  background-color: transparent;
  border: 0;
  text-decoration: none;
  cursor: pointer;
}

.searchable-select-dropdown .dropdown-item:hover {
  background-color: #f8f9fa;
}

.searchable-select-dropdown .dropdown-item.active {
  background-color: #0d6efd;
  color: white;
}

.searchable-select-dropdown .dropdown-item.text-muted {
  cursor: default;
}

.searchable-select-dropdown .dropdown-item.text-muted:hover {
  background-color: transparent;
}
</style>
