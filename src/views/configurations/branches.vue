<template>
  <div class="row">
    <div class="col-12">
      <div class="d-flex align-items-sm-center flex-sm-row flex-column my-3">
        <div class="flex-grow-1">
          <h4 class="fs-xl mb-1">{{ t('branches.page_title') }}</h4>
          <p class="text-muted mb-0">{{ t('branches.page_description') }}</p>
        </div>

        <div class="text-end mt-3 mt-sm-0">
          <button @click="handleAddBranch" type="button" class="btn btn-primary">
            <i class="ti ti-plus me-1"></i> {{ t('branches.add_new_branch') }}
          </button>
        </div>
      </div>

      <div class="row">
        <div class="col-12">
          <BranchesList
            ref="branchListRef"
            :loading="loading"
            :branches="branch_list"
            :meta="meta"
            @page-change="handlePageChange"
            @search="handleSearch"
            @refresh="handleRefresh"
            @per-page-change="handlePerPageChange"
            @status-filter="handleStatusFilter"
            @country-filter="handleCountryFilter"
            @edit="handleEditBranch"
            @delete="handleDeleteBranch"
            @toggle-status="handleToggleStatus"
          />
        </div>
      </div>
      <!-- end row-->

      <!-- Branch Form Modal -->
      <BranchFormModal
        :show="showModal"
        :is-editing="isEditing"
        :form-data="formData"
        :processing="isProcessing"
        @submit="handleSubmitBranch"
        @cancel="handleCancelForm"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useHead } from '@vueuse/head'
import { useBranchStore } from '@/stores/branches'
import { onMounted, computed, ref, reactive } from 'vue'
import BranchesList from '@/components/Branches/BranchesList.vue'
import BranchFormModal from '@/components/Branches/BranchFormModal.vue'
import { useI18n } from '@/composables/useI18n'
import { confirmDialog } from '@/utils/notification'
import type { Branch, BranchFormData } from '@/types'

const { t } = useI18n()

const store: ReturnType<typeof useBranchStore> = useBranchStore()
const branchListRef = ref<InstanceType<typeof BranchesList> | null>(null)

useHead({
  title: t('branches.page_title'),
  meta: [
    {
      name: 'description',
      content: t('branches.page_description'),
    },
  ],
})

const meta = computed(() => ({
  current_page: store.branches?.meta?.current_page ?? 1,
  last_page: store.branches?.meta?.last_page ?? 1,
  from: store.branches?.meta?.from ?? 0,
  to: store.branches?.meta?.to ?? 0,
  per_page: store.branches?.meta?.per_page ?? 10,
  total: store.branches?.meta?.total ?? 0,
}))
const branch_list = computed(() => store.branch_list)
const loading = computed(() => store.loading)
const isProcessing = computed(() => store.processing)

// Modal and form state
const showModal = ref(false)
const isEditing = ref(false)
const formData = reactive<BranchFormData>({
  code: '',
  name: '',
  country_id: null,
  address: '',
  cash_balance: '',
  status: 'active',
})

onMounted(() => {
  store.fetchBranches()
})

const handleAddBranch = () => {
  isEditing.value = false
  formData.code = ''
  formData.name = ''
  formData.country_id = null
  formData.address = ''
  formData.cash_balance = ''
  formData.status = 'active'
  store.setCurrentBranch(null)
  showModal.value = true
}

const handlePageChange = (page: number) => {
  store.fetchBranches(page)
}
const handleSearch = (search: string) => {
  store.fetchBranches(1, search)
}
const handleRefresh = () => {
  store.fetchBranches()
}

const handlePerPageChange = (perPage: number) => {
  store.fetchBranches(1, undefined, perPage)
}

const handleStatusFilter = (status: string) => {
  store.setStatusFilter(status)
  store.fetchBranches()
}

const handleCountryFilter = (countryId: number | null) => {
  store.setCountryFilter(countryId)
  store.fetchBranches()
}

const handleEditBranch = (branch: Branch) => {
  isEditing.value = true
  formData.code = branch.code
  formData.name = branch.name
  formData.country_id = branch.country_id
  formData.address = branch.address || ''
  formData.cash_balance = branch.cash_balance
  formData.status = branch.status
  store.setCurrentBranch(branch)
  showModal.value = true
}

const handleDeleteBranch = async (branchId: number) => {
  confirmDialog(
    async (confirmed) => {
      if (confirmed) {
        const success = await store.deleteBranch(branchId)
        if (success) {
          handleRefresh()
        }
      }
    },
    {
      message: t('branches.deleteConfirmMessage') || 'Are you sure you want to delete this branch?',
      title: t('branches.deleteConfirmTitle') || 'Delete Confirmation',
      type: 'danger',
      yes: t('branches.yes') || 'Yes, delete',
      no: t('branches.no') || 'Cancel',
    }
  )
}

const handleToggleStatus = async (branchId: number) => {
  confirmDialog(
    async (confirmed) => {
      if (confirmed) {
        const success = await store.toggleBranchStatus(branchId)
        if (success) {
          handleRefresh()
        }
      }
    },
    {
      message:
        t('branches.toggleStatusMessage') || 'Are you sure you want to change this branch status?',
      title: t('branches.toggleStatusTitle') || 'Status Change',
      type: 'warning',
      yes: t('branches.yes') || 'Yes, change',
      no: t('branches.no') || 'Cancel',
    }
  )
}

const handleSubmitBranch = async (data: BranchFormData) => {
  const success = await store.storeBranch(data)
  if (success) {
    handleCancelForm()
    handleRefresh()
  }
}

const handleCancelForm = () => {
  showModal.value = false
  isEditing.value = false
  formData.code = ''
  formData.name = ''
  formData.country_id = null
  formData.address = ''
  formData.cash_balance = ''
  formData.status = 'active'
  store.setCurrentBranch(null)
}
</script>
