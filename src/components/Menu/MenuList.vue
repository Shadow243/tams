<template>
  <ul class="side-nav">
    <template v-for="menuItem in items" :key="menuItem.label">
      <!-- Section Header -->
      <li
        v-if="menuItem.type === 'header' && (menuItem.permissions === undefined || hasPermission(menuItem.permissions))"
        class="side-nav-title mt-2"
        :data-lang="menuItem.label"
      >
        {{ menuItem.label }}
      </li>

      <!-- Menu Item with Children (Collapsible) -->
      <li
        v-else-if="menuItem.type === 'menu' && menuItem.children && menuItem.children.length > 0 && hasPermission(menuItem.permissions)"
        class="side-nav-item"
        :class="{ 'special-menu': subIsActive(menuItem.subRoutesActive) }"
      >
        <a
          data-bs-toggle="collapse"
          :href="`#${menuItem.id || menuItem.label.toLowerCase().replace(/\s+/g, '-')}`"
          aria-expanded="false"
          :aria-controls="menuItem.id || menuItem.label.toLowerCase().replace(/\s+/g, '-')"
          class="side-nav-link"
        >
          <span class="menu-icon" v-if="menuItem.icon">
            <i class="ti" :class="`ti-${menuItem.icon}`"></i>
          </span>
          <span class="menu-text" :data-lang="menuItem.label">{{ menuItem.label }}</span>
          <span class="menu-arrow"></span>
        </a>
        <div class="collapse" :id="menuItem.id || menuItem.label.toLowerCase().replace(/\s+/g, '-')">
          <MenuList :items="menuItem.children" :innerLoop="true" />
        </div>
      </li>

      <!-- Regular Menu Item (Link) -->
      <router-link
        v-else-if="menuItem.type === 'menu' && (menuItem.permissions === undefined || hasPermission(menuItem.permissions))"
        :to="{ name: menuItem.route }"
        v-slot="{ href, navigate, isActive }"
        custom
      >
        <li class="side-nav-item">
          <a
            :href="href"
            @click="navigate"
            class="side-nav-link"
            :class="{ 'special-menu': isActive || isRouteActive(menuItem.route) }"
          >
            <span class="menu-icon" v-if="menuItem.icon">
              <i class="ti" :class="`ti-${menuItem.icon}`"></i>
            </span>
            <span class="menu-text" :data-lang="menuItem.label">{{ menuItem.label }}</span>
          </a>
        </li>
      </router-link>

      <!-- Disabled Menu Item -->
      <li
        v-else-if="menuItem.type === 'menu' && !hasPermission(menuItem.permissions)"
        class="side-nav-item"
      >
        <a href="#" class="side-nav-link disabled">
          <span class="menu-icon" v-if="menuItem.icon">
            <i class="ti" :class="`ti-${menuItem.icon}`"></i>
          </span>
          <span class="menu-text" :data-lang="menuItem.label">{{ menuItem.label }}</span>
        </a>
      </li>
    </template>
  </ul>
</template>
<script lang="ts" setup>
import { useAuthStore } from '@/stores/auth'
import { useRoute } from 'vue-router'

defineProps({
  items: {
    type: Array as () => Array<any>,
    required: true,
  },
  innerLoop: {
    type: Boolean,
    default: false,
  },
})

const store = useAuthStore()
const route = useRoute()

const hasPermission = (permissions: string[] | undefined): boolean => {
  if (!permissions) return true
  return store.hasPermission(permissions)
}

const subIsActive = (paths: string[] | string): boolean => {
  const testPaths = Array.isArray(paths) ? paths : [paths]
  return testPaths.some((path) => route.path.startsWith(path))
}

const isRouteActive = (routeName: string): boolean => {
  return route.name === routeName
}
</script>