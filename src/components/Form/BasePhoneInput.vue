<script lang="ts">
import { defineComponent, watch } from 'vue'
import { useField } from 'vee-validate'
import { getUniqueID, strtolower, isEmpty } from '@/utils/str-utils'

import VueTelInput from 'vue-tel-input'
// import 'vue-tel-input/dist/vue-tel-input.css'

import setupPhoneInput from '@/composables/phone-input'

export default defineComponent({
  inheritAttrs: false,
  components: { VueTelInput },
  props: {
    id: {
      type: String,
      default: () => `phone-input-${getUniqueID()}`,
    },
    rules: {
      type: [String, Object, Function, Array],
      default: '',
    },
    name: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      required: true,
    },
    formatted: {
      type: Boolean,
      default: true,
    },
    error: String,
  },
  setup(props) {
    const {
      value: inputValue,
      errorMessage,
      handleBlur,
      handleChange,
      meta,
    } = useField(props.name, props.rules as any, {
      label: strtolower(props.label),
    })

    const { phoneRef, defaultCountry, dropdownOptions, inputOptions, preferredCountries } =
      setupPhoneInput(props, inputValue)

    watch(inputValue, (val) => {
      if (val) {
        phoneRef.value = val.toString().replace('+', '')
      }
    })

    const handleInput = (value: any) => {
      if (value.valid) {
        if (props.formatted) {
          inputValue.value = value.number.toString().replace('+', '')
        } else {
          inputValue.value = {
            number: value.nationalNumber,
            code: value.countryCallingCode,
          }
        }
      }
    }

    return {
      meta,
      isEmpty,
      phoneRef,
      inputValue,
      handleBlur,
      handleInput,
      handleChange,
      errorMessage,
      inputOptions,
      defaultCountry,
      dropdownOptions,
      preferredCountries,
    }
  },
})
</script>
