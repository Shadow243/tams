<template>
  <div class="row">
    <div class="col-12">
      <div class="d-flex align-items-sm-center flex-sm-row flex-column my-3">
        <div class="flex-grow-1">
          <h4 class="fs-xl mb-1">{{ t('users.page_title') }}</h4>
          <p class="text-muted mb-0">{{ t('users.page_description') }}</p>
        </div>

        <div class="text-end mt-3 mt-sm-0">
          <button @click="handleAddUser" type="button" class="btn btn-primary">
            <i class="ti ti-plus me-1"></i> {{ t('users.add_new_user') }}
          </button>
        </div>
      </div>

      <div class="row">
        <div class="col-12">
          <UserList
            ref="userListRef"
            :loading="loading"
            :users="user_list"
            :meta="meta"
            @page-change="handlePageChange"
            @search="handleSearch"
            @refresh="handleRefresh"
            @status-change="handleStatusChange"
            @per-page-change="handlePerPageChange"
          />
        </div>
      </div>
      <!-- end row-->
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useHead } from '@vueuse/head'
import { breadcrumbImage } from '@/utils/ui-utils'
import { appConfig } from '@/config/app'
import { useUserStore } from '@/stores/users'
import { onMounted, computed, ref } from 'vue'
import UserList from '@/components/Users/UserList.vue'
import { useI18n } from '@/composables/useI18n'
const { t } = useI18n()

const appName: string = appConfig.appName
const store: ReturnType<typeof useUserStore> = useUserStore()
const userListRef = ref<InstanceType<typeof UserList> | null>(null)

useHead({
  title: t('users.page_title'),
  meta: [
    {
      name: 'description',
      content: t('users.page_description'),
    },
  ],
})

const meta = computed(() => ({
  current_page: store.users?.meta?.current_page ?? 1,
  last_page: store.users?.meta?.last_page ?? 1,
  from: store.users?.meta?.from ?? 0,
  to: store.users?.meta?.to ?? 0,
  per_page: store.users?.meta?.per_page ?? 10,
  total: store.users?.meta?.total ?? 0,
}))
const user_list = computed(() => store.user_list)
const loading = computed(() => store.loading)

onMounted(() => {
  // Réinitialiser le filtre de statut pour qu'il corresponde à l'état initial du dropdown ('')
  store.filters.status = ''
  store.fetchUsers()
})

const handlePageChange = (page: number) => {
  store.fetchUsers(page)
}
const handleSearch = (search: string) => {
  store.fetchUsers(1, search)
}
const handleRefresh = () => {
  store.fetchUsers()
}

const handleAddUser = () => {
  userListRef.value?.addNewUser()
}

const handleStatusChange = (status: string) => {
  store.fetchUsers(1, undefined, status)
}

const handlePerPageChange = (perPage: number) => {
  store.fetchUsers(1, undefined, undefined, perPage)
}
</script>