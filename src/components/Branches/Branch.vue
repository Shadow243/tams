<template>
  <td class="text-center">{{ index + 1 }}</td>
  <td>
    <div class="d-flex justify-content-start align-items-center gap-2">
      <div>
        <h5 class="text-nowrap mb-0 lh-base fs-base">
          <a href="#!" class="link-reset">{{ branch.name }}</a>
        </h5>
        <small class="text-muted">{{ branch.code }}</small>
      </div>
    </div>
  </td>
  <td>
    <span v-if="branch.country">{{ branch.country.name }}</span>
    <span v-else class="text-muted">-</span>
  </td>
  <td>
    <span v-if="branch.address" class="text-truncate d-inline-block" style="max-width: 200px">
      {{ branch.address }}
    </span>
    <span v-else class="text-muted">-</span>
  </td>
  <td class="text-end">
    <div
      v-if="branch.balances && branch.balances.length > 0"
      class="d-flex flex-column gap-1 align-items-end"
    >
      <div v-for="balance in branch.balances" :key="balance.currency_code" class="text-nowrap">
        <small class="badge badge-soft-primary">
          {{ balance.currency?.symbol || balance.currency_code }}
          {{ formatCurrency(balance.cash_balance) }}
        </small>
      </div>
    </div>
    <span v-else class="text-muted">-</span>
  </td>
  <td class="text-center">
    <span
      class="badge"
      :class="{
        'badge-soft-success': branch.is_active,
        'badge-soft-danger': !branch.is_active,
      }"
    >
      {{ branch.status_label }}
    </span>
  </td>
  <td class="text-center">{{ formatDate(branch.created_at) }}</td>
  <td>
    <div class="d-flex align-items-center justify-content-center gap-1">
      <a
        href="javascript:void(0);"
        @click="$emit('manage-balances', branch)"
        class="btn btn-primary btn-icon btn-sm"
        :title="t('branches.manageBalances') || 'Manage Balances'"
      >
        <i class="ti ti-wallet fs-lg"></i>
      </a>
      <a
        href="javascript:void(0);"
        @click="$emit('toggle-status', branch.id)"
        class="btn btn-icon btn-sm"
        :class="branch.is_active ? 'btn-warning' : 'btn-info'"
        :title="branch.is_active ? t('branches.deactivate') : t('branches.activate')"
      >
        <i class="ti" :class="branch.is_active ? 'ti-ban' : 'ti-check'"></i>
      </a>
      <a
        href="javascript:void(0);"
        @click="$emit('edit', branch)"
        class="btn btn-success btn-icon btn-sm"
        :title="t('branches.edit') || 'Edit'"
      >
        <i class="ti ti-edit fs-lg"></i>
      </a>
      <a
        href="javascript:void(0);"
        @click="$emit('delete', branch.id)"
        class="btn btn-danger btn-icon btn-sm"
        :title="t('branches.delete') || 'Delete'"
      >
        <i class="ti ti-trash fs-lg"></i>
      </a>
    </div>
  </td>
</template>

<script lang="ts" setup>
import { useI18n } from '@/composables/useI18n'
import type { Branch } from '@/types'

const { t } = useI18n()

defineProps<{
  branch: Branch
  index: number
}>()

defineEmits<{
  (e: 'edit', branch: Branch): void
  (e: 'delete', branchId: number): void
  (e: 'toggle-status', branchId: number): void
  (e: 'manage-balances', branch: Branch): void
}>()

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const formatCurrency = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}
</script>
