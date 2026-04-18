<template>
  <div class="card">
    <div class="card-header border-light justify-content-between">
      <div class="d-flex gap-2">
        <div class="app-search">
          <input
            v-model="searchQuery"
            type="search"
            class="form-control"
            :placeholder="t('operators.searchPlaceholder') || 'Search operators...'"
          />
          <i class="ti ti-search app-search-icon text-muted"></i>
        </div>
      </div>

      <div class="d-flex align-items-center gap-2">
        <!-- Records Per Page -->
        <div>
          <select v-model="perPage" class="form-select form-control my-1 my-md-0">
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>

        <button
          type="button"
          @click="refreshTable"
          class="btn btn-primary"
          :title="t('operators.refresh') || 'Refresh'"
        >
          <i class="ti ti-refresh"></i>
        </button>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-custom table-centered table-hover w-100 mb-0">
        <thead class="bg-light bg-opacity-25 thead-sm">
          <tr class="text-uppercase fs-xxs">
            <th class="text-center" style="width: 5%">#</th>
            <th style="cursor: pointer">
              {{ t('operators.table.name') || 'Name' }}
            </th>
            <th style="cursor: pointer">
              {{ t('operators.table.country') || 'Country' }}
            </th>
            <th style="cursor: pointer">
              {{ t('operators.table.createdAt') || 'Created At' }}
            </th>
            <th class="text-center">{{ t('operators.table.actions') || 'Actions' }}</th>
          </tr>
        </thead>
        <!-- end table-head -->
        <tbody v-if="loading">
          <tr>
            <td colspan="5" class="text-center py-5">
              <div class="d-flex justify-content-center align-items-center">
                <div
                  class="spinner-border text-primary"
                  role="status"
                  style="width: 3rem; height: 3rem"
                >
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
        <tbody v-else-if="!operators.length">
          <tr>
            <td colspan="5" class="text-center py-5">
              <span class="text-muted">{{ t('operators.noResults') || 'No operators found' }}</span>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr v-for="(operator, index) in operators" :key="operator.id">
            <Operator
              :operator="operator"
              :index="index + from - 1"
              @edit="handleEdit"
              @delete="handleDelete"
            />
          </tr>
        </tbody>
        <!-- end table-body -->
      </table>
      <!-- end table -->
    </div>
    <div class="card-footer border-0">
      <div class="d-flex justify-content-between align-items-center">
        <div class="text-muted">
          {{ t('operators.showing') || 'Showing' }} <span class="fw-semibold">{{ from }}</span>
          {{ t('operators.to') || 'to' }} <span class="fw-semibold">{{ to }}</span>
          {{ t('operators.of') || 'of' }} <span class="fw-semibold">{{ total }}</span>
          {{ t('operators.operators') || 'operators' }}
        </div>
        <div>
          <ul class="pagination pagination-sm pagination-boxed mb-0 justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a href="#" class="page-link" @click.prevent="goToPrevious"
                ><svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M15 6l-6 6l6 6"></path></svg
              ></a>
            </li>
            <li
              v-for="page in visiblePages"
              :key="page"
              class="page-item"
              :class="{ active: page === currentPage }"
            >
              <a href="#" class="page-link" @click.prevent="emit('page-change', page)">{{
                page
              }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === lastPage }">
              <a href="#" class="page-link" @click.prevent="goToNext"
                ><svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M9 6l6 6l-6 6"></path></svg
              ></a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, type PropType } from 'vue'
import debounce from 'lodash.debounce'
import type { OperatorsResponse, OperatorList, Operator as OperatorType } from '@/types'
import { useI18n } from '@/composables/useI18n'
import { useUserSettings } from '@/composables/useUserSettings'
import Operator from '@/components/Operators/Operator.vue'

const { t } = useI18n()
const { getItemsPerPage } = useUserSettings()

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'search', query: string): void
  (e: 'refresh'): void
  (e: 'per-page-change', perPage: number): void
  (e: 'edit', operator: OperatorType): void
  (e: 'delete', operatorId: number): void
}>()

const props = defineProps({
  operators: {
    type: Array as PropType<OperatorList>,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  meta: {
    type: Object as PropType<OperatorsResponse['meta']>,
    required: true,
  },
})

const searchQuery = ref('')
const perPage = ref(getItemsPerPage())

const from = computed(() => props.meta?.from ?? 0)
const to = computed(() => props.meta?.to ?? 0)
const total = computed(() => props.meta?.total ?? 0)
const currentPage = computed(() => props.meta?.current_page ?? 1)
const lastPage = computed(() => props.meta?.last_page ?? 1)

// Compute visible pages for pagination
const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(lastPage.value, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

const goToPrevious = () => {
  if (currentPage.value > 1) emit('page-change', currentPage.value - 1)
}
const goToNext = () => {
  if (currentPage.value < lastPage.value) emit('page-change', currentPage.value + 1)
}

const refreshTable = () => {
  emit('refresh')
}

const handleEdit = (operator: OperatorType) => {
  emit('edit', operator)
}

const handleDelete = (operatorId: number) => {
  emit('delete', operatorId)
}

watch(
  searchQuery,
  debounce((val: string) => {
    if (val.trim()) {
      emit('search', val.trim())
    } else {
      emit('search', '')
    }
  }, 500)
)

watch(perPage, (val: number) => {
  emit('per-page-change', val)
})
</script>
