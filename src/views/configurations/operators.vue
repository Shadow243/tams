<template>
  <div class="row">
    <div class="col-12">
      <div class="d-flex align-items-sm-center flex-sm-row flex-column my-3">
        <div class="flex-grow-1">
          <h4 class="fs-xl mb-1">{{ t('operators.page_title') }}</h4>
          <p class="text-muted mb-0">{{ t('operators.page_description') }}</p>
        </div>
      </div>

      <div class="row">
        <div class="col-md-8">
          <OperatorsList
            ref="operatorListRef"
            :loading="loading"
            :operators="operator_list"
            :meta="meta"
            @page-change="handlePageChange"
            @search="handleSearch"
            @refresh="handleRefresh"
            @per-page-change="handlePerPageChange"
            @edit="handleEditOperator"
            @delete="handleDeleteOperator"
          />
        </div>
        <div class="col-md-4">
          <OperatorForm
            :is-editing="isEditing"
            :form-data="formData"
            :processing="isProcessing"
            :countries="countries"
            @submit="handleSubmitOperator"
            @cancel="handleCancelForm"
          />
        </div>
      </div>
      <!-- end row-->
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useHead } from '@vueuse/head'
import { useOperatorStore } from '@/stores/operators'
import { useCountryStore } from '@/stores/countries'
import { onMounted, computed, ref, reactive } from 'vue'
import OperatorsList from '@/components/Operators/OperatorsList.vue'
import OperatorForm from '@/components/Operators/OperatorForm.vue'
import { useI18n } from '@/composables/useI18n'
import { confirmDialog } from '@/utils/notification'
import type { Operator } from '@/types'

const { t } = useI18n()

const store: ReturnType<typeof useOperatorStore> = useOperatorStore()
const countryStore: ReturnType<typeof useCountryStore> = useCountryStore()
const operatorListRef = ref<InstanceType<typeof OperatorsList> | null>(null)

useHead({
  title: t('operators.page_title'),
  meta: [
    {
      name: 'description',
      content: t('operators.page_description'),
    },
  ],
})

const meta = computed(() => ({
  current_page: store.operators?.meta?.current_page ?? 1,
  last_page: store.operators?.meta?.last_page ?? 1,
  from: store.operators?.meta?.from ?? 0,
  to: store.operators?.meta?.to ?? 0,
  per_page: store.operators?.meta?.per_page ?? 10,
  total: store.operators?.meta?.total ?? 0,
}))
const operator_list = computed(() => store.operator_list)
const loading = computed(() => store.loading)
const isProcessing = computed(() => store.processing)
const countries = computed(() => countryStore.country_list)

// Form state
const isEditing = ref(false)
const formData = reactive({
  name: '',
  country_id: null as number | null,
  logo_url: null as string | null,
})

onMounted(async () => {
  store.fetchOperators()
  // Fetch countries for the dropdown
  await countryStore.fetchCountries(1, '', 1000) // Fetch all countries
})

const handlePageChange = (page: number) => {
  store.fetchOperators(page)
}
const handleSearch = (search: string) => {
  store.fetchOperators(1, search)
}
const handleRefresh = () => {
  store.fetchOperators()
}

const handlePerPageChange = (perPage: number) => {
  store.fetchOperators(1, undefined, perPage)
}

const handleEditOperator = (operator: Operator) => {
  isEditing.value = true
  formData.name = operator.name
  formData.country_id = operator.country_id
  formData.logo_url = operator.logo_url
  store.setCurrentOperator(operator)
}

const handleDeleteOperator = async (operatorId: number) => {
  confirmDialog(
    async (confirmed) => {
      if (confirmed) {
        const success = await store.deleteOperator(operatorId)
        if (success) {
          handleRefresh()
        }
      }
    },
    {
      message:
        t('operators.deleteConfirmMessage') || 'Are you sure you want to delete this operator?',
      title: t('operators.deleteConfirmTitle') || 'Delete Confirmation',
      type: 'error',
      yes: t('operators.yes') || 'Yes, delete',
      no: t('operators.no') || 'Cancel',
    }
  )
}

const handleSubmitOperator = async (data: {
  name: string
  country_id: number | null
  logo: File | null
}) => {
  const success = await store.storeOperator(data)
  if (success) {
    handleCancelForm()
    handleRefresh()
  }
}

const handleCancelForm = () => {
  isEditing.value = false
  formData.name = ''
  formData.country_id = null
  formData.logo_url = null
  store.setCurrentOperator(null)
}
</script>