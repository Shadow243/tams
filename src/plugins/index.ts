import type { App } from 'vue';
import PrelinePlugin from './preline'
import axiosPlugin from './axios';
import echoPlugin from './echo';
import i18n from "@/plugins/i18n";
import { registerVeeValidate } from '@/plugins/vee-validate'
import VueApexCharts from 'vue3-apexcharts'

export function registerPlugins(app: App): void {
    app.use(i18n);
    app.use(PrelinePlugin);
    app.use(axiosPlugin);
    app.use(echoPlugin);
    app.use(VueApexCharts);
    registerVeeValidate(app);
}
