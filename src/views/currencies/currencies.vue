<template>
  <div class="row">
    <div class="col-12">
      <div class="d-flex align-items-sm-center flex-sm-row flex-column my-3">
        <div class="flex-grow-1">
          <h4 class="fs-xl mb-1">{{ t('currencies.page_title') }}</h4>
          <p class="text-muted mb-0">
            {{ t('currencies.page_description') }}
          </p>
        </div>

        <div class="text-end mt-3 mt-sm-0">
          <button @click="handleAdd" type="button" class="btn btn-success me-2">
            <i class="ti ti-plus me-1"></i> {{ t('currencies.add_currency') }}
          </button>
          <button @click="handleRefresh" type="button" class="btn btn-primary">
            <i class="ti ti-refresh me-1"></i> {{ t('common.refresh') }}
          </button>
        </div>
      </div>

      <div class="row">
        <div class="col-12">
          <CurrenciesList
            :currencies="currency_list"
            :meta="meta"
            :loading="store.loading"
            @page-change="handlePageChange"
            @search="handleSearch"
            @per-page-change="handlePerPageChange"
            @refresh="handleRefresh"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Currency Form Modal -->
  <CurrencyFormModal
    :show="showModal"
    :currency="selectedCurrency"
    @close="showModal = false"
    @success="handleSuccess"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useHead } from '@vueuse/head'
import { useCurrencyStore } from '@/stores/currencies'
import { useI18n } from '@/composables/useI18n'
import CurrenciesList from '@/components/Currencies/CurrenciesList.vue'
import CurrencyFormModal from '@/components/Currencies/CurrencyFormModal.vue'
import { axiosInstance } from '@/plugins/axios'
import { appConfig } from '@/config/app'
import Swal from 'sweetalert2'
import type { Currency } from '@/stores/currencies'

const { t } = useI18n()
const store = useCurrencyStore()

const showModal = ref(false)
const selectedCurrency = ref<Currency | null>(null)

const meta = computed(() => ({
  current_page: store.currencies?.meta?.current_page ?? 1,
  last_page: store.currencies?.meta?.last_page ?? 1,
  from: store.currencies?.meta?.from ?? 0,
  to: store.currencies?.meta?.to ?? 0,
  per_page: store.currencies?.meta?.per_page ?? 15,
  total: store.currencies?.meta?.total ?? 0,
  path: '',
}))

const currency_list = computed(() => store.currency_list)

useHead({
  title: t('currencies.page_title'),
  meta: [{ name: 'description', content: t('currencies.page_description') }],
})

onMounted(() => {
  store.fetchCurrencies()
  store.fetchAllCurrencies() // Load all for dropdowns
})

const handlePageChange = (page: number) => {
  store.fetchCurrencies(page)
}

const handleSearch = (search: string) => {
  store.fetchCurrencies(1, search)
}

const handlePerPageChange = (perPage: number) => {
  store.fetchCurrencies(1, undefined, perPage)
}

const handleRefresh = () => {
  store.fetchCurrencies()
  store.fetchAllCurrencies()
}

const handleAdd = () => {
  selectedCurrency.value = null
  showModal.value = true
}

const handleEdit = (currency: Currency) => {
  selectedCurrency.value = currency
  showModal.value = true
}

const handleDelete = async (currency: Currency) => {
  const result = await Swal.fire({
    title: t('currencies.delete_confirm_title') || 'Supprimer la Devise?',
    text: t('currencies.delete_confirm_message') || 'Cette action ne peut pas être annulée.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: t('currencies.delete_confirm_button') || 'Oui, supprimer',
    cancelButtonText: t('currencies.cancel_button') || 'Annuler',
  })

  if (result.isConfirmed) {
    try {
      console.log('Deleting currency:', currency.code)
      console.log('API URL:', `${appConfig.apiUrl}/currencies/${currency.code}`)

      const response = await axiosInstance.delete(`${appConfig.apiUrl}/currencies/${currency.code}`)

      console.log('Delete response:', response)

      await Swal.fire({
        icon: 'success',
        title: t('common.success') || 'Succès',
        text: t('currencies.deleted_successfully') || 'Devise supprimée avec succès',
        timer: 2000,
        showConfirmButton: false,
      })

      handleRefresh()
    } catch (error: any) {
      console.error('Delete error:', error)
      console.error('Error response:', error.response)
      console.error('Error message:', error.message)

      // Déterminer le message d'erreur approprié selon le code de statut
      let errorMessage =
        t('currencies.delete_error') || 'Erreur lors de la suppression de la devise'

      if (error.response) {
        if (error.response.status === 403) {
          errorMessage =
            error.response.data?.message || "Vous n'avez pas la permission de supprimer des devises"
        } else if (error.response.status === 422) {
          errorMessage = error.response.data?.message || 'Cette devise ne peut pas être supprimée'
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message
        }
      } else if (error.request) {
        errorMessage = 'Aucune réponse du serveur. Vérifiez votre connexion.'
      }

      Swal.fire({
        icon: 'error',
        title: t('common.error') || 'Erreur',
        text: errorMessage,
      })
    }
  }
}

const handleSuccess = async () => {
  await Swal.fire({
    icon: 'success',
    title: t('common.success') || 'Succès',
    text: selectedCurrency.value
      ? t('currencies.updated_successfully') || 'Devise mise à jour avec succès'
      : t('currencies.created_successfully') || 'Devise créée avec succès',
    timer: 2000,
    showConfirmButton: false,
  })

  handleRefresh()
}
</script>
