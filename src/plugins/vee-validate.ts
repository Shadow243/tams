import { type App } from 'vue'
import { defineRule, configure } from 'vee-validate'
import { required, email, min, max, confirmed } from '@vee-validate/rules'
import { localize, setLocale } from '@vee-validate/i18n'
import fr from '@vee-validate/i18n/dist/locale/fr.json'

/**
 * Registers VeeValidate rules and localization.
 *
 * @param {App} _app - The Vue application instance.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function registerVeeValidate(_app: App) {
    // Register validation rules globally
    defineRule('required', required)
    defineRule('email', email)
    defineRule('min', min)
    defineRule('max', max)
    defineRule('confirmed', confirmed)

    // Configure localization with French messages
    configure({
        generateMessage: localize({
            fr,
        }),
    })
    setLocale('fr')
}