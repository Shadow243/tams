<template>
  <div class="error-page">
    <div class="error-content">
      <h1 class="error-code">{{ t('notFound.code') }}</h1>
      <h2 class="error-title">{{ t('notFound.title') }}</h2>
      <p class="error-message">{{ t('notFound.message') }}</p>
      <router-link to="/" class="btn-home"> {{ t('notFound.goHome') }} </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
</script>

<style scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  text-align: center;
}

.error-content {
  max-width: 600px;
}

.error-code {
  font-size: 8rem;
  font-weight: bold;
  color: #e74c3c;
  margin: 0;
  line-height: 1;
}

.error-title {
  font-size: 2rem;
  margin: 1rem 0;
  color: #333;
}

.error-message {
  font-size: 1.1rem;
  color: #666;
  margin: 1rem 0 2rem;
}

.btn-home {
  display: inline-block;
  padding: 0.75rem 2rem;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.btn-home:hover {
  background-color: #2980b9;
}
</style>