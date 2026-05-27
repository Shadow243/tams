<template>
  <div class="customer-accounts-page mt-3">
    <!-- Customer Accounts List Component -->
    <CustomerAccountsList />
  </div>
</template>

<script setup lang="ts">
import CustomerAccountsList from '@/components/CustomerAccounts/CustomerAccountsList.vue'
</script>

<style scoped lang="scss">
.customer-accounts-page {
  padding: 0;
}
</style>
