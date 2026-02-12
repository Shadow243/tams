<template>
  <div class="app-search">
    <label
      v-if="label"
      :for="id"
      class="form-label"
      :class="labelClass"
    >
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>

    <div :class="icon ? 'app-search' : ''">
      <input
        ref="input"
        :id="id"
        :type="type"
        :placeholder="placeholder"
        :required="required"
        v-bind="$attrs"
        v-model="inputValue"
        :class="[
          'form-control',
          errorMessage ? 'is-invalid' : '',
        ]"
        @blur="onBlur"
      />
      <i v-if="icon" :class="`ti ti-${icon} app-search-icon text-muted`"></i>
    </div>

    <span v-if="errorMessage" class="text-sm text-error mt-2">
      {{ errorMessage }}
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRef, watch } from 'vue'
import { useField, type RuleExpression } from 'vee-validate'
import { strtolower } from '@/utils/str-utils'

export default defineComponent({
  name: 'BaseTextInput',
  props: {
    id: {
      type: String,
      default: () => `text-input-${Math.random().toString(36).substring(2, 9)}`,
    },
    name: { type: String, required: true },
    type: { type: String, default: 'text' },
    modelValue: { type: String, default: '' },
    rules: {
      type: [String, Function, Array] as unknown as () => RuleExpression<string>,
      default: '',
    },
    placeholder: { type: String, default: '' },
    label: { type: String, required: true },
    labelClass: { type: String, default: '' },
    icon: { type: String, default: '' },
    required: { type: Boolean, default: false },
  },
  emits: ['blur', 'update:modelValue'],
  setup(props, { emit }) {
    const {
      value: inputValue,
      errorMessage,
      handleBlur,
    } = useField(toRef(props, 'name'), props.rules, {
      label: strtolower(props.label),
      initialValue: props.modelValue,
    })

    // Sync vee-validate inputValue to v-model
    watch(inputValue, (val) => {
      emit('update:modelValue', val)
    })

    // Sync external modelValue to inputValue
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
      onBlur,
    }
  },
})
</script>
