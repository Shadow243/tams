<template>
  <div class="row">
    <div class="col-12">
      <div class="d-flex align-items-sm-center flex-sm-row flex-column my-3">
        <div class="flex-grow-1">
          <h4 class="fs-xl mb-1">{{ t('countries.page_title') }}</h4>
          <p class="text-muted mb-0">{{ t('countries.page_description') }}</p>
        </div>
      </div>

      <div class="row">
        <div class="col-md-8">
          <CountriesList
            ref="countryListRef"
            :loading="loading"
            :countries="country_list"
            :meta="meta"
            @page-change="handlePageChange"
            @search="handleSearch"
            @refresh="handleRefresh"
            @per-page-change="handlePerPageChange"
            @edit="handleEditCountry"
            @delete="handleDeleteCountry"
          />
        </div>
        <div class="col-md-4">
          <CountryForm
            :is-editing="isEditing"
            :form-data="formData"
            :processing="isProcessing"
            @submit="handleSubmitCountry"
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
import { useCountryStore } from '@/stores/countries'
import { onMounted, computed, ref, reactive } from 'vue'
import CountriesList from '@/components/Countries/CountriesList.vue'
import CountryForm from '@/components/Countries/CountryForm.vue'
import { useI18n } from '@/composables/useI18n'
import { confirmDialog } from '@/utils/notification'
import type { Country } from '@/types'

const { t } = useI18n()

const store: ReturnType<typeof useCountryStore> = useCountryStore()
const countryListRef = ref<InstanceType<typeof CountriesList> | null>(null)

useHead({
  title: t('countries.page_title'),
  meta: [
    {
      name: 'description',
      content: t('countries.page_description'),
    },
  ],
})

const meta = computed(() => ({
  current_page: store.countries?.meta?.current_page ?? 1,
  last_page: store.countries?.meta?.last_page ?? 1,
  from: store.countries?.meta?.from ?? 0,
  to: store.countries?.meta?.to ?? 0,
  per_page: store.countries?.meta?.per_page ?? 10,
  total: store.countries?.meta?.total ?? 0,
}))
const country_list = computed(() => store.country_list)
const loading = computed(() => store.loading)
const isProcessing = computed(() => store.processing)

// Form state
const isEditing = ref(false)
const formData = reactive({
  name: '',
  code: '',
})

onMounted(() => {
  store.fetchCountries()
})

const handlePageChange = (page: number) => {
  store.fetchCountries(page)
}
const handleSearch = (search: string) => {
  store.fetchCountries(1, search)
}
const handleRefresh = () => {
  store.fetchCountries()
}

const handlePerPageChange = (perPage: number) => {
  store.fetchCountries(1, undefined, perPage)
}

const handleEditCountry = (country: Country) => {
  isEditing.value = true
  formData.name = country.name
  formData.code = country.code
  store.setCurrentCountry(country)
}

const handleDeleteCountry = async (countryId: number) => {
  confirmDialog(
    async (confirmed) => {
      if (confirmed) {
        const success = await store.deleteCountry(countryId)
        if (success) {
          handleRefresh()
        }
      }
    },
    {
      message:
        t('countries.deleteConfirmMessage') || 'Are you sure you want to delete this country?',
      title: t('countries.deleteConfirmTitle') || 'Delete Confirmation',
      type: 'danger',
      yes: t('countries.yes') || 'Yes, delete',
      no: t('countries.no') || 'Cancel',
    }
  )
}

const handleSubmitCountry = async (data: { name: string; code: string }) => {
  const success = await store.storeCountry(data)
  if (success) {
    handleCancelForm()
    handleRefresh()
  }
}

const handleCancelForm = () => {
  isEditing.value = false
  formData.name = ''
  formData.code = ''
  store.setCurrentCountry(null)
}
</script>
