<template>
  <div
    :class="['modal', { show: show }]"
    :style="{ display: show ? 'block' : 'none' }"
    tabindex="-1"
    role="dialog"
  >
    <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="ti ti-receipt me-2"></i>
            {{ t('transactions.receipt') || 'Reçu de Transaction' }}
          </h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>

        <div class="modal-body">
          <div id="receipt-content" ref="receiptContent" class="receipt-container p-4">
            <!-- Header -->
            <div class="text-center mb-4 border-bottom pb-3">
              <h3 class="fw-bold mb-1">{{ appConfig.name }}</h3>
              <p class="text-muted mb-0 small">
                {{ t('transactions.transaction_receipt') || 'REÇU DE TRANSACTION' }}
              </p>
            </div>

            <!-- Transaction Info -->
            <div v-if="transaction" class="mb-4">
              <div class="row mb-2">
                <div class="col-6">
                  <strong>{{ t('transactions.reference') }}:</strong>
                </div>
                <div class="col-6 text-end">
                  <span class="badge bg-dark fs-6">{{ transaction.reference }}</span>
                </div>
              </div>

              <div v-if="transaction.withdrawal_code" class="row mb-2">
                <div class="col-6">
                  <strong>{{ t('transactions.withdrawal_code') }}:</strong>
                </div>
                <div class="col-6 text-end">
                  <span class="badge bg-primary fs-5">{{ transaction.withdrawal_code }}</span>
                </div>
              </div>

              <div class="row mb-2">
                <div class="col-6">
                  <strong>{{ t('transactions.date') }}:</strong>
                </div>
                <div class="col-6 text-end">
                  {{ formatDateTime(transaction.created_at) }}
                </div>
              </div>

              <div class="row mb-2">
                <div class="col-6">
                  <strong>{{ t('transactions.status') }}:</strong>
                </div>
                <div class="col-6 text-end">
                  <span :class="`badge bg-${getStatusColor(transaction.status)}`">
                    {{ getStatusLabel(transaction.status) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Transaction Details -->
            <div v-if="transaction" class="border-top border-bottom py-3 mb-3">
              <div class="row mb-2">
                <div class="col-6">
                  <strong>{{ t('transactions.transaction_type') }}:</strong>
                </div>
                <div class="col-6 text-end">
                  {{ transaction.transaction_type?.name }}
                </div>
              </div>

              <div class="row mb-2">
                <div class="col-6">
                  <strong>{{ t('transactions.branch') }}:</strong>
                </div>
                <div class="col-6 text-end">
                  {{ transaction.branch?.name }}
                </div>
              </div>

              <div v-if="transaction.destination_branch" class="row mb-2">
                <div class="col-6">
                  <strong>{{ t('transactions.destination_branch') }}:</strong>
                </div>
                <div class="col-6 text-end">
                  {{ transaction.destination_branch.name }}
                </div>
              </div>

              <div v-if="transaction.customer" class="row mb-2">
                <div class="col-6">
                  <strong>{{ t('transactions.customer') }}:</strong>
                </div>
                <div class="col-6 text-end">
                  <div>{{ transaction.customer.full_name }}</div>
                  <div class="small text-muted">{{ transaction.customer.phone }}</div>
                </div>
              </div>

              <div v-else-if="transaction.customer_phone" class="row mb-2">
                <div class="col-6">
                  <strong>{{ t('transactions.phone') }}:</strong>
                </div>
                <div class="col-6 text-end">
                  {{ transaction.customer_phone }}
                </div>
              </div>

              <div class="row mb-2">
                <div class="col-6">
                  <strong>{{ t('transactions.cashier') }}:</strong>
                </div>
                <div class="col-6 text-end">
                  {{ transaction.user?.name }}
                </div>
              </div>
            </div>

            <!-- Amounts -->
            <div v-if="transaction" class="mb-4">
              <div class="row mb-2">
                <div class="col-6">
                  <strong>{{ t('transactions.gross_amount') }}:</strong>
                </div>
                <div class="col-6 text-end">
                  {{ formatCurrency(transaction.gross_amount) }}
                </div>
              </div>

              <div class="row mb-2 text-danger">
                <div class="col-6">
                  <strong>{{ t('transactions.fee_amount') }}:</strong>
                </div>
                <div class="col-6 text-end">- {{ formatCurrency(transaction.fee_amount) }}</div>
              </div>

              <div class="row border-top pt-2">
                <div class="col-6">
                  <strong class="fs-5">{{ t('transactions.net_amount') }}:</strong>
                </div>
                <div class="col-6 text-end">
                  <strong class="fs-4 text-success">{{
                    formatCurrency(transaction.net_amount)
                  }}</strong>
                </div>
              </div>
            </div>

            <!-- Expiration Warning -->
            <div
              v-if="transaction?.expires_at && transaction.status === 'available'"
              class="alert alert-warning mb-3"
            >
              <i class="ti ti-alert-triangle me-2"></i>
              <strong>{{ t('transactions.expires_at') }}:</strong>
              {{ formatDateTime(transaction.expires_at) }}
            </div>

            <!-- Footer -->
            <div class="text-center mt-4 pt-3 border-top">
              <p class="small text-muted mb-1">
                {{ t('transactions.receipt_footer') || 'Merci pour votre confiance' }}
              </p>
              <p class="small text-muted mb-0">
                {{ t('transactions.keep_receipt') || 'Conservez ce reçu pour toute réclamation' }}
              </p>
            </div>

            <!-- Barcode/QR Code Placeholder -->
            <div class="text-center mt-3">
              <svg width="200" height="50" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern
                    id="barcode"
                    x="0"
                    y="0"
                    width="10"
                    height="50"
                    patternUnits="userSpaceOnUse"
                  >
                    <rect x="0" y="0" width="4" height="50" fill="black" />
                    <rect x="4" y="0" width="6" height="50" fill="white" />
                  </pattern>
                </defs>
                <rect width="200" height="50" fill="url(#barcode)" />
              </svg>
              <div class="small text-muted mt-1">{{ transaction?.reference }}</div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">
            <i class="ti ti-x me-2"></i>
            {{ t('transactions.close') || 'Fermer' }}
          </button>
          <button type="button" class="btn btn-info" @click="printReceipt">
            <i class="ti ti-printer me-2"></i>
            {{ t('transactions.print') || 'Imprimer' }}
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="downloadPDF"
            :disabled="downloading"
          >
            <span v-if="downloading" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="ti ti-download me-2"></i>
            {{ t('transactions.download_pdf') || 'Télécharger PDF' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Backdrop -->
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from '@/composables/useI18n'
import axiosInstance from '@/plugins/axios'
import appConfig from '@/config/app'
import type { Transaction } from '@/types'
import Swal from 'sweetalert2'

const { t } = useI18n()

interface Props {
  show: boolean
  transaction: Transaction | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const downloading = ref(false)
const receiptContent = ref<HTMLElement | null>(null)

const closeModal = () => {
  emit('close')
}

const printReceipt = () => {
  if (!receiptContent.value) return

  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const content = receiptContent.value.innerHTML

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Reçu - ${props.transaction?.reference}</title>
        <style>
          @media print {
            @page {
              size: 80mm 120mm;
              margin: 5mm;
            }
          }
          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.5;
            color: #000;
            margin: 0;
            padding: 10px;
          }
          .receipt-container {
            max-width: 80mm;
          }
          .badge {
            display: inline-block;
            padding: 4px 8px;
            font-size: 12px;
            font-weight: 600;
            border-radius: 4px;
          }
          .bg-dark { background-color: #333; color: white; }
          .bg-primary { background-color: #0d6efd; color: white; }
          .bg-success { background-color: #198754; color: white; }
          .bg-warning { background-color: #ffc107; color: black; }
          .bg-danger { background-color: #dc3545; color: white; }
          .text-success { color: #198754; }
          .text-danger { color: #dc3545; }
          .text-muted { color: #6c757d; }
          .border-top { border-top: 1px solid #dee2e6 !important; }
          .border-bottom { border-bottom: 1px solid #dee2e6 !important; }
          .fw-bold { font-weight: 700; }
          .fs-4 { font-size: 1.5rem; }
          .fs-5 { font-size: 1.25rem; }
          .fs-6 { font-size: 1rem; }
          .small { font-size: 0.875rem; }
          .text-center { text-align: center; }
          .text-end { text-align: right; }
          .alert { padding: 8px; margin-bottom: 1rem; border: 1px solid transparent; border-radius: 4px; }
          .alert-warning { color: #664d03; background-color: #fff3cd; border-color: #ffecb5; }
        </style>
      </head>
      <body onload="window.print(); window.close();">
        ${content}
      </body>
    </html>
  `)

  printWindow.document.close()
}

const downloadPDF = async () => {
  if (!props.transaction) return

  downloading.value = true

  try {
    const response = await axiosInstance.get(`/transactions/${props.transaction.id}/receipt`, {
      responseType: 'blob',
    })

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `receipt-${props.transaction.reference}.pdf`
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: t('transactions.error') || 'Erreur',
      text:
        error.response?.data?.message ||
        t('transactions.error_downloading_receipt') ||
        'Erreur lors du téléchargement du reçu',
    })
  } finally {
    downloading.value = false
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
  }).format(amount)
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'warning',
    available: 'info',
    completed: 'success',
    cancelled: 'secondary',
    failed: 'danger',
    expired: 'dark',
  }
  return colors[status] || 'secondary'
}

const getStatusLabel = (status: string) => {
  return t(`transactions.status_${status}`) || status
}
</script>

<style scoped>
.modal.show {
  display: block;
}

.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

.receipt-container {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  max-width: 600px;
  margin: 0 auto;
}

@media print {
  .modal-header,
  .modal-footer {
    display: none !important;
  }

  .receipt-container {
    border: none;
  }
}
</style>
