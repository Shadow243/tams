import type { App } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { showModal } from '@/utils/ui-utils';

const globalMixin = {
  methods: {
    showModal,
  },
};

export function registerCoreMixins(app: App): void {
  const authStore = useAuthStore();

  app.mixin(globalMixin);
  app.provide('user', authStore.user);
}
