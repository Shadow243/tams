import { mergeApiLocales, loadAvailableLocales } from "@/plugins/i18n"

export default function useLocale() {
    /**
     * Load and merge locales from API
     * Fetches available locales and their translations, then merges with local ones
     */
    const loadAppConfig = async (): Promise<void> => {
        await mergeApiLocales()
    }

    /**
     * Get available locales from API
     * Returns a map of locale codes to their display names
     * Example: { "en": "English", "fr": "Français" }
     */
    const getAvailableLocales = async (): Promise<Record<string, string>> => {
        return await loadAvailableLocales()
    }

    return { 
        loadAppConfig,
        getAvailableLocales
    }
}
