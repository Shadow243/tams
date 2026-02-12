import { ref } from "vue";

/**
 * @typedef {Object} PhoneInputProps
 * @property {string} [id]
 * @property {string} [name]
 * @property {string} [placeholder]
 */

/**
 * @typedef {Object} InputOptions
 * @property {string} [id]
 * @property {string} [name]
 * @property {string} [placeholder]
 * @property {string} styleClasses
 */

/**
 * @typedef {Object} DropdownOptions
 * @property {boolean} showFlags
 * @property {boolean} showDialCodeInList
 * @property {boolean} showDialCodeInSelection
 */

export default function setupPhoneInput(
    props: { id: unknown; name: unknown; placeholder: unknown; },
    inputValue: { value: unknown; }
) {
    const defaultCountry = "CD";

    const preferredCountries = ["CD", "RW", "FR"];

    const dropdownOptions = {
        showFlags: true,
        showDialCodeInList: true,
        showDialCodeInSelection: true,
    };

    const inputOptions = {
        id: props.id,
        name: props.name,
        placeholder: props.placeholder,
        styleClasses: "border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full",
    };

    const phoneRef = ref<string | null>(
        typeof inputValue?.value === "string" ? inputValue.value as string : null
    );

    return {
        phoneRef,
        inputOptions,
        defaultCountry,
        dropdownOptions,
        preferredCountries,
    };
}
