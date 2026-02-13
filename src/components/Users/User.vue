<template>
  <td>
    <input
      :checked="selected"
      @change="$emit('toggle-select', user.id)"
      class="form-check-input form-check-input-light fs-14 mt-0"
      type="checkbox"
      :value="user.id"
    />
  </td>
  <td>
    <div class="d-flex justify-content-start align-items-center gap-2">
      <div class="avatar avatar-sm">
        <img
          :src="user?.avatar?.full || avatarImage"
          :alt="user.name"
          class="img-fluid rounded-circle"
        />
      </div>
      <div>
        <h5 class="text-nowrap mb-0 lh-base fs-base">
          <a href="#!" class="link-reset">{{ user.name }}</a>
        </h5>
        <p class="text-muted fs-xs mb-0">{{ user.email }}</p>
      </div>
    </div>
  </td>
  <td>{{ user.username }}</td>
  <td>{{ user.email }}</td>
  <td>{{ user.phone_number || 'N/A' }}</td>
  <td>{{ user.gender || 'N/A' }}</td>
  <td>
    <span
      v-if="user.active === 1 || user.active === true"
      class="badge bg-success-subtle text-success badge-label"
    >
      Active
    </span>
    <span v-else class="badge bg-danger-subtle text-danger badge-label"> Inactive </span>
  </td>
  <td>
    <div class="d-flex align-items-center justify-content-center gap-1">
      <a
        href="javascript:void(0);"
        @click="$emit('edit', user)"
        class="btn btn-default btn-icon btn-sm"
        title="Edit"
      >
        <i class="ti ti-edit fs-lg"></i>
      </a>
      <a
        href="javascript:void(0);"
        @click="$emit('delete', user.id)"
        class="btn btn-default btn-icon btn-sm"
        title="Delete"
      >
        <i class="ti ti-trash fs-lg"></i>
      </a>
    </div>
  </td>
</template>

<script lang="ts" setup>
import { computed, type PropType } from 'vue'
import type { User } from '@/types'
import { avatarImage } from '@/utils/ui-utils'

const props = defineProps({
  user: {
    type: Object as PropType<User>,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits<{
  (e: 'edit', user: User): void
  (e: 'delete', userId: number): void
  (e: 'toggle-select', userId: number): void
}>()

const user = computed(() => props.user)
</script>
