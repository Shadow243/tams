<template>
  <div class="form-check">
    <input
      :id="id"
      type="checkbox"
      :name="name"
      :checked="inputValue"
      v-model="inputValue"
      class="form-check-input form-check-input-light fs-14"
      :class="[errorMessage ? 'is-invalid' : '']"
      v-bind="$attrs"
      @blur="onBlur"
    />
    <label
      v-if="label"
      :for="id"
      class="form-check-label"
    >
      {{ label }}
    </label>

    <span v-if="errorMessage" class="text-sm text-error mt-2 d-block">
      {{ errorMessage }}
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRef, watch } from 'vue'
import { useField, type RuleExpression } from 'vee-validate'

export default defineComponent({
  name: 'BaseCheckbox',
  props: {
    id: {
      type: String,
      default: () => `checkbox-${Math.random().toString(36).substring(2, 9)}`,
    },
    name: { type: String, required: true },
    modelValue: { type: Boolean, default: false },
    rules: {
      type: [String, Function, Array] as unknown as () => RuleExpression<boolean>,
      default: '',
    },
    label: { type: String, default: '' },
  },
  emits: ['blur', 'update:modelValue'],
  setup(props, { emit }) {
    const {
      value: inputValue,
      errorMessage,
      handleBlur,
    } = useField(toRef(props, 'name'), props.rules, {
      type: 'checkbox',
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

<style scoped>
.form-check-input.is-invalid {
  border-color: var(--bs-danger);
}
</style>
