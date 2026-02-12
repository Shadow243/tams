// @ts-nocheck
import type { App } from 'vue';

export function registerDynamicComponents(app: App): void {
    const registerFromGlob = (glob: Record<string, unknown>) => {
        for (const path in glob) {
            const componentName = path.replace(/(^.\/)|(\.vue$)/g, '');
            const name = componentName.slice(componentName.lastIndexOf('/') + 1);
            const component = glob[path];
            app.component(name, component.default || component);
        }
    };

    // ✅ Use eager loading so components are available immediately
    registerFromGlob(import.meta.glob('./../components/Form/*.vue', { eager: true }));
    registerFromGlob(import.meta.glob('./../components/Shared/*.vue', { eager: true }));
    registerFromGlob(import.meta.glob('./../components/Crud/*.vue', { eager: true }));
}
