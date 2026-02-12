import type { App } from 'vue';
import PrelinePlugin from './preline'
import axiosPlugin from './axios';
import i18n from "@/plugins/i18n";
import { registerVeeValidate } from '@/plugins/vee-validate'

export function registerPlugins(app: App): void {
    app.use(i18n);
    app.use(PrelinePlugin);
    app.use(axiosPlugin);
    registerVeeValidate(app);
}
