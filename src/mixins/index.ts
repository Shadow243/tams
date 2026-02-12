import type { App } from 'vue';
import { registerCoreMixins } from './core';
import { registerDynamicComponents } from './dynamic';

export function registerGlobalMixins(app: App): void {
  registerCoreMixins(app);
  registerDynamicComponents(app);
}
