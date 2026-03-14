<template>
  <div class="row">
    <div class="col-12">
      <div class="d-flex align-items-sm-center flex-sm-row flex-column my-3">
        <div class="flex-grow-1">
          <h4 class="fs-xl mb-1">{{ t('wallets.page_title') }}</h4>
          <p class="text-muted mb-0">{{ t('wallets.page_description') }}</p>
        </div>

        <div class="text-end mt-3 mt-sm-0">
          <button @click="handleAddWallet" type="button" class="btn btn-primary">
            <i class="ti ti-plus me-1"></i> {{ t('wallets.add_new_wallet') }}
          </button>
        </div>
      </div>

      <div class="row">
        <div class="col-12">
          <WalletsList
            ref="walletListRef"
            :loading="loading"
            :wallets="wallet_list"
            :meta="meta"
            @page-change="handlePageChange"
            @search="handleSearch"
            @refresh="handleRefresh"
            @per-page-change="handlePerPageChange"
            @status-filter="handleStatusFilter"
            @branch-filter="handleBranchFilter"
            @operator-filter="handleOperatorFilter"
            @edit="handleEditWallet"
            @delete="handleDeleteWallet"
            @toggle-status="handleToggleStatus"
          />
        </div>
      </div>
      <!-- end row-->

      <!-- Wallet Form Modal -->
      <WalletFormModal
        :show="showModal"
        :is-editing="isEditing"
        :form-data="formData"
        :processing="isProcessing"
        @submit="handleSubmitWallet"
        @cancel="handleCancelForm"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useHead } from '@vueuse/head'
import { useWalletStore } from '@/stores/wallets'
import { onMounted, computed, ref, reactive } from 'vue'
import WalletsList from '@/components/Wallets/WalletsList.vue'
import WalletFormModal from '@/components/Wallets/WalletFormModal.vue'
import { useI18n } from '@/composables/useI18n'
import { confirmDialog } from '@/utils/notification'
import type { Wallet, WalletFormData } from '@/types'

const { t } = useI18n()

const store: ReturnType<typeof useWalletStore> = useWalletStore()
const walletListRef = ref<InstanceType<typeof WalletsList> | null>(null)

useHead({
  title: t('wallets.page_title'),
  meta: [
    {
      name: 'description',
      content: t('wallets.page_description'),
    },
  ],
})

const meta = computed(() => ({
  current_page: store.wallets?.meta?.current_page ?? 1,
  last_page: store.wallets?.meta?.last_page ?? 1,
  from: store.wallets?.meta?.from ?? 0,
  to: store.wallets?.meta?.to ?? 0,
  per_page: store.wallets?.meta?.per_page ?? 10,
  total: store.wallets?.meta?.total ?? 0,
}))
const wallet_list = computed(() => store.wallet_list)
const loading = computed(() => store.loading)
const isProcessing = computed(() => store.processing)

// Modal and form state
const showModal = ref(false)
const isEditing = ref(false)
const formData = reactive<WalletFormData>({
  branch_id: null,
  operator_id: null,
  wallet_number: '',
  balance: '',
  currency_id: null,
  status: 'active',
})

onMounted(() => {
  store.fetchWallets()
})

const handleAddWallet = () => {
  isEditing.value = false
  formData.branch_id = null
  formData.operator_id = null
  formData.wallet_number = ''
  formData.balance = ''
  formData.currency_id = null
  formData.status = 'active'
  store.setCurrentWallet(null)
  showModal.value = true
}

const handlePageChange = (page: number) => {
  store.fetchWallets(page)
}

const handleSearch = (search: string) => {
  store.fetchWallets(1, search)
}

const handleRefresh = () => {
  store.fetchWallets()
}

const handlePerPageChange = (perPage: number) => {
  store.fetchWallets(1, undefined, perPage)
}

const handleStatusFilter = (status: string) => {
  store.setStatusFilter(status)
  store.fetchWallets()
}

const handleBranchFilter = (branchId: number | null) => {
  store.setBranchFilter(branchId)
  store.fetchWallets()
}

const handleOperatorFilter = (operatorId: number | null) => {
  store.setOperatorFilter(operatorId)
  store.fetchWallets()
}

const handleEditWallet = (wallet: Wallet) => {
  isEditing.value = true
  formData.branch_id = wallet.branch_id
  formData.operator_id = wallet.operator_id
  formData.wallet_number = wallet.wallet_number
  formData.balance = wallet.balance
  formData.currency_id = wallet.currency_id
  formData.status = wallet.status
  store.setCurrentWallet(wallet)
  showModal.value = true
}

const handleDeleteWallet = async (walletId: number) => {
  confirmDialog(
    async (confirmed) => {
      if (confirmed) {
        const success = await store.deleteWallet(walletId)
        if (success) {
          handleRefresh()
        }
      }
    },
    {
      message: t('wallets.deleteConfirmMessage') || 'Are you sure you want to delete this wallet?',
      title: t('wallets.deleteConfirmTitle') || 'Delete Confirmation',
      type: 'danger',
      yes: t('wallets.yes') || 'Yes, delete',
      no: t('wallets.no') || 'Cancel',
    }
  )
}

const handleToggleStatus = async (walletId: number) => {
  confirmDialog(
    async (confirmed) => {
      if (confirmed) {
        const success = await store.toggleWalletStatus(walletId)
        if (success) {
          handleRefresh()
        }
      }
    },
    {
      message:
        t('wallets.toggleStatusMessage') || 'Are you sure you want to change this wallet status?',
      title: t('wallets.toggleStatusTitle') || 'Status Change',
      type: 'warning',
      yes: t('wallets.yes') || 'Yes, change',
      no: t('wallets.no') || 'Cancel',
    }
  )
}

const handleSubmitWallet = async (data: WalletFormData) => {
  const success = await store.storeWallet(data)
  if (success) {
    handleCancelForm()
    handleRefresh()
  }
}

const handleCancelForm = () => {
  showModal.value = false
  store.setCurrentWallet(null)
}
</script>
