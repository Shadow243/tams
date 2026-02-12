<template>
  <div>
    <label
      v-if="label"
      :for="id"
      class="form-label"
      :class="labelClass"
    >
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>

    <div :class="icon ? 'app-search' : ''" style="position: relative;">
      <input
        :id="id"
        :type="inputType"
        autocomplete="off"
        :placeholder="placeholder"
        :required="required"
        v-model="inputValue"
        v-bind="$attrs"
        class="form-control"
        :class="[errorMessage ? 'is-invalid' : '']"
        @blur="onBlur"
      />

      <i v-if="icon" :class="`ti ti-${icon} app-search-icon text-muted`"></i>

      <button
        v-if="withToggle"
        type="button"
        @click="toggleInputType"
        class="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted"
        style="z-index: 10; padding: 0.25rem 0.75rem;"
        tabindex="-1"
      >
        <i v-if="inputType === 'password'" class="ti ti-eye" style="font-size: 1.2rem;"></i>
        <i v-else class="ti ti-eye-off" style="font-size: 1.2rem;"></i>
      </button>
    </div>

    <span v-if="errorMessage" class="invalid-feedback d-block">
      {{ errorMessage }}
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, toRef, watch } from 'vue'
import { useField, type RuleExpression } from 'vee-validate'
import { strtolower } from '@/utils/str-utils'

export default defineComponent({
  name: 'BasePasswordInput',
  props: {
    id: {
      type: String,
      default: () => `password-input-${Math.random().toString(36).substring(2, 9)}`,
    },
    name: { type: String, required: true },
    modelValue: { type: String, default: '' },
    rules: {
      type: [String, Function, Array] as unknown as () => RuleExpression<string>,
      default: '',
    },
    placeholder: { type: String, default: 'Enter your password' },
    label: { type: String, required: true },
    labelClass: { type: String, default: '' },
    withToggle: { type: Boolean, default: true },
    icon: { type: String, default: '' },
    required: { type: Boolean, default: false },
  },
  emits: ['blur', 'update:modelValue'],
  setup(props, { emit }) {
    const inputType = ref<'password' | 'text'>('password')

    const toggleInputType = () => {
      inputType.value = inputType.value === 'password' ? 'text' : 'password'
    }

    const {
      value: inputValue,
      errorMessage,
      handleBlur,
    } = useField(toRef(props, 'name'), props.rules, {
      label: strtolower(props.label),
      initialValue: props.modelValue,
    })

    // emit changes to parent
    watch(inputValue, (val) => {
      emit('update:modelValue', val)
    })

    // sync external modelValue changes
    watch(
      () => props.modelValue,
      (val) => {
        if (val !== inputValue.value) {
          inputValue.value = val
        }
      }
    )

    const onBlur = (e: FocusEvent) => {
      handleBlur(e)
      emit('blur', e)
    }

    return {
      inputValue,
      errorMessage,
      inputType,
      toggleInputType,
      onBlur,
    }
  },
})
</script>

<style scoped>
.dark .dark\:focus\:outline-none:focus {
  outline-style: auto !important;
}
</style>
