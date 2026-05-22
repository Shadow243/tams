<template>
  <div class="customer-accounts-page">
    <!-- Page Header -->
    <div class="row mb-3">
      <div class="col-12">
        <div class="page-title-box">
          <div class="page-title-right">
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb m-0">
                <li class="breadcrumb-item">
                  <router-link :to="{ name: 'home' }">{{ $t('sidebar.home') }}</router-link>
                </li>
                <li class="breadcrumb-item active" aria-current="page">
                  {{ $t('sidebar.customer_accounts') }}
                </li>
              </ol>
            </nav>
          </div>
          <h4 class="page-title">
            <i class="ti ti-pig-money me-2"></i>
            {{ $t('sidebar.customer_accounts') }}
          </h4>
        </div>
      </div>
    </div>

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

.page-title-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;

  .page-title {
    margin-bottom: 0;
    font-size: 1.25rem;
    font-weight: 600;
    display: flex;
    align-items: center;

    i {
      font-size: 1.5rem;
    }
  }

  .page-title-right {
    .breadcrumb {
      background: transparent;
      padding: 0;
      margin: 0;
    }
  }
}
</style>
