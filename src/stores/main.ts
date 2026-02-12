import { ref } from "vue";
import { defineStore } from "pinia";

export const useMainStore = defineStore("main", () => {
    const locales = ref<string[]>([]);
    const loadLocaleData = ref<Record<string, any>>({});
    const printing = ref(false);

    const setLocaleData = (data: Record<string, any>) => {
        loadLocaleData.value = data;
    };

    function setLocales(newLocales: string[]) {
        locales.value = newLocales;
    }

    return {
        locales,
        printing,
        loadLocaleData,
        setLocaleData,
        setLocales,
    };
});
